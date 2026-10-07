import { describe, expect, it } from "vitest";

import { tenantRepository } from "@/features/tenant/repository";
import { parseCreateTenant } from "@/features/tenant/schema";
import {
  getTenantContext,
  hasTenantContext,
  runWithTenant,
} from "@/lib/context/tenant-context";

describe("TenantContext", () => {
  it("lança erro claro quando não há contexto", () => {
    expect(() => getTenantContext()).toThrow(/TenantContext ausente/);
  });

  it("fornece o contexto dentro de runWithTenant", () => {
    runWithTenant({ tenantId: "tenant-a" }, () => {
      expect(getTenantContext().tenantId).toBe("tenant-a");
      expect(hasTenantContext()).toBe(true);
    });
    expect(hasTenantContext()).toBe(false);
  });
});

describe("repositório sem contexto de tenant (falha antes do banco)", () => {
  it("getCurrent rejeita sem contexto", async () => {
    await expect(tenantRepository.getCurrent()).rejects.toThrow(
      /TenantContext ausente/,
    );
  });

  it("getById rejeita sem contexto", async () => {
    await expect(tenantRepository.getById("qualquer-id")).rejects.toThrow(
      /TenantContext ausente/,
    );
  });

  it("getById rejeita id que não é o do contexto", async () => {
    await expect(
      runWithTenant({ tenantId: "tenant-a" }, () =>
        tenantRepository.getById("tenant-b"),
      ),
    ).rejects.toThrow(/Conflito de tenant/);
  });
});

describe("schema de criação de tenant", () => {
  it("rejeita entrada sem nome", () => {
    expect(() => parseCreateTenant({})).toThrow(/nome/);
  });

  it("rejeita entrada não-objeto", () => {
    expect(() => parseCreateTenant("empresa")).toThrow(/objeto/);
  });

  it("normaliza campos opcionais", () => {
    expect(
      parseCreateTenant({ nome: "  Empresa X  ", telefone: "" }),
    ).toEqual({
      nome: "Empresa X",
      nomeFantasia: undefined,
      telefone: undefined,
      email: undefined,
      endereco: undefined,
    });
  });
});
