package main

import (
	"dbview/dbs"
	"fmt"
	"testing"
)

func TestOpenProject(t *testing.T) {
	proj, err := OpenProject("./build/spk")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(proj.Databases())
	fmt.Println(proj.NewMysqlDatabase("Aka", dbs.MysqlOpts{DB: "mysql", Username: "root", Password: "123456"}))
	fmt.Println(proj.Databases())
}
