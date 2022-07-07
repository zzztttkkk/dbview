package dbs

import (
	"database/sql"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"strconv"
	"sync"
)

type MysqlOpts struct {
	SqlCommon

	Url                    string     `json:"url"`
	Address                string     `json:"address"`
	Username               string     `json:"username"`
	Password               string     `json:"password"`
	DB                     string     `json:"db"`
	TLS                    *TLSConfig `json:"tls"`
	DisableNativePasswords bool       `json:"disable_native_passwords"`
	Collation              string     `json:"collation"`
}

func (mo *MysqlOpts) open() (*sql.DB, error) {
	var (
		cfg *mysql.Config
		err error
	)
	if len(mo.Url) > 0 {
		cfg, err = mysql.ParseDSN(mo.Url)
		if err != nil {
			return nil, err
		}
	} else {
		cfg = &mysql.Config{}
		cfg.Net = "tcp"
		cfg.Addr = mo.Address
		cfg.DBName = mo.DB
		cfg.User = mo.Username
		cfg.Passwd = mo.Password
	}

	if !mo.DisableNativePasswords {
		cfg.AllowNativePasswords = true
	}
	if len(mo.Collation) < 1 {
		mo.Collation = "utf8mb4_unicode_ci"
	}
	cfg.Collation = mo.Collation

	conn, err := mysql.NewConnector(cfg)
	if err != nil {
		return nil, err
	}
	db := sql.OpenDB(conn)
	return db, db.Ping()
}

func (mo *MysqlOpts) cast(val interface{}, sqltype string) interface{} {
	switch sqltype {
	case "VARCHAR", "CHAR", "TEXT", "JSON", "DATETIME", "DATE", "TIME":
		return string(val.([]byte))
	case "BIGINT":
		switch tv := val.(type) {
		case []byte:
			v, _ := strconv.ParseInt(string(tv), 10, 64)
			return v
		}
		break
	}
	return val
}

type MysqlProxy struct {
	rw   sync.RWMutex
	opts map[string]*MysqlOpts
}

func NewMysqlProxy() *MysqlProxy {
	return &MysqlProxy{opts: map[string]*MysqlOpts{}}
}

func (proxy *MysqlProxy) Register(name string, opts MysqlOpts) {
	proxy.rw.Lock()
	defer proxy.rw.Unlock()

	nopts := &MysqlOpts{}
	*nopts = opts
	nopts.Mutex = &sync.Mutex{}
	nopts._Driver = nopts
	proxy.opts[name] = nopts
}

func (proxy *MysqlProxy) Query(name string, query string, params []interface{}) (*SqlResult, error) {
	proxy.rw.RLock()
	defer proxy.rw.RUnlock()

	opts, ok := proxy.opts[name]
	if !ok {
		return nil, fmt.Errorf(`mysql: unregistered name "%s"`, name)
	}
	return opts.Query(query, params...)
}
