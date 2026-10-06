# PLANO DO PROJETO — SaaS de Atendimento, Filas e Painéis Digitais

> Status do documento: **Primeira entrega (Fase 0 — análise e planejamento)**
> Nenhum código de funcionalidade foi escrito. Nenhuma dependência foi instalada.
> Decisões marcadas como **[AGUARDA AUTORIZAÇÃO]** não podem ser tomadas sem aprovação explícita.

---

## 0. Como ler este documento

| Marcador | Significado |
|---|---|
| **[DEFINIDO]** | Já determinado no prompt do projeto. Não muda sem autorização. |
| **[PROPOSTA]** | Recomendação técnica minha, reversível, dentro da minha autonomia. |
| **[AGUARDA AUTORIZAÇÃO]** | Decisão que altera arquitetura, banco, autenticação, segurança, infraestrutura, custos, serviços externos, tempo real, armazenamento ou multi-tenant. Será apresentada com opções na tarefa correspondente. |
| **[A VERIFICAR]** | Informação que depende de inspecionar o projeto real (Tarefa 001–004). |

---

## 1. Diagnóstico do projeto

### 1.1 Limitação desta análise (leia primeiro)

> **Atualização (2026-10-06):** como não havia projeto existente, a base foi criada do zero (Next.js 16.4.0, App Router, React 19.3.0, TypeScript estrito, Tailwind 4, ESLint 9, npm). Os itens [A VERIFICAR] do baseline abaixo agora têm resposta em `TAREFAS.md` (Registro de execução) e `docs/desenvolvimento.md`.

O prompt determina que, antes de qualquer proposta, todo o projeto existente seja inspecionado
(`package.json`, `package-lock.json`, `src/`, `public/`, configurações de TypeScript, Next.js,
Tailwind e ESLint, componentes, páginas, scripts).

**Nesta sessão não recebi o código do projeto Next.js.** Só o documento de especificação
foi anexado; não há `package.json` nem diretório `src/` acessível. Portanto:

- **Não vou inventar um diagnóstico** de arquivos que não vi.
- O que está abaixo em "baseline assumido" vem **exclusivamente do prompt** ("o projeto atual utiliza Next.js, TypeScript, Tailwind CSS, ESLint").
- A **Tarefa 001 (Analisar projeto)** foi desenhada para fechar essa lacuna: ela produz o diagnóstico real e corrige este documento, caso algo difira.

**O que preciso de você para a Tarefa 001:** o projeto compactado (sem `node_modules` e sem `.next`),
ou a saída de `tree -L 3 -I "node_modules|.next"` + conteúdo de `package.json`, `tsconfig.json`,
`next.config.*`, `tailwind.config.*` / CSS global e `eslint.config.*`.

### 1.2 Baseline assumido (somente do prompt)

| Item | Valor assumido | Situação |
|---|---|---|
| Framework | Next.js | [A VERIFICAR] versão e roteador (App Router × Pages Router) |
| Linguagem | TypeScript | [A VERIFICAR] `strict` ativo? |
| Estilo | Tailwind CSS | [A VERIFICAR] versão (v3 × v4) e forma de configuração |
| Lint | ESLint | [A VERIFICAR] regras ativas, `no-explicit-any` |
| Gerenciador de pacotes | desconhecido | [A VERIFICAR] npm / pnpm / yarn |
| Banco de dados | nenhum | Prompt manda **não** implementar ainda |
| Autenticação | nenhuma | idem |
| Tempo real | nenhum | idem |
| Testes automatizados | desconhecido | [A VERIFICAR] |
| Git | desconhecido | [A VERIFICAR] |

### 1.3 Perguntas que a Tarefa 001 precisa responder

1. App Router ou Pages Router? (afeta toda a estrutura de pastas e a estratégia de API.)
2. Qual a versão do Next.js e do React? (Route Handlers, Server Actions e `middleware` mudam entre versões.)
3. Onde a aplicação será hospedada no piloto: máquina local, VPS, ou plataforma serverless? (determina o tempo real — ver seção 11.)
4. Há código existente que deva ser preservado ou é um projeto recém-criado (`create-next-app`)?
5. O repositório está sob Git? Há branch de trabalho?

---

## 2. Princípios que guiam todas as decisões

1. **Simplicidade para o usuário, robustez por baixo** [DEFINIDO]. O usuário final nunca vê IP, servidor, WebSocket, API, banco.
2. **Backend é a fonte da verdade** [DEFINIDO]. Recepção e painel nunca conversam diretamente.
3. **Isolamento multi-tenant no backend** [DEFINIDO]. Frontend nunca é barreira de segurança.
4. **Genérico, não clínico** [DEFINIDO]. Vocabulário: Cliente, Profissional, Atendente, Setor, Serviço, Local, Painel. Sem "Paciente", "Médico", "Consultório" fixos no código.
5. **Uma tarefa por vez, com checkpoint** [DEFINIDO].
6. **Nada de funcionalidades fora do documento** [DEFINIDO].
7. **Não impedir a evolução** (offline do painel, Display Node físico, SaaS comercial) [DEFINIDO].

---

## 3. Arquitetura proposta (resumo)

Detalhamento completo em `/docs/arquitetura.md`.

```
                          INTERNET
                             │
                             ▼
                 ┌───────────────────────┐
                 │        BACKEND        │
                 │  API (Route Handlers) │
                 │  Autenticação / RBAC  │
                 │  Regras de negócio    │
                 │  Gateway tempo real   │
                 └───────────┬───────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
     ADMIN (web)      RECEPÇÃO (web)      PAINEL /display
   desktop/tablet   desktop/tablet/cel      16:9, fullscreen
          │                  │                  │
          └──────── navegador em notebook ──────┘
                   (representa o Display Node)
```

**Camadas lógicas dentro do backend** [PROPOSTA]:

| Camada | Responsabilidade | Regra |
|---|---|---|
| Rotas/API (`app/api/**`) | Receber HTTP, validar entrada, devolver resposta | Sem regra de negócio |
| Serviços de domínio (`features/*/service`) | Regras de negócio (ex.: chamar cliente) | Sempre recebem o contexto do tenant |
| Repositórios (`features/*/repository`) | Acesso a dados | **Único** lugar que fala com o banco; toda consulta filtra por `tenantId` |
| Contexto de requisição (`lib/context`) | Resolver usuário, tenant, papel, ou painel | Obrigatório antes de qualquer serviço |
| Gateway de tempo real (`lib/realtime`) | Publicar/assinar eventos por tenant e painel | Interface abstrata, implementação trocável |

---

## 4. Estrutura de pastas proposta [PROPOSTA]

O prompt pede explicitamente para **não criar a estrutura cegamente**. A estrutura abaixo é um
alvo evolutivo: **cada pasta só é criada na tarefa que precisa dela**. Será validada contra o
projeto real na Tarefa 006.

```
/
├── PLANO-PROJETO.md
├── TAREFAS.md
├── docs/
│   ├── arquitetura.md
│   ├── banco-de-dados.md        (criado na Fase 4 / quando o banco for definido)
│   ├── api.md
│   ├── tempo-real.md
│   ├── painel.md
│   ├── seguranca.md
│   ├── testes.md
│   └── desenvolvimento.md
├── src/
│   ├── app/
│   │   ├── (admin)/             # área administrativa
│   │   ├── (recepcao)/          # área de recepção/atendente
│   │   ├── (auth)/              # login
│   │   ├── display/             # painel: pareamento + exibição (sem login)
│   │   └── api/                 # Route Handlers
│   ├── features/                # um diretório por domínio
│   │   ├── tenant/
│   │   ├── auth/
│   │   ├── sectors/
│   │   ├── services/
│   │   ├── professionals/
│   │   ├── locations/
│   │   ├── customers/
│   │   ├── queue/
│   │   ├── attendance/
│   │   ├── displays/
│   │   ├── media/
│   │   └── dashboard/
│   │       └── (cada feature: components/ hooks/ service.ts repository.ts schema.ts types.ts)
│   ├── components/ui/           # componentes visuais genéricos, sem regra de negócio
│   ├── lib/                     # infraestrutura compartilhada (db, realtime, auth, config)
│   ├── types/                   # tipos globais
│   └── constants/               # enums, nomes de eventos, limites (sem strings mágicas)
└── public/
```

**Decisão de estilo** [PROPOSTA]: organização **por feature** (e não por tipo de arquivo),
porque o produto é um conjunto de domínios independentes e isso reduz acoplamento.

Pastas do esboço do prompt que **provavelmente não serão criadas**: `services/` global,
`utils/` global, `hooks/` global, `styles/` — só nascem se surgir necessidade real (Tarefa 006).

---

## 5. Dependências

### 5.1 Existentes [DEFINIDO pelo prompt / A VERIFICAR versões]

- `next`, `react`, `react-dom`
- `typescript`, `@types/*`
- `tailwindcss` (+ PostCSS, conforme versão)
- `eslint`, `eslint-config-next`

### 5.2 Que talvez sejam necessárias [NENHUMA será instalada agora]

Cada item segue o rito do prompt (explicar → para que serve → alternativa → compatibilidade → instalar → testar) **somente na tarefa que o exigir**.

| Necessidade | Candidatas | Tarefa | Precisa autorização? |
|---|---|---|---|
| Validação de entrada | **Zod** (alternativa: validação manual) | 021+ | Não (reversível, interna) |
| Banco de dados | **PostgreSQL** (recomendado); alternativas SQLite (piloto), MySQL | Antes da 013 | **Sim** |
| ORM / query builder | Prisma, Drizzle (alternativa: SQL puro) | idem | **Sim** |
| Autenticação | Auth.js, Lucia/implementação própria com sessões, Supabase Auth | 017 | **Sim** |
| Hash de senha | argon2 ou bcrypt | 017 | Sim (parte da auth) |
| Tempo real | SSE, WebSocket (`ws`/Socket.IO), serviço gerenciado (Pusher/Ably/Supabase Realtime) | 038 | **Sim** |
| Armazenamento de mídia | Disco local (piloto), S3-compatível (S3/R2/MinIO) | 043 | **Sim** |
| Teste unitário | Vitest (alternativa: Jest) | quando a 1ª regra de negócio existir | Não |
| Teste E2E | Playwright | Fase 11 | Não |
| Ícones | lucide-react | 011 | Não, se realmente necessário |
| Componentes de UI | construir próprios sobre Tailwind (alternativa: shadcn/ui) | 011 | Não, mas documentar |

---

## 6. Modelo conceitual de dados

> Conceitual: entidades, relacionamentos e cardinalidade. **Não é o schema final.**
> A tecnologia de banco só é definida depois desta análise, conforme o prompt.
> O documento `docs/banco-de-dados.md` formalizará isso após a autorização.

### 6.1 Regra de ouro

**Toda entidade de negócio carrega `tenantId`.** Exceções: apenas entidades de plataforma
(o próprio `Tenant`, e eventualmente `Plan` no futuro SaaS).

### 6.2 Entidades e atributos principais

| Entidade | Atributos principais | Observações |
|---|---|---|
| **Tenant** (Company) | nome, nome fantasia, logo, telefone, e-mail, endereço, identidade visual (cores), configurações, status | Raiz de isolamento |
| **User** | tenantId, nome, e-mail, hash de senha, roleId, status | E-mail único **por tenant** (ou global — decisão da Tarefa 017) |
| **Role** | tenantId (ou global), nome | ADMIN, RECEPCAO_ATENDENTE (PAINEL não é usuário humano) |
| **Permission** | código (ex.: `queue.call`) | Ligadas a Role |
| **Customer** | tenantId, nome, documento (opcional), telefone (opcional), observação (opcional) | **Coleta mínima** |
| **Sector** | tenantId, nome, status | Livre; sistema não assume setores |
| **Service** | tenantId, nome, status | Associado a N setores |
| **Professional** | tenantId, nome, função, setorId, status, locationId (padrão) | Sem profissão fixa |
| **Location** | tenantId, nome, tipo (rótulo livre: sala, guichê...), status | "Sala 01", "Guichê 02" |
| **Queue** | tenantId, nome, escopo (setor/serviço), status | Container lógico de itens |
| **QueueItem** | tenantId, queueId, customerId, serviceId, sectorId, status, enteredAt, posição/senha | Estados: AGUARDANDO, CHAMADO, EM_ATENDIMENTO, CONCLUIDO, CANCELADO, NAO_COMPARECEU |
| **Attendance** | tenantId, queueItemId, professionalId, locationId, calledAt, startedAt, finishedAt | Histórico/relatórios |
| **Display** | tenantId, nome, localização, status, config, tokenHash, revokedAt, lastSeenAt | O "Painel" |
| **DisplayPairing** | código curto, expiraEm, displayCandidateId, tenantId (null até parear), usadoEm | Efêmera |
| **DisplaySession** | displayId, conexão, início, fim | Telemetria/status |
| **Media** | tenantId, tipo (JPG/PNG/WEBP/MP4), chave de armazenamento, tamanho, hash, status | Arquivo em si fora do banco |
| **Playlist** | tenantId, nome, status | |
| **PlaylistItem** | playlistId, mediaId, ordem, duração (imagens), ativo | |
| **DisplaySector** (N:N) | displayId, sectorId | Quais setores o painel mostra |
| **DisplayPlaylist** | displayId, playlistId | Painel → playlist |
| **CallEvent** | tenantId, queueItemId, displayIds alvo, tipo (CALL_CLIENT / CANCEL_CALL), createdAt, actorUserId | Trilha imutável (append-only) |
| **AuditLog** | tenantId, actor, ação, entidade, antes/depois, createdAt | Auditoria geral |

### 6.3 Relacionamentos (cardinalidade)

```
Tenant 1──N User
Tenant 1──N Customer | Sector | Service | Professional | Location | Queue | Display | Media | Playlist
Role   N──N Permission
User   N──1 Role
Sector N──N Service
Sector 1──N Professional
Professional N──1 Location (padrão, opcional)
Queue  1──N QueueItem
QueueItem N──1 Customer
QueueItem N──1 Service
QueueItem N──1 Sector
QueueItem 1──N Attendance   (normalmente 1; admite rechamada/reabertura)
Attendance N──1 Professional
Attendance N──1 Location
QueueItem 1──N CallEvent
Display N──N Sector         (setores exibidos)
Display N──1 Playlist       (ou N:N, se houver agenda futura)
Playlist 1──N PlaylistItem N──1 Media
Display 1──N DisplaySession
```

### 6.4 Máquina de estados do QueueItem

```
                ┌────────────► CANCELADO
                │
AGUARDANDO ──► CHAMADO ──► EM_ATENDIMENTO ──► CONCLUIDO
     │             │
     │             └────────► NAO_COMPARECEU
     └──────────────────────► CANCELADO
```

Regras [PROPOSTA — a validar na Tarefa 026]:

- Transições válidas são centralizadas em **um único módulo** (tabela de transições), nunca espalhadas em `if`.
- `CHAMADO → AGUARDANDO` (rechamada/devolução) fica **fora do escopo** até o documento pedir.
- Toda transição gera registro (histórico e, quando aplicável, `CallEvent`).

### 6.5 Índices e integridade (a considerar na definição do banco)

- Índices compostos **começando por `tenantId`** (`(tenantId, status, enteredAt)` na fila).
- Unicidade por tenant (`(tenantId, nome)` em Setor, Local etc.).
- Chaves estrangeiras **compostas ou verificadas** para impedir referência cruzada entre tenants (ex.: um `QueueItem` do tenant A apontando para um `Customer` do tenant B). Este é o ponto mais fácil de falhar em multi-tenant.
- `Attendance` e `CallEvent` append-only: sem `UPDATE`/`DELETE` pela aplicação.
- Exclusão lógica (`deletedAt`/status) para cadastros referenciados pelo histórico.

### 6.6 Auditoria

`AuditLog` + `CallEvent` registram quem fez o quê e quando. Dados pessoais de `Customer` têm coleta mínima (LGPD).

---

## 7. Estratégia multi-tenant **[AGUARDA AUTORIZAÇÃO]**

Requisito crítico do prompt. Recomendo detalhar e aprovar **antes** de qualquer tabela ser criada.

### 7.1 Modelos possíveis

| Modelo | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Banco compartilhado, schema compartilhado, coluna `tenantId`** | Todas as empresas nas mesmas tabelas | Simples, barato, escala bem, migrações únicas | Isolamento depende de disciplina; um erro vaza dados |
| **B. Schema por tenant** | Um schema Postgres por empresa | Isolamento mais forte | Migrações N vezes; complexidade operacional |
| **C. Banco por tenant** | Um banco por empresa | Isolamento máximo | Custo e operação altos; inviável para SaaS pequeno no início |

### 7.2 Recomendação [PROPOSTA]

**Modelo A (coluna `tenantId`) + defesa em profundidade:**

1. **Contexto obrigatório**: toda operação de domínio exige um `TenantContext` (resolvido do usuário autenticado ou do token do painel). Sem contexto, a função não compila/chama.
2. **Repositórios como único acesso a dados**; nenhum componente ou rota consulta o banco diretamente.
3. **`tenantId` nunca vem do cliente**. Vem da sessão/token. Qualquer `tenantId` enviado no corpo/URL é ignorado ou rejeitado.
4. **Row Level Security (RLS) no banco** se for PostgreSQL: segunda camada que impede vazamento mesmo se o código errar.
5. **Chaves compostas/verificação cruzada** para impedir referências entre tenants.
6. **Testes automatizados de isolamento** (Tarefa 052/063): criar dois tenants e provar que A não lê, não altera e não vê eventos de B — incluindo canais de tempo real.
7. **Canais de tempo real namespaced por tenant** (`tenant:{id}:display:{id}`); assinatura validada no servidor.

### 7.3 Pontos que exigem decisão sua

- Modelo A, B ou C? (recomendo A para o piloto e para o início do SaaS.)
- E-mail de usuário único globalmente ou por tenant?
- Como a empresa é identificada no login: subdomínio (`empresa.app.com`), slug no caminho, ou apenas pela conta do usuário? (impacta infraestrutura/DNS e custo.)

---

## 8. Estratégia de autenticação **[AGUARDA AUTORIZAÇÃO]**

Dois tipos de identidade **completamente separados**:

### 8.1 Usuários humanos (Admin, Recepção/Atendente)

- Login por e-mail e senha.
- Sessão por **cookie `httpOnly`, `Secure`, `SameSite=Lax`**, expiração e renovação definidas.
- Senha com hash forte (argon2id preferido).
- Autorização por **RBAC**: `Role` → `Permission`. Verificação **no backend** em todo Route Handler/serviço.
- Proteção contra força bruta (limite de tentativas) e mensagens de erro genéricas.
- Proteção CSRF para operações com cookie.

Opções (a apresentar na Tarefa 017): Auth.js; sessões próprias (estilo Lucia) com tabela de sessões; serviço gerenciado (Supabase Auth, Clerk). Trade-off principal: **controle e custo × velocidade**. Serviços gerenciados somam custo e dependência externa, por isso exigem sua autorização.

### 8.2 Painéis (Display)

- **Não usam usuário e senha** [DEFINIDO].
- Usam **token de dispositivo** emitido no pareamento (seção 9).
- O token: aleatório de alta entropia, armazenado **apenas como hash** no servidor, **revogável** e com **expiração/rotação** configurável.
- Permissão **somente de leitura de exibição**: assinar eventos do seu tenant/painel e ler a playlist. Nunca acessa endpoints administrativos.

---

## 9. Estratégia de painel

### 9.1 Pareamento [DEFINIDO no prompt, detalhado aqui]

```
1. Notebook/TV abre  /display
2. Servidor cria um DisplayPairing: código curto (ex.: 6 caracteres legíveis), validade curta (ex.: 10 min)
3. Tela do painel mostra o código e fica aguardando (polling curto ou canal temporário)
4. Admin → Painéis → "Adicionar painel" → digita o código + nome + local
5. Servidor valida código (existe, não expirou, não foi usado), associa ao tenant
6. Servidor gera o token do dispositivo, guarda o HASH e entrega o token ao painel UMA vez
7. Painel guarda o token (armazenamento do navegador) e a partir daí:
      abre /display → apresenta token → backend identifica painel → conecta → funciona
```

Cuidados de segurança [PROPOSTA]:

- Código de uso único, expira rápido, **limite de tentativas** por IP/tenant (evita adivinhar códigos).
- Alfabeto sem caracteres ambíguos (sem 0/O, 1/I/L).
- Token entregue ao painel por canal que **só o painel que gerou o código** consegue receber (vínculo pelo identificador temporário do candidato).
- Revogação pelo Admin derruba a conexão ativa e invalida o token.

### 9.2 Comportamento da tela de exibição [DEFINIDO]

```
Estado normal      → reproduz mídia (playlist)
Chegou CALL_CLIENT → interrompe a mídia, mostra:
                       JOÃO SILVA
                       DIRIJA-SE À
                       SALA 04
                    por tempo configurável
Fim do tempo       → retorna à mídia
```

Pontos de design:

- Máquina de estados do painel: `PAREANDO → CONECTANDO → EXIBINDO_MIDIA ⇄ EXIBINDO_CHAMADA → (OFFLINE)`.
- **Fila de chamadas no painel**: se duas chamadas chegarem juntas, exibir em sequência, sem perder nenhuma.
- Layout 16:9 em tela cheia, com logo e nome da empresa; contraste e tamanho de fonte legíveis à distância.
- Estado local mínimo guardado no navegador (token, última playlist) para preparar o modo offline futuro [DEFINIDO: não impedir a evolução].

### 9.3 Display Node (futuro) [DEFINIDO]

No piloto, **navegador em notebook = Display Node**. Para não bloquear o futuro:

- O painel é uma **página web independente de hardware** que só precisa de URL + token.
- Nada no código assume notebook, SO ou resolução fixa além de 16:9.

---

## 10. Estratégia de tempo real **[AGUARDA AUTORIZAÇÃO]**

### 10.1 Escopo da primeira versão [DEFINIDO]

Apenas **`CALL_CLIENT`**. Demais eventos (`CANCEL_CALL`, `QUEUE_UPDATED`, `PLAYLIST_UPDATED`, `DISPLAY_STATUS`, `DISPLAY_CONFIG_UPDATED`) ficam para depois, mas o desenho deve comportá-los.

### 10.2 O problema técnico central

Next.js hospedado em plataformas **serverless** (ex.: Vercel) **não mantém conexões WebSocket persistentes** de forma nativa. A escolha do tempo real depende do **onde hospedar** — por isso é decisão de infraestrutura e custo.

### 10.3 Opções

| Opção | Descrição | Prós | Contras |
|---|---|---|---|
| **1. SSE (Server-Sent Events)** | Painel mantém uma conexão HTTP de leitura; servidor empurra eventos | Simples; só o servidor→painel é necessário (é exatamente o caso do painel); reconexão automática nativa; funciona sobre HTTP | Requer servidor Node de longa duração (não serverless puro); unidirecional |
| **2. WebSocket (`ws`/Socket.IO) em serviço Node próprio** | Processo separado para conexões | Bidirecional; controle total; Socket.IO traz reconexão e rooms | Mais uma peça para operar; precisa broker (Redis) ao escalar horizontalmente |
| **3. Serviço gerenciado** (Pusher, Ably, Supabase Realtime) | Terceiro cuida das conexões | Zero infraestrutura de conexão; funciona com serverless | Custo recorrente; dependência externa; autorização de canais precisa ser bem feita |

### 10.4 Recomendação [PROPOSTA — para decisão na Tarefa 038]

- **Piloto:** **SSE** (ou WebSocket) rodando em servidor Node único. O fluxo é naturalmente unidirecional (recepção → API → painel), e SSE resolve com menos peças.
- **Abstração desde o início:** uma interface `RealtimePublisher` / `RealtimeSubscriber` em `lib/realtime`, de modo que trocar SSE por WebSocket ou serviço gerenciado **não altere regras de negócio**.
- **Evolução para vários servidores:** barramento (Redis Pub/Sub ou equivalente) atrás da mesma interface.

### 10.5 Requisitos independentes da tecnologia

- **Autorização na assinatura**: o painel só assina o canal do **seu** tenant/painel, validado pelo token no servidor.
- **Mensagens com ID e timestamp** e **versão/sequência** para permitir ressincronização.
- **Reconexão automática** com backoff; ao reconectar, o painel pede o **estado atual** (não depende de ter recebido todos os eventos).
- **Heartbeat** para o backend saber quais painéis estão online (`DISPLAY_STATUS`, `lastSeenAt`).
- **Persistir primeiro, emitir depois**: o backend grava o `CallEvent` e atualiza a fila **antes** de emitir. Se a emissão falhar, o estado continua correto e o painel ressincroniza.
- Evento carrega o **mínimo necessário** (nome de exibição, serviço, profissional, local) — nada de dados pessoais além do que será mostrado na tela.

### 10.6 Formato do evento [DEFINIDO no prompt, formalizado aqui]

```jsonc
{
  "id": "evt_...",            // identificador único
  "type": "CALL_CLIENT",
  "tenantId": "...",          // nunca confiado pelo cliente; vem do servidor
  "occurredAt": "2025-...",
  "payload": {
    "client": "João Silva",
    "service": "Atendimento",
    "professional": "Maria",
    "location": "Sala 04"
  }
}
```

---

## 11. Riscos técnicos

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Vazamento entre tenants** (consulta sem filtro, FK cruzada, canal de tempo real compartilhado) | Média | **Crítico** | Contexto obrigatório, repositórios únicos, RLS, FKs verificadas, testes automatizados de isolamento incluindo tempo real |
| R2 | **Tempo real incompatível com a hospedagem** escolhida (serverless) | Alta | Alto | Decidir hospedagem e tempo real juntos; abstração `lib/realtime`; piloto em servidor Node |
| R3 | **Pareamento de painel sequestrado** (código adivinhado, token roubado) | Média | Alto | Código curto-vivo, uso único, rate limit, token com hash, revogação, expiração |
| R4 | **Perda de chamada** se o painel estiver desconectado no momento do evento | Alta | Médio | Persistir antes de emitir; ressincronização por estado atual na reconexão; fila de chamadas no painel |
| R5 | **Chamadas concorrentes** (dois atendentes chamam o mesmo cliente) | Média | Médio | Transição de estado atômica no backend (condição `status = AGUARDANDO` na atualização); a segunda recebe erro claro |
| R6 | **Upload malicioso ou excessivo** (arquivo disfarçado, vídeo gigante) | Média | Alto | Validar tipo real pelo conteúdo (não só extensão), limites de tamanho/quantidade por tenant, armazenamento fora da raiz pública, nome gerado pelo servidor |
| R7 | **Mídia pesada** travando notebooks/TVs fracas | Média | Médio | Limites de resolução/bitrate recomendados; pré-carregamento; testar em hardware modesto no piloto |
| R8 | **Reprodução automática de vídeo bloqueada** pelos navegadores | Alta | Médio | Vídeo mudo; painel pede **uma interação inicial** no pareamento (e/ou política de autoplay); documentar procedimento do piloto |
| R9 | **Dados pessoais (LGPD)** em tela pública e no banco | Média | Alto | Coleta mínima; exibir só nome (ou apelido/senha configurável) no painel; política de retenção; ponto para decisão futura: exibir nome completo ou abreviado |
| R10 | **Escopo inflando** (tentar fazer tudo ao mesmo tempo) | Alta | Alto | Regras 1 e 50 do prompt: uma tarefa por vez, checkpoint, sem antecipar fases |
| R11 | **Estrutura de pastas ou stack divergente** do projeto real | Média | Baixo | Tarefas 001–006 validam tudo antes de criar qualquer coisa |
| R12 | **Acoplamento da regra de negócio a componentes visuais** | Média | Médio | Camadas definidas (seção 3), revisão em cada checkpoint, ESLint |
| R13 | **Relógio/horário** (tempo médio de espera, "hoje") com fuso errado | Média | Baixo | Guardar UTC; fuso configurado **por tenant**; relatórios convertem na borda |
| R14 | **Dependência de uma só pessoa operando o piloto** (sem monitoramento) | Baixa | Médio | Status de painéis online/offline visível no admin (Tarefa 037) |

---

## 12. Plano de execução

### 12.1 Visão geral das fases

| Fase | Nome | Tarefas | Resultado |
|---|---|---|---|
| 0 | Preparação | 001–007 | Diagnóstico real, arquitetura e estrutura validadas |
| 1 | Base | 008–012 | Layout, navegação, componentes, sistema visual |
| 2 | Tenant | 013–016 | Empresa, configuração, logo, identidade visual |
| 3 | Acesso | 017–020 | Autenticação, usuários, papéis, permissões |
| 4 | Cadastros | 021–025 | Setores, serviços, profissionais, locais, clientes |
| 5 | Atendimento | 026–032 | Fila, entrada, chamada, atendimento, conclusão, cancelamento, histórico |
| 6 | Painel | 033–037 | Painel, identificação, pareamento, display, status |
| 7 | Tempo real | 038–042 | Arquitetura, conexão, `CALL_CLIENT`, atualização, reconexão |
| 8 | Mídia | 043–049 | Estrutura, uploads, playlist, reprodução, interrupção, retorno |
| 9 | Dashboard | 050–051 | Indicadores e relatórios básicos |
| 10 | Segurança | 052–055 | Isolamento, API, upload, painel |
| 11 | Piloto | 056–064 | Testes ponta a ponta e correções |

### 12.2 Pontos de decisão obrigatórios (paradas previstas)

Cada um interrompe a execução e pede sua autorização, com **opções, prós/contras, custo e recomendação**.

| Antes da tarefa | Decisão | Categoria do prompt |
|---|---|---|
| 001 | Enviar o projeto para análise real | Pré-requisito |
| 005 | Arquitetura final (camadas, estrutura por feature) | Arquitetura |
| 013 | **Banco de dados** (PostgreSQL × outros) e **ORM** | Banco de dados |
| 013 | **Modelo multi-tenant** (A/B/C), identificação do tenant no login | Multi-tenant |
| 015 | Onde guardar o logo (disco local × objeto) | Armazenamento |
| 017 | **Autenticação** (própria × Auth.js × gerenciada) | Autenticação, segurança |
| 038 | **Tempo real** (SSE × WebSocket × gerenciado) e hospedagem | Tempo real, infraestrutura, custos |
| 043 | **Armazenamento de mídia** (disco × S3-compatível) | Armazenamento, custos |
| 052–055 | Políticas de segurança (rate limits, expiração de token, retenção) | Segurança |

### 12.3 Marcos (milestones)

| Marco | Após fase | Entrega demonstrável |
|---|---|---|
| **M1 — Esqueleto navegável** | 1 | App com layout, navegação e sistema visual |
| **M2 — Empresa configurada** | 2 | Tenant com logo e identidade visual |
| **M3 — Acesso protegido** | 3 | Login, papéis e permissões funcionando |
| **M4 — Atendimento sem painel** | 5 | Recepção opera a fila de ponta a ponta |
| **M5 — Coração do produto** | 7 | **Notebook 1 clica CHAMAR → Notebook 2 exibe "JOÃO SILVA — DIRIJA-SE À SALA 04"** |
| **M6 — Painel completo** | 8 | Mídia, playlist e interrupção por chamada |
| **M7 — Piloto pronto** | 11 | Testes de recepção, painéis múltiplos, reconexão, mídia, responsivo e multi-tenant |

### 12.4 Ordem de implementação [DEFINIDO]

```
BASE → DADOS → ATENDIMENTO → PAINEL → TEMPO REAL → MÍDIA → DASHBOARD → SEGURANÇA → PILOTO
```

Observação importante de sequenciamento: **segurança de multi-tenant não é só a Fase 10.**
O isolamento é construído desde a primeira tabela (Fase 2) e a Fase 10 **audita e prova** com testes,
em vez de "adicionar segurança no final". Isso respeita o prompt (a tarefa 052 existe) sem criar dívida.

### 12.5 Convenções de trabalho [DEFINIDO + PROPOSTA]

- **Definição de pronto** de cada tarefa: código funcionando, sem erros conhecidos, testes executados, documentação atualizada, checklist marcado.
- **Checkpoint** ao final de cada tarefa (formato do prompt, seção 34 do prompt).
- **Git**: sem `reset --hard`/`clean -fd` sem autorização; commits sugeridos por tarefa (`feat:`, `docs:`, `chore:`, `fix:`, `test:`).
- **Dependências**: explicar → finalidade → alternativa → compatibilidade → instalar → testar.
- **Código**: TypeScript estrito, sem `any`, funções e componentes pequenos, sem strings mágicas (eventos, status e papéis em `constants/`), lógica de negócio fora de componentes visuais.

### 12.6 Fora do escopo (confirmado) [DEFINIDO]

IA · pagamentos/gateway · WhatsApp · apps nativos (Android, iOS, Windows, macOS) · hardware (Raspberry Pi, Mini PC, TV Box, firmware, SO) · funcionalidades não listadas no prompt.

---

## 13. Próximo passo

Ver `TAREFAS.md` (64 tarefas no formato do prompt) e `/docs/arquitetura.md`.

**Próxima tarefa: 001 — Analisar projeto.** Aguarda sua autorização e o envio do código existente.
