package main

import (
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
}
