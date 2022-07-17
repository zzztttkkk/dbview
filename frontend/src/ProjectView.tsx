import {dbs, main} from "../wailsjs/go/models";
import React, {useEffect, useState} from "react";
import {StyledLink} from "baseui/link";
import {WindowSetTitle} from "../wailsjs/runtime";
import {ListDatabases} from "../wailsjs/go/main/App";
import {ListItem} from "baseui/list";
import {useStyletron} from "baseui";
import {Input} from "baseui/input";
import {Select} from "baseui/select";
import {Btn} from "./comps/Btn";
import {Modal, ModalBody, ModalButton, ModalFooter, ModalHeader,} from 'baseui/modal';
import {MysqlOptsForm} from "./comps/MysqlOptsForm";
import {PostgresqlOptsForm} from "./comps/PostgresqlOptsForm";
import {RedisOptsForm} from "./comps/RedisOptsForm";
import Styles from "./comps/Styles";
import {MongoOptsForm} from "./comps/MongoOptsForm";
import {TestMysql, TestPostgresql} from "../wailsjs/go/dbs/SqlProxy";
import MysqlOpts = dbs.MysqlOpts;
import PostgresqlOpts = dbs.PostgresqlOpts;

export interface ProjectViewProps {
    all: main.ProjectListItem[];
    project: main.ProjectListItem;
}

enum DatabaseType {
    Mysql,
    Postgresql,
    Mongo,
    Redis,
}

interface OptsEditorProps {
    close: () => void;
    dbName: string;
    dbType: DatabaseType | null;
}

function OptsEditor(props: OptsEditorProps) {
    if (props.dbType == null || !props.dbName) return null;
    const [, theme] = useStyletron();
    let MysqlOptsGetter: (() => dbs.MysqlOpts | null) | null = null;
    let PostgresqlOptsGetter: (() => dbs.PostgresqlOpts) | null = null;

    function Editor() {
        switch (props.dbType) {
            case DatabaseType.Mysql: {
                return <MysqlOptsForm SetOptsGetter={(fn) => {
                    MysqlOptsGetter = fn;
                }}/>
            }
            case DatabaseType.Postgresql: {
                return <PostgresqlOptsForm/>
            }
            case DatabaseType.Mongo: {
                return <MongoOptsForm/>
            }
            case DatabaseType.Redis: {
                return <RedisOptsForm/>
            }
            default: {
                return <div>Unknown Database Type: {`${props.dbType}`}</div>
            }
        }
    }

    function getOpts(): dbs.PostgresqlOpts | dbs.MysqlOpts | null {
        switch (props.dbType) {
            case DatabaseType.Mysql: {
                if (!MysqlOptsGetter) return null;
                return MysqlOptsGetter();
            }
            case DatabaseType.Postgresql: {
                if (!PostgresqlOptsGetter) return null;
                return PostgresqlOptsGetter();
            }
            default: {
                return null;
            }
        }
    }

    async function test() {
        const opts = getOpts();
        if (!opts) return false;
        switch (props.dbType) {
            case DatabaseType.Mysql: {
                return TestMysql(opts as MysqlOpts);
            }
            case DatabaseType.Postgresql: {
                return TestPostgresql(opts as PostgresqlOpts);
            }
            default: {
                return new Error(`0.0`);
            }
        }
    }

    async function ok() {

    }

    return <>
        <ModalHeader>{`Configure ${DatabaseType[props.dbType]} Database: ${props.dbName}`}</ModalHeader>
        <ModalBody>
            <Editor/>
        </ModalBody>
        <ModalFooter>
            <ModalButton
                kind="tertiary"
                onClick={props.close}
                overrides={{
                    BaseButton: {
                        style: {
                            ...Styles.BorderRadiusSizing(theme)
                        }
                    }
                }}
            >Cancel</ModalButton>
            <ModalButton
                kind="tertiary"
                onClick={async (evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    await test();
                    props.close();
                }}
                overrides={{
                    BaseButton: {
                        style: {
                            ...Styles.BorderRadiusSizing(theme)
                        }
                    }
                }}
            >Test</ModalButton>
            <ModalButton
                onClick={async (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    await ok();
                    props.close();
                }}
                overrides={{
                    BaseButton: {
                        style: {
                            ...Styles.BorderRadiusSizing(theme)
                        }
                    }
                }}
            >Okay</ModalButton>
        </ModalFooter>
    </>
}

export function ProjectView(props: ProjectViewProps) {
    const [dbs, setDbs] = useState([] as main.DBInfo[]);
    const [css, theme] = useStyletron();
    const [dbName, setDbName] = useState("");
    const [dbTypes, setDbTypes] = useState([]);
    const [isOpen, setIsOpen] = React.useState(false);

    useEffect(function () {
        WindowSetTitle(`DBView: ${props.project.name}`);
        ListDatabases(props.project.name).then((v) => {
            if (v instanceof Error) {
                window.app.Alert(v.message, {kind: "negative"});
                return;
            }
            setDbs(v || []);
        }).catch(e => {
            window.app.Alert(e.toString(), {kind: "negative"});
        });
    }, [props.project])

    function exists(): boolean {
        for (const db of dbs) {
            if (db.name === dbName) return true;
        }
        return false;
    }

    return <div className={css({position: "relative"})}>
        <div>
            <ul>
                {
                    dbs.map((db) => {
                        return <ListItem key={db.name}>
                            <StyledLink>
                                <h2>{db.name}</h2>
                            </StyledLink>
                        </ListItem>
                    })
                }
            </ul>
        </div>
        <div
            className={css({
                marginTop: theme.sizing.scale400,
                position: "relative",
                justifyContent: "center",
                display: "flex",
            })}
        >
            <Input
                type={"text"} value={dbName}
                onChange={(e) => {
                    let val = (e.target as HTMLInputElement).value.replaceAll(/\s/g, "");
                    if (val.length >= 1) val = `${val[0].toUpperCase()}${val.slice(1)}`;
                    setDbName(val);
                }}
                placeholder={"New Database Name In The App"}
                autoComplete={"off"}
                overrides={{
                    Root: {
                        style: {
                            width: "30%",
                            marginRight: theme.sizing.scale400,
                        }
                    }
                }}
            />
            <Select
                backspaceRemoves={false}
                value={dbTypes}
                onChange={params => setDbTypes(params.value as any)}
                placeholder={"Database Type"}
                options={
                    Array.from(Object.keys(DatabaseType))
                        .filter(k => Number.isNaN(Number.parseInt(k)))
                        .sort((a, b) => {
                            // @ts-ignore
                            return DatabaseType[a] - DatabaseType[b]
                        }).map(k => {
                        return {label: k}
                    })
                }
                labelKey={"label"}
                valueKey={"label"}
                overrides={{
                    Root: {
                        style: {
                            width: "20%",
                            marginRight: theme.sizing.scale400,
                        }
                    }
                }}
            />
            <Btn
                disabled={!dbName || exists() || !dbTypes || dbTypes.length < 1}
                onClick={() => setIsOpen(true)}
            >Configure</Btn>
        </div>
        <Modal
            isOpen={isOpen} onClose={() => setIsOpen(false)}
            overrides={{
                Dialog: {
                    style: {
                        width: "875px",
                        ...Styles.BorderRadiusSizing(theme)
                    }
                }
            }}
        >
            <OptsEditor
                dbName={dbName}
                dbType={dbTypes && dbTypes.length > 0 ? DatabaseType[(dbTypes[0] as any).label] as any as DatabaseType : null}
                close={() => setIsOpen(false)}
            />
        </Modal>
    </div>
}