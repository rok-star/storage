import * as libpath from 'path'
import * as libschema from 'schema'
import { createLocalDriver } from './local'
import { createRedisDriver } from './redis'

export const TYPE_REGEXP = /^[a-z]+\-?[0-9]*(\/[a-z0-9\-]+)?$/;
export const NAME_REGEXP = /^[a-zA-Z0-9\.\-\_\@]+$/;

export type StorageDriver = {
    readonly read: (path: string) => Promise<string>;
    readonly write: (path: string, data: string) => Promise<void>;
    readonly delete: (path: string) => Promise<void>;
    readonly exists: (path: string) => Promise<boolean>;
    readonly list: (path: string) => Promise<string[]>;
}

export type StorageSchemaAddOptions = {
    readonly type: string;
    readonly schema: libschema.Schema;
}

export const StorageSchemaAddOptionsSchema: libschema.Schema<StorageSchemaAddOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        schema: { type: 'object', arbitrary: true }
    }
}

export type StorageSchemaRemoveOptions = {
    readonly type: string;
}

export const StorageSchemaRemoveOptionsSchema: libschema.Schema<StorageSchemaRemoveOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP }
    }
}

export type StorageCreateOptions<T = any> = {
    readonly type: string;
    readonly name: string;
    readonly data: T;
}

export const StorageCreateOptionsSchema: libschema.Schema<StorageCreateOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP },
        data: { type: 'any' }
    }
}

export type StorageUpdateOptions<T = any> = {
    readonly type: string;
    readonly name: string;
    readonly data: T;
}

export const StorageUpdateOptionsSchema: libschema.Schema<StorageUpdateOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP },
        data: { type: 'any' }
    }
}

export type StorageDeleteOptions = {
    readonly type: string;
    readonly name: string;
}

export const StorageDeleteOptionsSchema: libschema.Schema<StorageDeleteOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
}

export type StorageExistsOptions = {
    readonly type: string;
    readonly name: string;
}

export const StorageExistsOptionsSchema: libschema.Schema<StorageExistsOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
}

export type StorageListOptions = {
    readonly type: string;
}

export const StorageListOptionsSchema: libschema.Schema<StorageListOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP }
    }
}

export type StorageLookupOptions = {
    readonly type: string;
    readonly name: string;
}

export const StorageLookupOptionsSchema: libschema.Schema<StorageLookupOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
}

export type StorageGetOptions = {
    readonly type: string;
    readonly name: string;
}

export const StorageGetOptionsSchema: libschema.Schema<StorageGetOptions> = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
}

export type Storage = {
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
    }
}

export type StorageOptions = {
    readonly driver: {
        readonly type: 'local';
        readonly path: string;
    } | {
        readonly type: 'redis';
        readonly host: string;
        readonly port: number;
        readonly username: string;
        readonly password: string;
        readonly database: string;
    };
    readonly schemas?: StorageSchemaAddOptions[];
}

export const StorageOptionsSchema: libschema.Schema<StorageOptions> = {
    type: 'object',
    props: {
        driver: {
            type: 'object',
            props: {
                type: { type: 'string', oneOf: ['local', 'redis'] },
                path: { type: 'string', optional: true },
                host: { type: 'string', optional: true },
                port: { type: 'number', optional: true },
                username: { type: 'string', optional: true },
                password: { type: 'string', optional: true },
                database: { type: 'string', optional: true }
            }
        },
        schemas: { type: 'array', item: StorageSchemaAddOptionsSchema, optional: true }
    }
}

export const createStorage = (options: StorageOptions): Storage => {
    libschema.assert(options, StorageOptionsSchema);
    const driver = (() => {
        if (options.driver.type === 'local') {
            return createLocalDriver({ path: options.driver.path });
        } else if (options.driver.type === 'redis') {
            return createRedisDriver({
                host: options.driver.host,
                port: options.driver.port,
                username: options.driver.username,
                password: options.driver.password,
                database: options.driver.database
            });
        } else {
            throw new Error('driver not supported');
        }
    })();
    const schemaList: StorageSchemaAddOptions[] = [];
    const schemaAdd = (options_: StorageSchemaAddOptions) => {
        if (schemaList.some(s => s.type === options_.type) === false) {
            schemaList.push(options_);
        } else {
            throw new Error(`schema "${options_.type}" already registered`);
        }
    }
    const schemaRemove = (options_: StorageSchemaRemoveOptions) => {
        const index = schemaList.findIndex(s => s.type === options_.type);
        if (index > -1) {
            schemaList.splice(index, 1);
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const create = async (options_: StorageCreateOptions) => {
        libschema.assert(options_, StorageCreateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((await driver.exists(path)) === false) {
                try {
                    const json = libschema.assert<any>(options_.data, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    await driver.write(path, raw);
                    return json;
                } catch (e) {
                    throw new Error(`failed to write data "${options_.type}/${options_.name}": ${e.message}`);
                }
            } else {
                throw new Error(`data "${options_.type}/${options_.name}" already exists`);
            }
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const update = async (options_: StorageUpdateOptions) => {
        libschema.assert(options_, StorageUpdateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((await driver.exists(path)) === true) {
                try {
                    const json = libschema.assert<any>(options_.data, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    await driver.write(path, raw);
                    return json;
                } catch (e) {
                    throw new Error(`failed to write data "${options_.type}/${options_.name}": ${e.message}`);
                }
            } else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const delete_ = async (options_: StorageDeleteOptions) => {
        libschema.assert(options_, StorageDeleteOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((await driver.exists(path)) === true) {
                await driver.delete(path);
            } else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const exists = async (options_: StorageExistsOptions) => {
        libschema.assert(options_, StorageExistsOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            return await driver.exists(path);
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const lookup = async (options_: StorageLookupOptions) => {
        libschema.assert(options_, StorageLookupOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((await driver.exists(path)) === true) {
                try {
                    const raw = await driver.read(path);
                    const json = JSON.parse(raw);
                    const ret = libschema.assert(json, schema.schema);
                    return ret;
                } catch (e) {
                    throw new Error(`failed to read data "${options_.type}/${options_.name}": ${e.message}`);
                }
            } else {
                return undefined;
            }
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const list = async (options_: StorageListOptions) => {
        libschema.assert(options_, StorageListOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            return await driver.list(options_.type);
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    const get = async (options_: StorageGetOptions) => {
        libschema.assert(options_, StorageGetOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((await driver.exists(path)) === true) {
                try {
                    const raw = await driver.read(path);
                    const json = JSON.parse(raw);
                    const ret = libschema.assert(json, schema.schema);
                    return ret;
                } catch (e) {
                    throw new Error(`failed to read data "${options_.type}/${options_.name}": ${e.message}`);
                }
            } else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        } else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    }
    if (options.schemas) {
        for (const schem of options.schemas) {
            schemaAdd(schem);
        }
    }
    return {
        create,
        update,
        delete: delete_,
        exists,
        lookup,
        list,
        get,
        schema: {
            add: schemaAdd,
            remove: schemaRemove
        }
    }
}