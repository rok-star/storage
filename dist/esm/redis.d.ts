import * as libschema from 'schema';
import { StorageDriver } from './storage';
export declare type RedisStorageDriverOptions = {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
};
export declare const RedisStorageDriverOptionsSchema: libschema.Schema;
export declare const createRedisDriver: (options: RedisStorageDriverOptions) => StorageDriver;
