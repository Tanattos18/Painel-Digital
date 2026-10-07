import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { criarStorageLocal } from "@/lib/storage/local";

let base: string;
let storage: ReturnType<typeof criarStorageLocal>;

beforeAll(async () => {
  base = await mkdtemp(path.join(tmpdir(), "storage-teste-"));
  storage = criarStorageLocal(base);
});

afterAll(async () => {
  await rm(base, { recursive: true, force: true });
});

describe("storage local", () => {
  it("salva, lê e remove arquivos (incluindo subdiretórios)", async () => {
    const conteudo = Buffer.from("bytes de teste");
    await storage.salvar("tenant-1/logo.png", conteudo);

    const lido = await storage.ler("tenant-1/logo.png");
    expect(lido?.equals(conteudo)).toBe(true);

    await storage.remover("tenant-1/logo.png");
    expect(await storage.ler("tenant-1/logo.png")).toBeNull();
  });

  it("retorna null ao ler arquivo inexistente", async () => {
    expect(await storage.ler("nao/existe.png")).toBeNull();
  });

  it("não falha ao remover arquivo inexistente", async () => {
    await expect(storage.remover("nao/existe.png")).resolves.toBeUndefined();
  });

  it("bloqueia path traversal", async () => {
    await expect(storage.ler("../fuga.txt")).rejects.toThrow(
      /fora da área/,
    );
    await expect(storage.salvar("../fuga.txt", Buffer.from("x"))).rejects.toThrow(
      /fora da área/,
    );
    await expect(
      storage.ler(path.join(base, "..", "fora.txt")),
    ).rejects.toThrow(/fora da área/);
  });
});
