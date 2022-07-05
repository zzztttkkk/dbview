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

declare function AppChangeTheme(name: string): void;