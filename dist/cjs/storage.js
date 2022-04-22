"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorage = exports.StorageOptionsSchema = exports.StorageGetOptionsSchema = exports.StorageLookupOptionsSchema = exports.StorageListOptionsSchema = exports.StorageExistsOptionsSchema = exports.StorageDeleteOptionsSchema = exports.StorageUpdateOptionsSchema = exports.StorageCreateOptionsSchema = exports.StorageSchemaRemoveOptionsSchema = exports.StorageSchemaAddOptionsSchema = exports.NAME_REGEXP = exports.TYPE_REGEXP = void 0;
const libpath = require("path");
const libschema = require("schema");
const local_1 = require("./local");
const redis_1 = require("./redis");
exports.TYPE_REGEXP = /^[a-z]+\-?[0-9]*(\/[a-z0-9\-]+)?$/;
exports.NAME_REGEXP = /^[a-zA-Z0-9\.\-\_\@]+$/;
exports.StorageSchemaAddOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        schema: { type: 'object', arbitrary: true }
    }
};
exports.StorageSchemaRemoveOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP }
    }
};
exports.StorageCreateOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP },
        payload: { type: 'any' }
    }
};
exports.StorageUpdateOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP },
        payload: { type: 'any' }
    }
};
exports.StorageDeleteOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP }
    }
};
exports.StorageExistsOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP }
    }
};
exports.StorageListOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP }
    }
};
exports.StorageLookupOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP }
    }
};
exports.StorageGetOptionsSchema = {
    type: 'object',
    props: {
        type: { type: 'string', matches: exports.TYPE_REGEXP },
        name: { type: 'string', matches: exports.NAME_REGEXP }
    }
};
exports.StorageOptionsSchema = {
    type: 'object',
    props: {
        driver: {
            type: 'object',
            props: {
                type: { type: 'string', oneOf: ['local', 'redis'] },
                basePath: { type: 'string', optional: true },
                host: { type: 'string', optional: true },
                port: { type: 'number', optional: true },
                username: { type: 'string', optional: true },
                password: { type: 'string', optional: true },
                database: { type: 'string', optional: true }
            }
        },
        schemas: { type: 'array', item: exports.StorageSchemaAddOptionsSchema, optional: true }
    }
};
const createStorage = (options) => {
    libschema.assert(options, exports.StorageOptionsSchema);
    const driver = (() => {
        if (options.driver.type === 'local') {
            return (0, local_1.createLocalDriver)({ basePath: options.driver.basePath });
        }
        else if (options.driver.type === 'redis') {
            return (0, redis_1.createRedisDriver)({
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
        libschema.assert(options_, exports.StorageCreateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === false) {
                try {
                    const json = libschema.assert(options_.payload, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    yield driver.write(path, raw);
                    return json;
                }
                catch (e) {
                    throw new Error(`failed to write payload "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`payload "${options_.type}/${options_.name}" already exists`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const update = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, exports.StorageUpdateOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                try {
                    const json = libschema.assert(options_.payload, schema.schema);
                    const raw = JSON.stringify(json, null, 4);
                    yield driver.write(path, raw);
                    return json;
                }
                catch (e) {
                    throw new Error(`failed to write payload "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`payload "${options_.type}/${options_.name}" not found`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const delete_ = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, exports.StorageDeleteOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            const path = libpath.join(options_.type, options_.name);
            if ((yield driver.exists(path)) === true) {
                yield driver.delete(path);
            }
            else {
                throw new Error(`payload "${options_.type}/${options_.name}" not found`);
            }
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const exists = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, exports.StorageExistsOptionsSchema);
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
        libschema.assert(options_, exports.StorageLookupOptionsSchema);
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
                    throw new Error(`failed to read payload "${options_.type}/${options_.name}": ${e.message}`);
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
        libschema.assert(options_, exports.StorageListOptionsSchema);
        const schema = schemaList.find(s => s.type === options_.type);
        if (schema) {
            return yield driver.list(options_.type);
        }
        else {
            throw new Error(`schema "${options_.type}" not found`);
        }
    });
    const get = (options_) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(options_, exports.StorageGetOptionsSchema);
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
                    throw new Error(`failed to read payload "${options_.type}/${options_.name}": ${e.message}`);
                }
            }
            else {
                throw new Error(`payload "${options_.type}/${options_.name}" not found`);
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
exports.createStorage = createStorage;
