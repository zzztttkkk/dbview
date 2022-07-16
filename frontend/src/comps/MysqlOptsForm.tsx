import React, {useState} from "react";
import {Input, SIZE} from "baseui/input";
import {useStyletron} from "baseui";
import {Select} from "baseui/select";
import {StatefulTooltip} from "baseui/tooltip";
import {Btn} from "./Btn";
import Styles from "./Styles";
import {SIZE as BtnSize} from "baseui/button";
import {dbs} from "../../wailsjs/go/models";

interface MysqlOptsFormProps {
    host?: string;
    port?: number | string;
    db?: string;
    username?: string;
    password?: string;
    timeout?: number | string;
    tls?: {
        pem?: string;
        servername?: string;
    },
    setCfgGetter: (fn: () => dbs.MysqlOpts) => void;
}

const MysqlTLSPemFileInput = "MysqlTLSPemFileInput"

export function MysqlOptsForm(props: MysqlOptsFormProps) {
    const [css, theme] = useStyletron();
    const [host, setHost] = useState(props.host || "");
    const [port, setPort] = useState(props.port);
    const [db, setDb] = useState(props.db);
    const [username, setUsername] = useState(props.username || "");
    const [password, setPassword] = useState(props.password || "");
    const [timeout, setTimeout] = useState(props.timeout || "");

    function getCfg(): dbs.MysqlOpts {
        return new dbs.MysqlOpts();
    }

    props.setCfgGetter(getCfg);

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
                value={db}
                onChange={event => setDb((event.target as HTMLInputElement).value)}
                placeholder={"database name in remote host, default to 'mysql'"}
            />
        </div>
        <div className={css({display: "flex", justifyContent: "center", margin: `${theme.sizing.scale400} 0`})}>
            <Input
                type={"text"} required={true}
                value={username}
                onChange={event => setUsername((event.target as HTMLInputElement).value)}
                overrides={{
                    Root: {
                        style: {
                            width: `350px`,
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
                placeholder={"username"}
            />
            <Input
                type={"password"} required={true}
                value={password}
                onChange={event => setPassword((event.target as HTMLInputElement).value)}
                placeholder={"******"}
            />
        </div>
        <div className={css({display: "flex", margin: `${theme.sizing.scale400} 0`})}>
            <Select
                placeholder={"environment"}
                options={[{label: "Dev"}, {label: "Test"}, {label: "Prod"}]}
                overrides={{Root: {style: {width: "160px"}}}}
            />
            <Select
                placeholder={"read only"}
                options={[{label: "True"}, {label: "False"}]}
                overrides={{
                    Root: {
                        style: {
                            margin: `0 ${theme.sizing.scale400}`,
                            width: "160px",
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
                placeholder={"timeouts,45s"}
                overrides={{
                    Root: {
                        style: {
                            width: `160px`,
                            marginRight: theme.sizing.scale400
                        }
                    }
                }}
            />
            <div className={css({display: "none"})}>
                <input
                    type="file" accept={".pem"} id={MysqlTLSPemFileInput}
                />
            </div>

            <StatefulTooltip
                content={() => {
                    return <div className={css({width: "300px"})}>
                        <Btn
                            size={BtnSize.mini}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                                document.getElementById(MysqlTLSPemFileInput)!.click();
                            }}
                            overrides={{
                                Root: {
                                    style: {
                                        width: "100%",
                                        marginBottom: theme.sizing.scale300,
                                        ...Styles.BorderRadiusSizing(theme),
                                    }
                                }
                            }}
                        >Select PEM File</Btn>
                        <Input size={SIZE.mini} type={"text"} placeholder={"Server Name"}/>
                    </div>
                }}
                triggerType={"click"}
                overrides={{
                    Inner: {
                        style: {
                            backgroundColor: theme.colors.backgroundPrimary,
                            paddingLeft: theme.sizing.scale300,
                            paddingRight: theme.sizing.scale300,
                            ...Styles.BorderRadiusSizing(theme),
                        }
                    }
                }}
            >
                <div>
                    <Btn overrides={{
                        Root: {
                            style: {
                                userSelect: "none",
                                ...Styles.BorderRadiusSizing(theme),
                            }
                        }
                    }}>TLS</Btn>
                </div>
            </StatefulTooltip>
        </div>
    </>
}