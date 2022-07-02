import {Link} from "react-router-dom";
import {main} from "../wailsjs/go/models";

export interface ProjectViewProps {
    project: main.Project
}

export function ProjectView(props: ProjectViewProps) {
    return <div>
        <div>
            <Link to={"/"}>Home</Link>
        </div>
        <h1>{props.project.name}</h1>
    </div>
}