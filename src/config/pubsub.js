import Redis from "ioredis";
import { PubSub } from "graphql-subscriptions";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { env } from "./env.js";

let pubSubClient = null;
let publisher = null;
let subscriber = null;

export function getPubSub() {
  if (pubSubClient) {
    return pubSubClient;
  }

  if (!env.redisUrl) {
    pubSubClient = new PubSub();
    return pubSubClient;
  }

  publisher = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  subscriber = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  pubSubClient = new RedisPubSub({
    publisher,
    subscriber,
  });

  return pubSubClient;
}

export async function closePubSub() {
  if (!pubSubClient) {
    return;
  }

  if (typeof pubSubClient.close === "function") {
    await pubSubClient.close();
  }

  pubSubClient = null;
  publisher = null;
  subscriber = null;
}