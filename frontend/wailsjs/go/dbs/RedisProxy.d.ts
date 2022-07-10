// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {dbs} from '../models';

export function HIncrBy(arg1:string,arg2:string,arg3:string,arg4:number):Promise<number|Error>;

export function Keys(arg1:string,arg2:string):Promise<Array<string>|Error>;

export function LLen(arg1:string,arg2:string):Promise<number|Error>;

export function BitCount(arg1:string,arg2:string,arg3:number,arg4:number):Promise<number|Error>;

export function BitOpXor(arg1:string,arg2:string,arg3:Array<string>):Promise<number|Error>;

export function Decr(arg1:string,arg2:string):Promise<number|Error>;

export function DecrBy(arg1:string,arg2:string,arg3:number):Promise<number|Error>;

export function HLen(arg1:string,arg2:string):Promise<number|Error>;

export function Incr(arg1:string,arg2:string):Promise<number|Error>;

export function Register(arg1:string,arg2:dbs.RedisOpts):Promise<Error>;

export function SetBit(arg1:string,arg2:string,arg3:number,arg4:boolean):Promise<number|Error>;

export function BitOpNot(arg1:string,arg2:string,arg3:string):Promise<number|Error>;

export function BitOpOr(arg1:string,arg2:string,arg3:Array<string>):Promise<number|Error>;

export function Del(arg1:string,arg2:Array<string>):Promise<number|Error>;

export function GetBit(arg1:string,arg2:string,arg3:number):Promise<number|Error>;

export function BitOpAnd(arg1:string,arg2:string,arg3:Array<string>):Promise<number|Error>;

export function BitPos(arg1:string,arg2:string,arg3:number,arg4:Array<number>):Promise<number|Error>;

export function Exists(arg1:string,arg2:Array<string>):Promise<number|Error>;

export function IncrBy(arg1:string,arg2:string,arg3:number):Promise<number|Error>;

export function LInsertBefore(arg1:string,arg2:string,arg3:any,arg4:any):Promise<number|Error>;

export function Ping(arg1:string):Promise<number|Error>;

export function Unlink(arg1:string,arg2:Array<string>):Promise<number|Error>;

export function Expire(arg1:string,arg2:string,arg3:number,arg4:string):Promise<boolean|Error>;

export function HDel(arg1:string,arg2:string,arg3:Array<string>):Promise<number|Error>;

export function HSet(arg1:string,arg2:string,arg3:Array<any>):Promise<number|Error>;

export function LInsertAfter(arg1:string,arg2:string,arg3:any,arg4:any):Promise<number|Error>;
