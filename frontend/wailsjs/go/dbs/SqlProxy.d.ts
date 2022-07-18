// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {dbs} from '../models';

export function Unregister(arg1:string):void;

export function Commit(arg1:string,arg2:string):Promise<Error>;

export function Query(arg1:string,arg2:string,arg3:Array<any>):Promise<dbs.SqlResult|Error>;

export function RegisterMysql(arg1:string,arg2:dbs.MysqlOpts):void;

export function RegisterPostgresql(arg1:string,arg2:dbs.PostgresqlOpts):void;

export function Rollback(arg1:string,arg2:string):Promise<Error>;

export function TestMysql(arg1:dbs.MysqlOpts):Promise<number|Error>;

export function TestPostgresql(arg1:dbs.PostgresqlOpts):Promise<number|Error>;
