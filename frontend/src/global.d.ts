import {ToastProps} from "baseui/toast";

declare module "*.png" {
    const value: string;
    export = value;
}

declare module "*.jpeg" {
    const value: string;
    export = value;
}

declare module "*.ico" {
    const value: string;
    export = value;
}


export interface IApp {
    ChangeTheme(name: string): void;

    ChangeLocale(name: string): void;

    Alert(msg: string, props?: Partial<ToastProps>): void;
}


declare global {
    interface Window {
        app: IApp;
    }
}
