import { verifyAccessToken } from "../config/jwt.js";
import { createDataSources } from "./datasources.js";
import { createLoaders } from "../loaders/index.js";
import { prisma } from "../config/prisma.js";

export function baseContext(token = null) {
  const dataSources = createDataSources();
  const user = token ? verifyAccessToken(token) : null;

  return {
    db: prisma,
    user,
    token,
    ...dataSources,
    loaders: createLoaders(dataSources),
  };
}

export async function createApolloContext({ req }) {
  const token = req.token || null;
  return baseContext(token);
}

export async function createSubscriptionContext(ctx) {
  const token = ctx.connectionParams?.authorization?.replace("Bearer ", "") || ctx.connectionParams?.token || null;
  const payload = token ? verifyAccessToken(token) : null;
  const base = baseContext(token);

  return {
    ...base,
    user: payload,
    tokenExpiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
    expiryTimer: null,
  };
}