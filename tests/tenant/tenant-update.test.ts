import { describe, expect, it } from "vitest";

import {
  createTenant,
  updateCurrentTenant,
} from "@/features/tenant/service";
import { env } from "@/lib/config/env";
import { runWithTenant } from "@/lib/context/tenant-context";
import { getPrisma } from "@/lib/db/prisma";

const hasDatabase = env.databaseUrl !== "";

const CONFIGURACAO = {
  nome: "Empresa Config Teste Ltda",
  nomeFantasia: "Config Teste",
  email: "config@teste.example",
  fusoHorario: "America/Manaus",
  duracaoChamadaSegundos: "15",
};

describe.skipIf(!hasDatabase)("Configuração da empresa (Tarefa 014)", () => {
  it("grava dados/configurações, audita a alteração e isola por RLS", async () => {
    const criada = await createTenant({ nome: "Empresa Config Teste" });
    const prisma = getPrisma();

    try {
      const atualizada = await runWithTenant({ tenantId: criada.id }, () =>
        updateCurrentTenant(CONFIGURACAO),
      );
      expect(atualizada.nome).toBe("Empresa Config Teste Ltda");
      expect(atualizada.fusoHorario).toBe("America/Manaus");
      expect(atualizada.duracaoChamadaSegundos).toBe(15);

      const relida = await runWithTenant({ tenantId: criada.id }, () =>
        updateCurrentTenant({ ...CONFIGURACAO }),
      );
      expect(relida.fusoHorario).toBe("America/Manaus");

      await expect(
        runWithTenant({ tenantId: criada.id }, () =>
          updateCurrentTenant({
            ...CONFIGURACAO,
            nome: "   ",
          }),
        ),
      ).rejects.toThrow(/Campo obrigatório ausente: nome/);

      const auditorias = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT set_config('app.tenant_id', ${criada.id}, true)`;
        return tx.auditLog.findMany({
          where: { tenantId: criada.id },
          orderBy: { createdAt: "asc" },
        });
      });

      // 1ª chamada alterou (auditoria); 2ª idempotente (sem nova auditoria);
      // 3ª rejeitada no backend (sem efeito).
      expect(auditorias).toHaveLength(1);
      expect(auditorias[0]?.acao).toBe("UPDATE");
      expect(auditorias[0]?.entidade).toBe("tenant");
      expect(auditorias[0]?.entidadeId).toBe(criada.id);
      expect(auditorias[0]?.dadosAntes).toMatchObject({
        nome: "Empresa Config Teste",
      });
      expect(auditorias[0]?.dadosDepois).toMatchObject({
        nome: "Empresa Config Teste Ltda",
        fusoHorario: "America/Manaus",
        duracaoChamadaSegundos: 15,
      });

      const linhasSemContexto = await prisma.$queryRaw<
        { id: string }[]
      >`SELECT "id" FROM "audit_log"`;
      expect(linhasSemContexto).toHaveLength(0);
    } finally {
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT set_config('app.tenant_id', ${criada.id}, true)`;
        await tx.tenant.delete({ where: { id: criada.id } });
      });
    }
  }, 30000);
});
