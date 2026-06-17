import redis from "./redis.ts";

// save to cache
export const set_cache = async (key: string, data: any, ttl_seconds = 300) => {
  await redis.setEx(key, ttl_seconds, JSON.stringify(data));
};

// get from cache
export const get_cache = async (key: string) => {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
};

// delete from cache (when data changes)
export const clear_cache = async (key: string) => {
  await redis.del(key);
};
