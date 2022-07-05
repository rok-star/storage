var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as libfs from 'fs';
import * as libpath from 'path';
import * as libschema from 'schema';
export const LocalStorageDriverOptionsSchema = {
    type: 'object',
    props: {
        basePath: { type: 'string' }
    }
};
export const createLocalDriver = (options) => {
    libschema.assert(options, LocalStorageDriverOptionsSchema);
    return {
        read: (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            return libfs.readFileSync(fullPath).toString();
        }),
        write: (path, data) => __awaiter(void 0, void 0, void 0, function* () {
            const fullPath = libpath.join(options.basePath, path);
            libfs.mkdirSync(libpath.dirname(fullPath), { recursive: true });
            libfs.writeFileSync(fullPath, data);
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
