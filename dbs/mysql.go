package dbs

import (
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"fmt"
	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"io/ioutil"
	"strconv"
)

type MysqlOpts struct {
	SqlCommon

	Url                    string        `json:"url"`
	Address                string        `json:"address"`
	Username               string        `json:"username"`
	Password               string        `json:"password"`
	DB                     string        `json:"db"`
	TLS                    *TLSPEMConfig `json:"tls"`
	DisableNativePasswords bool          `json:"disable_native_passwords"`
	Collation              string        `json:"collation"`
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

	cfg.Collation = mo.Collation

	if mo.TLS != nil {
		pem, err := ioutil.ReadFile(mo.TLS.Pem)
		if err != nil {
			return nil, err
		}
		pool := x509.NewCertPool()
		if !pool.AppendCertsFromPEM(pem) {
			return nil, fmt.Errorf(`mysql: failed to append pem file`)
		}
		tcfg := &tls.Config{RootCAs: pool}
		if len(mo.TLS.ServerName) > 0 {
			tcfg.ServerName = mo.TLS.ServerName
		}
		if err = mysql.RegisterTLSConfig(uuid.New().String(), tcfg); err != nil {
			return nil, err
		}
	}
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
