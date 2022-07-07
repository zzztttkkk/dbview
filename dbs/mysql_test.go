package dbs

import (
	"encoding/json"
	"fmt"
	"sync"
	"testing"
)

func TestMysql(t *testing.T) {
	mo := MysqlOpts{
		Username: "root",
		Password: "123456",
		DB:       "mysql",
	}
	mo.Mutex = &sync.Mutex{}
	mo._Driver = &mo

	r, e := mo.Query("select 1 + 45")
	if e != nil {
		fmt.Println(e)
		return
	}

	bs, _ := json.Marshal(r)
	fmt.Println(string(bs))
}
