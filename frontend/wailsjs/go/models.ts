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

}

export namespace main {
	
	export class ProjectListItem {
	    name: string;
	    last_active_at: number;
	
	    static createFrom(source: any = {}) {
	        return new ProjectListItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.last_active_at = source["last_active_at"];
	    }
	}
	export class ProjectList {
	    all: ProjectListItem[];
	    default: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.all = this.convertValues(source["all"], ProjectListItem);
	        this.default = source["default"];
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
	export class ProjectInfo {
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new ProjectInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	    }
	}

}

