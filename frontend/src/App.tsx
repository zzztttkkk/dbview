import {HashRouter, Route, Routes} from 'react-router-dom';
import {Home} from './Home';
import {useEffect, useState} from "react";
import {ListProjects} from "../wailsjs/go/main/App"
import {main} from "../wailsjs/go/models";
import {ProjectView} from './ProjectView';

function App() {
    const [projects, setProjects] = useState({} as main.Projects);

    useEffect(() => {
        const promise = ListProjects();
        promise.then((v) => {
            if (v instanceof Error) {
                return;
            }
            setProjects(v);
        });
    }, []);

    async function reload() {
        const ps = await ListProjects();
        if (ps instanceof Error) {
            return;
        }
        setProjects(ps);
    }

    return (
        <HashRouter>
            <Routes>
                <Route path={"/"} key={"/"} element={<Home projects={projects} reload={reload}/>}/>
                {
                    (projects.all || []).sort(
                        (a, b) => {
                            if (a.name === projects.default) {
                                return -1;
                            }
                            if (b.name === projects.default) {
                                return 1;
                            }
                            return a.last_active_at - b.last_active_at;
                        }).map((p) => {
                        return <Route path={`/${p.name}`} key={p.name} element={<ProjectView project={p}/>}/>
                    })
                }
            </Routes>
        </HashRouter>
    )
}

export default App
