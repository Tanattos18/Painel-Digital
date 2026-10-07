import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Storage } from "./types";

/**
 * Resolve um caminho relativo à base, bloqueando path traversal
 * (`..`, caminhos absolutos e anything que saia da base).
 */
function resolverSeguro(baseDir: string, relativo: string): string {
  if (relativo.includes("\0")) {
    throw new Error("Caminho de arquivo inválido.");
  }
  const base = path.resolve(baseDir);
  const alvo = path.resolve(base, relativo);
  const prefixo = base + path.sep;
  if (alvo !== base && !alvo.startsWith(prefixo)) {
    throw new Error("Caminho de arquivo fora da área de armazenamento.");
  }
  return alvo;
}

export function criarStorageLocal(baseDir: string): Storage {
  return {
    async salvar(relativo: string, dados: Buffer): Promise<void> {
      const alvo = resolverSeguro(baseDir, relativo);
      await mkdir(path.dirname(alvo), { recursive: true });
      const temporario = `${alvo}.tmp-${process.pid}-${Date.now()}`;
      await writeFile(temporario, dados);
      await rename(temporario, alvo);
    },

    async ler(relativo: string): Promise<Buffer | null> {
      try {
        return await readFile(resolverSeguro(baseDir, relativo));
      } catch (erro) {
        if ((erro as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw erro;
      }
    },

    async remover(relativo: string): Promise<void> {
      try {
        await unlink(resolverSeguro(baseDir, relativo));
      } catch (erro) {
        if ((erro as NodeJS.ErrnoException).code !== "ENOENT") {
          throw erro;
        }
      }
    },
  };
}
