import { describe, expect, it } from "vitest";

import {
  createTenant,
  getCurrentTenant,
  getTenantById,
} from "@/features/tenant/service";
import { env } from "@/lib/config/env";
import { runWithTenant } from "@/lib/context/tenant-context";
import { getPrisma } from "@/lib/db/prisma";

const hasDatabase = env.databaseUrl !== "";

describe.skipIf(!hasDatabase)("Isolamento multi-tenant (contexto + RLS)", () => {
  it("persiste, lê e isola tenants; consulta crua sem contexto vê zero linhas", async () => {
    const empresaA = await createTenant({ nome: "Empresa A" });
    const empresaB = await createTenant({ nome: "Empresa B" });

    const lidaA = await runWithTenant({ tenantId: empresaA.id }, () =>
      getCurrentTenant(),
    );
    expect(lidaA?.nome).toBe("Empresa A");

    const lidaB = await runWithTenant({ tenantId: empresaB.id }, () =>
      getCurrentTenant(),
    );
    expect(lidaB?.nome).toBe("Empresa B");

    await expect(
      runWithTenant({ tenantId: empresaA.id }, () =>
        getTenantById(empresaB.id),
      ),
    ).rejects.toThrow(/Conflito de tenant/);

    const prisma = getPrisma();
    const linhasSemContexto = await prisma.$queryRaw<
      { id: string }[]
    >`SELECT "id" FROM "tenants"`;
    expect(linhasSemContexto).toHaveLength(0);

    const linhasDeA = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaA.id}, true)`;
      return tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "tenants"`;
    });
    expect(linhasDeA).toHaveLength(1);
    expect(linhasDeA[0]?.id).toBe(empresaA.id);

    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaA.id}, true)`;
      await tx.tenant.delete({ where: { id: empresaA.id } });
    });
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaB.id}, true)`;
      await tx.tenant.delete({ where: { id: empresaB.id } });
    });
  }, 30000);
});
