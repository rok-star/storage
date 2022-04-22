import * as libschema from 'schema';
import { StorageDriver } from './storage';
export declare type LocalStorageDriverOptions = {
    readonly basePath: string;
};
export declare const LocalStorageDriverOptionsSchema: libschema.Schema;
export declare const createLocalDriver: (options: LocalStorageDriverOptions) => StorageDriver;
