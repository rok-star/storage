var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as libschema from 'schema';
import * as libredis from 'redis';
export const RedisStorageDriverOptionsSchema = {
    type: 'object',
    props: {
        host: { type: 'string' },
        port: { type: 'number', minValue: 1, maxValue: 65535 },
        username: { type: 'string' },
        password: { type: 'string' },
        database: { type: 'string' }
    }
};
export const createRedisDriver = (options) => {
    libschema.assert(options, RedisStorageDriverOptionsSchema);
    const redisClient = libredis.createClient({ url: `redis://${options.username}:${options.password}@${options.host}:${options.port}/${options.database}` });
    const ensureConnection = () => __awaiter(void 0, void 0, void 0, function* () {
        yield redisClient.connect();
    });
    return {
        read: (key) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            yield ensureConnection();
            return ((_a = (yield redisClient.get(key))) !== null && _a !== void 0 ? _a : '');
        }),
        write: (key, data) => __awaiter(void 0, void 0, void 0, function* () {
            yield ensureConnection();
            redisClient.set(key, data);
        }),
        delete: (key) => __awaiter(void 0, void 0, void 0, function* () {
            yield ensureConnection();
            redisClient.del(key);
        }),
        exists: (key) => __awaiter(void 0, void 0, void 0, function* () {
            yield ensureConnection();
            return ((yield redisClient.exists(key)) == 1);
        }),
        list: (key) => __awaiter(void 0, void 0, void 0, function* () {
            yield ensureConnection();
            return (yield redisClient.keys(`${key}/*`))
                .map(e => e.slice(key.length));
        })
    };
};
