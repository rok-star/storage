import * as libfs from 'fs'
import * as libpath from 'path'
import * as libschema from 'schema'
import { StorageDriver } from './storage'

export type LocalStorageDriverOptions = {
    readonly basePath: string;
}

export const LocalStorageDriverOptionsSchema: libschema.Schema = {
    type: 'object',
    props: {
        basePath: { type: 'string' }
    }
}

export const createLocalDriver = (options: LocalStorageDriverOptions): StorageDriver => {
    libschema.assert(options, LocalStorageDriverOptionsSchema);
    return {
        read: async (path: string) => {
            const fullPath = libpath.join(options.basePath, path);
            return libfs.readFileSync(fullPath).toString();
        },
        write: async (path: string, payload: string) => {
            const fullPath = libpath.join(options.basePath, path);
            libfs.mkdirSync(libpath.dirname(fullPath), { recursive: true });
            libfs.writeFileSync(fullPath, payload);
        },
        delete: async (path: string) => {
            const fullPath = libpath.join(options.basePath, path);
            libfs.unlinkSync(fullPath);
        },
        exists: async (path: string) => {
            const fullPath = libpath.join(options.basePath, path);
            return libfs.existsSync(fullPath);
        },
        list: async (path: string) => {
            const fullPath = libpath.join(options.basePath, path);
            return (libfs.existsSync(fullPath) ? libfs.readdirSync(fullPath) : []);
        }
    }
}