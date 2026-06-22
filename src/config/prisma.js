import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const adapter = new PrismaBetterSqlite3(
  { url: env.databaseUrl },
  { timestampFormat: "unixepoch-ms" },
);

export const prisma = new PrismaClient({ adapter });

export async function closePrisma() {
  await prisma.$disconnect();
}