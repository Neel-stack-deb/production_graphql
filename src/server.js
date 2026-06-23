import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { expressMiddleware } from "@apollo/server/express4";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { authMiddleware } from "./config/auth.js";
import {
  createApolloContext,
  createSubscriptionContext,
} from "./data/context.js";
import { schema } from "./graphql/schema.js";
import { formatGraphQLError } from "./utils/errors.js";
import { closePrisma, prisma } from "./config/prisma.js";
import { closeRedis } from "./config/redis.js";
import { closePubSub } from "./config/pubsub.js";
import { requestContext } from "./middleware/requestContext.js";
import { graphqlRateLimit } from "./middleware/graphqlRateLimit.js";

const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const wsCleanup = useServer(
  {
    schema,
    onConnect: async (ctx) => {
      const token =
        ctx.connectionParams?.authorization?.replace("Bearer ", "") ||
        ctx.connectionParams?.token ||
        null;
      if (!token) {
        throw new Error("Unauthorized");
      }

      const connectionContext = await createSubscriptionContext(ctx);
      if (!connectionContext.user) {
        throw new Error("Invalid token");
      }

      if (connectionContext.tokenExpiresAt) {
        const timeoutMs = Math.max(
          connectionContext.tokenExpiresAt.getTime() - Date.now(),
          0,
        );
        ctx.extra.expiryTimer = setTimeout(() => {
          ctx.extra.socket.close(4403, "Token expired");
        }, timeoutMs);
      }

      ctx.extra.connectionContext = connectionContext;
    },
    context: async (ctx) => {
      if (!ctx.extra.connectionContext) {
        throw new Error("Connection context missing");
      }
      return ctx.extra.connectionContext;
    },
    onDisconnect: async (ctx) => {
      if (ctx.extra?.expiryTimer) {
        clearTimeout(ctx.extra.expiryTimer);
      }
    },
  },
  wsServer,
);

const apollo = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            wsCleanup.dispose();
          },
        };
      },
    },
  ],
  formatError: formatGraphQLError,
});

export async function startServer() {
  await apollo.start();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(requestContext);
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      message: "ok",
      data: { service: "up" },
    });
  });

  app.get("/ready", async (_req, res) => {
    const status = await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "ok",
      data: { db: Array.isArray(status) ? "up" : "up" },
    });
  });

  app.use(
    "/graphql",
    graphqlRateLimit,
    authMiddleware,
    expressMiddleware(apollo, {
      context: createApolloContext,
    }),
  );

  const port = Number(process.env.PORT || 3000);

  await new Promise((resolve) => {
    httpServer.listen(port, resolve);
  });

  return { app, httpServer, apollo };
}

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  await apollo.stop();
  await closePubSub();
  await closeRedis();
  await closePrisma();
  await new Promise((resolve) => httpServer.close(resolve));
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
