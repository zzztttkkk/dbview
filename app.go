package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"sync"
	"time"
)

type App struct {
	sync.Mutex
	ctx context.Context

	root     string
	projects *ProjectListData
	infos    map[string]*ProjectInfo
}

func NewApp() *App {
	return &App{
		infos: map[string]*ProjectInfo{},
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
	ReadOnly     bool   `json:"read_only"`
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

type ProjectListData struct {
	LastActiveAts map[string]int64 `json:"last_active_ats"`
}

func (app *App) projectList() *ProjectListData {
	app.Lock()
	defer app.Unlock()

	if app.projects != nil {
		return app.projects
	}
	app.projects = &ProjectListData{LastActiveAts: map[string]int64{}}
	fc, e := ioutil.ReadFile(path.Join(app.Root(), "projects.json"))
	if e != nil {
		return app.projects
	}
	if e = json.Unmarshal(fc, app.projects); e != nil {
		return app.projects
	}
	return app.projects
}

func (app *App) save() {
	app.Lock()
	defer app.Unlock()

	if app.projects == nil {
		return
	}
	fn := path.Join(app.Root(), "projects.json")
	f, e := os.OpenFile(fn, os.O_WRONLY|os.O_CREATE, 0664)
	if e != nil {
		return
	}
	fmt.Println(app.projects)
	d, e := json.MarshalIndent(app.projects, "", "\t")
	if e != nil {
		return
	}
	_, _ = f.Write(d)
}

type ProjectList struct {
	All []ProjectListItem `json:"all"`
}

func (app *App) ListProjects() (ProjectList, error) {
	root := app.Root()

	files, err := ioutil.ReadDir(root)
	if err != nil {
		return ProjectList{}, err
	}

	list := app.projectList()

	var projects ProjectList
	for _, f := range files {
		if f.IsDir() {
			proj := ProjectListItem{Name: f.Name()}
			proj.LastActiveAt = list.LastActiveAts[f.Name()]
			if proj.LastActiveAt == 0 {
				stat, _ := os.Stat(path.Join(app.Root(), f.Name()))
				if stat != nil {
					proj.LastActiveAt = stat.ModTime().Unix()
					app.projects.LastActiveAts[f.Name()] = proj.LastActiveAt
				}
			}
			projects.All = append(projects.All, proj)
			continue
		}
	}
	return projects, nil
}

func (app *App) CreateProject(name string) error {
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

	gd := app.projectList()
	if gd == nil {
		gd = &ProjectListData{
			LastActiveAts: map[string]int64{},
		}
	}
	gd.LastActiveAts[name] = time.Now().Unix()
	app.save()
	return os.MkdirAll(fp, os.ModePerm)
}

type ProjectInfo struct {
	Name      string   `json:"name"`
	RedisList []string `json:"redis_list"`
}

func (app *App) OpenProject(name string) ProjectInfo {
	info, ok := app.infos[name]
	if ok {
		return *info
	}
	pinfo := &ProjectInfo{
		Name: name,
	}
	app.infos[name] = pinfo
	app.projects.LastActiveAts[name] = time.Now().Unix()
	app.save()
	return *pinfo
}
