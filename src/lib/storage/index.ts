import { env } from "@/lib/config/env";

import { criarStorageLocal } from "./local";
import type { Storage } from "./types";

let armazenamento: Storage | null = null;

/**
 * Armazenamento ativo. Hoje: disco local (decisão da Tarefa 015).
 * Na Tarefa 043 esta fábrica passa a devolver um objeto (R2/S3/etc.)
 * sem alterar quem consome.
 */
export function getStorage(): Storage {
  armazenamento ??= criarStorageLocal(env.storageDir);
  return armazenamento;
}
