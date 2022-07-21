var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as libpath from 'path';
import * as libschema from 'schema';
import { createLocalDriver } from './local';
import { createRedisDriver } from './redis';
export const TYPE_REGEXP = /^[a-z]+\-?[0-9]*(\/[a-z0-9\-]+)?$/;
export const NAME_REGEXP = /^[a-zA-Z0-9\.\-\_\@]+$/;
export const StorageSchemaAddOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        schema: { type: 'object', arbitrary: true }
    }
};
export const StorageSchemaRemoveOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP }
    }
};
export const StorageCreateOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP },
        data: { type: 'any' }
    }
};
export const StorageUpdateOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP },
        data: { type: 'any' }
    }
};
export const StorageDeleteOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
};
export const StorageExistsOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
};
export const StorageListOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP }
    }
};
export const StorageLookupOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
};
export const StorageGetOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: TYPE_REGEXP },
        name: { type: 'string', matches: NAME_REGEXP }
    }
};
export const StorageOptionsSchema = {
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
};
export const createStorage = (options) => {
    libschema.assert(options, StorageOptionsSchema);
    const driver = (() => {
        if (options.driver.type === 'local') {
            return createLocalDriver({ path: options.driver.path });
        }
        else if (options.driver.type === 'redis') {
            return createRedisDriver({
                host: options.driver.host,
                port: options.driver.port,
                username: options.driver.username,
                password: options.driver.password,
                database: options.driver.database
            });
        }
        else {
            throw new Error('driver not supported');
        }
    })();
    const schemaList = [];
    const schemaAdd = (options_) => {
        if (schemaList.some(s => s.type === options_.type) === false) {
            schemaList.push(options_);
        }
        else {
            throw new Error(`schema "${options_.type}" already registered`);
        }
    };
    const schemaRemove = (options_) => {
        const index = schemaList.findIndex(s => s.type === options_.type);
        if (index > -1) {
            schemaList.splice(index, 1);
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    };
    const create = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageCreateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === false) {
                try {
                    const json = libschema.assert(options_.data, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    yield driver.write(path, raw);
                    return json;
                }
                catch (e) {
                    throw new Error(`failed to write data "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`data "${options_.type}/${options_.name}" already exists`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const update = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageUpdateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                try {
                    const json = libschema.assert(options_.data, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    yield driver.write(path, raw);
                    return json;
                }
                catch (e) {
                    throw new Error(`failed to write data "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const delete_ = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageDeleteOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                yield driver.delete(path);
            }
            else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const exists = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageExistsOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            return yield driver.exists(path);
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const lookup = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageLookupOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                try {
                    const raw = yield driver.read(path);
                    const json = JSON.parse(raw);
                    const ret = libschema.assert(json, schema.schema);
                    return ret;
                }
                catch (e) {
                    throw new Error(`failed to read data "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                return undefined;
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const list = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageListOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            return yield driver.list(options_.type);
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const get = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, StorageGetOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                try {
                    const raw = yield driver.read(path);
                    const json = JSON.parse(raw);
                    const ret = libschema.assert(json, schema.schema);
                    return ret;
                }
                catch (e) {
                    throw new Error(`failed to read data "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`data "${options_.type}/${options_.name}" not found`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
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
    };
};
