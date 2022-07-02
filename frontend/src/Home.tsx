import {main} from "../wailsjs/go/models"
import {Link} from "react-router-dom";
import {useState} from "react";
import {CreateProject} from "../wailsjs/go/main/App";

export interface HomeProps {
    projects: main.Projects;
    reload: () => Promise<void>;
}

export function Home(props: HomeProps) {
    const [name, setName] = useState("");

    return <div>
        <div id={"ProjectsList"}>
            <ul>
                {
                    (props.projects.all || []).slice(0, 10).map(p => {
                        return <div key={p.name}>
                            <Link
                                to={`/${p.name}`}
                            >
                                <span>{
                                    `${p.name} ${p.last_active_at > 0 ? new Date(p.last_active_at) : "---/--/-- :--:--:--"}`
                                }</span>
                            </Link>
                        </div>
                    })
                }
            </ul>
        </div>
        <div id={"ProjectCreateForm"}>
            <label htmlFor={"name"}>CreateNew:</label>
            <input
                type="text" id={"name"}
                value={name} onChange={(e) => {
                setName(e.target.value)
            }}
                placeholder={"Project Name"}
            />
            <button
                onClick={
                    async () => {
                        if (!name) return;
                        const err = await CreateProject(name);
                        if (err != null) {
                            return;
                        }
                        await props.reload();
                    }
                }
            >OK
            </button>
        </div>
    </div>
}