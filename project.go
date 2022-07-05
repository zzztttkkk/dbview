package main

import "dbview/dbs"

type Project struct {
	MysqlList      dbs.MysqlOpts      `json:"mysql_list"`
	PostgresqlList dbs.PostgresqlOpts `json:"postgresql_list"`
	MongoList      dbs.MongoOpts      `json:"mongo_list"`
	RedisList      dbs.RedisOpts      `json:"redis_list"`
}
