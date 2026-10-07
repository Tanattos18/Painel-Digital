// Cria a empresa de desenvolvimento (id fixo lido de DEV_TENANT_ID no .env).
// Roda com o usuário painel_app, portanto precisa de contexto de tenant
// (set_config) para passar pelo RLS.
import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const id =
  process.env.DEV_TENANT_ID || "00000000-0000-4000-8000-000000000001";
const prisma = new PrismaClient();

try {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT set_config('app.tenant_id', ${id}, true)`;
    const existente = await tx.tenant.findUnique({ where: { id } });
    if (existente) {
      console.log(`Tenant demo já existe: ${id}`);
      return;
    }
    await tx.tenant.create({
      data: {
        id,
        nome: "Empresa Demo",
        nomeFantasia: "Demo Atendimento",
        telefone: "(11) 99999-0000",
        email: "contato@demo.example",
        endereco: "Av. Exemplo, 100 - São Paulo/SP",
      },
    });
    console.log(`Tenant demo criado: ${id}`);
  });
} finally {
  await prisma.$disconnect();
}
