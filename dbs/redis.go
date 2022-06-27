package dbs

import (
	"context"
	"crypto/tls"
	"fmt"
	"github.com/go-redis/redis/v8"
	"reflect"
	"sync"
	"time"
)

type TLSConfig struct {
	Cert       string `json:"cert"`
	Key        string `json:"key"`
	ServerName string `json:"server_name"`
}

type RedisOpts struct {
	Uri      string     `json:"uri"`
	Host     string     `json:"host"`
	Port     int        `json:"port"`
	DB       int        `json:"db"`
	Username string     `json:"username"`
	Password string     `json:"password"`
	TLS      *TLSConfig `json:"tls"`
}

type RedisProxy struct {
	rw   sync.RWMutex
	opts map[string]*redis.Options
	clis map[string]*redis.Client

	timeout float64
}

func (rp *RedisProxy) Register(name string, opts *RedisOpts) error {
	rp.rw.Lock()
	defer rp.rw.Unlock()

	_, exists := rp.opts[name]
	if exists {
		return fmt.Errorf("redis: name `%s` is already exists", name)
	}

	var ropts *redis.Options
	if opts != nil {
		if len(opts.Uri) > 0 {
			var e error
			ropts, e = redis.ParseURL(opts.Uri)
			if e != nil {
				return e
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

		if len(opts.Username) > 0 {
			ropts.Username = opts.Username
		}
		if len(opts.Password) > 0 {
			ropts.Username = opts.Password
		}

		if opts.TLS != nil {
			tlsCfg := &tls.Config{
				MinVersion: tls.VersionTLS12,
			}
			if len(opts.TLS.Cert) > 0 || len(opts.TLS.Key) > 0 {
				cert, err := tls.LoadX509KeyPair(opts.TLS.Cert, opts.TLS.Key)
				if err != nil {
					return err
				}
				tlsCfg.Certificates = append(tlsCfg.Certificates, cert)
			}
			tlsCfg.ServerName = opts.TLS.ServerName
			ropts.TLSConfig = tlsCfg
		}
	}
	rp.opts[name] = ropts
	return nil
}

func (rp *RedisProxy) get(name string) (redis.Cmdable, error) {
	rp.rw.RLock()
	cls, ok := rp.clis[name]
	if ok {
		rp.rw.RUnlock()
		return cls, nil
	}

	opts, ok := rp.opts[name]
	if !ok {
		rp.rw.RUnlock()
		return cls, fmt.Errorf("redis: unregistered name `%s`", name)
	}
	rp.rw.RUnlock()

	rp.rw.Lock()
	defer rp.rw.Unlock()

	cli := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
	defer cancel()
	if err := cli.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	rp.clis[name] = cli
	return cli, nil
}

func (rp *RedisProxy) intcmd(name string, cmd string, args ...interface{}) (int64, error) {
	cli, err := rp.get(name)
	if err != nil {
		return 0, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(float64(time.Second)*rp.timeout))
	defer cancel()

	cliv := reflect.ValueOf(cli).Elem()
	fnv := cliv.MethodByName(cmd)
	var inargs []reflect.Value
	inargs = append(inargs, reflect.ValueOf(ctx))
	for _, arg := range args {
		inargs = append(inargs, reflect.ValueOf(arg))
	}
	outs := fnv.Call(inargs)
	return (outs[0].Interface().(*redis.IntCmd)).Result()
}

func (rp *RedisProxy) Ping(name string) (int64, error) {
	cli, err := rp.get(name)
	if err != nil {
		return 0, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*time.Duration(rp.timeout))
	defer cancel()

	begin := time.Now()
	if err = cli.Ping(ctx).Err(); err != nil {
		return 0, err
	}
	return time.Now().UnixNano() - begin.UnixNano(), nil
}

func (rp *RedisProxy) Del(name string, keys ...string) (int64, error) {
	var il []interface{}
	for _, key := range keys {
		il = append(il, key)
	}
	return rp.intcmd(name, "Del", il...)
}

func (rp *RedisProxy) Unlink(name string, keys ...string) (int64, error) {
	var il []interface{}
	for _, key := range keys {
		il = append(il, key)
	}
	return rp.intcmd(name, "Unlink", il...)
}

func (rp *RedisProxy) Exists(name string, keys ...string) (int64, error) {
	var il []interface{}
	for _, key := range keys {
		il = append(il, key)
	}
	return rp.intcmd(name, "Exists", il...)
}

func (rp *RedisProxy) Incr(name string, key string) (int64, error) {
	return rp.intcmd(name, "Incr", key)
}

func (rp *RedisProxy) IncrBy(name string, key string, val int64) (int64, error) {
	return rp.intcmd(name, "IncrBy", key, val)
}

func (rp *RedisProxy) Decr(name string, key string) (int64, error) {
	return rp.intcmd(name, "Decr", key)
}

func (rp *RedisProxy) DecrBy(name string, key string, val int64) (int64, error) {
	return rp.intcmd(name, "DecrBy", key, val)
}

func (rp *RedisProxy) GetBit(name string, key string, offset int64) (int64, error) {
	return rp.intcmd(name, "GetBit", key, offset)
}

func (rp *RedisProxy) SetBit(name string, key string, offset int64, val bool) (int64, error) {
	num := 0
	if val {
		num = 1
	}
	return rp.intcmd(name, "SetBit", key, offset, num)
}

func (rp *RedisProxy) BitCount(name string, key string, start int64, end int64) (int64, error) {
	return rp.intcmd(name, "BitCount", key, &redis.BitCount{Start: start, End: end})
}

func (rp *RedisProxy) bitop(name string, op string, dest string, keys ...string) (int64, error) {
	var il []interface{}
	il = append(il, dest)
	for _, key := range keys {
		il = append(il, key)
	}
	return rp.intcmd(name, fmt.Sprintf("BitOp%s", op), il...)
}

func (rp *RedisProxy) BitOpAnd(name string, dest string, keys ...string) (int64, error) {
	return rp.bitop(name, "And", dest, keys...)
}

func (rp *RedisProxy) BitOpOr(name string, dest string, keys ...string) (int64, error) {
	return rp.bitop(name, "Or", dest, keys...)
}

func (rp *RedisProxy) BitOpXor(name string, dest string, keys ...string) (int64, error) {
	return rp.bitop(name, "Xor", dest, keys...)
}

func (rp *RedisProxy) BitOpNot(name string, dest string, key string) (int64, error) {
	return rp.bitop(name, "Not", dest, key)
}

func (rp *RedisProxy) BitPos(name string, key string, bit int64, pos ...int64) (int64, error) {
	var il []interface{}
	il = append(il, key)
	il = append(il, bit)
	for _, v := range pos {
		il = append(il, v)
	}
	return rp.intcmd(name, "BitPos", il...)
}

func (rp *RedisProxy) HDel(name string, key string, fields ...string) (int64, error) {
	var il []interface{}
	il = append(il, key)
	for _, field := range fields {
		il = append(il, field)
	}
	return rp.intcmd(name, "HDel", il...)
}

func (rp *RedisProxy) HIncrBy(name string, key string, field string, val int64) (int64, error) {
	return rp.intcmd(name, "HIncrBy", key, field, val)
}

func (rp *RedisProxy) HLen(name string, key string) (int64, error) {
	return rp.intcmd(name, "HLen", key)
}

func (rp *RedisProxy) HSet(name string, key string, values ...interface{}) (int64, error) {
	var il []interface{}
	il = append(il, key)
	for _, val := range values {
		il = append(il, val)
	}
	return rp.intcmd(name, "HSet", il...)
}
