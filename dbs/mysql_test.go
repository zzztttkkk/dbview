package dbs

import (
	"fmt"
	"testing"
)

func TestMysql(t *testing.T) {
	proxy := NewSqlProxy()
	proxy.RegisterMysql(
		"A",
		MysqlOpts{
			Username: "root",
			Password: "123456",
			DB:       "dbv",
		},
	)

	r, e := proxy.Query("A", "insert into user(name) values(?)", []interface{}{"ztk34"})
	if e != nil {
		fmt.Println(e)
		return
	}
	fmt.Println(proxy.Commit("A", r.Tx))
}
