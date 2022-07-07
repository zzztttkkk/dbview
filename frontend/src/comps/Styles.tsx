import {Theme} from "baseui";
import {StyleObject} from "styletron-standard";

export default {
    BorderRadiusSizing: function (theme: Theme): StyleObject {
        return {
            borderBottomLeftRadius: theme.borders.radius100,
            borderBottomRightRadius: theme.borders.radius100,
            borderTopRightRadius: theme.borders.radius100,
            borderTopLeftRadius: theme.borders.radius100
        }
    }
}