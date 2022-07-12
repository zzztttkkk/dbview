package dbs

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"reflect"
	"sync"
	"time"
)

type NamedQuery struct {
	Name string `json:"name"`
	Sql  string `json:"sql"`
}

type SqlCommon struct {
	NamedQueries map[string]NamedQuery `json:"named_queries"`
	History      []string              `json:"history"`
	Timeouts     float64               `json:"timeouts"`
	Readonly     bool                  `json:"readonly"`
	AutoCommit   bool                  `json:"auto_commit"`

	*sync.Mutex `json:"-"`
	_Driver     `json:"-"`
	DB          *sql.DB `json:"-"`
	txMap       *sync.Map
}

func initSqlCommon(v *SqlCommon, d _Driver) {
	v.Mutex = &sync.Mutex{}
	v._Driver = d
	v.txMap = &sync.Map{}
}

type SqlField struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

type _Driver interface {
	open() (*sql.DB, error)
	cast(val interface{}, sqltype string) interface{}
}

type SqlResult struct {
	Tx     string          `json:"tx"`
	Fields []SqlField      `json:"fields"`
	Rows   [][]interface{} `json:"rows"`
}

func (sc *SqlCommon) ensure() error {
	sc.Lock()
	defer sc.Unlock()

	if sc.DB != nil {
		return nil
	}
	db, err := sc.open()
	sc.DB = db
	return err
}

type LazyTx struct {
	ctx    context.Context
	tx     *sql.Tx
	cancel func()
}

func (sc *SqlCommon) Query(query string, params ...interface{}) (result *SqlResult, err error) {
	if err = sc.ensure(); err != nil {
		return
	}

	timeouts := time.Second * 60
	if sc.Timeouts > 45 {
		timeouts = time.Duration(float64(time.Second) * sc.Timeouts)
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeouts)

	tx, err := sc.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: sc.Readonly})
	if err != nil {
		cancel()
		return
	}

	defer func() {
		v := recover()
		if v == nil && err == nil {
			if sc.AutoCommit {
				err = tx.Commit()
				cancel()
			} else {
				uid := uuid.New().String()
				result.Tx = uid
				sc.txMap.Store(uid, LazyTx{cancel: cancel, tx: tx, ctx: ctx})
			}
		} else {
			re := tx.Rollback()
			cancel()
			if re != nil {
				err = fmt.Errorf("sql.rollback.err: %s, %s", re.Error(), err.Error())
			}
		}
	}()

	rows, err := tx.Query(query, params...)
	if err != nil {
		return nil, err
	}

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	columnsTypes, err := rows.ColumnTypes()
	if err != nil {
		return nil, err
	}

	result = &SqlResult{}
	for i, column := range columns {
		result.Fields = append(result.Fields, SqlField{})
		field := &(result.Fields[i])
		field.Name = column
		field.Type = columnsTypes[i].DatabaseTypeName()
	}

	var ptrs = make([]interface{}, len(columns))
	for rows.Next() {
		var vals = make([]interface{}, len(columns))
		for i := 0; i < len(columns); i++ {
			ptrs[i] = &(vals[i])
		}

		err = rows.Scan(ptrs...)
		if err != nil {
			return nil, err
		}

		for i := 0; i < len(columns); i++ {
			val := vals[i]
			if !reflect.ValueOf(val).IsValid() {
				continue
			}
			vals[i] = sc.cast(val, result.Fields[i].Type)
		}

		result.Rows = append(result.Rows, vals)
	}
	return result, nil
}

func (sc *SqlCommon) Commit(tx string) error {
	obj, ok := sc.txMap.LoadAndDelete(tx)
	if !ok {
		return fmt.Errorf(`sql: "%s" is not exists`, tx)
	}
	ltx := obj.(LazyTx)
	if ltx.ctx.Err() != nil {
		return ltx.ctx.Err()
	}
	err := ltx.tx.Commit()
	ltx.cancel()
	return err
}

func (sc *SqlCommon) Rollback(tx string) error {
	obj, ok := sc.txMap.LoadAndDelete(tx)
	if !ok {
		return fmt.Errorf(`sql: "%s" is not exists`, tx)
	}

	ltx := obj.(LazyTx)
	if ltx.ctx.Err() != nil {
		return ltx.ctx.Err()
	}
	err := ltx.tx.Rollback()
	ltx.cancel()
	return err
}

type SqlProxy struct {
	mutex sync.Mutex
	opts  map[string]interface{}
}

func NewSqlProxy() *SqlProxy {
	return &SqlProxy{opts: map[string]interface{}{}}
}

func (proxy *SqlProxy) register(name string, opts interface{}) {
	proxy.mutex.Lock()
	defer proxy.mutex.Unlock()

	nopts := reflect.New(reflect.TypeOf(opts))
	nopts.Elem().Set(reflect.ValueOf(opts))
	inf := nopts.Elem().FieldByName("SqlCommon").Addr().Interface()
	initSqlCommon((inf).(*SqlCommon), nopts.Interface().(_Driver))
	proxy.opts[name] = nopts.Interface()
}

func (proxy *SqlProxy) RegisterMysql(name string, opts MysqlOpts) {
	proxy.register(name, opts)
}

func (proxy *SqlProxy) RegisterPostgresql(name string, opts PostgresqlOpts) {
	proxy.register(name, opts)
}

func (proxy *SqlProxy) getOpts(name string) interface{} {
	proxy.mutex.Lock()
	defer proxy.mutex.Unlock()
	return proxy.opts[name]
}

type Sqler interface {
	Query(query string, params ...interface{}) (*SqlResult, error)
	Commit(tx string) error
	Rollback(tx string) error
}

func (proxy *SqlProxy) Query(name string, query string, params []interface{}) (*SqlResult, error) {
	opts := proxy.getOpts(name)
	if opts == nil {
		return nil, fmt.Errorf(`mysql: unregistered name "%s"`, name)
	}
	return (opts.(Sqler)).Query(query, params...)
}

func (proxy *SqlProxy) Commit(name string, tx string) error {
	opts := proxy.getOpts(name)
	if opts == nil {
		return fmt.Errorf(`mysql: unregistered name "%s"`, name)
	}
	return (opts.(Sqler)).Commit(tx)
}

func (proxy *SqlProxy) Rollback(name string, tx string) error {
	opts := proxy.getOpts(name)
	if opts == nil {
		return fmt.Errorf(`mysql: unregistered name "%s"`, name)
	}
	return (opts.(Sqler)).Rollback(tx)
}
