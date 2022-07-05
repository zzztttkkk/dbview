import {main} from "../wailsjs/go/models"
import React, {useState} from "react";
import {CreateProject} from "../wailsjs/go/main/App";
import {Input} from "baseui/input";
import {Button} from "baseui/button";
import {ListItem} from "baseui/list";
import {StyledLink} from "baseui/link";
import {useStyletron} from "baseui";

export interface HomeProps {
    projects: main.ProjectList;
    reload: () => Promise<void>;
}

export function Home(props: HomeProps) {
    const [name, setName] = useState("");
    const [css, theme] = useStyletron();

    return <div>
        <div id={"ProjectsList"}>
            <ul>
                {
                    (props.projects.all || []).slice(0, 10).map(p => {
                        return <ListItem key={p.name}>
                            <StyledLink
                                href={`/#/${p.name}`}
                            >
                                <div
                                    className={css({width: "100%"})}
                                >
                                    {
                                        `${p.name} ${p.last_active_at > 0 ? new Date(p.last_active_at) : "---/--/-- :--:--:--."}`
                                    }
                                </div>
                            </StyledLink>
                        </ListItem>
                    })
                }
            </ul>
        </div>
        <div className={css({
            display: "flex",
            width: "20vw",
            minWidth: "600px",
            margin: `${theme.sizing.scale400} auto`,
        })}>
            <Input
                type="text" id={"name"}
                value={name}
                onChange={(e) => {
                    setName((e.target as HTMLInputElement).value)
                }}
                placeholder={"New Project Name"}
                autoComplete={"off"}
                overrides={{
                    Root: {
                        style: {
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
            />
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
                overrides={{
                    BaseButton: {
                        style: {
                            borderBottomLeftRadius: "1px",
                            borderBottomRightRadius: "1px",
                            borderTopRightRadius: "1px",
                            borderTopLeftRadius: "1px"
                        }
                    }
                }}
            >OK
            </Button>
        </div>
    </div>
}