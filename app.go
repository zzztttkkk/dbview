package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"time"
)

// App struct
type App struct {
	ctx context.Context

	root            string
	projectListData *ProjectListData
	projectInfo     map[string]*ProjectInfo
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		projectInfo: map[string]*ProjectInfo{},
	}
}

func (app *App) startup(ctx context.Context) {
	app.ctx = ctx
}

func (app *App) shutdown(_ context.Context) {
	app.writeProjectList()
}

type ProjectListItem struct {
	Name         string `json:"name"`
	LastActiveAt int64  `json:"last_active_at"`
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
	Default       string           `json:"default"`
}

func (app *App) readProjectList() *ProjectListData {
	defer func() {
		if app.projectListData.LastActiveAts == nil {
			app.projectListData.LastActiveAts = map[string]int64{}
		}
	}()

	if app.projectListData != nil {
		return app.projectListData
	}
	app.projectListData = &ProjectListData{LastActiveAts: map[string]int64{}}
	fc, e := ioutil.ReadFile(path.Join(app.Root(), "projects.json"))
	if e != nil {
		return app.projectListData
	}
	app.projectListData.LastActiveAts = nil
	if e = json.Unmarshal(fc, app.projectListData); e != nil {
		return app.projectListData
	}
	return app.projectListData
}

func (app *App) writeProjectList() {
	if app.projectListData == nil {
		return
	}
	fn := path.Join(app.Root(), "projects.json")
	f, e := os.OpenFile(fn, os.O_WRONLY|os.O_CREATE, 0664)
	if e != nil {
		return
	}
	d, e := json.Marshal(app.projectListData)
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

	list := app.readProjectList()

	var projects ProjectList
	for _, f := range files {
		if f.IsDir() {
			proj := ProjectListItem{Name: f.Name()}
			if list != nil && list.LastActiveAts != nil {
				proj.LastActiveAt = list.LastActiveAts[f.Name()]
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

	gd := app.readProjectList()
	if gd == nil {
		gd = &ProjectListData{
			LastActiveAts: map[string]int64{},
		}
	}
	gd.LastActiveAts[name] = time.Now().Unix()
	app.writeProjectList()
	return os.MkdirAll(fp, os.ModePerm)
}

type ProjectInfo struct {
	Name      string   `json:"name"`
	RedisList []string `json:"redis_list"`
}

func (app *App) OpenProject(name string) ProjectInfo {
	info, ok := app.projectInfo[name]
	if ok {
		return *info
	}
	pinfo := &ProjectInfo{
		Name: name,
	}
	app.projectInfo[name] = pinfo
	app.projectListData.LastActiveAts[name] = time.Now().Unix()
	return *pinfo
}
