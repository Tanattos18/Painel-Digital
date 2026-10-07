# Testes

> **Status:** primeira suíte registrada na **Tarefa 013** (2026-10-06).
> **Finalidade:** estratégia, suítes e resultados dos roteiros do piloto.

## Ferramenta

- **Vitest 5** (devDependency autorizada com a ADR-005 — executa TypeScript com
  o alias `@/*` do `tsconfig`).
- `npm test` (modo único) · `npm run test:watch` (modo observador).
- Roteiros E2E do piloto (Fase 11) usarão navegador — a ferramenta será
  definida na tarefa correspondente.

## Suítes

### `tests/tenant/tenant-context.test.ts` — unitária (sem banco)

- contexto ausente lança erro claro (`TenantContext ausente`)
- `runWithTenant` fornece e limpa o contexto
- repositório `getCurrent`/`getById` **rejeitam sem contexto** (falham antes de
  tocar o banco)
- id que não é o do contexto → erro `Conflito de tenant`
- schema de criação valida entrada e normaliza campos opcionais

### `tests/tenant/tenant-isolation.test.ts` — integração (requer `DATABASE_URL`; é **pulada** se ausente)

- cria e lê dois tenants
- tenant A não lê o tenant B (conflito no nível da aplicação)
- consulta crua **sem** `app.tenant_id` → **0 linhas** (prova do RLS)
- consulta com contexto → apenas as linhas do próprio tenant
- limpeza no final (delete com contexto)

## Resultados (Tarefa 013 — 2026-10-06)

| Suíte | Resultado |
|---|---|
| Unitária (`tenant-context`) | **8 testes — todos passando** |
| Integração (`tenant-isolation`) | **1 teste — passando** (banco Neon limpo: `db:deploy` do zero, RLS provado) |
| **Total** | **9/9 passando** (`npm test`) |

> **Nota (observada em 2026-10-06):** na primeira execução logo após ~15 min
> sem tocar no banco, o teste de integração falhou (provável *cold start* do
> compute do Neon free tier); nas reexecuções imediatas seguiu **9/9**.
> Se acontecer, basta rodar `npm test` novamente.

## Pendências

- Roteiros do piloto: Tarefas 056–063 (Fase 11)
- Auditoria de isolamento em todas as camadas: Tarefa 052
