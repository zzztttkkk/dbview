package dbs

import (
	"context"
	"database/sql"
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

	*sync.Mutex `json:"-"`
	_Driver     `json:"-"`
	DB          *sql.DB `json:"-"`
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

func (sc *SqlCommon) Query(query string, params ...interface{}) (*SqlResult, error) {
	if err := sc.ensure(); err != nil {
		return nil, err
	}

	timeouts := time.Second * 10
	if sc.Timeouts > 0 {
		timeouts = time.Duration(float64(time.Second) * sc.Timeouts)
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeouts)
	defer cancel()

	tx, err := sc.DB.BeginTx(ctx, &sql.TxOptions{ReadOnly: sc.Readonly})
	if err != nil {
		return nil, err
	}
	defer func() {
		v := recover()
		if v == nil {
			_ = tx.Commit()
		} else {
			_ = tx.Rollback()
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

	result := &SqlResult{}
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
