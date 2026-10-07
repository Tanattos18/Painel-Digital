import { describe, expect, it } from "vitest";

import {
  createTenant,
  getCurrentTenant,
  getLogo,
  removerLogo,
  uploadLogo,
} from "@/features/tenant/service";
import { env } from "@/lib/config/env";
import { getStorage } from "@/lib/storage";
import { runWithTenant } from "@/lib/context/tenant-context";
import { getPrisma } from "@/lib/db/prisma";

import { pngDeTeste } from "../helpers/imagens";

const hasDatabase = env.databaseUrl !== "";

describe.skipIf(!hasDatabase)("Logo da empresa (Tarefa 015)", () => {
  it("envia, lê, isola por tenant e remove (com auditoria)", async () => {
    const empresaA = await createTenant({ nome: "Empresa Logo A" });
    const empresaB = await createTenant({ nome: "Empresa Logo B" });
    const prisma = getPrisma();

    try {
      const bytes = pngDeTeste(64, 64);

      const atualizada = await runWithTenant({ tenantId: empresaA.id }, () =>
        uploadLogo(bytes),
      );
      expect(atualizada.logoPath).toContain(`${empresaA.id}/`);

      const logoA = await runWithTenant({ tenantId: empresaA.id }, () =>
        getLogo(),
      );
      expect(logoA?.dados.equals(bytes)).toBe(true);
      expect(logoA?.contentType).toBe("image/png");

      // isolamento: o contexto de B não enxerga o logo de A
      const logoB = await runWithTenant({ tenantId: empresaB.id }, () =>
        getLogo(),
      );
      expect(logoB).toBeNull();

      // validação acontece no serviço (formato decidido pelo conteúdo)
      await expect(
        runWithTenant({ tenantId: empresaA.id }, () =>
          uploadLogo(Buffer.from("GIF89a nao e permitido")),
        ),
      ).rejects.toThrow(/não permitido/);

      const caminho = logoA?.caminho;
      expect(caminho).toContain(`${empresaA.id}/`);

      const removido = await runWithTenant({ tenantId: empresaA.id }, () =>
        removerLogo(),
      );
      expect(removido.logoPath).toBeNull();

      const depois = await runWithTenant({ tenantId: empresaA.id }, () =>
        getLogo(),
      );
      expect(depois).toBeNull();
      expect(await getStorage().ler(caminho ?? "")).toBeNull();

      const auditorias = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaA.id}, true)`;
        return tx.auditLog.findMany({ where: { tenantId: empresaA.id } });
      });
      const deLogo = auditorias.filter(
        (a) =>
          typeof a.dadosDepois === "object" &&
          a.dadosDepois !== null &&
          "logoPath" in a.dadosDepois,
      );
      expect(deLogo).toHaveLength(2);
    } finally {
      const restante = await runWithTenant({ tenantId: empresaA.id }, () =>
        getCurrentTenant(),
      );
      if (restante?.logoPath) {
        await getStorage().remover(restante.logoPath).catch(() => undefined);
      }
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaA.id}, true)`;
        await tx.tenant.delete({ where: { id: empresaA.id } });
      });
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT set_config('app.tenant_id', ${empresaB.id}, true)`;
        await tx.tenant.delete({ where: { id: empresaB.id } });
      });
    }
  }, 30000);
});
