import {main} from "../wailsjs/go/models";
import React, {useEffect, useState} from "react";
import {StyledLink} from "baseui/link";
import {WindowSetTitle} from "../wailsjs/runtime";

export interface ProjectViewProps {
    all: main.ProjectListItem[];
    project: main.ProjectListItem;
}

export function ProjectView(props: ProjectViewProps) {
    const [dbs, setDbs] = useState(null);

    useEffect(function () {
        WindowSetTitle(`DBView: ${props.project.name}`);
    }, [props.project])

    return <div>
        <div>
            <StyledLink href={"#/"}><h2>Home</h2></StyledLink>
        </div>
        <h1>{props.project.name}</h1>
    </div>
}