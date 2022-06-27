package utils

import (
	"io/ioutil"
	"os"
	"path"
)

type _FsNamespace struct{}

//goland:noinspection GoUnusedGlobalVariable
var Fs = _FsNamespace{}

func (_FsNamespace) AppPath() (string, error) {
	p, e := os.UserConfigDir()
	if e != nil {
		return "", e
	}
	return path.Join(p, "zzztttkkk.dbview"), nil
}

func (fs _FsNamespace) Mkdir(fp string) error {
	root, e := fs.AppPath()
	if e != nil {
		return e
	}
	return os.Mkdir(path.Join(root, fp), os.ModeDir)
}

func (fs _FsNamespace) ReadAll(fp string) ([]byte, error) {
	root, e := fs.AppPath()
	if e != nil {
		return nil, e
	}
	f, e := os.Open(path.Join(root, fp))
	if e != nil {
		return nil, e
	}
	return ioutil.ReadAll(f)
}

func (fs _FsNamespace) WriteTo(fp string, bytes []byte) error {
	root, e := fs.AppPath()
	if e != nil {
		return e
	}
	f, e := os.OpenFile(path.Join(root, fp), os.O_WRONLY|os.O_CREATE, 0664)
	if e != nil {
		return e
	}
	_ = f.Truncate(0)
	_, e = f.Write(bytes)
	return e
}

func (fs _FsNamespace) AppendTo(fp string, bytes []byte) error {
	root, e := fs.AppPath()
	if e != nil {
		return e
	}
	f, e := os.OpenFile(path.Join(root, fp), os.O_APPEND|os.O_CREATE, 0664)
	if e != nil {
		return e
	}
	_, e = f.Write(bytes)
	return e
}

func (fs _FsNamespace) Exists(fp string) (bool, error) {
	root, e := fs.AppPath()
	if e != nil {
		return false, e
	}
	_, e = os.Stat(path.Join(root, fp))
	if e == os.ErrNotExist {
		return false, nil
	}
	return true, nil
}
