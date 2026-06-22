import Redis from "ioredis";
import { env } from "./env.js";

let redisClient = null;

export function getRedisClient() {
  if (!redisClient && env.redisUrl) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}