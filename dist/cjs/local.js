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
exports.createLocalDriver = exports.LocalStorageDriverOptionsSchema = void 0;
const libfs = require("fs");
const libpath = require("path");
const libschema = require("schema");
exports.LocalStorageDriverOptionsSchema = {
    type: 'object',
    props: {
        basePath: { type: 'string' }
    }
};
const createLocalDriver = (options) => {
    libschema.assert(options, exports.LocalStorageDriverOptionsSchema);
    return {
        read: (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            return libfs.readFileSync(fullPath).toString();
        }),
        write: (path, payload) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            libfs.mkdirSync(libpath.dirname(fullPath), { recursive: true });
            libfs.writeFileSync(fullPath, payload);
        }),
        delete: (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            libfs.unlinkSync(fullPath);
        }),
        exists: (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            return libfs.existsSync(fullPath);
        }),
        list: (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            return (libfs.existsSync(fullPath) ? libfs.readdirSync(fullPath) : []);
        })
    };
};
exports.createLocalDriver = createLocalDriver;
