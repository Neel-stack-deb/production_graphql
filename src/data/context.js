import { verifyAccessToken } from "../config/jwt.js";
import { createDataSources } from "./datasources.js";
import { createLoaders } from "../loaders/index.js";
import { prisma } from "../config/prisma.js";

async function resolveCurrentUser(token, userRepository) {
  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  if (!payload?.id) {
    return null;
  }

  const user = await userRepository.findById(payload.id);
  if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
    return null;
  }

  return user;
}

export function baseContext(token = null) {
  const dataSources = createDataSources();

  return {
    db: prisma,
    user: null,
    token,
    requestId: null,
    ...dataSources,
    loaders: createLoaders(dataSources),
  };
}

export async function createApolloContext({ req }) {
  const token = req.token || null;
  const base = baseContext(token);

  return {
    ...base,
    user: await resolveCurrentUser(token, base.userRepository),
    requestId: req.requestId || null,
  };
}

export async function createSubscriptionContext(ctx) {
  const token = ctx.connectionParams?.authorization?.replace("Bearer ", "") || ctx.connectionParams?.token || null;
  const base = baseContext(token);
  const payload = token ? verifyAccessToken(token) : null;

  return {
    ...base,
    user: await resolveCurrentUser(token, base.userRepository),
    requestId: ctx.extra?.requestId || null,
    tokenExpiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
    expiryTimer: null,
  };
}