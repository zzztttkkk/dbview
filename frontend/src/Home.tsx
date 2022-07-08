import {main} from "../wailsjs/go/models"
import React, {useEffect, useRef, useState} from "react";
import {CreateProject, SetColor} from "../wailsjs/go/main/App";
import {Input} from "baseui/input";
import {ListItem} from "baseui/list";
import {useStyletron} from "baseui";
import {StyledLink} from "baseui/link";
import {Btn} from "./comps/Btn";
import {WindowSetTitle} from "../wailsjs/runtime";
import * as Luxon from "luxon";
import {CirclePicker} from "react-color";
import {StyleObject} from "styletron-standard";
import {toaster} from 'baseui/toast';
import Styles from "./comps/Styles";

export interface HomeProps {
    projects: main.ProjectListItem[];
    reload: () => Promise<void>;
}

const colors = [
    "#592C63", "#FFBA84", "#3F2B36",
    "#F7D94C", "#096148", "#0F2540",
    "#D7C4BB", "#646A58", "#005CAF",
    "#58B2DC", "#B5495B", "#FEDFE1",
    "#897D55", "#577C8A", "#516E41",
    "#994639", "#24936E", "#A5DEE4",
    "#D75455", "#434343", "#947A6D"
];

let currentProjName: string = "";

export function Home(props: HomeProps) {
    const [name, setName] = useState("");
    const [liHeight, setLiHeight] = useState(0);
    const [colorPickerWrapperCss, setColorPickerWrapperCss] = useState({display: "none"} as StyleObject);
    const [colorPickerCss, setColorPickerCss] = useState({} as React.CSSProperties);
    const [css, theme] = useStyletron();
    const ulWrapperRef = useRef(null);
    const colorPickerWrapperRef = useRef(null);

    function exists(): boolean {
        if (!props.projects) return false;
        for (const p of props.projects) {
            if (p.name === name) return true;
        }
        return false;
    }


    useEffect(function () {
        WindowSetTitle("DBView");

        const ele = ulWrapperRef.current as any as HTMLElement;
        const fli = ele.querySelector("li");
        if (fli) setLiHeight(fli.clientHeight);
    }, [props.projects]);

    return <div>
        <div
            className={css(colorPickerWrapperCss)} ref={colorPickerWrapperRef}
            onClick={(evt) => {
                evt.stopPropagation();
                setColorPickerWrapperCss({display: "none"});
            }}
        >
            <CirclePicker
                width={"220px"} circleSize={16} colors={colors}
                styles={{default: {card: {...colorPickerCss}}}}
                onChangeComplete={async (color) => {
                    if (!currentProjName) return;
                    await SetColor(currentProjName, color.hex);
                    await props.reload();
                }}
            />
        </div>

        <div ref={ulWrapperRef} className={liHeight > 0 ? css({
            maxHeight: `${liHeight * 6}px`,
            overflowY: "auto",
            overflowX: "hidden"
        }) : ""}>
            <ul>
                {
                    (props.projects || []).map(p => {
                        return <ListItem key={p.name}>
                            <div className={css({display: "flex"})}>
                                <div className={css({
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                })}>
                                    <div
                                        data-proj-name={p.name}
                                        className={css({
                                            width: "16px",
                                            height: "16px",
                                            background: p.color ? p.color : "",
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                            borderColor: p.color ? "" : theme.colors.contentPositive,
                                            borderStyle: p.color ? "none" : "solid",
                                            borderWidth: p.color ? "0px" : "1px"
                                        })}
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            const evtEle = evt.target as HTMLElement;
                                            currentProjName = evtEle.getAttribute("data-proj-name") || "";

                                            const wrapperEle = (colorPickerWrapperRef.current!) as HTMLElement;
                                            if (wrapperEle.clientHeight < 1) {
                                                setColorPickerWrapperCss({
                                                    position: "absolute",
                                                    width: "100vw",
                                                    height: "100vh"
                                                });
                                                const top = evtEle.offsetTop - (ulWrapperRef.current! as HTMLElement).scrollTop + 1;
                                                setColorPickerCss({
                                                    position: "absolute",
                                                    left: `${evtEle.offsetLeft + 1}px`,
                                                    top: `${top}px`
                                                });
                                            } else {
                                                setColorPickerWrapperCss({display: "none"});
                                            }
                                        }}
                                    >
                                    </div>
                                </div>
                                <StyledLink href={`/#/${p.name}`} target={"_self"}>
                                    <h2 className={css({
                                        textOverflow: "ellipsis",
                                        overflowX: "hidden",
                                        marginLeft: theme.sizing.scale400
                                    })}>
                                        {`${p.name}`}
                                    </h2>
                                </StyledLink>
                                {
                                    p.read_only
                                        ?
                                        <h6
                                            className={css({
                                                fontSize: theme.sizing.scale600,
                                                fontWeight: "400",
                                                color: theme.colors.negative400,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                marginLeft: theme.sizing.scale400
                                            })}
                                        >ReadOnly</h6>
                                        :
                                        null
                                }
                            </div>
                            <div>
                                <p className={css({
                                    height: "100%",
                                    lineHeight: "100%",
                                })}>
                                    {Luxon.DateTime.fromSeconds(p.last_active_at).toRelative({})}
                                </p>
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
                    if (val.length > 1) val = `${val[0].toUpperCase()}${val.slice(1)}`;
                    setName(val);
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
                            toaster.negative(
                                e as string, {
                                    closeable: true,
                                    autoHideDuration: 3000,
                                    overrides: {
                                        Body: {
                                            style: {
                                                ...Styles.BorderRadiusSizing(theme)
                                            }
                                        },
                                        InnerContainer: {
                                            style: {
                                                width: "100%",
                                                wordWrap: "break-word",
                                            }
                                        }
                                    }
                                }
                            );
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