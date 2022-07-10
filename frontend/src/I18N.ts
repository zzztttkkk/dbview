import {Locale} from "baseui/locale";

export interface ILocale extends Partial<Locale> {
}

export function I18N(localeName: string): ILocale {
    switch (localeName.toLowerCase()) {
        case "en": {
            return {}
        }
        default: {
            return {}
        }
    }
}