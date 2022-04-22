import * as libschema from 'schema'
import * as libredis from 'redis'
import { StorageDriver } from './storage'

export type RedisStorageDriverOptions = {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly password: string;
    readonly database: string;
}

export const RedisStorageDriverOptionsSchema: libschema.Schema = {
    type: 'object',
    props: {
        host: { type: 'string' },
        port: { type: 'number', minValue: 1, maxValue: 65535 },
        username: { type: 'string' },
        password: { type: 'string' },
        database: { type: 'string' }
    }
}

export const createRedisDriver = (options: RedisStorageDriverOptions): StorageDriver => {
    libschema.assert(options, RedisStorageDriverOptionsSchema);
    const redisClient = libredis.createClient({ url:`redis://${options.username}:${options.password}@${options.host}:${options.port}/${options.database}` });
    const ensureConnection = async () => {
        await redisClient.connect();
    }
    return {
        read: async (key: string) => {
            await ensureConnection();
            return ((await redisClient.get(key)) ?? '');
        },
        write: async (key: string, payload: string) => {
            await ensureConnection();
            redisClient.set(key, payload);
        },
        delete: async (key: string) => {
            await ensureConnection();
            redisClient.del(key);
        },
        exists: async (key: string) => {
            await ensureConnection();
            return ((await redisClient.exists(key)) == 1);
        },
        list: async (key: string) => {
            await ensureConnection();
            return (await redisClient.keys(`${key}/*`))
                .map(e => e.slice(key.length));
        }
    }
}