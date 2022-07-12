import React, {useState} from "react";
import {Input} from "baseui/input";
import {useStyletron} from "baseui";
import {Select} from "baseui/select";
import {Btn} from "./Btn";
import Styles from "./Styles";

interface MysqlOptsFormProps {
}

export function MysqlOptsForm(props: MysqlOptsFormProps) {
    const [css, theme] = useStyletron();
    const [host, setHost] = useState("");
    const [port, setPort] = useState("" as (number | string));
    const [dbName, setDbName] = useState("");
    const [userName, setUserName] = useState("");
    const [pwd, setPwd] = useState("");
    const [timeout, setTimeout] = useState("" as (number | string));

    return <>
        <div className={css({display: "flex", justifyContent: "center",})}>
            <Input
                type={"text"} required={true}
                value={host}
                onChange={event => setHost((event.target as HTMLInputElement).value)}
                overrides={{
                    Root: {
                        style: {
                            width: `60%`,
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
                placeholder={"127.0.0.1"}
            />
            <Input
                type={"number"} required={true} step={1} min={1} max={2 << 16}
                value={port}
                onChange={event => {
                    const v = (event.target as HTMLInputElement).value;
                    if (!v) {
                        setPort(3306);
                        return;
                    }
                    const nv = Number.parseInt(v);
                    if (Number.isNaN(nv) || nv < 1 || nv > 2 << 16) {
                        setPort(3306);
                        return;
                    }
                    setPort(nv);
                }}
                placeholder={"3306"}
                overrides={{
                    Root: {
                        style: {
                            width: `40%`
                        }
                    }
                }}
            />
        </div>
        <div className={css({margin: `${theme.sizing.scale400} 0`})}>
            <Input
                type={"text"} required={true}
                value={dbName}
                onChange={event => setDbName((event.target as HTMLInputElement).value)}
                placeholder={"database name in remote host, default to 'mysql'"}
            />
        </div>
        <div className={css({display: "flex", justifyContent: "center", margin: `${theme.sizing.scale400} 0`})}>
            <Input
                type={"text"} required={true}
                value={userName}
                onChange={event => setUserName((event.target as HTMLInputElement).value)}
                overrides={{
                    Root: {
                        style: {
                            width: `40%`,
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
                placeholder={"username"}
            />
            <Input
                type={"password"} required={true}
                value={pwd}
                onChange={event => setPwd((event.target as HTMLInputElement).value)}
                placeholder={"******"}
                overrides={{
                    Root: {
                        style: {
                            width: `60%`
                        }
                    }
                }}
            />
        </div>
        <div className={css({display: "flex", justifyContent: "center", margin: `${theme.sizing.scale400} 0`})}>
            <Select
                placeholder={"environment"}
                options={[{label: "Dev"}, {label: "Test"}, {label: "Prod"}]}
                overrides={{
                    Root: {
                        style: {
                            // width: "25%",
                        }
                    }
                }}
            />
            <Select
                placeholder={"read only"}
                options={[{label: "True"}, {label: "False"}]}
                overrides={{
                    Root: {
                        style: {
                            // width: "25%",
                            margin: `0 ${theme.sizing.scale400}`
                        }
                    }
                }}
            />
            <Input
                type={"number"} required={true} step={1} min={45} value={timeout}
                onChange={event => {
                    const v = (event.target as HTMLInputElement).value;
                    if (!v) {
                        setTimeout(45);
                        return;
                    }
                    const nv = Number.parseInt(v);
                    if (Number.isNaN(nv) || nv < 45) {
                        setTimeout(45);
                        return;
                    }
                    setTimeout(nv);
                }}
                placeholder={"45s"}
                overrides={{
                    Root: {
                        style: {
                            // width: `25%`,
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
            />
            <Btn
                onClick={(evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                }}
                overrides={{
                    BaseButton: {
                        style: {
                            width: "50%",
                            ...Styles.BorderRadiusSizing(theme)
                        }
                    }
                }}
            >SSL</Btn>
        </div>
    </>
}