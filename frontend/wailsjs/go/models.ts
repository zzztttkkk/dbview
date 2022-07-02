export namespace main {
	
	export class Project {
	    name: string;
	    last_active_at: number;
	
	    static createFrom(source: any = {}) {
	        return new Project(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.last_active_at = source["last_active_at"];
	    }
	}
	export class Projects {
	    all: Project[];
	    default: string;
	
	    static createFrom(source: any = {}) {
	        return new Projects(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.all = this.convertValues(source["all"], Project);
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

}

