import {main} from "../wailsjs/go/models"
import React, {useEffect, useRef, useState} from "react";
import {CreateProject} from "../wailsjs/go/main/App";
import {Input} from "baseui/input";
import {ListItem} from "baseui/list";
import {useStyletron} from "baseui";
import {StyledLink} from "baseui/link";
import {Btn} from "./comps/Btn";
import {WindowSetTitle} from "../wailsjs/runtime";

export interface HomeProps {
    projects: main.ProjectList;
    reload: () => Promise<void>;
}

export function Home(props: HomeProps) {
    const [name, setName] = useState("");
    const [liHeight, setLiHeight] = useState(0);
    const [css, theme] = useStyletron();
    const ref = useRef(null);

    function exists(): boolean {
        if (!props.projects.all) return false;
        for (const p of props.projects.all) {
            if (p.name === name) return true;
        }
        return false;
    }


    useEffect(function () {
        WindowSetTitle("DBView");

        const ele = ref.current as any as HTMLElement;
        const fli = ele.querySelector("li");
        if (fli) setLiHeight(fli.clientHeight);
    }, [props.projects]);

    return <div>
        <div ref={ref} className={liHeight > 0 ? css({maxHeight: `${liHeight * 6}px`, overflowY: "scroll"}) : ""}>
            <ul>
                {
                    (props.projects.all || []).map(p => {
                        return <ListItem key={p.name}>
                            <div className={css({display: "flex"})}>
                                <StyledLink href={`/#/${p.name}`} target={"_self"}>
                                    <h2 className={css({width: "12em", textOverflow: "ellipsis", overflowX: "hidden"})}>
                                        {`${p.name}`}
                                    </h2>
                                </StyledLink>
                            </div>
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
                    let val = (e.target as HTMLInputElement).value.replaceAll(/\s/g, "");
                    setName(`${val[0].toUpperCase()}${val.slice(1)}`)
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
            <Btn
                disabled={name.length < 1 || exists()}
                onClick={
                    async () => {
                        if (!name) return;
                        try {
                            await CreateProject(name)
                        } catch (e) {
                            return;
                        }
                        setName("");
                        await props.reload();
                    }
                }
            >OK
            </Btn>
        </div>
    </div>
}