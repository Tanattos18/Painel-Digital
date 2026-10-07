# Banco de Dados

> **Status:** preenchido na **Tarefa 013** (2026-10-06), após aprovação de
> **ADR-005** e **ADR-006**.

## Decisões aprovadas

| ADR | Decisão |
|---|---|
| **ADR-005** | **PostgreSQL + Prisma 6** (linha estável; v7+ muda para driver adapters — avaliar depois). Desenvolvimento em **free tier na nuvem** (Neon/Supabase); piloto e produção usam o mesmo motor. |
| **ADR-006** | **Modelo A** — coluna de tenant + defesa em profundidade. Isolamento desde a **primeira tabela**. |

Alternativas descartadas: SQLite (sem RLS, troca posterior cara), schema/banco
por tenant (custo/operação altos para o início).

## Defesa em profundidade (PLANO-PROJETO §7.2)

1. **Contexto obrigatório**: `src/lib/context/tenant-context.ts`
   (`runWithTenant`/`getTenantContext` com `AsyncLocalStorage`) — operação sem
   contexto **lança erro**.
2. **Repositórios são o único acesso a dados**; toda consulta roda dentro de
   transação com `set_config('app.tenant_id', ..., true)`.
3. **`tenantId` nunca vem do cliente** — vem do contexto (sessão/token futuro).
4. **RLS no banco** (camada 2): `ENABLE`/`FORCE ROW LEVEL SECURITY` + policy
   `id = current_setting('app.tenant_id', true)` desde a tabela `tenants`.
5. **Testes automatizados** (unit + integração) — `docs/testes.md`; auditoria
   ampliada nas Tarefas 052/063.
6. *(Futuro)* canais de tempo real namespaced por tenant (`tenant:{id}:...`).

## Modelo — entidade Tenant (tabela `tenants`)

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | TEXT PK | gerado **no serviço** (`crypto.randomUUID`) — o INSERT precisa saber o id antes, por causa do RLS |
| `nome` | TEXT NOT NULL | obrigatório, ≤ 255 |
| `nome_fantasia` | TEXT | opcional |
| `telefone` | TEXT | opcional |
| `email` | TEXT | opcional (sub-decisão de login/e-mail adiada para a Tarefa 017) |
| `endereco` | TEXT | opcional |
| `status` | enum `TenantStatus` | `ATIVO` (padrão) / `INATIVO` |
| `created_at` / `updated_at` | TIMESTAMP(3) | automáticos |

## Padrão de repositório (obrigatório para as próximas entidades)

```ts
const { tenantId } = getTenantContext();          // 1. falha se não houver contexto
return getPrisma().$transaction(async (tx) => {
  await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
  return tx.tenant.findUnique({ where: { id: tenantId } }); // 2. RLS filtra
});
```

Toda tabela de domínio nova deve nascer com a **mesma policy de RLS**
(adicionada na migração correspondente).

## Migrações

- `prisma/migrations/0_init_tenant/migration.sql` — enum + tabela `tenants` +
  RLS. Gerada por `prisma migrate diff` e completada com o SQL de RLS.
- **Reprodutível do zero:** `npm run db:deploy` em banco limpo aplica todas as
  migrações pendentes.

| Comando | Uso |
|---|---|
| `npm run db:migrate` | cria/aplica migração (dev) |
| `npm run db:deploy` | aplica pendências (banco limpo/produção) |
| `npm run db:generate` | regenera o Prisma Client |
| `npm run db:studio` | interface do banco |

## Ambiente

- `DATABASE_URL` no arquivo **`.env`** (gitignored; lido pelo Next **e** pelo
  Prisma CLI via `prisma.config.ts` + `dotenv`). Exemplo em `.env.example`.
- **Dois usuários no banco dev** (Neon free tier, projeto `painel-digital-dev`):

| Variável | Papel | Uso |
|---|---|---|
| `MIGRATE_DATABASE_URL` | `neondb_owner` (tem `BYPASSRLS`) | só Prisma CLI (migrações) |
| `DATABASE_URL` | `painel_app` (**sem** `BYPASSRLS`) | runtime e testes |

> **Descoberta importante (Tarefa 013):** o owner padrão do Neon tem
> `BYPASSRLS = true` — ignora RLS mesmo com `FORCE`. Por isso o runtime usa um
> **role de aplicação dedicado**; sem ele as políticas não têm efeito.

SQL de provisionamento da role (executado como owner; senha fica só no `.env`):

```sql
CREATE ROLE painel_app LOGIN PASSWORD '...';
GRANT USAGE ON SCHEMA public TO painel_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO painel_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO painel_app;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO painel_app;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO painel_app;
```
