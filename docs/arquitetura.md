# Arquitetura — SaaS de Atendimento, Filas e Painéis Digitais

> Versão: 0.2 (2026-10-06) — **validada contra o código real** nas Tarefas 001–006.
> ADR-003 **confirmada** pelo solicitante em 2026-10-06 (Tarefa 005).
> Decisões com status **PROPOSTA** são reversíveis. Decisões **PENDENTE** exigem autorização.

---

## 1. Objetivo e escopo da arquitetura

Plataforma web multi-tenant onde empresas organizam filas, chamam clientes e controlam painéis
digitais que exibem mídia e chamadas em tempo real.

A arquitetura precisa satisfazer, nesta ordem de prioridade:

1. **Isolamento entre empresas** (um vazamento invalida o produto).
2. **Chamada confiável**: recepção chama → painel exibe, sem perda e sem depender de IP local.
3. **Simplicidade operacional**: configurar → usar.
4. **Evolução**: offline do painel, Display Node físico, SaaS comercial, sem reescrever.

### Não-metas do piloto

Hardware próprio, apps nativos, IA, pagamentos, WhatsApp, alta disponibilidade multi-região.

---

## 2. Visão de contexto

```
┌──────────────┐   HTTPS   ┌──────────────────────────────┐   HTTPS/SSE|WS   ┌──────────────┐
│  Admin (web) │──────────►│                              │◄─────────────────│ Painel       │
└──────────────┘           │           BACKEND            │                  │ /display     │
┌──────────────┐   HTTPS   │  API · Auth · Regras · RT    │                  │ (notebook =  │
│ Recepção web │──────────►│                              │                  │ Display Node)│
└──────────────┘           └───────┬───────────────┬──────┘                  └──────────────┘
                                   │               │
                           ┌───────▼──────┐ ┌──────▼───────┐
                           │ Banco [PEND.]│ │ Armazen. mídia│
                           │              │ │      [PEND.]  │
                           └──────────────┘ └───────────────┘
```

Regras de comunicação (do prompt):

- Recepção **nunca** fala diretamente com o painel.
- O painel **nunca** depende do IP da recepção.
- Toda comunicação passa pelo backend, que é a fonte central de verdade.

---

## 3. Atores e contextos de acesso

| Ator | Autenticação | Escopo | Acesso |
|---|---|---|---|
| Admin | Sessão (usuário/senha) | Um tenant | Configuração, cadastros, painéis, mídia, relatórios |
| Recepção/Atendente | Sessão (usuário/senha) | Um tenant | Clientes, fila, chamada, atendimento, histórico permitido |
| Painel | Token de dispositivo | Um tenant, um painel | **Somente exibição** |
| (Futuro) Plataforma | A definir | Todos os tenants | Gestão do SaaS — fora do escopo do piloto |

Cada requisição entra no backend e é convertida em **um contexto tipado**:

```ts
// Conceito — ilustrativo, não é implementação
type RequestContext =
  | { kind: "user"; tenantId: TenantId; userId: UserId; role: RoleName; permissions: Permission[] }
  | { kind: "display"; tenantId: TenantId; displayId: DisplayId };
```

Sem contexto válido, **nenhum serviço de domínio é chamado**.

---

## 4. Camadas do backend

```
   Requisição
       │
       ▼
┌───────────────────┐
│ 1. Borda (API)    │  Route Handler / Server Action
│  - parse + valida │  - schema de entrada
│  - autentica      │  - NÃO contém regra de negócio
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 2. Contexto       │  resolve usuário/painel → RequestContext (tenant, papel)
│  - autoriza       │  verifica permissão exigida pela operação
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ 3. Serviço de     │  regras de negócio (ex.: chamar cliente)
│    domínio        │  orquestra repositórios e publicação de eventos
└──────┬──────┬─────┘
       ▼      ▼
┌──────────┐ ┌────────────┐
│4.Reposit.│ │5. Realtime │
│ (dados)  │ │ (publicar) │
└──────────┘ └────────────┘
```

| Camada | Pode | Não pode |
|---|---|---|
| Borda | Validar formato, traduzir erros em HTTP | Consultar banco, decidir regra |
| Contexto | Identificar quem é e de qual tenant | Executar operação de negócio |
| Serviço | Aplicar regras, abrir transações, publicar eventos | Conhecer HTTP/cookies, montar HTML |
| Repositório | Ler/gravar **sempre** filtrando por tenant | Conter regra de negócio |
| Realtime | Publicar/assinar por canal namespaced | Decidir o que é evento (isso é do serviço) |

---

## 5. Organização do código (confirmada — Tarefa 006)

Organização **por feature** (ADR-003 confirmada); cada pasta só é criada na tarefa que a exige.
Estrutura **já aplicada** no repositório (pastas de fases futuras vazias com `.gitkeep`).
Convenção de imports: alias `@/*` → `./src/*` (`tsconfig.json`).

```
src/
├── app/                      # rotas e layouts (Next.js)
│   ├── (auth)/               # login
│   ├── (admin)/              # área administrativa
│   ├── (recepcao)/           # área de recepção
│   ├── display/              # pareamento + exibição do painel
│   └── api/                  # Route Handlers (finos)
├── features/
│   └── <feature>/
│       ├── components/       # UI da feature
│       ├── hooks/            # estado de UI
│       ├── service.ts        # regras de negócio
│       ├── repository.ts     # acesso a dados
│       ├── schema.ts         # validação de entrada
│       └── types.ts
├── components/ui/            # componentes visuais genéricos
├── lib/
│   ├── context/              # RequestContext
│   ├── db/                   # [PENDENTE]
│   ├── auth/                 # [PENDENTE]
│   ├── realtime/             # [PENDENTE] interface + implementação
│   ├── storage/              # [PENDENTE]
│   └── config/               # leitura tipada de variáveis de ambiente
├── constants/                # enums, eventos, limites, rótulos
└── types/
```

Regras de dependência:

- `features/A` **não** importa de `features/B` diretamente; conversam por serviços exportados explicitamente.
- `components/ui` **não** importa de `features`.
- `app/` importa de `features/` (nunca o contrário).
- Lógica de negócio **nunca** dentro de componentes visuais.

---

## 6. Multi-tenant

> Estratégia completa e opções em `PLANO-PROJETO.md` §7. Status: **PENDENTE** de autorização.

Defesa em profundidade (proposta):

| # | Camada | Mecanismo |
|---|---|---|
| 1 | Identidade | `tenantId` vem **só** da sessão/token, nunca do cliente |
| 2 | Aplicação | `RequestContext` obrigatório; repositórios filtram por tenant |
| 3 | Dados | Índices e chaves iniciando por `tenantId`; FKs que impedem referência cruzada |
| 4 | Banco | Row Level Security (se PostgreSQL) como rede de segurança |
| 5 | Tempo real | Canais `tenant:{id}:...`, assinatura validada no servidor |
| 6 | Arquivos | Chaves de objeto prefixadas por tenant; leitura autorizada |
| 7 | Verificação | Testes automatizados com dois tenants, rodados em toda mudança relevante |

---

## 7. Fluxo central: chamar cliente

Este é o "coração do produto" (prompt §44). Os passos 1–7 espelham o prompt §19.

```
Recepção            Backend                                   Banco        Painel(is)
   │  POST chamar      │                                         │              │
   │──────────────────►│                                         │              │
   │                   │ 1. autentica usuário                    │              │
   │                   │ 2. resolve tenant (da sessão)           │              │
   │                   │ 3. checa permissão queue.call           │              │
   │                   │ 4. carrega item DO TENANT               │              │
   │                   │──────────────────────────────────────── ►              │
   │                   │ 5. valida local/profissional do tenant  │              │
   │                   │ 6. transação atômica:                   │              │
   │                   │    UPDATE ... SET status=CHAMADO        │              │
   │                   │      WHERE id=? AND tenant=?            │              │
   │                   │      AND status=AGUARDANDO              │              │
   │                   │    INSERT CallEvent                     │              │
   │                   │──────────────────────────────────────── ►              │
   │                   │ 7. (após commit) publica CALL_CLIENT    │              │
   │                   │────────────────────────────────────────────────────── ►│
   │  200 OK           │                                         │   exibe      │
   │◄──────────────────│                                         │ "JOÃO SILVA" │
```

Propriedades garantidas:

- **Atomicidade**: a condição `status = AGUARDANDO` na atualização impede que dois atendentes chamem o mesmo cliente; o segundo recebe conflito.
- **Persistir antes de emitir**: se a publicação falhar, o estado já está correto; painéis ressincronizam.
- **Direcionamento**: o evento só vai aos painéis associados ao setor/local, do mesmo tenant.

---

## 8. Painel (Display)

### 8.1 Ciclo de vida

```
[sem token] ── abre /display ──► PAREANDO (mostra código)
                                     │ admin informa o código
                                     ▼
                            token entregue ao painel
                                     │
[com token] ── abre /display ──► CONECTANDO ──► EXIBINDO_MIDIA
                                                    ▲   │ CALL_CLIENT
                                                    │   ▼
                                               EXIBINDO_CHAMADA
                                     perda de rede │
                                                   ▼
                                                OFFLINE ──reconecta──► CONECTANDO
```

### 8.2 Segurança do pareamento e do token

- Código curto-vivo, uso único, limite de tentativas, alfabeto sem ambiguidade.
- Token de alta entropia, **armazenado no servidor apenas como hash**, revogável, com expiração/rotação.
- O token autoriza **apenas** leitura de exibição (eventos do próprio painel/tenant, playlist).

### 8.3 Preparação para offline (sem implementar agora)

- O painel é uma página independente que só precisa de URL + token.
- Estado mínimo local (token, última playlist conhecida) planejado desde o início.
- Eventos têm identificador e sequência para ressincronização após reconexão.
- Nada na arquitetura exige conexão permanente para **exibir mídia já conhecida**.

---

## 9. Tempo real

> Status: **PENDENTE** (Tarefa 038). Opções e recomendação em `PLANO-PROJETO.md` §10.

Contrato independente de tecnologia:

```ts
// Conceito — ilustrativo
interface RealtimePublisher {
  publish(channel: Channel, event: RealtimeEvent): Promise<void>;
}
interface RealtimeSubscriber {
  subscribe(channel: Channel, onEvent: (e: RealtimeEvent) => void): Unsubscribe;
}
```

| Aspecto | Decisão proposta |
|---|---|
| Canal | `tenant:{tenantId}:display:{displayId}` (e variações por setor) |
| Autorização | Validada no servidor ao assinar, com base no token |
| Eventos v1 | Somente `CALL_CLIENT` |
| Eventos futuros | `CANCEL_CALL`, `QUEUE_UPDATED`, `PLAYLIST_UPDATED`, `DISPLAY_STATUS`, `DISPLAY_CONFIG_UPDATED` |
| Ressincronização | Ao reconectar, o painel busca o estado atual |
| Heartbeat | Mantém `lastSeenAt` e o status online/offline no admin |

---

## 10. Mídia

> Status: **PENDENTE** (Tarefa 043). Armazenamento e custo exigem autorização.

- Tipos: JPG, PNG, WEBP, MP4; formato 16:9 priorizado.
- Arquivo **fora** do banco; banco guarda metadados (`tenantId`, chave, tamanho, hash, tipo, status).
- Validação **pelo conteúdo real** (não só extensão), limite de tamanho e de quantidade por tenant.
- Nome do arquivo gerado pelo servidor; armazenamento não executável e não listável.
- Imagens com duração configurável; vídeos tocam integralmente (mudos, por limitação de autoplay).

---

## 11. Segurança (visão arquitetural)

Detalhamento futuro em `/docs/seguranca.md`.

| Tema | Diretriz |
|---|---|
| Validação | Toda entrada validada no backend por schema; nunca confiar no frontend |
| Autenticação | Cookie `httpOnly`/`Secure`/`SameSite`; hash forte; limite de tentativas |
| Autorização | RBAC verificado no backend, em toda operação |
| Isolamento | Ver §6 |
| Segredos | Somente variáveis de ambiente; nada no repositório; `.env.example` sem valores reais |
| Erros | Mensagens genéricas ao cliente; detalhes só em log |
| Logs | Sem dados pessoais desnecessários; correlação por ID de requisição |
| Dados pessoais | Coleta mínima; painel exibe só o necessário; política de retenção a definir |
| Uploads | Ver §10 |

---

## 12. Convenções de código

- TypeScript estrito; **sem `any`**; tipos de ID distintos (ex.: `TenantId`, `DisplayId`) para evitar misturar identificadores.
- **Sem strings mágicas**: status, papéis, permissões, nomes de evento e limites em `constants/`.
- Funções e componentes pequenos; um motivo para mudar por módulo.
- Erros de domínio tipados (ex.: `NotFound`, `Conflict`, `Forbidden`) traduzidos na borda.
- Nomes de domínio genéricos (Cliente, Profissional, Local...), nunca "Paciente/Médico/Consultório".
- Textos de interface centralizados para permitir ajustes de rótulo por tenant no futuro (ex.: "Sala" × "Guichê").

---

## 13. Registro de decisões (ADR)

| ID | Decisão | Status | Tarefa |
|---|---|---|---|
| ADR-001 | Next.js + TypeScript + Tailwind + ESLint; sem trocar de stack | **DEFINIDA** (prompt) | — |
| ADR-002 | Backend como fonte única de verdade; recepção e painel não se comunicam diretamente | **DEFINIDA** (prompt) | — |
| ADR-003 | Organização por feature, camadas Borda → Contexto → Serviço → Repositório | **CONFIRMADA** (2026-10-06) | 005/006 |
| ADR-004 | Vocabulário genérico no código | **DEFINIDA** (prompt) | — |
| ADR-005 | Banco de dados e ORM | **APROVADA** (2026-10-06): PostgreSQL + Prisma 6, dev em free tier | 013 |
| ADR-006 | Modelo multi-tenant (recomendado: coluna `tenantId` + RLS) | **APROVADA** (2026-10-06): Modelo A + RLS desde a 1ª tabela | 013 |
| ADR-007 | Autenticação de usuários | **PENDENTE** | 017 |
| ADR-008 | Token de painel com hash, revogável, expirável | PROPOSTA (segurança: confirmar) | 035 |
| ADR-009 | Tempo real (recomendado para o piloto: SSE atrás de interface abstrata) | **PENDENTE** | 038 |
| ADR-010 | Armazenamento de mídia | **PENDENTE** | 043 |
| ADR-011 | Persistir antes de emitir evento; transição de fila atômica | PROPOSTA | 026/040 |
| ADR-012 | Fuso horário por tenant; armazenamento em UTC | PROPOSTA | 013/014 |

Cada ADR aprovada ganhará seção própria (contexto, opções, decisão, consequências) neste arquivo.

---

## 14. Pendências desta versão

1. ~~Validar tudo contra o projeto real (Tarefas 001–004).~~ ✅ Concluído em 2026-10-06.
2. ~~Confirmar App Router × Pages Router.~~ ✅ **App Router** confirmado (Tarefa 001).
3. Decidir hospedagem do piloto (influencia ADR-009) — Tarefa 038 ⛔.
4. Obter autorização para ADR-007, 009, 010 — tarefas 017, 038, 043 ⛔. *(ADR-005 e 006 aprovadas em 2026-10-06.)*
5. Sub-decisões do PLANO §7.3 (e-mail global × por tenant; identificação da empresa no login) — decidir na Tarefa 017.

---

## 15. ADRs aprovadas

### ADR-005 — Banco de dados e ORM (aprovada em 2026-10-06)

- **Contexto:** a Tarefa 013 precisa de um banco; o piloto roda em notebooks
  comuns e a hospedagem ainda não está fechada.
- **Opções avaliadas:** PostgreSQL + Prisma · SQLite + Prisma · PostgreSQL + Drizzle.
- **Decisão:** **PostgreSQL + Prisma 6** (linha estável; v7+ exige driver
  adapters novos). Desenvolvimento em **free tier na nuvem** (Neon/Supabase) —
  o solicitante criará a conta e fornecerá o `DATABASE_URL`.
- **Consequências:** RLS disponível (defesa em profundidade); migrações
  reprodutíveis via `prisma migrate`; dependências `prisma`, `@prisma/client` e
  `vitest` autorizadas sob a regra de dependências do prompt.

### ADR-006 — Modelo multi-tenant (aprovada em 2026-10-06)

- **Opções:** A (coluna `tenantId`) · B (schema por tenant) · C (banco por tenant).
- **Decisão:** **Modelo A** + as 7 camadas de defesa do PLANO §7.2, com **RLS
  (`FORCE ROW LEVEL SECURITY`) ativo desde a primeira tabela**.
- **Consequências:** toda tabela nova nasce com a policy; todo repositório usa
  contexto obrigatório + `set_config` na transação; testes de isolamento
  (052/063) provam a barreira.
- **Adiado para 017:** e-mail global × por tenant; identificação da empresa no
  login (subdomínio × slug × conta do usuário).
