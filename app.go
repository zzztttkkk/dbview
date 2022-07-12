package main

import (
	"context"
	"dbview/dbs"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"sync"
	"time"
)

type App struct {
	mut sync.Mutex
	ctx context.Context

	root     string
	items    map[string]*ProjectListItem
	projects map[string]*Project
}

func NewApp() *App {
	return &App{
		items:    map[string]*ProjectListItem{},
		projects: map[string]*Project{},
	}
}

func (app *App) startup(ctx context.Context) {
	app.ctx = ctx
}

func (app *App) shutdown(_ context.Context) {
	app.save()
}

type ProjectListItem struct {
	Name         string `json:"name"`
	LastActiveAt int64  `json:"last_active_at"`
	Env          string `json:"env"`
	Color        string `json:"color"`
}

func (app *App) Root() string {
	if len(app.root) > 0 {
		return app.root
	}
	p, e := os.UserConfigDir()
	if e != nil {
		panic(e)
	}
	app.root = path.Join(p, "zzztttkkk.dbview")

	_, e = os.Stat(app.root)
	if e != nil {
		if os.IsNotExist(e) {
			_ = os.MkdirAll(app.root, os.ModePerm)
		} else {
			panic(e)
		}
	}
	return app.root
}

func (app *App) save() {
	fn := path.Join(app.Root(), "projects.json")
	f, e := os.OpenFile(fn, os.O_WRONLY|os.O_CREATE, 0664)
	if e != nil {
		return
	}
	d, e := json.MarshalIndent(app.items, "", "\t")
	if e != nil {
		return
	}
	_, _ = f.Write(d)
}

func (app *App) ListProjects() ([]ProjectListItem, error) {
	app.mut.Lock()
	defer app.mut.Unlock()

	root := app.Root()

	files, err := ioutil.ReadDir(root)
	if err != nil {
		return nil, err
	}

	if len(app.items) < 1 {
		var previtems map[string]*ProjectListItem
		fd, e := ioutil.ReadFile(path.Join(root, "projects.json"))
		if e == nil {
			_ = json.Unmarshal(fd, &previtems)
		}
		if previtems == nil {
			previtems = map[string]*ProjectListItem{}
		}
		for _, f := range files {
			if f.IsDir() {
				proj := &ProjectListItem{Name: f.Name()}
				if prevproj := previtems[f.Name()]; prevproj != nil {
					*proj = *prevproj
				}
				if proj.LastActiveAt == 0 {
					stat, _ := os.Stat(path.Join(app.Root(), f.Name()))
					if stat != nil {
						proj.LastActiveAt = stat.ModTime().Unix()
					}
				}
				app.items[f.Name()] = proj
				continue
			}
		}
	}

	var lst []ProjectListItem
	for _, p := range app.items {
		lst = append(lst, *p)
	}
	return lst, nil
}

func (app *App) CreateProject(name string) error {
	app.mut.Lock()
	defer app.mut.Unlock()

	root := app.Root()
	fp := path.Join(root, name)
	_, err := os.Stat(fp)
	if err == nil {
		return fmt.Errorf(`project: "%s" is exists`, name)
	}

	err = os.Mkdir(fp, 0664)
	if err != nil {
		return err
	}
	app.items[name] = &ProjectListItem{Name: name, LastActiveAt: time.Now().Unix()}
	return os.MkdirAll(fp, os.ModePerm)
}

func (app *App) SetColor(name string, color string) {
	app.mut.Lock()
	defer app.mut.Unlock()

	proj := app.items[name]
	if proj == nil {
		return
	}
	proj.Color = color
}

func (app *App) getProj(name string) (*Project, error) {
	app.mut.Lock()
	defer app.mut.Unlock()

	proj := app.projects[name]
	if proj == nil {
		root := app.Root()
		var err error
		proj, err = OpenProject(path.Join(root, name))
		if err != nil {
			return nil, err
		}
		app.projects[name] = proj
	}
	return proj, nil
}

func (app *App) ListDatabases(name string) ([]DBInfo, error) {
	proj, err := app.getProj(name)
	if err != nil {
		return nil, err
	}
	return proj.Databases()
}

func (app *App) NewMysqlDatabase(name string, opts dbs.MysqlOpts) error {
	app.mut.Lock()
	proj := app.projects[name]
	app.mut.Unlock()

	return proj.newDatabase(name, "mysql", opts)
}

func (app *App) NewPostgresqlDatabase(name string, opts dbs.PostgresqlOpts) error {
	app.mut.Lock()
	proj := app.projects[name]
	app.mut.Unlock()

	return proj.newDatabase(name, "postgresql", opts)
}

func (app *App) NewRedisDatabase(name string, opts dbs.RedisOpts) error {
	app.mut.Lock()
	proj := app.projects[name]
	app.mut.Unlock()
	return proj.newDatabase(name, "redis", opts)
}
