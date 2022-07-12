import {useStyletron} from "baseui";
import {Button, ButtonProps} from "baseui/button";
import React from "react";
import Styles from "./Styles";

export function Btn(props: ButtonProps) {
    const [, theme] = useStyletron();
    return (
        <Button
            overrides={{
                BaseButton: {
                    style: {
                        ...Styles.BorderRadiusSizing(theme)
                    }
                }
            }}
            {...props}
        >{props.children}</Button>
    )
}