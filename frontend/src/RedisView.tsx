export interface RedisOptsViewProps {
    url?: string;
    host?: string;
    port?: number;
    db?: number;
    username?: string;
    password?: string;
    tls?: {
        cert: string;
        key: string;
        servername?: string;
    }
}

export interface RedisViewProps {
    opts?: RedisOptsViewProps
}

function RedisOptsView(props: RedisOptsViewProps) {

}

export function RedisView(props: RedisViewProps) {
    return <div className={"RedisViewWrapper"}>

    </div>
}