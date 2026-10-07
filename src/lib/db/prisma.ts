import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/config/env";

type GlobalWithPrisma = typeof globalThis & { __prisma?: PrismaClient };

const globalPrisma = globalThis as GlobalWithPrisma;

export function getPrisma(): PrismaClient {
  if (env.databaseUrl === "") {
    throw new Error(
      "DATABASE_URL ausente: copie .env.example para .env e preencha (ver Tarefa 013).",
    );
  }
  if (!globalPrisma.__prisma) {
    globalPrisma.__prisma = new PrismaClient();
  }
  return globalPrisma.__prisma;
}
