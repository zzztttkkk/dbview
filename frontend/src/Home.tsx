import {main} from "../wailsjs/go/models"
import {Link} from "react-router-dom";
import React, {useState} from "react";
import {CreateProject} from "../wailsjs/go/main/App";
import {Input} from "baseui/input";
import {Button} from "baseui/button";
import {ListItem} from "baseui/list";
import {FlexGrid, FlexGridItem} from "baseui/flex-grid";
import {StyledLink} from "baseui/link";

export interface HomeProps {
    projects: main.ProjectList;
    reload: () => Promise<void>;
}

export function Home(props: HomeProps) {
    const [name, setName] = useState("");

    return <div>
        <div id={"ProjectsList"}>
            <ul>
                {
                    (props.projects.all || []).slice(0, 10).map(p => {
                        return <ListItem>
                            <StyledLink key={p.name}>
                                <Link
                                    to={`/${p.name}`}
                                >
                                <span>{
                                    `${p.name} ${p.last_active_at > 0 ? new Date(p.last_active_at) : "---/--/-- :--:--:--"}`
                                }</span>
                                </Link>
                            </StyledLink>
                        </ListItem>
                    })
                }
            </ul>
        </div>
        <FlexGrid
            flexGridColumnCount={3}
            flexGridColumnGap={"scale800"}
        >
            <FlexGridItem>
                <label htmlFor={"name"}>CreateNew:</label>
            </FlexGridItem>
            <FlexGridItem>
                <Input
                    type="text" id={"name"}
                    value={name}
                    onChange={(e) => {
                        setName((e.target as HTMLInputElement).value)
                    }}
                    placeholder={"Project Name"}
                    autoComplete={"off"}
                />
            </FlexGridItem>
            <FlexGridItem>
                <Button
                    onClick={
                        async () => {
                            if (!name) return;
                            setName("");
                            const err = await CreateProject(name);
                            if (err != null) return;
                            await props.reload();
                        }
                    }
                >OK
                </Button>
            </FlexGridItem>
        </FlexGrid>
    </div>
}