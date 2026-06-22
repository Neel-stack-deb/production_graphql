import { PubSub } from "graphql-subscriptions";

const pubSub = new PubSub();

export function createPubSub() {
  return pubSub;
}