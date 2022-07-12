package dbs

import (
	"database/sql"
	"fmt"
	"github.com/lib/pq"
	"strings"
)

type PostgresqlOpts struct {
	SqlCommon

	Address  string `json:"address"`
	Username string `json:"username"`
	Password string `json:"password"`
	DB       string `json:"db"`
}

func (po *PostgresqlOpts) open() (*sql.DB, error) {
	var dsn []string

	if len(po.Address) > 0 {
		idx := strings.IndexByte(po.Address, ':')
		if idx < 0 {
			return nil, fmt.Errorf(`pq: bad address "%s"`, po.Address)
		}
		dsn = append(dsn, fmt.Sprintf("host=%s", po.Address[:idx]))
		dsn = append(dsn, fmt.Sprintf("port=%s", po.Address[idx+1:]))
	}

	if len(po.Username) > 0 {
		dsn = append(dsn, fmt.Sprintf("user=%s", po.Username))
	}

	if len(po.Password) > 0 {
		dsn = append(dsn, fmt.Sprintf("password=%s", po.Password))
	}

	if len(po.DB) > 0 {
		dsn = append(dsn, fmt.Sprintf("dbname=%s", po.DB))
	}

	dsn = append(dsn, "sslmode=disable")

	conn, err := pq.NewConnector(strings.Join(dsn, " "))
	if err != nil {
		return nil, err
	}
	db := sql.OpenDB(conn)
	return db, db.Ping()
}

func (po *PostgresqlOpts) cast(val interface{}, _ string) interface{} {
	return val
}
