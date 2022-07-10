import {HashRouter, Route, Routes} from 'react-router-dom';
import {Home} from './Home';
import React, {useEffect, useState} from "react";
import {ListProjects} from "../wailsjs/go/main/App"
import {main} from "../wailsjs/go/models";
import {ProjectView} from './ProjectView';
import {DarkTheme, LightTheme, LocaleProvider, Theme, ThemeProvider} from "baseui";
import {Provider as StyletronProvider} from 'styletron-react';
import {Client as Styletron} from 'styletron-engine-atomic';
import * as Luxon from "luxon";
import {ToasterContainer} from 'baseui/toast';
import {I18N} from './I18N';

function nothing() {
}

function Routers() {
    const [projects, setProjects] = useState([] as main.ProjectListItem[]);

    async function reload() {
        const ps = await ListProjects();
        if (ps instanceof Error) return;
        setProjects(ps);
    }

    useEffect(() => {
        reload().finally(nothing);
    }, []);

    if (projects) {
        projects.sort((a, b) => {
            return b.last_active_at - a.last_active_at;
        });
    }

    return (
        <>
            <HashRouter>
                <Routes>
                    <Route path={"/"} key={"/"} element={<Home projects={projects} reload={reload}/>}/>
                    {
                        (projects || []).map((p) => {
                            return (
                                <Route
                                    key={p.name}
                                    path={`/${p.name}`}
                                    element={
                                        <ProjectView project={p} all={projects || []}/>
                                    }
                                />
                            )
                        })
                    }
                </Routes>
            </HashRouter>
            <ToasterContainer/>
        </>
    )
}

const themes: { [k: string]: Theme } = {
    "light": LightTheme,
    "dark": DarkTheme
};

const engine = new Styletron();

function App() {
    const [themeName, setThemeName] = useState("light");
    window.AppChangeTheme = (name: string) => {
        setThemeName(name);
    }
    const [localeName, setLocaleName] = useState("en");
    Luxon.Settings.defaultLocale = localeName;
    window.AppChangeLocale = (name: string) => {
        setLocaleName(name);
    }

    return (
        <StyletronProvider value={engine}>
            <LocaleProvider locale={I18N(localeName)}>
                <ThemeProvider theme={themes[themeName] || LightTheme}>
                    <Routers/>
                </ThemeProvider>
            </LocaleProvider>
        </StyletronProvider>
    )
}

export default App
