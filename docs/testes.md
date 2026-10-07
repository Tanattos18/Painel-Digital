# Testes

> **Status:** primeira suíte registrada na **Tarefa 013** (2026-10-06);
> última atualização na **Tarefa 015** (2026-10-07).
> **Finalidade:** estratégia, suítes e resultados dos roteiros do piloto.

## Ferramenta

- **Vitest 5** (devDependency autorizada com a ADR-005 — executa TypeScript com
  o alias `@/*` do `tsconfig`).
- `npm test` (modo único) · `npm run test:watch` (modo observador).
- O `.env` é carregado de forma **determinística** via `import "dotenv/config"`
  no `vitest.config.mts` — as suítes de integração não dependem do ambiente
  do shell; sem `DATABASE_URL` elas são **puladas** (`describe.skipIf`).
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

### `tests/tenant/update-schema.test.ts` — unitária (Tarefa 014)

- entrada válida de formulário (tudo string) é normalizada
- nome ausente/vazio, e-mail malformado, fuso desconhecido e duração fora
  da faixa 3–300 são **rejeitados no backend**

### `tests/lib/time.test.ts` — unitária (Tarefa 014)

- validação de fuso IANA
- `formatarComFuso` aplica o fuso do tenant a datas de exemplo
  (12:00 UTC → 09:00 São Paulo; 08:00 Manaus)

### `tests/tenant/tenant-update.test.ts` — integração (Tarefa 014)

- grava dados + configurações com contexto e relê
- **auditoria**: exatamente 1 registro `UPDATE` com antes/depois
  (segunda chamada idempotente; terceira rejeitada no backend)
- `audit_log` sem contexto → **0 linhas** (RLS)
- limpeza com cascata (`audit_log` cai junto com o tenant)

### `tests/features/logo.test.ts` — unitária (Tarefa 015)

- aceita PNG/JPEG/WEBP **pelo conteúdo** (extensão falsa não cola)
- rejeita GIF/SVG/texto, arquivo > 1 MiB, vazio e dimensões fora de 16–4096 px
- rejeita imagem corrompida (sem dimensões legíveis)

### `tests/lib/storage-local.test.ts` — unitária (Tarefa 015)

- salva/lê/remove (inclusive subdiretórios), arquivo inexistente → `null`
- **path traversal bloqueado** (`../`, caminho absoluto)

### `tests/tenant/logo-integration.test.ts` — integração (Tarefa 015)

- upload → `getLogo` devolve os mesmos bytes (`image/png`)
- **isolamento:** contexto do tenant B não enxerga o logo de A
- remoção limpa o banco **e** o arquivo; auditoria com `logoPath` antes/depois
  (2 registros)

## Resultados (Tarefa 015 — 2026-10-07)

| Suíte | Testes | Resultado |
|---|---|---|
| `tenant-context` (unit) | 8 | ✅ |
| `update-schema` (unit) | 9 | ✅ |
| `time` (unit) | 5 | ✅ |
| `logo` — validação (unit) | 8 | ✅ |
| `storage-local` (unit) | 4 | ✅ |
| `tenant-isolation` (integração/RLS) | 1 | ✅ |
| `tenant-update` — auditoria (integração) | 1 | ✅ |
| `logo-integration` (integração) | 1 | ✅ |
| **Total** | **37** | **37/37 passando** (`npm test`) |

> Smoke manual da Tarefa 015 (fora da suíte): upload no tenant de dev →
> `GET /api/logo` **200** `image/png` com `ETag` → reenvio com
> `If-None-Match` → **304** → remoção volta a **404**.
>
> Correção de contagem: o registro da 014 citava "20 unit + 4 integração";
> a divisão real era **22 unit + 2 integração** (24 no total).

## Resultados (Tarefa 014 — 2026-10-07)

| Suíte | Resultado |
|---|---|
| Unitárias (contexto 8 + update-schema 8 + time 4) | **20 — todas passando** |
| Integração (isolation 1 + update/auditoria 1) | **2 — passando** |
| **Total** | **24/24 passando** (`npm test`) |

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
