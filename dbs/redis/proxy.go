package redis

import (
	"fmt"
	"github.com/go-redis/redis/v8"
	"sync"
)

type Opts struct {
	Uri      string `json:"uri"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	DB       int    `json:"db"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Proxy struct {
	rw    sync.RWMutex
	clis  map[string]*redis.Options
	conns map[string]*redis.Conn
}

func (proxy *Proxy) Register(name string, opts *Opts) string {
	proxy.rw.Lock()
	defer proxy.rw.Unlock()

	_, exists := proxy.clis[name]
	if exists {
		return fmt.Sprintf("Redis: name `%s` is already exists", name)
	}

	var ropts *redis.Options
	if opts != nil {
		if len(opts.Uri) > 0 {
			var e error
			ropts, e = redis.ParseURL(opts.Uri)
			if e != nil {
				return e.Error()
			}
		}
	}

	if ropts == nil {
		ropts = &redis.Options{}

		if len(opts.Host) > 0 || opts.Port > 0 {
			ropts.Addr = fmt.Sprintf("%s:%d", opts.Host, opts.Port)
		}

		if opts.DB >= 0 {
			ropts.DB = opts.DB
		}
	}

	return ""
}
