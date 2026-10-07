import { randomUUID } from "node:crypto";
import type { Prisma, Tenant as TenantRow } from "@prisma/client";

import { getTenantContext } from "@/lib/context/tenant-context";
import { getPrisma } from "@/lib/db/prisma";

import type { CreateTenantInput, Tenant, UpdateTenantInput } from "./types";

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
    fusoHorario: row.fusoHorario,
    duracaoChamadaSegundos: row.duracaoChamadaSegundos,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type TenantSnapshot = {
  nome: string;
  nomeFantasia: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  fusoHorario: string;
  duracaoChamadaSegundos: number;
};

function snapshot(tenant: TenantSnapshot): TenantSnapshot {
  return {
    nome: tenant.nome,
    nomeFantasia: tenant.nomeFantasia ?? null,
    telefone: tenant.telefone ?? null,
    email: tenant.email ?? null,
    endereco: tenant.endereco ?? null,
    fusoHorario: tenant.fusoHorario,
    duracaoChamadaSegundos: tenant.duracaoChamadaSegundos,
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

  /**
   * Atualiza os dados/configurações da empresa do contexto e registra a
   * alteração na auditoria (na mesma transação). Sem mudança real, não grava.
   */
  async update(data: UpdateTenantInput): Promise<Tenant> {
    const { tenantId } = getTenantContext();
    return runScoped(tenantId, async (tx) => {
      const antes = await tx.tenant.findUnique({ where: { id: tenantId } });
      if (!antes) {
        throw new Error(`Empresa não encontrada: ${tenantId}`);
      }
      const dados = {
        nome: data.nome,
        nomeFantasia: data.nomeFantasia ?? null,
        telefone: data.telefone ?? null,
        email: data.email ?? null,
        endereco: data.endereco ?? null,
        fusoHorario: data.fusoHorario,
        duracaoChamadaSegundos: data.duracaoChamadaSegundos,
      };
      const antesSnapshot = snapshot(antes);
      if (JSON.stringify(antesSnapshot) === JSON.stringify(dados)) {
        return toTenant(antes);
      }
      const linha = await tx.tenant.update({
        where: { id: tenantId },
        data: dados,
      });
      await tx.auditLog.create({
        data: {
          id: randomUUID(),
          tenantId,
          acao: "UPDATE",
          entidade: "tenant",
          entidadeId: tenantId,
          dadosAntes: antesSnapshot,
          dadosDepois: dados,
        },
      });
      return toTenant(linha);
    });
  },
};
