package dbs

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestMysql(t *testing.T) {
	mo := MysqlOpts{
		Username: "root",
		Password: "123456",
		DB:       "mysql",
	}
	mo._SqlDbOpener = &mo

	r, e := mo.Query("select 1")
	if e != nil {
		fmt.Println(e)
		return
	}

	bs, _ := json.Marshal(r)
	fmt.Println(string(bs))
}
