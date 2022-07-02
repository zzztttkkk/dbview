package dbs

import (
	"fmt"
	"github.com/go-redis/redis/v8"
	"testing"
)

var rp = &RedisProxy{
	opts:    map[string]*redis.Options{},
	clis:    map[string]*redis.Client{},
	timeout: 0.5,
}

func init() {
	_ = rp.Register("test", &RedisOpts{})
}

func TestIntCmd(t *testing.T) {
	fmt.Println(rp.Del("test", []string{"ax", "bx"}))
}
