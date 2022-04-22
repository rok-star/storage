import * as libschema from 'schema';
export declare const TYPE_REGEXP: RegExp;
export declare const NAME_REGEXP: RegExp;
export declare type StorageDriver = {
    readonly read: (path: string) => Promise<string>;
    readonly write: (path: string, payload: string) => Promise<void>;
    readonly delete: (path: string) => Promise<void>;
    readonly exists: (path: string) => Promise<boolean>;
    readonly list: (path: string) => Promise<string[]>;
};
export declare type StorageSchemaAddOptions = {
    readonly type: string;
    readonly schema: libschema.Schema;
};
export declare const StorageSchemaAddOptionsSchema: libschema.Schema;
export declare type StorageSchemaRemoveOptions = {
    readonly type: string;
};
export declare const StorageSchemaRemoveOptionsSchema: libschema.Schema;
export declare type StorageCreateOptions<T = any> = {
    readonly type: string;
    readonly name: string;
    readonly payload: T;
};
export declare const StorageCreateOptionsSchema: libschema.Schema;
export declare type StorageUpdateOptions<T = any> = {
    readonly type: string;
    readonly name: string;
    readonly payload: T;
};
export declare const StorageUpdateOptionsSchema: libschema.Schema;
export declare type StorageDeleteOptions = {
    readonly type: string;
    readonly name: string;
};
export declare const StorageDeleteOptionsSchema: libschema.Schema;
export declare type StorageExistsOptions = {
    readonly type: string;
    readonly name: string;
};
export declare const StorageExistsOptionsSchema: libschema.Schema;
export declare type StorageListOptions = {
    readonly type: string;
};
export declare const StorageListOptionsSchema: libschema.Schema;
export declare type StorageLookupOptions = {
    readonly type: string;
    readonly name: string;
};
export declare const StorageLookupOptionsSchema: libschema.Schema;
export declare type StorageGetOptions = {
    readonly type: string;
    readonly name: string;
};
export declare const StorageGetOptionsSchema: libschema.Schema;
export declare type Storage = {
    readonly create: <T>(options: StorageCreateOptions<T>) => Promise<T>;
    readonly update: <T>(options: StorageUpdateOptions<T>) => Promise<T>;
    readonly delete: (options: StorageDeleteOptions) => Promise<void>;
    readonly exists: (options: StorageExistsOptions) => Promise<boolean>;
    readonly lookup: <T>(options: StorageLookupOptions) => Promise<(T | undefined)>;
    readonly list: (options: StorageListOptions) => Promise<string[]>;
    readonly get: <T>(options: StorageGetOptions) => Promise<T>;
    readonly schema: {
        readonly add: (options: StorageSchemaAddOptions) => void;
        readonly remove: (options: StorageSchemaRemoveOptions) => void;
    };
};
export declare type StorageOptions = {
    readonly driver: {
        readonly type: 'local';
        readonly basePath: string;
    } | {
        readonly type: 'redis';
        readonly host: string;
        readonly port: number;
        readonly username: string;
        readonly password: string;
        readonly database: string;
    };
    readonly schemas?: StorageSchemaAddOptions[];
};
export declare const StorageOptionsSchema: libschema.Schema;
export declare const createStorage: (options: StorageOptions) => Storage;
