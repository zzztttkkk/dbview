export namespace main {
	
	export class ProjectInfo {
	    name: string;
	    redis_list: string[];
	
	    static createFrom(source: any = {}) {
	        return new ProjectInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.redis_list = source["redis_list"];
	    }
	}
	export class ProjectListItem {
	    name: string;
	    last_active_at: number;
	    env: string;
	    read_only: boolean;
	    color: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectListItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.last_active_at = source["last_active_at"];
	        this.env = source["env"];
	        this.read_only = source["read_only"];
	        this.color = source["color"];
	    }
	}

}

export namespace dbs {
	
	export class TLSConfig {
	    cert: string;
	    key: string;
	    server_name: string;
	
	    static createFrom(source: any = {}) {
	        return new TLSConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cert = source["cert"];
	        this.key = source["key"];
	        this.server_name = source["server_name"];
	    }
	}
	export class RedisOpts {
	    uri: string;
	    host: string;
	    port: number;
	    db: number;
	    username: string;
	    password: string;
	    // Go type: TLSConfig
	    tls?: any;
	
	    static createFrom(source: any = {}) {
	        return new RedisOpts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uri = source["uri"];
	        this.host = source["host"];
	        this.port = source["port"];
	        this.db = source["db"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.tls = this.convertValues(source["tls"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SqlField {
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new SqlField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class SqlResult {
	    fields: SqlField[];
	    rows: any[][];
	
	    static createFrom(source: any = {}) {
	        return new SqlResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.fields = this.convertValues(source["fields"], SqlField);
	        this.rows = source["rows"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NamedQuery {
	    name: string;
	    sql: string;
	
	    static createFrom(source: any = {}) {
	        return new NamedQuery(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.sql = source["sql"];
	    }
	}
	export class MysqlOpts {
	    named_queries: {[key: string]: NamedQuery};
	    history: string[];
	    timeouts: number;
	    readonly: boolean;
	    url: string;
	    address: string;
	    username: string;
	    password: string;
	    db: string;
	    // Go type: TLSConfig
	    tls?: any;
	    disable_native_passwords: boolean;
	    collation: string;
	
	    static createFrom(source: any = {}) {
	        return new MysqlOpts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.named_queries = this.convertValues(source["named_queries"], NamedQuery, true);
	        this.history = source["history"];
	        this.timeouts = source["timeouts"];
	        this.readonly = source["readonly"];
	        this.url = source["url"];
	        this.address = source["address"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.db = source["db"];
	        this.tls = this.convertValues(source["tls"], null);
	        this.disable_native_passwords = source["disable_native_passwords"];
	        this.collation = source["collation"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PostgresqlOpts {
	    named_queries: {[key: string]: NamedQuery};
	    history: string[];
	    timeouts: number;
	    readonly: boolean;
	    address: string;
	    username: string;
	    password: string;
	    db: string;
	
	    static createFrom(source: any = {}) {
	        return new PostgresqlOpts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.named_queries = this.convertValues(source["named_queries"], NamedQuery, true);
	        this.history = source["history"];
	        this.timeouts = source["timeouts"];
	        this.readonly = source["readonly"];
	        this.address = source["address"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.db = source["db"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

