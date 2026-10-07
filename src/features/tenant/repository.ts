import type { Prisma, Tenant as TenantRow } from "@prisma/client";

import { getTenantContext } from "@/lib/context/tenant-context";
import { getPrisma } from "@/lib/db/prisma";

import type { CreateTenantInput, Tenant } from "./types";

type ScopedTx = Prisma.TransactionClient;

async function runScoped<T>(
  tenantId: string,
  fn: (tx: ScopedTx) => Promise<T>,
): Promise<T> {
  return getPrisma().$transaction(async (tx) => {
    await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}

function toTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    nome: row.nome,
    nomeFantasia: row.nomeFantasia,
    telefone: row.telefone,
    email: row.email,
    endereco: row.endereco,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const tenantRepository = {
  async create(data: CreateTenantInput & { id: string }): Promise<Tenant> {
    const row = await runScoped(data.id, (tx) =>
      tx.tenant.create({
        data: {
          id: data.id,
          nome: data.nome,
          nomeFantasia: data.nomeFantasia ?? null,
          telefone: data.telefone ?? null,
          email: data.email ?? null,
          endereco: data.endereco ?? null,
        },
      }),
    );
    return toTenant(row);
  },

  async getById(id: string): Promise<Tenant> {
    const { tenantId } = getTenantContext();
    if (tenantId !== id) {
      throw new Error(
        "Conflito de tenant: o id solicitado difere do contexto da requisição.",
      );
    }
    const row = await runScoped(tenantId, (tx) =>
      tx.tenant.findUnique({ where: { id } }),
    );
    if (!row) {
      throw new Error(`Empresa não encontrada: ${id}`);
    }
    return toTenant(row);
  },

  async getCurrent(): Promise<Tenant | null> {
    const { tenantId } = getTenantContext();
    const row = await runScoped(tenantId, (tx) =>
      tx.tenant.findUnique({ where: { id: tenantId } }),
    );
    return row ? toTenant(row) : null;
  },
};
