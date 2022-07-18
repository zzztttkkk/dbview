package internal

import "sync"

type GetExtOptsFn func(db string) map[string]interface{}

type _ExtGetter struct {
	m sync.Map
}

func (eg *_ExtGetter) Register(proj string, fn GetExtOptsFn) {
	eg.m.Store(proj, fn)
}

func (eg *_ExtGetter) Get(proj string, db string) map[string]interface{} {
	fn, ok := eg.m.Load(proj)
	if !ok {
		return nil
	}
	return fn.(GetExtOptsFn)(db)
}

var ExtOptsGetter = &_ExtGetter{}
