package dbs

import (
	"encoding/json"
	"fmt"
	"sync"
	"testing"
)

func TestPostgresql(t *testing.T) {
	po := PostgresqlOpts{
		Username: "postgres",
		Password: "123456",
		DB:       "postgres",
		Address:  "127.0.0.1:5432",
	}
	po.Mutex = &sync.Mutex{}
	po._Driver = &po

	r, e := po.Query("select now()")
	if e != nil {
		fmt.Println(e)
		return
	}
	v, _ := json.Marshal(r)
	fmt.Println(string(v))
}
