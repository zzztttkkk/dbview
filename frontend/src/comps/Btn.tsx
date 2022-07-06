import {useStyletron} from "baseui";
import {Button, ButtonProps} from "baseui/button";
import React from "react";

export function Btn(props: ButtonProps) {
    const [, theme] = useStyletron();
    return (
        <Button
            {...props}
            overrides={{
                BaseButton: {
                    style: {
                        borderBottomLeftRadius: theme.borders.radius100,
                        borderBottomRightRadius: theme.borders.radius100,
                        borderTopRightRadius: theme.borders.radius100,
                        borderTopLeftRadius: theme.borders.radius100
                    }
                }
            }}
        >{props.children}</Button>
    )
}