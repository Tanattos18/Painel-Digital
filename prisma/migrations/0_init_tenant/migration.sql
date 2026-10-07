-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ATIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- Multi-tenant: defesa em profundidade (PLANO-PROJETO 7.2, ADR-006).
-- Camada 2 de isolamento ativa desde a primeira tabela:
-- sem app.tenant_id na sessao, nenhuma linha e visivel (nem para o owner).
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "tenants"
    USING ("id" = current_setting('app.tenant_id', true))
    WITH CHECK ("id" = current_setting('app.tenant_id', true));
