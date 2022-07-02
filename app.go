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

	root     string
	projects *_GlobalData
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

func (app *App) startup(ctx context.Context) {
	app.ctx = ctx
}

type Project struct {
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

type _GlobalData struct {
	LastActiveAts map[string]int64 `json:"last_active_ats"`
	Default       string           `json:"default"`
}

func (app *App) readGlobalData() *_GlobalData {
	if app.projects != nil {
		return app.projects
	}
	fc, e := ioutil.ReadFile(path.Join(app.Root(), "projects.json"))
	if e != nil {
		return nil
	}
	var gd _GlobalData
	if e = json.Unmarshal(fc, &gd); e != nil {
		return nil
	}
	return &gd
}

func (app *App) writeGlobalData() {
	if app.projects == nil {
		return
	}
	fn := path.Join(app.Root(), "projects.json")
	f, e := os.OpenFile(fn, os.O_WRONLY|os.O_CREATE, 0664)
	if e != nil {
		return
	}
	d, e := json.Marshal(app.projects)
	if e != nil {
		return
	}
	_, _ = f.Write(d)
}

type Projects struct {
	All     []Project `json:"all"`
	Default string    `json:"default"`
}

func (app *App) ListProjects() (Projects, error) {
	root := app.Root()

	files, err := ioutil.ReadDir(root)
	if err != nil {
		return Projects{}, err
	}

	gd := app.readGlobalData()

	var projects Projects
	for _, f := range files {
		if f.IsDir() {
			proj := Project{Name: f.Name()}
			if gd != nil && gd.LastActiveAts != nil {
				proj.LastActiveAt = gd.LastActiveAts[f.Name()]
			}
			projects.All = append(projects.All, proj)
			continue
		}
	}

	dp := ""
	if gd != nil && len(gd.Default) > 0 {
		fund := false
		for _, p := range projects.All {
			if p.Name == gd.Default {
				fund = true
				break
			}
		}
		if fund {
			dp = gd.Default
		}
	}
	projects.Default = dp
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
		panic(err)
	}

	gd := app.readGlobalData()
	if gd == nil {
		gd = &_GlobalData{
			LastActiveAts: map[string]int64{},
		}
	}
	gd.LastActiveAts[name] = time.Now().Unix()
	app.writeGlobalData()
	return os.MkdirAll(fp, os.ModePerm)
}
