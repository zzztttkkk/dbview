import {main} from "../wailsjs/go/models";
import React from "react";
import {StyledLink} from "baseui/link";

export interface ProjectViewProps {
    project: main.ProjectListItem
}

export function ProjectView(props: ProjectViewProps) {
    return <div>
        <div>
            <StyledLink href={"#/"}>Home</StyledLink>
        </div>
        <h1>{props.project.name}</h1>
    </div>
}