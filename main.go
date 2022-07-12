package main

import (
	"dbview/dbs"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
)

//go:embed frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:      "DBView",
		Width:      1366,
		Height:     768,
		Assets:     assets,
		OnStartup:  app.startup,
		OnShutdown: app.shutdown,
		Bind: []interface{}{
			app,
			dbs.NewRedisProxy(),
			dbs.NewSqlProxy(),
		},
	})

	if err != nil {
		println("Error:", err)
	}
}
