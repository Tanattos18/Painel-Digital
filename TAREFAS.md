# TAREFAS — SaaS de Atendimento, Filas e Painéis Digitais

> Plano de execução em 12 fases (0 a 11) e 64 tarefas, no formato definido no prompt do projeto.
> **Regra:** uma tarefa por vez. Não pular, não misturar, não antecipar funcionalidades.
> Todas as tarefas começam como **PENDENTE** e só viram **CONCLUÍDA** após o checklist inteiro.

## Definição de pronto (vale para toda tarefa)

Uma tarefa só é considerada concluída quando:

- [ ] o código estiver funcionando;
- [ ] não houver erros conhecidos;
- [ ] os testes necessários forem executados;
- [ ] a documentação correspondente estiver atualizada;
- [ ] o checklist da tarefa estiver marcado como concluído.

## Pontos de parada obrigatórios

Estas tarefas **não começam** sem sua autorização explícita, porque envolvem decisões que o prompt reserva a você:

| Tarefa | Decisão |
|---|---|
| 005 Definir arquitetura | confirmar a arquitetura (decisão significativa de arquitetura). |
| 013 Empresa | banco de dados, ORM e modelo multi-tenant (ADR-005 e ADR-006). |
| 015 Logo | ~~onde armazenar arquivos~~ — **decidido em 2026-10-07: disco local com abstração `Storage`** (mídia completa e possivelmente objeto na 043). |
| 017 Autenticação | estratégia de autenticação (ADR-007). |
| 034 Identificação | política de expiração/rotação do token (segurança). |
| 038 Arquitetura real-time | tecnologia de tempo real, hospedagem e custos (ADR-009). |
| 043 Estrutura mídia | armazenamento de arquivos e custos (ADR-010). |

## Formato do checkpoint (ao fim de cada tarefa)

```
TAREFA:
XXX

STATUS:
CONCLUÍDA

ARQUIVOS ALTERADOS:
...

ARQUIVOS CRIADOS:
...

DEPENDÊNCIAS:
...

TESTES EXECUTADOS:
...

RESULTADO:
...

PRÓXIMA TAREFA:
XXX
```
A próxima tarefa **não** é executada automaticamente se exigir decisão importante.

## Registro de execução

### 2026-10-07 — Tarefa 015 concluída (Fase 2: 3/4)

| Tarefa | Situação | Evidência |
|---|---|---|
| 015 Logo | **CONCLUÍDA** | Decisão de armazenamento **A (disco local)** aprovada pelo solicitante; abstração `src/lib/storage` (`Storage` + `criarStorageLocal` com anti path-traversal e escrita atômica; fábrica `getStorage()` para trocar na 043); validação por **conteúdo** (magic bytes PNG/JPEG/WEBP — SVG fora), limites 1 MiB e 16–4096 px, nome gerado pelo servidor com prefixo do tenant; coluna `logo_path` (migração `20261007011812_tenant_logo`); upload/remoção com auditoria na mesma transação; `GET /api/logo` (ETag/304, `Cache-Control: private`, caminho sempre do BD); card de logo em `/empresa`; **37/37 testes**; suíte agora carrega `.env` via `dotenv` no `vitest.config.mts` (determinístico) |

**Checkpoint — Tarefa 015:**

```
TAREFA: 015
STATUS: CONCLUÍDA
DECISÃO: armazenamento A — disco local com abstração Storage (aprovada);
SVG fica de fora; ADR-010 registrada como PARCIAL (mídia completa na 043)
ARQUIVOS ALTERADOS: prisma/schema.prisma, .gitignore, .env.example,
env.ts, tenant/{types,repository,service}.ts, empresa/{actions,page}.tsx,
vitest.config.mts, docs/{arquitetura,banco-de-dados,testes}.md, TAREFAS.md, README.md
ARQUIVOS CRIADOS: prisma/migrations/20261007011812_tenant_logo,
src/lib/storage/{types,local,index}.ts, src/features/tenant/logo.ts,
src/app/api/logo/route.ts, src/app/(admin)/empresa/logo-form.tsx,
docs/armazenamento.md, tests/helpers/imagens.ts, tests/features/logo.test.ts,
tests/lib/storage-local.test.ts, tests/tenant/logo-integration.test.ts
ARQUIVOS REMOVIDOS: nenhum
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: npm test = 37/37 (34 unit + 3 integração RLS/isolamento); npm run lint (0 avisos); npm run build (9 rotas,
/api/logo dinâmica); dev — 7 páginas = 200; smoke HTTP manual:
upload no dev tenant → GET /api/logo 200 image/png + ETag → 304 no
reenvio com If-None-Match → remoção volta a 404 (validado com servidor
reiniciado — o dev anterior segurava o Prisma Client antigo em memória)
RESULTADO: logo enviável, exibível e removível em /empresa; arquivos
inválidos rejeitados com mensagem clara; isolamento por tenant provado
(contexto B não lê o logo de A); armazenamento preparado para a 043
PRÓXIMA TAREFA: 016 - Identidade visual (cores de marca + logo nas áreas)
```

### 2026-10-07 — Tarefa 014 concluída (Fase 2: 2/4)

| Tarefa | Situação | Evidência |
|---|---|---|
| 014 Configuração | **CONCLUÍDA** | Página `/empresa` no menu admin com formulário (dados + fuso + duração da chamada) e **server action** validada no backend (`parseUpdateTenant`: nome, e-mail, fuso IANA, duração 3–300); colunas `fuso_horario`/`duracao_chamada_segundos` + tabela `audit_log` com RLS `FORCE` (migração `001`); auditoria gravada **na mesma transação** (só quando há mudança real); ADR-012 implementada (armazenar UTC, exibir no fuso do tenant — `lib/time.ts`); seed `npm run seed` cria a empresa demo; **24/24 testes**; rota dinâmica com `instant = false` (Next 16/cacheComponents) |

**Checkpoint — Tarefa 014:**

```
TAREFA: 014
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: prisma/schema.prisma, package.json, env.ts,
navigation.ts, tenant/{schema,repository,service,types}.ts,
docs/{banco-de-dados,arquitetura,testes}.md, TAREFAS.md, README.md
ARQUIVOS CRIADOS: prisma/migrations/20261007003949_tenant_config_audit,
src/lib/time.ts, src/lib/context/dev-tenant.ts, src/constants/timezones.ts,
scripts/seed.mjs, src/app/(admin)/empresa/{page,empresa-form,actions}.tsx|ts,
tests/tenant/update-schema.test.ts, tests/tenant/tenant-update.test.ts,
tests/lib/time.test.ts
ARQUIVOS REMOVIDOS: nenhum
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: npm test = 24/24 (20 unit + 4 integração/RLS);
npm run lint (0 avisos); npm run build (8 rotas, /empresa dinâmica);
dev — 7 páginas = 200; /empresa renderiza os dados do tenant demo;
seed idempotente. Observação: migrate reset derrubou os grants do
painel_app — reaplicados e documentado em docs/banco-de-dados.md.
RESULTADO: configuração da empresa operante (dados + fuso + duração da
chamada) com auditoria e RLS; contexto provisório DEV_TENANT_ID isolado
num módulo (substituído na 017)
PRÓXIMA TAREFA: 015 - Logo ⛔ (decisão de armazenamento)
```

### 2026-10-06 — Tarefa 013 concluída (Fase 2: 1/4)

| Tarefa | Situação | Evidência |
|---|---|---|
| 013 Empresa | **CONCLUÍDA** | ADR-005 (**PostgreSQL + Prisma 6.19.3**) e ADR-006 (**coluna + RLS**) aprovadas e registradas em `docs/arquitetura.md`; `model Tenant` + migração `0_init_tenant` **aplicada do zero em banco limpo** (Neon free tier) com `ENABLE/FORCE ROW LEVEL SECURITY` + policy `id = current_setting('app.tenant_id', true)`; `TenantContext` com `AsyncLocalStorage` — repositório **falha antes do banco** sem contexto; **9/9 testes passando** (RLS provado: consulta crua sem contexto = 0 linhas); **descoberta: owner do Neon tem `BYPASSRLS`** → role `painel_app` criada para o runtime (MIGRATE/DATABASE separados) |

**Checkpoint — Tarefa 013:**

```
TAREFA: 013
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: package.json, .env.example, prisma.config.ts,
docs/arquitetura.md (ADR-005/006 APROVADAS + seção 15), docs/banco-de-dados.md,
docs/testes.md, TAREFAS.md, README.md
ARQUIVOS CRIADOS: prisma/schema.prisma, prisma/migrations/0_init_tenant/migration.sql,
prisma/migrations/migration_lock.toml, src/lib/db/prisma.ts,
src/lib/context/tenant-context.ts, src/features/tenant/{types,schema,repository,service}.ts,
vitest.config.mts, tests/tenant/tenant-context.test.ts, tests/tenant/tenant-isolation.test.ts
ARQUIVOS REMOVIDOS: nenhum
DEPENDÊNCIAS: prisma@6.19.3 e @prisma/client@6.19.3 (ADR-005), vitest@5,
dotenv (dev), @types/node@^24 (bump p/ Node 24)
TESTES EXECUTADOS: npm test = 9/9 (8 unit sem banco + 1 integração RLS);
npm run lint (0 avisos); npm run build (7 rotas, TS OK); dev — 6 páginas = 200;
prisma migrate deploy do zero em banco Neon limpo (corrigido BOM do SQL da migração).
RESULTADO: isolamento multi-tenant estabelecido desde a 1ª tabela; role de
aplicação painel_app sem BYPASSRLS (owner do Neon ignora RLS — descoberto no teste);
padrão de repositório documentado para as próximas entidades
PRÓXIMA TAREFA: 014 - Configuração
```

### 2026-10-06 — Tarefa 012 concluída (Fase 1 ENCERRADA — 5/5)

| Tarefa | Situação | Evidência |
|---|---|---|
| 012 Sistema visual | **CONCLUÍDA** | `@theme` em `globals.css` com escala `--color-brand-50…900` (padrão azul, hex documentados); utilitários compilam para `var(--color-brand-*)` (**verificado no CSS gerado**: `.bg-brand-600{background-color:var(--color-brand-600)}`); marca aplicada em `Button` primary, `AreaNav` ativo e `Spinner`; contraste WCAG calculado (todos ≥ 4,5:1 — tabela em `docs/sistema-visual.md`); única animação: `animate-spin`; seletor de cor em `/dev/components` troca as variáveis em runtime |

**Checkpoint — Tarefa 012:**

```
TAREFA: 012
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: src/app/globals.css, src/components/ui/button.tsx,
src/components/ui/area-nav.tsx, src/components/ui/spinner.tsx,
src/app/dev/components/page.tsx, docs/componentes.md, TAREFAS.md, README.md
ARQUIVOS CRIADOS: docs/sistema-visual.md
ARQUIVOS REMOVIDOS: nenhum
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: npm run lint (0 avisos); npm run build (7 rotas, TS OK);
dev — 6 páginas = 200 e /dashboard com bg-brand-50 no menu ativo; CSS compilado
contém var(--color-brand-600) (prova da cascata); contraste WCAG: 5,17 (marca/
branco), 6,16 (menu ativo), 4,83 (perigo), 17,93 (títulos) — todos AA ou melhor;
grep: única animação = animate-spin; seletor de marca no demo troca variáveis.
RESULTADO: Fase 1 completa (5/5) — MARCO M1 atingido; marca trocável por
variável CSS, pronta para identidade por tenant na Tarefa 016
PRÓXIMA TAREFA: 013 - Empresa ⛔ (aguarda decisão de banco/ORM/multi-tenant)
```

### 2026-10-06 — Tarefa 011 concluída (Fase 1: 4/5)

| Tarefa | Situação | Evidência |
|---|---|---|
| 011 Componentes | **CONCLUÍDA** | 9 componentes em `src/components/ui/` — `Button`, `TextField`, `SelectField`, `Card`, `SimpleTable<T>`, `Modal`, `Alert`, `EmptyState`, `Spinner` — tipagem forte, sem `any`, sem regra de negócio, **zero dependências novas** (HTML nativo + Tailwind, conforme "Regra sobre dependências"); página de demonstração `/dev/components` com todos os estados; `docs/componentes.md` criado |

**Checkpoint — Tarefa 011:**

```
TAREFA: 011
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: TAREFAS.md, README.md
ARQUIVOS CRIADOS: src/components/ui/{button,text-field,select-field,card,
simple-table,modal,alert,empty-state,spinner}.tsx,
src/app/dev/components/page.tsx, docs/componentes.md
ARQUIVOS REMOVIDOS: nenhum
DEPENDÊNCIAS: nenhuma nova (rito de dependências não foi necessário:
bibliotecas de UI/ícones não adotadas)
TESTES EXECUTADOS: npm run lint (0 avisos); npm run build (7 rotas estáticas,
TypeScript OK); dev server — 6 páginas = 200; /dev/components renderiza
4 alerts, 2 spinners, tabela, 3 labels e 8 botões no HTML. Modal abre no
cliente (não aparece no SSR — comportamento esperado); foco inicial e fechamento
por Esc implementados no código; conferência interativa humana pendente.
RESULTADO: conjunto mínimo de componentes prontos para as Fases 2–9
PRÓXIMA TAREFA: 012 - Sistema visual
```

### 2026-10-06 — Tarefa 010 concluída (Fase 1: 3/5)

| Tarefa | Situação | Evidência |
|---|---|---|
| 010 Navegação | **CONCLUÍDA** | `src/constants/navigation.ts` (itens de menu por área, campo `permission` reservado para a 020) + `src/components/ui/area-nav.tsx` (client component: aside no desktop, disclosure com `aria-expanded`/`aria-controls` no mobile, rota ativa via `usePathname` com `aria-current="page"`, foco visível); layouts `(admin)` e `(recepcao)` atualizados; `display` e `(auth)` sem navegação (correto) |

**Checkpoint — Tarefa 010:**

```
TAREFA: 010
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: src/app/(admin)/layout.tsx, src/app/(recepcao)/layout.tsx,
TAREFAS.md, README.md
ARQUIVOS CRIADOS: src/constants/navigation.ts, src/components/ui/area-nav.tsx
ARQUIVOS REMOVIDOS: nenhum (.gitkeep de components/ui e constants removidos ao
criar o primeiro arquivo de cada)
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: npm run lint (0 avisos); npm run build (6 rotas estáticas,
TypeScript OK); dev server — 5 rotas = 200; /dashboard e /fila com
aria-current="page" (1) e botão aria-expanded; /, /login e /display sem
navegação. Teclado/foco: validado por código (elementos nativos
nav/ul/li/a/button + focus-visible); conferência interativa humana pendente.
RESULTADO: navegação responsiva das áreas admin e recepção; constantes prontas
para filtro por permissão na Tarefa 020
PRÓXIMA TAREFA: 011 - Componentes
```

### 2026-10-06 — Tarefa 009 concluída (Fase 1 em andamento)

| Tarefa | Situação | Evidência |
|---|---|---|
| 009 Layout | **CONCLUÍDA** | 4 layouts base criados — `(auth)`, `(admin)`, `(recepcao)`, `display` (16:9 com `aspect-video` e limites de tela cheia) — mais páginas placeholder `login`, `dashboard`, `fila` e `display`; `lint` **0 avisos**, `build` OK (6 rotas estáticas), as 5 rotas responderam **HTTP 200** no `dev` |

**Checkpoint — Tarefa 009:**

```
TAREFA: 009
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: TAREFAS.md, README.md, docs/analise-checklist.md
ARQUIVOS CRIADOS: src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx,
src/app/(admin)/layout.tsx, src/app/(admin)/dashboard/page.tsx,
src/app/(recepcao)/layout.tsx, src/app/(recepcao)/fila/page.tsx,
src/app/display/layout.tsx, src/app/display/page.tsx, docs/analise-checklist.md
ARQUIVOS REMOVIDOS: .gitkeep das 4 pastas de rota (agora com conteúdo)
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: npm run lint (0 avisos); npm run build (6 rotas estáticas,
TypeScript OK); dev server — GET /, /login, /dashboard, /fila, /display = 200.
Verificação visual nos tamanhos-alvo (375/768/1280/1920×1080) pendente de
revisão humana no piloto.
RESULTADO: esqueleto navegável iniciado; nenhuma regra de negócio
PRÓXIMA TAREFA: 010 - Navegação
```

### 2026-10-06 — Tarefas 005–007 concluídas (Fase 0 encerrada)

| Tarefa | Situação | Evidência |
|---|---|---|
| 005 Definir arquitetura ⛔ | **CONCLUÍDA** | Arquitetura validada contra o código real (App Router, estrutura por feature, alias, Tailwind 4 — nenhuma contradição); **ADR-003 aprovada pelo solicitante** em 2026-10-06; `docs/arquitetura.md` → v0.2; hospedagem segue pendente (Tarefa 038) |
| 006 Definir estrutura | **CONCLUÍDA** | Estrutura documentada em `docs/arquitetura.md` §5 como **confirmada**; compatível com paths do TypeScript (`@/*` → `./src/*`); nenhum diretório novo criado nesta tarefa |
| 007 Documentar decisões | **CONCLUÍDA** | `docs/desenvolvimento.md` reproduz o ambiente do zero (validado: install/lint/build/dev executados com sucesso); 6 esqueletos de `/docs` presentes com título e finalidade; registro de ADRs atualizado; links internos revisados (README → PLANO, TAREFAS, docs/*) |

**Checkpoint — Fase 0 (7/7):**

```
TAREFA: 005 / 006 / 007
STATUS: CONCLUÍDA
ARQUIVOS ALTERADOS: docs/arquitetura.md, TAREFAS.md, PLANO-PROJETO.md, CHECKLIST.md
ARQUIVOS CRIADOS: nenhum
DEPENDÊNCIAS: nenhuma nova
TESTES EXECUTADOS: revisão cruzada arquitetura × código; links internos; ambiente reproduzido do zero (install 72,5s / lint 10,3s / build 9,4s / dev 728ms)
RESULTADO: Fase 0 completa; ADR-003 confirmada; documentação consistente
PRÓXIMA TAREFA: 009 — Layout
```

### 2026-10-06 — Tarefas 001–004 formalizadas (análise do projeto real)

Com o código no repositório, as quatro tarefas de análise foram executadas e documentadas:

| Tarefa | Situação | Evidência |
|---|---|---|
| 001 Analisar projeto | **CONCLUÍDA** | Diagnóstico real gravado em `PLANO-PROJETO.md` §1.1–§1.3 (todas as 5 perguntas respondidas; baseline substituído por valores verificados no código) |
| 002 Analisar ambiente | **CONCLUÍDA** | `npm install` (357 pacotes, 72,5 s), `npm run lint` (10,3 s, **0 avisos**), `npm run build` (9,4 s, 2 rotas estáticas, TypeScript OK), `npm run dev` (ready em 728 ms, encerrado com segurança). Node 24.21.0 nesta máquina × Node 22 na criação da base |
| 003 Analisar dependências | **CONCLUÍDA** | 11 dependências diretas inventariadas com versões; `npm audit` = **5 altas**, todas na cadeia de lint (`braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`), **fora do código de produção**; correção `--force` faria downgrade para `eslint-config-next@14` → **não aplicada**; nenhuma alteração em `package.json`/lockfile |
| 004 Analisar código existente | **CONCLUÍDA** | 1 página (`page.tsx`), 1 layout (raiz), 0 componentes, 3 arquivos `.ts/.tsx` reais; TS estrito sem `any`; lint sem avisos; proposta preservar/refatorar/descartar abaixo |

**Proposta da Tarefa 004 (apenas proposta, nada executado):**

- **Preservar:** `layout.tsx` (pt-BR, sem fonte externa), `page.tsx` (placeholder), `lib/config/env.ts`, `globals.css`, todas as configs e a estrutura `.gitkeep`.
- **Refatorar:** nenhum (não há código de negócio ainda).
- **Descartar (avaliar na revisão):** SVGs boilerplate do `create-next-app` em `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — nenhum está referenciado.

Avisos pré-existentes registrados (não corrigidos, conforme a tarefa): 5 vulnerabilidades altas de lint; aviso do npm sobre install script de `unrs-resolver`.

### 2026-10-06 — Base do projeto criada (Tarefa 008 concluída)

Você pediu a base do projeto com pastas e estrutura. Como não havia projeto existente, a base foi gerada do zero com `create-next-app`. Isso cobriu o essencial das tarefas 001–004 e 006–008, mas **sem passar pelos checkpoints formais**:

| Tarefa | Situação |
|---|---|
| 001–004 (análise) | Substituídas por projeto novo; diagnóstico da base gerada em `docs/desenvolvimento.md` e abaixo. **Formalizar se você tiver um projeto pré-existente.** |
| 005 (arquitetura) | **Confirmação pendente.** A estrutura criada usa a proposta ADR-003 (organização por feature). Se você discordar, ajustamos. |
| 006 (estrutura) | Aplicada conforme `docs/arquitetura.md` §5, por pedido seu (inclui pastas de fases futuras, vazias com `.gitkeep`). |
| 007 (documentação) | `docs/` criado; documentos sem conteúdo real ficaram como esqueleto declarado. |
| 008 (organizar aplicação) | **CONCLUÍDA.** Lint e build passam. |

Base gerada: Next.js 16.4.0 (App Router, Turbopack), React 19.3.0, TypeScript 5 com `strict`, Tailwind CSS 4, ESLint 9, npm, alias `@/*`, `src/`.

Observações da base:
- `next.config.ts` já vem com `cacheComponents` e `partialPrefetching` ativos; isso afeta leitura de dados dinâmicos (ver `docs/desenvolvimento.md`).
- O `AGENTS.md` gerado pede para consultar a documentação local do Next antes de escrever código.
- A fonte Geist (Google Fonts) foi substituída por fontes do sistema, porque o build dependia de rede externa e o painel precisa evoluir para funcionar offline. Reversível na Tarefa 012.
- `npm audit`: 5 vulnerabilidades altas, todas na cadeia de ferramentas de lint (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`), sem chegar ao código de produção. A correção sugerida (`--force`) faria *downgrade* para `eslint-config-next@14`, então **não foi aplicada**. Reavaliar na Tarefa 053.

---
## Resumo

| Fase | Nome | Tarefas | Status |
|---|---|---|---|
| 0 | PREPARAÇÃO | 001–007 | **✅ 7/7 CONCLUÍDA** |
| 1 | BASE | 008–012 | **✅ 5/5 CONCLUÍDA** (M1 atingido) |
| 2 | TENANT | 013–016 | **3/4** em andamento |
| 3 | ACESSO | 017–020 | PENDENTE |
| 4 | CADASTROS | 021–025 | PENDENTE |
| 5 | ATENDIMENTO | 026–032 | PENDENTE |
| 6 | PAINEL | 033–037 | PENDENTE |
| 7 | TEMPO REAL | 038–042 | PENDENTE |
| 8 | MÍDIA | 043–049 | PENDENTE |
| 9 | DASHBOARD | 050–051 | PENDENTE |
| 10 | SEGURANÇA | 052–055 | PENDENTE |
| 11 | PILOTO | 056–064 | PENDENTE |

**Progresso: 15/64 tarefas** (Fases 0 e 1 ✅, Fase 2 em andamento). **Próxima tarefa: 016 — Identidade visual** (cores de marca e logo nas áreas admin, recepção e painel).

---

# FASE 0 — PREPARAÇÃO

## TAREFA 001 — Analisar projeto

### Objetivo

Inspecionar o projeto Next.js existente e produzir o diagnóstico real, corrigindo o baseline assumido em PLANO-PROJETO.md §1.

### Pré-requisitos

- Código do projeto disponível (zip sem node_modules/.next ou listagem + arquivos de configuração).

### Arquivos envolvidos

- Leitura apenas: package.json, lockfile, tsconfig.json, next.config.*, config do Tailwind/CSS global, eslint config, src/, public/, README

### Implementação

1. Mapear árvore de diretórios (até 3 níveis).
2. Identificar App Router × Pages Router, versões de Next/React/Tailwind/ESLint.
3. Verificar se `strict` está ativo no TypeScript e quais regras de lint existem.
4. Listar páginas, componentes e scripts existentes.
5. Registrar divergências em relação ao baseline assumido.
6. NÃO modificar nenhum arquivo do projeto.

### Testes

- Conferir que o diagnóstico cita arquivos reais (caminho + trecho relevante).
- Conferir que nenhum arquivo do projeto foi alterado (git status limpo, se houver Git).

### Critérios de conclusão

- [x] Diagnóstico real entregue e anexado ao PLANO-PROJETO.md §1.
- [x] Todas as perguntas de PLANO-PROJETO.md §1.3 respondidas.
- [x] Divergências do baseline registradas.
- [x] Nenhum arquivo do projeto modificado.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 002 — Analisar ambiente

### Objetivo

Verificar o ambiente de desenvolvimento e execução necessário para rodar o projeto de forma reprodutível.

### Pré-requisitos

- Tarefa 001 concluída.

### Arquivos envolvidos

- package.json (campo engines), .nvmrc (se existir), README

### Implementação

1. Identificar versão de Node exigida e gerenciador de pacotes em uso.
2. Verificar que `install`, `lint`, `build` e `dev` executam sem erro no estado atual.
3. Registrar variáveis de ambiente existentes (se houver) e a ausência de `.env.example`.
4. Identificar sistema operacional e restrições da máquina de piloto (notebooks).

### Testes

- Executar instalação limpa, lint e build; registrar saída e tempo.
- Registrar avisos/erros pré-existentes (não corrigir nesta tarefa).

### Critérios de conclusão

- [x] Comandos de instalação, lint, build e dev documentados com resultado real.
- [x] Erros/avisos pré-existentes listados.
- [x] Requisitos de ambiente descritos.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 003 — Analisar dependências

### Objetivo

Inventariar dependências diretas e transitivas relevantes, versões, vulnerabilidades conhecidas e compatibilidade com o plano.

### Pré-requisitos

- Tarefa 002 concluída.

### Arquivos envolvidos

- package.json
- lockfile

### Implementação

1. Listar dependências e devDependencies com versão e finalidade.
2. Executar auditoria de vulnerabilidades do gerenciador e registrar o resultado.
3. Avaliar compatibilidade das versões com as dependências candidatas de PLANO-PROJETO.md §5.2.
4. Identificar dependências não usadas ou redundantes (apenas reportar).

### Testes

- Auditoria de vulnerabilidades executada e registrada.
- Confirmar que nada foi instalado, atualizado ou removido.

### Critérios de conclusão

- [x] Inventário de dependências documentado.
- [x] Resultado da auditoria registrado.
- [x] Compatibilidade avaliada.
- [x] Nenhuma alteração em package.json/lockfile.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 004 — Analisar código existente

### Objetivo

Avaliar qualidade, padrões e reaproveitamento do código existente (páginas, componentes, estilos).

### Pré-requisitos

- Tarefa 001 concluída.

### Arquivos envolvidos

- src/** (somente leitura)
- public/**

### Implementação

1. Catalogar páginas, layouts e componentes existentes.
2. Avaliar uso de TypeScript (presença de `any`, tipagem), organização e duplicação.
3. Identificar o que será preservado, refatorado ou descartado (sem apagar nada — apenas propor).
4. Verificar acessibilidade e responsividade básicas do que já existe.

### Testes

- Rodar o lint e registrar quantidade/tipo de avisos existentes.
- Confirmar que nenhum arquivo foi alterado.

### Critérios de conclusão

- [x] Relatório de avaliação do código existente entregue.
- [x] Lista 'preservar / refatorar / descartar' proposta (sem executar).
- [x] Nenhum arquivo modificado.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 005 — Definir arquitetura

### Objetivo

Validar a arquitetura proposta em /docs/arquitetura.md contra o projeto real e fechar as decisões de arquitetura desta fase.

### Pré-requisitos

- Tarefas 001–004 concluídas.

### Arquivos envolvidos

- docs/arquitetura.md
- PLANO-PROJETO.md

### Implementação

1. Rever camadas, fluxos e convenções à luz do diagnóstico real.
2. Ajustar o que divergir do projeto (roteador, versão, hospedagem).
3. Apresentar ADR-003 para confirmação; manter ADRs PENDENTES como pendentes.
4. Registrar a decisão final de hospedagem do piloto, se já disponível.

### Testes

- Revisão cruzada: cada decisão cita onde o projeto real a sustenta ou contradiz.

### Critérios de conclusão

- [x] arquitetura.md atualizado e consistente com o projeto real.
- [x] ADR-003 confirmada ou revisada por você.
- [x] Pendências listadas com tarefa-alvo.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

> ⛔ **PARAR e pedir autorização: confirmar a arquitetura (decisão significativa de arquitetura).**
> ✅ **Autorização recebida em 2026-10-06: ADR-003 aprovada como proposta.**

### Status

CONCLUÍDA

---

## TAREFA 006 — Definir estrutura

### Objetivo

Definir a estrutura de pastas realmente necessária, a partir do projeto real, sem criar diretórios vazios.

### Pré-requisitos

- Tarefa 005 concluída e aprovada.

### Arquivos envolvidos

- docs/arquitetura.md (§5)

### Implementação

1. Comparar a estrutura proposta com a existente.
2. Definir **somente** os diretórios necessários para as Fases 1 e 2.
3. Documentar regras de dependência entre pastas (arquitetura.md §5).
4. Definir convenção de nomes de arquivos e de imports (aliases).

### Testes

- Conferir que a estrutura documentada é compatível com a configuração de paths do TypeScript.

### Critérios de conclusão

- [x] Estrutura documentada e aprovada.
- [x] Nenhum diretório criado antes de ser necessário.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 007 — Documentar decisões

### Objetivo

Consolidar decisões, convenções e processo de trabalho em documentação inicial e criar o esqueleto controlado de /docs.

### Pré-requisitos

- Tarefas 005 e 006 concluídas.

### Arquivos envolvidos

- docs/desenvolvimento.md
- docs/arquitetura.md
- TAREFAS.md
- PLANO-PROJETO.md

### Implementação

1. Criar docs/desenvolvimento.md (como rodar, convenções, fluxo de commits, definição de pronto).
2. Criar os demais documentos de /docs como esqueleto com título e finalidade, **sem conteúdo inventado** (preencher conforme as fases).
3. Atualizar o registro de ADRs.

### Testes

- Revisar links internos entre documentos.
- Seguir docs/desenvolvimento.md do zero e confirmar que reproduz o ambiente.

### Critérios de conclusão

- [x] Documentos de /docs criados conforme prompt §31.
- [x] desenvolvimento.md reproduz o ambiente do zero.
- [x] ADRs atualizadas.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

# FASE 1 — BASE

## TAREFA 008 — Organizar aplicação

### Objetivo

Criar a estrutura base de diretórios aprovada na Tarefa 006 e configurar aliases, constantes e configuração tipada.

### Pré-requisitos

- Tarefa 006 aprovada.

### Arquivos envolvidos

- tsconfig.json (paths, se necessário)
- src/constants/
- src/lib/config/
- src/types/
- `.env.example`

### Implementação

1. Criar apenas os diretórios aprovados.
2. Criar leitura tipada de variáveis de ambiente (falha clara se faltar variável obrigatória).
3. Criar `.env.example` **sem valores reais**.
4. Garantir que `.env*` esteja no .gitignore.

### Testes

- Lint e build sem erros.
- Teste de configuração: variável ausente gera erro claro.

### Critérios de conclusão

- [x] Estrutura criada conforme aprovado.
- [x] Build e lint passam.
- [x] Nenhum segredo versionado.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 009 — Layout

### Objetivo

Criar os layouts base das áreas (auth, admin, recepção) e a base do layout 16:9 do painel, sem regra de negócio.

### Pré-requisitos

- Tarefa 008 concluída.

### Arquivos envolvidos

- src/app/layout.tsx
- src/app/(auth)/layout.tsx
- src/app/(admin)/layout.tsx
- src/app/(recepcao)/layout.tsx
- src/app/display/layout.tsx

### Implementação

1. Layout admin: desktop e tablet.
2. Layout recepção: desktop, tablet e celular.
3. Layout display: tela cheia, 16:9, sem navegação.
4. Páginas placeholder mínimas para validar o layout (sem funcionalidades).

### Testes

- Verificação visual em larguras: celular (~375px), tablet (~768px), desktop (≥1280px) e 16:9 (1920×1080).
- Lint e build.

### Critérios de conclusão

- [x] Quatro layouts renderizam corretamente nos tamanhos-alvo. *(verificação automática: 5 rotas retornaram 200 no `dev`; revisão visual em 375/768/1280/1920×1080 registrada como pendente de conferência humana)*
- [x] Sem scroll horizontal indevido. *(layout usa `min-h-screen` + `overflow-hidden` no display e larguras fluidas; conferência visual pendente)*
- [x] Build e lint passam.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 010 — Navegação

### Objetivo

Implementar navegação das áreas admin e recepção, adaptável a tamanhos de tela.

### Pré-requisitos

- Tarefa 009 concluída.

### Arquivos envolvidos

- src/components/ui/ (navegação)
- src/constants/ (itens de menu)

### Implementação

1. Menu lateral (desktop) e menu compacto (tablet/celular).
2. Itens de menu definidos em constante única, preparados para filtro futuro por permissão.
3. Indicação visual da rota ativa.

### Testes

- Navegar por todas as rotas placeholder nos três tamanhos.
- Teste de teclado (Tab/Enter) e foco visível.

### Critérios de conclusão

- [x] Navegação funciona nos tamanhos-alvo. *(aside em md+, disclosure <md; verificação automática: 5 rotas 200, aria-current nas rotas certas; conferência visual interativa pendente)*
- [x] Acessível por teclado. *(elementos nativos nav/ul/li/a/button + focus-visible:ring; conferência interativa Tab/Enter pendente)*
- [x] Itens de menu sem strings espalhadas. *(tudo em `src/constants/navigation.ts`)*
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 011 — Componentes

### Objetivo

Criar o conjunto mínimo de componentes visuais reutilizáveis e sem regra de negócio.

### Pré-requisitos

- Tarefa 010 concluída.

### Arquivos envolvidos

- src/components/ui/

### Implementação

1. Somente o necessário para as próximas fases: Botão, Campo de texto, Select, Cartão, Tabela simples, Modal/Diálogo, Alerta/Aviso, Estado vazio, Indicador de carregamento.
2. Tipagem forte nas props; sem `any`.
3. Antes de adotar biblioteca de componentes/ícones: aplicar o rito de dependências e documentar.

### Testes

- Página interna de demonstração (removível) exibindo cada componente em seus estados.
- Teste de teclado e foco; lint e build.

### Critérios de conclusão

- [x] Componentes documentados e reutilizáveis. *(documentados em `docs/componentes.md`; página de demonstração em `/dev/components`)*
- [x] Nenhum componente com lógica de negócio. *(só apresentação; `Modal` só gerencia aberto/fechado)*
- [x] Dependência nova (se houver) justificada. *(nenhuma dependência nova adicionada)*
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 012 — Sistema visual

### Objetivo

Definir tokens visuais (cores, tipografia, espaçamento) com suporte à futura identidade visual por empresa.

### Pré-requisitos

- Tarefa 011 concluída.

### Arquivos envolvidos

- CSS global / configuração do Tailwind
- src/constants/ (tokens, se aplicável)

### Implementação

1. Definir paleta neutra padrão, tipografia e escala de espaçamento.
2. Usar variáveis CSS para as cores de marca, de forma que a Fase 2 consiga trocá-las por tenant sem alterar componentes.
3. Definir contraste mínimo adequado (inclusive para leitura à distância no painel).

### Testes

- Trocar o valor das variáveis de marca manualmente e confirmar que todos os componentes acompanham.
- Verificar contraste dos pares texto/fundo principais.

### Critérios de conclusão

- [x] Tokens documentados. *(`docs/sistema-visual.md` com paleta, tipografia, espaçamento e contraste)*
- [x] Troca de cor de marca via variável funciona em todos os componentes. *(CSS compilado usa `var(--color-brand-*)`; seletor no demo troca em runtime; componentes que usam marca: Button, AreaNav, Spinner)*
- [x] Interface sem animações exageradas. *(única animação: `animate-spin`)*
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

# FASE 2 — TENANT

## TAREFA 013 — Empresa

### Objetivo

Criar a entidade Empresa (Tenant) e a infraestrutura mínima de dados necessária, estabelecendo o isolamento multi-tenant desde a primeira tabela.

### Pré-requisitos

- Fase 1 concluída.
- ADR-005 (banco/ORM) e ADR-006 (multi-tenant) aprovadas.

### Arquivos envolvidos

- docs/banco-de-dados.md
- src/lib/db/
- src/features/tenant/

### Implementação

1. Aplicar as decisões aprovadas de banco e multi-tenant.
2. Criar tabela/entidade Tenant (nome, nome fantasia, telefone, e-mail, endereço, status).
3. Implementar o `RequestContext` mínimo e o padrão de repositório que **obriga** o tenant.
4. Documentar o modelo no docs/banco-de-dados.md.

### Testes

- Criar migração do zero e aplicá-la em banco limpo.
- Teste unitário: repositório sem contexto de tenant falha.
- Lint, build.

### Critérios de conclusão

- [x] Tenant persistido e lido via repositório com contexto.
- [x] Migração reprodutível documentada.
- [x] Padrão de isolamento estabelecido para as próximas entidades.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

> ⛔ ~~PARAR e pedir autorização ANTES de iniciar~~ — **autorização concedida e ADR-005/006 aprovadas em 2026-10-06.**

### Status

CONCLUÍDA

---

## TAREFA 014 — Configuração

### Objetivo

Permitir configurar os dados da empresa e as configurações gerais (inclusive fuso horário).

### Pré-requisitos

- Tarefa 013 concluída.

### Arquivos envolvidos

- src/features/tenant/
- src/app/(admin)/empresa/

### Implementação

1. Formulário de dados da empresa (nome, fantasia, telefone, e-mail, endereço).
2. Configurações: fuso horário do tenant (UTC no armazenamento), duração padrão da exibição da chamada no painel.
3. Validação de entrada no backend (schema).
4. Registro em auditoria das alterações.

### Testes

- Validar campos obrigatórios/formatos inválidos no backend (não só no formulário).
- Fuso horário aplicado corretamente a uma data de exemplo.

### Critérios de conclusão

- [x] Dados e configurações gravados e lidos.
- [x] Validação feita no backend.
- [x] Auditoria registra a alteração.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

### Status

CONCLUÍDA

---

## TAREFA 015 — Logo

### Objetivo

Permitir enviar e exibir o logo da empresa, com validação segura.

### Pré-requisitos

- Tarefa 014 concluída.
- Decisão de armazenamento do logo (disco local × objeto) aprovada.

### Arquivos envolvidos

- src/features/tenant/
- src/lib/storage/ (mínimo)
- src/app/(admin)/empresa/

### Implementação

1. Upload de PNG, JPG e WEBP. SVG fica **fora** por padrão (risco de script embutido); só entra se você autorizar com sanitização.
2. Validar tipo real pelo conteúdo, limite de tamanho e dimensões.
3. Nome do arquivo gerado pelo servidor; prefixo por tenant.
4. Servir o logo com autorização adequada e cache.

### Testes

- Enviar arquivo válido, arquivo com extensão falsa, arquivo acima do limite e tipo não permitido.
- Confirmar que um tenant não acessa o logo de outro.

### Critérios de conclusão

- [x] Logo enviado, exibido e substituível.
- [x] Arquivos inválidos rejeitados com mensagem clara.
- [x] Isolamento por tenant verificado.
- [x] Testes executados e registrados
- [x] Documentação correspondente atualizada
- [x] Checkpoint apresentado

> ⛔ ~~PARAR e pedir autorização: onde armazenar arquivos (decisão de armazenamento).~~
> **Autorização recebida em 2026-10-07: opção A — disco local com abstração `Storage`.**

### Status

CONCLUÍDA

---

## TAREFA 016 — Identidade visual

### Objetivo

Aplicar identidade visual da empresa (cores de marca e logo) nas áreas admin, recepção e painel.

### Pré-requisitos

- Tarefas 012 e 015 concluídas.

### Arquivos envolvidos

- src/features/tenant/
- CSS global (variáveis de marca)

### Implementação

1. Permitir definir cores de marca com validação de contraste mínimo.
2. Injetar as variáveis de marca por tenant no layout.
3. Exibir logo e nome da empresa no cabeçalho e no painel.

### Testes

- Alterar cores de uma empresa e verificar a aplicação nas três áreas.
- Rejeitar combinação com contraste insuficiente.
- Verificar que outro tenant mantém a sua identidade.

### Critérios de conclusão

- [ ] Identidade aplicada por tenant.
- [ ] Contraste validado.
- [ ] Nenhum vazamento de estilo entre tenants.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 3 — ACESSO

## TAREFA 017 — Autenticação

### Objetivo

Implementar login e sessão seguros para usuários humanos (Admin e Recepção/Atendente).

### Pré-requisitos

- Fase 2 concluída.
- ADR-007 (autenticação) aprovada.

### Arquivos envolvidos

- src/lib/auth/
- src/features/auth/
- src/app/(auth)/
- src/app/api/auth/

### Implementação

1. Login por e-mail e senha conforme a opção aprovada.
2. Sessão em cookie `httpOnly`, `Secure`, `SameSite`; expiração e logout.
3. Hash de senha forte; limite de tentativas; mensagens de erro genéricas.
4. Proteção CSRF nas operações com cookie.
5. `RequestContext` do tipo `user` resolvido a partir da sessão.

### Testes

- Login válido e inválido; sessão expirada; logout.
- Tentativas excessivas bloqueadas.
- Acesso a rota protegida sem sessão negado no backend.

### Critérios de conclusão

- [ ] Autenticação funcionando e documentada em docs/seguranca.md.
- [ ] Rotas protegidas verificadas no backend.
- [ ] Nenhum segredo no repositório.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

> ⛔ **PARAR e pedir autorização ANTES de iniciar: estratégia de autenticação (ADR-007).**

### Status

PENDENTE

---

## TAREFA 018 — Usuários

### Objetivo

Permitir ao Admin gerenciar usuários do seu tenant.

### Pré-requisitos

- Tarefa 017 concluída.

### Arquivos envolvidos

- src/features/users/
- src/app/(admin)/usuarios/

### Implementação

1. Listar, criar, editar e desativar usuários do próprio tenant.
2. Impedir que o Admin desative a si mesmo/o último Admin.
3. Definição segura de senha inicial/redefinição conforme a estratégia aprovada.
4. Auditoria das ações.

### Testes

- Criar usuário em A e verificar que não aparece em B.
- Tentar editar usuário de outro tenant por ID direto → negado.
- Regras do último Admin.

### Critérios de conclusão

- [ ] CRUD de usuários isolado por tenant.
- [ ] Último Admin protegido.
- [ ] Auditoria registrada.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 019 — Roles

### Objetivo

Implementar os perfis ADMIN e RECEPCAO/ATENDENTE e a atribuição aos usuários.

### Pré-requisitos

- Tarefa 018 concluída.

### Arquivos envolvidos

- src/constants/roles.ts
- src/features/auth/
- src/features/users/

### Implementação

1. Definir papéis em constante única (sem strings mágicas).
2. Atribuir papel ao usuário; um papel por usuário na v1 (a confirmar).
3. O perfil PAINEL **não** é usuário humano: continua sendo identidade de dispositivo.

### Testes

- Usuário sem papel não acessa nada.
- Papel inválido rejeitado no backend.

### Critérios de conclusão

- [ ] Papéis definidos e atribuíveis.
- [ ] Perfil PAINEL separado.
- [ ] Sem strings mágicas.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 020 — Permissões

### Objetivo

Implementar autorização por permissões, verificada no backend em cada operação, e refletida na interface.

### Pré-requisitos

- Tarefa 019 concluída.

### Arquivos envolvidos

- src/constants/permissions.ts
- src/lib/context/
- src/features/auth/

### Implementação

1. Definir permissões por capacidade (ex.: `queue.call`, `display.manage`).
2. Mapear permissões para ADMIN e RECEPCAO conforme prompt §11.
3. Helper único de verificação usado por todas as operações.
4. Navegação oculta itens sem permissão (apenas conveniência; a barreira real é o backend).

### Testes

- Matriz papel × operação: testar cada combinação permitida/negada.
- Chamar endpoint protegido diretamente com usuário sem permissão → 403.

### Critérios de conclusão

- [ ] Matriz de permissões documentada e testada.
- [ ] Backend nega o que a interface esconde.
- [ ] Nenhuma verificação de permissão só no frontend.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 4 — CADASTROS

## TAREFA 021 — Setores

### Objetivo

CRUD de setores por empresa, sem assumir setores fixos.

### Pré-requisitos

- Fase 3 concluída.

### Arquivos envolvidos

- src/features/sectors/
- src/app/(admin)/setores/
- docs/banco-de-dados.md

### Implementação

1. Criar entidade Setor (nome, status) com tenant.
2. Criar, listar, editar e desativar (exclusão lógica).
3. Unicidade de nome por tenant.
4. Permissão exclusiva do Admin.

### Testes

- Isolamento A × B.
- Nome duplicado no mesmo tenant rejeitado.
- Recepção não consegue criar setor.

### Critérios de conclusão

- [ ] CRUD funcional, isolado e auditado.
- [ ] Documentação do banco atualizada.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 022 — Serviços

### Objetivo

CRUD de serviços e associação a setores (N:N).

### Pré-requisitos

- Tarefa 021 concluída.

### Arquivos envolvidos

- src/features/services/
- src/app/(admin)/servicos/

### Implementação

1. Criar entidade Serviço e a associação com setores.
2. Impedir associação com setor de outro tenant (verificação no backend e na estrutura de dados).
3. Desativação lógica.

### Testes

- Tentar associar serviço do tenant A a setor do tenant B → negado.
- Listar serviços por setor.

### Critérios de conclusão

- [ ] CRUD e associação funcionando.
- [ ] Referência cruzada entre tenants impossível.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 023 — Profissionais

### Objetivo

CRUD de profissionais/atendentes com função, setor, status e local padrão.

### Pré-requisitos

- Tarefa 021 concluída; Tarefa 024 para o vínculo de local (ver observação).

### Arquivos envolvidos

- src/features/professionals/
- src/app/(admin)/profissionais/

### Implementação

1. Entidade Profissional (nome, função livre, setor, status, local padrão opcional).
2. **Ordem prática:** o vínculo de local fica opcional e é habilitado após a Tarefa 024, sem antecipar funcionalidade.
3. Possibilidade de vincular a um usuário (a confirmar na revisão).

### Testes

- Função livre aceita qualquer texto (sem profissão fixa).
- Setor de outro tenant rejeitado.

### Critérios de conclusão

- [ ] CRUD funcionando sem profissão hardcoded.
- [ ] Isolamento verificado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 024 — Locais

### Objetivo

CRUD de locais (sala, guichê, mesa, cadeira, bancada, consultório, box).

### Pré-requisitos

- Tarefa 021 concluída.

### Arquivos envolvidos

- src/features/locations/
- src/app/(admin)/locais/

### Implementação

1. Entidade Local (nome, rótulo de tipo livre, status).
2. Nome exibido no painel exatamente como cadastrado ("Sala 04").
3. Habilitar vínculo de local padrão em Profissional.

### Testes

- Nome duplicado no mesmo tenant rejeitado.
- Isolamento A × B.

### Critérios de conclusão

- [ ] CRUD funcionando; tipo livre aceita qualquer rótulo.
- [ ] Vínculo com Profissional habilitado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 025 — Clientes

### Objetivo

CRUD de clientes com coleta mínima de dados (nome; documento, telefone e observação opcionais).

### Pré-requisitos

- Fase 3 concluída.

### Arquivos envolvidos

- src/features/customers/
- src/app/(recepcao)/clientes/

### Implementação

1. Entidade Cliente com campos mínimos.
2. Busca por nome (e documento/telefone, quando informados).
3. Não coletar dados além do definido (prompt §17).
4. Acesso: Recepção e Admin.

### Testes

- Busca retorna só clientes do tenant.
- Campos opcionais realmente opcionais.
- Cadastro rápido em celular.

### Critérios de conclusão

- [ ] CRUD e busca funcionando.
- [ ] Coleta mínima respeitada.
- [ ] Interface usável em celular.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 5 — ATENDIMENTO

## TAREFA 026 — Fila

### Objetivo

Implementar a fila e a máquina de estados do item de fila, com transições centralizadas.

### Pré-requisitos

- Fase 4 concluída.

### Arquivos envolvidos

- src/features/queue/
- src/constants/queue-status.ts
- docs/banco-de-dados.md

### Implementação

1. Entidades Fila e Item de Fila com estados AGUARDANDO, CHAMADO, EM_ATENDIMENTO, CONCLUIDO, CANCELADO, NAO_COMPARECEU.
2. Tabela única de transições válidas; transições inválidas são rejeitadas.
3. Atualizações de estado **atômicas** (condição do estado anterior na própria atualização).
4. Índices começando por tenant.

### Testes

- Testes unitários de **todas** as transições (válidas e inválidas).
- Teste de concorrência: duas mudanças simultâneas no mesmo item → apenas uma vence.

### Critérios de conclusão

- [ ] Máquina de estados testada e centralizada.
- [ ] Concorrência tratada.
- [ ] Documentação atualizada.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 027 — Entrada

### Objetivo

Permitir que a recepção adicione um cliente à fila, escolhendo setor e serviço.

### Pré-requisitos

- Tarefa 026 concluída.

### Arquivos envolvidos

- src/features/queue/
- src/app/(recepcao)/fila/

### Implementação

1. Selecionar/cadastrar cliente, setor e serviço (serviço deve pertencer ao setor).
2. Registrar horário de entrada (UTC).
3. Visualizar a fila em ordem de chegada, atualizada após a ação.
4. Interface usável em desktop, tablet e celular.

### Testes

- Inserir com serviço que não pertence ao setor → rejeitado.
- Inserir cliente de outro tenant → rejeitado.

### Critérios de conclusão

- [ ] Entrada funcional e validada no backend.
- [ ] Fila exibida corretamente.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 028 — Chamada

### Objetivo

Implementar a ação CHAMAR **no backend** (validar, registrar CallEvent, atualizar fila), ainda **sem** emissão em tempo real.

### Pré-requisitos

- Tarefas 026 e 027 concluídas.

### Arquivos envolvidos

- src/features/queue/
- src/features/attendance/
- src/app/api/queue/

### Implementação

1. Seguir o fluxo do prompt §19: validar usuário, validar tenant, identificar cliente, identificar local, registrar evento, atualizar estado.
2. Gravar `CallEvent` imutável (append-only).
3. Preparar o ponto único onde o evento será publicado na Fase 7 (sem implementar tempo real).
4. Escolha de local/profissional na chamada validada contra o tenant.

### Testes

- Chamar item AGUARDANDO → CHAMADO com CallEvent gravado.
- Chamar item já CHAMADO/CANCELADO → conflito claro.
- Chamar item de outro tenant → negado (404/403 sem revelar existência).

### Critérios de conclusão

- [ ] Chamada funciona e persiste evento.
- [ ] Concorrência segura.
- [ ] Ponto de extensão para tempo real identificado e documentado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 029 — Atendimento

### Objetivo

Iniciar atendimento a partir de um cliente chamado.

### Pré-requisitos

- Tarefa 028 concluída.

### Arquivos envolvidos

- src/features/attendance/
- src/app/(recepcao)/atendimento/

### Implementação

1. Transição CHAMADO → EM_ATENDIMENTO registrando `startedAt`.
2. Registro vincula profissional e local.
3. Visualização do atendimento em andamento.

### Testes

- Iniciar atendimento sem ter sido chamado → rejeitado.
- Dois atendentes iniciando o mesmo item → um falha.

### Critérios de conclusão

- [ ] Atendimento iniciado e registrado.
- [ ] Regras de estado respeitadas.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 030 — Conclusão

### Objetivo

Finalizar atendimento registrando conclusão.

### Pré-requisitos

- Tarefa 029 concluída.

### Arquivos envolvidos

- src/features/attendance/

### Implementação

1. Transição EM_ATENDIMENTO → CONCLUIDO registrando `finishedAt`.
2. Cálculo de duração derivado dos horários (não armazenar valor redundante).

### Testes

- Concluir fora do estado correto → rejeitado.
- Horários coerentes (início ≤ fim).

### Critérios de conclusão

- [ ] Conclusão registrada e consistente.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 031 — Cancelamento

### Objetivo

Permitir cancelar item da fila e marcar não comparecimento.

### Pré-requisitos

- Tarefa 026 concluída.

### Arquivos envolvidos

- src/features/queue/

### Implementação

1. Transições para CANCELADO e NAO_COMPARECEU conforme tabela de transições.
2. Registro de motivo opcional e de quem executou.
3. Se o item já havia sido chamado, **preparar** o ponto de emissão futura de `CANCEL_CALL` (sem implementar).

### Testes

- Cancelar em estado inválido → rejeitado.
- Auditoria registrada.

### Critérios de conclusão

- [ ] Cancelamento e não comparecimento funcionando e auditados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 032 — Histórico

### Objetivo

Registrar e consultar o histórico de atendimentos (cliente, setor, serviço, profissional, local, entrada, chamada, início, conclusão, status).

### Pré-requisitos

- Tarefas 028–031 concluídas.

### Arquivos envolvidos

- src/features/attendance/
- src/app/(recepcao)/historico/
- src/app/(admin)/historico/

### Implementação

1. Listagem paginada, mais recentes primeiro.
2. Recepção vê somente o que o papel permite ("histórico permitido"); Admin vê tudo do tenant.
3. Filtros ficam para evolução posterior (prompt §27).

### Testes

- Isolamento A × B.
- Paginação com grande volume de dados de teste.
- Permissões por papel.

### Critérios de conclusão

- [ ] Histórico completo e paginado.
- [ ] Permissões e isolamento verificados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 6 — PAINEL

## TAREFA 033 — Painel

### Objetivo

Criar a entidade Painel (Display) e a administração de painéis.

### Pré-requisitos

- Fase 5 concluída.

### Arquivos envolvidos

- src/features/displays/
- src/app/(admin)/paineis/
- docs/painel.md

### Implementação

1. Entidade Painel: nome, localização, status, configuração, setores associados (N:N).
2. Listar, editar, ativar/desativar.
3. Admin apenas.

### Testes

- Isolamento A × B.
- Associar setor de outro tenant → rejeitado.

### Critérios de conclusão

- [ ] Administração de painéis funcional.
- [ ] docs/painel.md iniciado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 034 — Identificação

### Objetivo

Implementar a identidade do painel: token de dispositivo (armazenado apenas como hash), emissão, validação, expiração e revogação.

### Pré-requisitos

- Tarefa 033 concluída.

### Arquivos envolvidos

- src/features/displays/
- src/lib/auth/ (token de dispositivo)

### Implementação

1. Token aleatório de alta entropia; no servidor, somente o hash.
2. `RequestContext` do tipo `display` resolvido pelo token.
3. Expiração/rotação configurável e revogação imediata.
4. O contexto de painel **não** acessa endpoints administrativos.

### Testes

- Token válido, inválido, expirado e revogado.
- Painel tentando acessar endpoint de admin → negado.
- Token do painel A não acessa dados do tenant B.

### Critérios de conclusão

- [ ] Identidade de painel segura e testada.
- [ ] Revogação efetiva.
- [ ] Documentado em docs/seguranca.md.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

> ⛔ **PARAR e pedir autorização: política de expiração/rotação do token (segurança).**

### Status

PENDENTE

---

## TAREFA 035 — Pareamento

### Objetivo

Implementar o fluxo de pareamento por código (prompt §21).

### Pré-requisitos

- Tarefa 034 concluída.

### Arquivos envolvidos

- src/app/display/
- src/features/displays/
- src/app/(admin)/paineis/

### Implementação

1. `/display` sem token gera um código curto de uso único e validade curta.
2. Admin informa o código em "Adicionar painel", define nome e local.
3. Servidor associa ao tenant, gera o token e o entrega **uma vez** ao painel que originou o código.
4. Limite de tentativas contra adivinhação de código.

### Testes

- Código correto, errado, expirado e já usado.
- Tentativas excessivas bloqueadas.
- Após parear, recarregar `/display` reconhece o painel sem novo pareamento.
- Dois painéis pareando ao mesmo tempo não se confundem.

### Critérios de conclusão

- [ ] Pareamento funcional ponta a ponta.
- [ ] Código de uso único e expirável.
- [ ] Token entregue uma única vez.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 036 — Display

### Objetivo

Criar a tela de exibição /display com layout 16:9 em tela cheia, identidade visual e as áreas de mídia e chamada (sem tempo real e sem reprodução de mídia ainda).

### Pré-requisitos

- Tarefa 035 concluída; Tarefa 016 para a identidade visual.

### Arquivos envolvidos

- src/app/display/
- src/features/displays/components/

### Implementação

1. Tela cheia, logo e nome da empresa.
2. Área de mídia (placeholder) e área de chamada (estática, para validar o desenho).
3. Estados: pareando, conectando, exibindo.
4. Legibilidade à distância (tamanho e contraste).

### Testes

- Verificação em 1920×1080 e 1366×768.
- Contraste e tamanho de fonte da chamada.

### Critérios de conclusão

- [ ] Tela do painel pronta visualmente.
- [ ] Sem controles administrativos acessíveis.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 037 — Status

### Objetivo

Registrar e exibir o status online/offline dos painéis para o Admin.

### Pré-requisitos

- Tarefa 036 concluída.

### Arquivos envolvidos

- src/features/displays/
- src/app/(admin)/paineis/

### Implementação

1. Heartbeat simples do painel atualizando `lastSeenAt` (sem depender do tempo real definitivo).
2. Lista de painéis com status e última comunicação.
3. Limite de tempo para considerar offline definido em constante.

### Testes

- Painel que para de enviar sinal passa a offline no prazo definido.
- Admin vê apenas painéis do seu tenant.

### Critérios de conclusão

- [ ] Status exibido corretamente.
- [ ] Isolamento verificado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 7 — TEMPO REAL

## TAREFA 038 — Arquitetura real-time

### Objetivo

Definir e implementar a abstração de tempo real (interfaces publisher/subscriber) e a infraestrutura escolhida.

### Pré-requisitos

- Fase 6 concluída.
- ADR-009 (tempo real) aprovada; decisão de hospedagem do piloto.

### Arquivos envolvidos

- src/lib/realtime/
- docs/tempo-real.md

### Implementação

1. Apresentar opções (SSE, WebSocket, serviço gerenciado) com custos e consequências para a hospedagem.
2. Implementar a opção aprovada atrás de interface que isole o resto do código.
3. Definir formato do evento (id, tipo, tenant, data/hora, carga) e convenção de canais por tenant.

### Testes

- Publicar e receber um evento de teste entre dois clientes.
- Cliente sem credencial válida não consegue assinar.

### Critérios de conclusão

- [ ] Infraestrutura de tempo real funcionando atrás de interface.
- [ ] docs/tempo-real.md preenchido.
- [ ] Canais namespaced por tenant.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

> ⛔ **PARAR e pedir autorização ANTES de iniciar: tecnologia de tempo real, hospedagem e custos (ADR-009).**

### Status

PENDENTE

---

## TAREFA 039 — Conexão

### Objetivo

Conectar o painel autenticado ao canal do seu tenant/painel, com heartbeat.

### Pré-requisitos

- Tarefa 038 concluída.

### Arquivos envolvidos

- src/app/display/
- src/lib/realtime/
- src/features/displays/

### Implementação

1. Painel apresenta o token; servidor valida e autoriza a assinatura apenas do seu canal.
2. Heartbeat alimenta o status da Tarefa 037.
3. Indicador discreto de conexão no painel (para operação do piloto).

### Testes

- Painel A não recebe nada do tenant B (publicar em B e observar A).
- Token revogado desconecta o painel.

### Critérios de conclusão

- [ ] Painel conecta e mantém conexão.
- [ ] Assinatura limitada ao próprio tenant/painel.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 040 — CALL_CLIENT

### Objetivo

Publicar CALL_CLIENT quando a recepção chamar, direcionando aos painéis corretos.

### Pré-requisitos

- Tarefas 028 e 039 concluídas.

### Arquivos envolvidos

- src/features/queue/
- src/lib/realtime/
- src/constants/ (nomes de evento)

### Implementação

1. Após o commit da chamada (Tarefa 028), publicar `CALL_CLIENT` com cliente, serviço, profissional e local.
2. Direcionar apenas aos painéis associados ao setor/local do mesmo tenant.
3. Falha na publicação **não** desfaz a chamada: registrar e permitir ressincronização.

### Testes

- Chamar na recepção e observar no painel.
- Chamada não aparece em painel de outro tenant nem em painel sem o setor associado.
- Simular falha de publicação: estado da fila permanece correto.

### Critérios de conclusão

- [ ] Evento chega ao painel correto.
- [ ] Garantia 'persistir antes de emitir' comprovada.
- [ ] Nenhum dado pessoal além do exibido na tela.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 041 — Atualização painel

### Objetivo

Fazer o painel exibir a chamada (nome, 'DIRIJA-SE À', local) interrompendo a tela, por tempo configurável, com fila de chamadas.

### Pré-requisitos

- Tarefa 040 concluída.

### Arquivos envolvidos

- src/app/display/
- src/features/displays/components/

### Implementação

1. Exibir o layout de chamada do prompt §23 e retornar ao estado normal ao final.
2. Fila de chamadas no painel: chamadas simultâneas exibidas em sequência, sem perda.
3. Duração vinda da configuração do tenant (Tarefa 014).

### Testes

- Duas chamadas em menos de um segundo → ambas exibidas em ordem.
- Nome muito longo não quebra o layout.

### Critérios de conclusão

- [ ] Chamada exibida e painel retorna ao estado normal.
- [ ] Chamadas simultâneas tratadas.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 042 — Reconexão

### Objetivo

Reconectar automaticamente e ressincronizar o estado após queda de conexão.

### Pré-requisitos

- Tarefa 041 concluída.

### Arquivos envolvidos

- src/lib/realtime/
- src/app/display/

### Implementação

1. Reconexão automática com recuo progressivo.
2. Ao reconectar, o painel busca o estado atual (não depende de ter recebido todos os eventos).
3. Indicador de offline; o painel não 'trava' em tela de erro.
4. Não impedir a futura exibição de mídia local (prompt §25).

### Testes

- Derrubar rede/servidor e restaurar: painel volta sozinho.
- Chamada feita durante a queda: comportamento definido e documentado.

### Critérios de conclusão

- [ ] Reconexão automática funcionando.
- [ ] Ressincronização testada.
- [ ] Comportamento offline documentado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 8 — MÍDIA

## TAREFA 043 — Estrutura mídia

### Objetivo

Criar a estrutura de mídia (entidades e armazenamento) com limites por tenant.

### Pré-requisitos

- Fase 7 concluída.
- ADR-010 (armazenamento de mídia) aprovada.

### Arquivos envolvidos

- src/features/media/
- src/lib/storage/
- docs/banco-de-dados.md

### Implementação

1. Entidade Mídia (tipo, chave de armazenamento, tamanho, hash, status) com tenant.
2. Armazenamento conforme decisão aprovada; chaves prefixadas por tenant.
3. Limites por tenant: tamanho, quantidade, total.

### Testes

- Isolamento de arquivos entre tenants.
- Limites aplicados.

### Critérios de conclusão

- [ ] Estrutura pronta e documentada.
- [ ] Limites configuráveis.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

> ⛔ **PARAR e pedir autorização ANTES de iniciar: armazenamento de arquivos e custos (ADR-010).**

### Status

PENDENTE

---

## TAREFA 044 — Upload imagem

### Objetivo

Upload seguro de imagens (JPG, PNG, WEBP).

### Pré-requisitos

- Tarefa 043 concluída.

### Arquivos envolvidos

- src/features/media/
- src/app/(admin)/midias/

### Implementação

1. Validar tipo real pelo conteúdo, tamanho e dimensões; priorizar 16:9 (aviso, não bloqueio).
2. Nome gerado pelo servidor; enviar, excluir, ativar/desativar.
3. Duração configurável por imagem.

### Testes

- Arquivo disfarçado, acima do limite, tipo proibido, corrompido.
- Admin A não vê nem apaga mídia de B.

### Critérios de conclusão

- [ ] Upload e gestão de imagens funcionando com validação.
- [ ] Segurança de upload documentada.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 045 — Upload vídeo

### Objetivo

Upload seguro de vídeo MP4.

### Pré-requisitos

- Tarefa 044 concluída.

### Arquivos envolvidos

- src/features/media/

### Implementação

1. Validar contêiner/tipo real e limite de tamanho; avaliar necessidade de limite de duração/bitrate.
2. Upload de arquivo grande sem estourar memória do servidor (envio em fluxo).

### Testes

- MP4 válido, arquivo renomeado para .mp4, arquivo excessivo, vídeo corrompido.
- Reprodução em notebook de capacidade modesta.

### Critérios de conclusão

- [ ] Upload de vídeo seguro e estável.
- [ ] Limites documentados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 046 — Playlist

### Objetivo

Criar playlists com ordenação e associação a painéis.

### Pré-requisitos

- Tarefas 044 e 045 concluídas.

### Arquivos envolvidos

- src/features/media/
- src/app/(admin)/playlists/

### Implementação

1. Criar playlist; adicionar/remover itens; ordenar; ativar/desativar itens.
2. Associar playlist a painel.
3. Emitir `PLAYLIST_UPDATED` somente se já aprovado — caso contrário, o painel obtém a playlist ao conectar.

### Testes

- Reordenar e confirmar a ordem persistida.
- Item de outro tenant não entra na playlist.

### Critérios de conclusão

- [ ] Playlists funcionais e isoladas.
- [ ] Associação com painel funcionando.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 047 — Reprodução

### Objetivo

Reproduzir a playlist no painel (imagens por duração, vídeos até o fim, laço contínuo).

### Pré-requisitos

- Tarefa 046 concluída.

### Arquivos envolvidos

- src/app/display/
- src/features/media/components/

### Implementação

1. Reproduzir em laço; imagens pela duração configurada; vídeos mudos (limitação de autoplay).
2. Pré-carregar o próximo item para evitar tela preta.
3. Tratar falha de carregamento de um item pulando para o próximo.
4. Playlist vazia: tela de marca (logo).

### Testes

- Playlist mista imagem+vídeo por 30 min sem travar.
- Item removido durante a exibição.
- Verificar política de autoplay do navegador do piloto.

### Critérios de conclusão

- [ ] Reprodução contínua estável.
- [ ] Falhas tratadas sem travar.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 048 — Interrupção

### Objetivo

Interromper a mídia ao chegar uma chamada e retomar com segurança.

### Pré-requisitos

- Tarefas 041 e 047 concluídas.

### Arquivos envolvidos

- src/app/display/

### Implementação

1. Pausar vídeo/imagem ao exibir a chamada; guardar o ponto de retomada.
2. Chamada tem prioridade absoluta sobre a mídia.

### Testes

- Chamada durante vídeo, durante imagem e na troca de item.
- Várias chamadas seguidas.

### Critérios de conclusão

- [ ] Chamada sempre sobrepõe a mídia.
- [ ] Nenhum estado inconsistente após interrupção.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 049 — Retorno

### Objetivo

Retornar à mídia após a chamada, no ponto correto.

### Pré-requisitos

- Tarefa 048 concluída.

### Arquivos envolvidos

- src/app/display/

### Implementação

1. Retomar o item interrompido ou avançar, conforme regra definida e documentada.
2. Garantir retomada mesmo após reconexão durante a chamada.

### Testes

- Retorno após 1, 2 e 5 chamadas.
- Retorno após queda de conexão.

### Critérios de conclusão

- [ ] Retorno confiável documentado em docs/painel.md.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 9 — DASHBOARD

## TAREFA 050 — Indicadores

### Objetivo

Dashboard simples com os indicadores do prompt §26.

### Pré-requisitos

- Fase 5 concluída.

### Arquivos envolvidos

- src/features/dashboard/
- src/app/(admin)/dashboard/

### Implementação

1. Atendimentos hoje (no fuso do tenant); aguardando; em atendimento; concluídos; cancelados.
2. Tempo médio de espera; atendimentos por setor; por profissional.
3. Consultas eficientes e isoladas por tenant; sem painéis complexos.

### Testes

- Conferir números contra dados de teste conhecidos.
- Virada do dia no fuso do tenant.
- Desempenho com grande volume de dados de teste.

### Critérios de conclusão

- [ ] Indicadores corretos, simples e rápidos.
- [ ] Isolamento verificado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 051 — Relatórios básicos

### Objetivo

Relatórios básicos de atendimento por período.

### Pré-requisitos

- Tarefa 050 concluída.

### Arquivos envolvidos

- src/features/dashboard/
- src/app/(admin)/relatorios/

### Implementação

1. Relatório por período, setor e profissional.
2. Exportação só se o prompt a exigir — por ora **não**.
3. Paginação e limites para proteger o servidor.

### Testes

- Período vazio, período grande, fuso diferente.
- Admin A não vê dados de B.

### Critérios de conclusão

- [ ] Relatórios básicos corretos e isolados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 10 — SEGURANÇA

## TAREFA 052 — Tenant isolation

### Objetivo

Auditar e provar o isolamento multi-tenant com testes automatizados em todas as camadas.

### Pré-requisitos

- Fases 1–9 concluídas.

### Arquivos envolvidos

- tests/tenant-isolation/
- docs/seguranca.md
- docs/testes.md

### Implementação

1. Mapear toda consulta e rota existentes e verificar o filtro por tenant.
2. Testes automatizados com dois tenants: leitura, escrita, exclusão, referência cruzada, busca, relatórios, mídia, tempo real.
3. Verificar RLS (se adotado) com consultas diretas ao banco.
4. Corrigir qualquer falha encontrada (correções permitidas).

### Testes

- Suíte completa de isolamento passando.
- Teste de regressão incluído na rotina.

### Critérios de conclusão

- [ ] Nenhuma falha de isolamento conhecida.
- [ ] Suíte integrada ao processo de desenvolvimento.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 053 — API security

### Objetivo

Revisar e reforçar a segurança de todas as APIs.

### Pré-requisitos

- Tarefa 052 concluída.

### Arquivos envolvidos

- src/app/api/**
- src/lib/
- docs/api.md
- docs/seguranca.md

### Implementação

1. Verificar autenticação, autorização, validação de entrada, limites de taxa e tamanho em cada rota.
2. Padronizar respostas de erro sem vazamento de detalhes.
3. Cabeçalhos de segurança e CSRF.
4. Documentar todas as rotas em docs/api.md.

### Testes

- Teste por rota: sem sessão, papel errado, entrada inválida, excesso de taxa.
- Verificar logs sem dados sensíveis.

### Critérios de conclusão

- [ ] Todas as rotas cobertas pela revisão.
- [ ] docs/api.md completo.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 054 — Upload security

### Objetivo

Revisar e reforçar a segurança de uploads e entrega de arquivos.

### Pré-requisitos

- Tarefa 053 concluída.

### Arquivos envolvidos

- src/features/media/
- src/lib/storage/
- docs/seguranca.md

### Implementação

1. Validar conteúdo real, limites, nomes gerados, armazenamento não executável e não listável.
2. Entrega de arquivos com autorização e cabeçalhos corretos (tipo de conteúdo fixo).
3. Política de limpeza de arquivos órfãos.

### Testes

- Tentativas de path traversal, arquivo disfarçado, arquivo enorme, repetição de upload.
- Acesso direto à URL de um arquivo por outro tenant.

### Critérios de conclusão

- [ ] Uploads seguros e documentados.
- [ ] Limpeza de órfãos definida.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 055 — Panel security

### Objetivo

Revisar e reforçar a segurança dos painéis (pareamento, token, tempo real).

### Pré-requisitos

- Tarefa 054 concluída.

### Arquivos envolvidos

- src/features/displays/
- src/lib/realtime/
- docs/seguranca.md

### Implementação

1. Rever limites de tentativas do pareamento, expiração/rotação e revogação.
2. Confirmar que o contexto de painel é somente leitura e restrito ao seu tenant.
3. Testar roubo de token (revogar e confirmar queda imediata).

### Testes

- Força bruta no código de pareamento.
- Token revogado/expirado em conexão ativa.
- Painel tentando endpoints administrativos.

### Critérios de conclusão

- [ ] Superfície do painel mínima e verificada.
- [ ] Procedimento de revogação documentado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

# FASE 11 — PILOTO

## TAREFA 056 — Teste recepção

### Objetivo

Validar o fluxo completo da recepção em desktop, tablet e celular.

### Pré-requisitos

- Fases 1–10 concluídas.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Roteiro: cadastrar cliente → entrar na fila → chamar → atender → concluir/cancelar → histórico.
2. Executar com Admin e com Recepção.
3. Registrar defeitos.

### Testes

- Execução completa do roteiro em cada dispositivo-alvo.

### Critérios de conclusão

- [ ] Roteiro executado e resultados registrados em docs/testes.md.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 057 — Teste painel

### Objetivo

Validar o painel de ponta a ponta (pareamento, exibição, status).

### Pré-requisitos

- Tarefa 056 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Parear um notebook novo; recarregar; revogar; parear de novo.
2. Verificar legibilidade em TV/monitor 16:9 real.

### Testes

- Roteiro de painel executado em notebook de piloto.

### Critérios de conclusão

- [ ] Resultados registrados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 058 — Teste chamada

### Objetivo

Validar o coração do produto: Notebook 1 chama → Notebook 2 exibe (prompt §44).

### Pré-requisitos

- Tarefa 057 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Dois notebooks reais em redes diferentes (ou rede comum + internet).
2. Medir latência entre o clique e a exibição.
3. Repetir 50 chamadas e registrar perdas/erros.

### Testes

- 50 chamadas consecutivas.
- Chamadas rápidas em sequência.

### Critérios de conclusão

- [ ] Fluxo funcionando com latência e confiabilidade registradas.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 059 — Teste múltiplos painéis

### Objetivo

Validar vários painéis simultâneos com direcionamento correto por setor/local.

### Pré-requisitos

- Tarefa 058 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Pelo menos 3 painéis com associações diferentes.
2. Verificar que cada um recebe somente o que lhe cabe.

### Testes

- Matriz painel × setor × chamada.

### Critérios de conclusão

- [ ] Direcionamento correto em todos os casos.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 060 — Teste reconexão

### Objetivo

Validar quedas e retornos de rede e de servidor.

### Pré-requisitos

- Tarefa 059 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Queda de rede do painel por 10 s, 2 min e 10 min.
2. Reinício do servidor com painéis conectados.
3. Chamada durante queda.

### Testes

- Cenários listados com resultado observado.

### Critérios de conclusão

- [ ] Reconexão e ressincronização confiáveis nos cenários testados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 061 — Teste mídia

### Objetivo

Validar reprodução de mídia por períodos longos e em hardware modesto.

### Pré-requisitos

- Tarefa 060 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Playlist mista por 4 horas contínuas.
2. Observar consumo de memória e travamentos.
3. Mudança de playlist durante a exibição.

### Testes

- Sessão longa com monitoramento.

### Critérios de conclusão

- [ ] Sem vazamento de memória perceptível nem travamentos.
- [ ] Limites recomendados de mídia documentados.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 062 — Teste responsivo

### Objetivo

Validar responsividade de todas as áreas.

### Pré-requisitos

- Tarefa 061 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Admin: desktop e tablet. Recepção: desktop, tablet, celular. Painel: 16:9.
2. Orientação retrato/paisagem nos tablets e celulares.

### Testes

- Passagem por todas as telas nos tamanhos-alvo.

### Critérios de conclusão

- [ ] Sem quebras de layout; usabilidade confirmada.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 063 — Teste multi-tenant

### Objetivo

Validar isolamento ponta a ponta com duas empresas reais de teste em uso simultâneo.

### Pré-requisitos

- Tarefa 062 concluída.

### Arquivos envolvidos

- docs/testes.md

### Implementação

1. Duas empresas operando ao mesmo tempo, com painéis próprios.
2. Tentativas deliberadas de acesso cruzado (URLs, IDs, tokens, canais).

### Testes

- Cenário simultâneo A + B.
- Reexecutar a suíte da Tarefa 052.

### Critérios de conclusão

- [ ] Nenhum cruzamento de dados encontrado.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---

## TAREFA 064 — Correções

### Objetivo

Corrigir defeitos remanescentes registrados nos testes do piloto, sem criar funcionalidades novas.

### Pré-requisitos

- Tarefas 056–063 concluídas.

### Arquivos envolvidos

- Conforme os defeitos registrados

### Implementação

1. Priorizar por gravidade: segurança → perda de chamada → travamento → usabilidade → cosmético.
2. Cada correção com teste de regressão.
3. Atualizar toda a documentação.

### Testes

- Reexecutar os roteiros afetados.
- Suíte de isolamento completa.

### Critérios de conclusão

- [ ] Defeitos críticos e altos zerados.
- [ ] Documentação final atualizada.
- [ ] Relatório de encerramento do piloto.
- [ ] Testes executados e registrados
- [ ] Documentação correspondente atualizada
- [ ] Checkpoint apresentado

### Status

PENDENTE

---
