package main

import (
	"encoding/json"
	"github.com/dgraph-io/badger/v3"
	"reflect"
)

type Project struct {
	db *badger.DB
}

func OpenProject(path string) (*Project, error) {
	proj := &Project{}
	db, err := badger.Open(badger.DefaultOptions(path))
	if err != nil {
		return nil, err
	}
	proj.db = db
	return proj, nil
}

func (proj *Project) get(txn *badger.Txn, key string, dist interface{}) error {
	item, err := txn.Get([]byte(key))
	if err != nil {
		return err
	}
	return item.Value(func(val []byte) error {
		return json.Unmarshal(val, dist)
	})
}

// dist is a pointer of slice
func (proj *Project) scan(txn *badger.Txn, prefix string, dist interface{}) error {
	dV := reflect.ValueOf(dist).Elem()
	eleT := dV.Elem().Type()
	ps := []byte(prefix)

	iter := txn.NewIterator(badger.DefaultIteratorOptions)
	defer iter.Close()
	for iter.Seek(ps); iter.ValidForPrefix(ps); iter.Next() {
		item := iter.Item()
		err := item.Value(func(val []byte) error {
			obj := reflect.New(eleT)
			e := json.Unmarshal(val, obj.Interface())
			if e != nil {
				return e
			}
			dV = reflect.Append(dV, obj)
			return nil
		})
		if err != nil {
			return err
		}
	}
	reflect.ValueOf(dist).Elem().Set(dV)
	return nil
}

func (proj *Project) set(txn *badger.Txn, key string, val interface{}) error {
	d, e := json.Marshal(val)
	if e != nil {
		return e
	}
	return txn.Set([]byte(key), d)
}

func (proj *Project) del(txn *badger.Txn, keys ...string) {
	for _, key := range keys {
		_ = txn.Delete([]byte(key))
	}
}

func (proj *Project) exists(txn *badger.Txn, key string) (bool, error) {
	_, err := txn.Get([]byte(key))
	if err != nil {
		if err == badger.ErrKeyNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

type DBInfo struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	Sorting    int64  `json:"sorting"`
	LastOpenAt int64  `json:"last_open_at"`
	Opts       string `json:"opts"`
}

func (proj *Project) Databases() ([]DBInfo, error) {
	var lst []DBInfo
	err := proj.db.View(func(txn *badger.Txn) error {
		return proj.scan(txn, "DB:", &lst)
	})
	return lst, err
}
