package main

import (
	"encoding/json"
	"fmt"
	"github.com/dgraph-io/badger/v3"
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

var (
	DBListInfosKey = "DBListInfos"
	DBListSortsKey = "DBListSorting"
)

func (proj *Project) Databases() {
	err := proj.db.View(func(txn *badger.Txn) error {
		return nil
	})
	fmt.Println(err)
}
