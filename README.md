<div align="center">

# 🎫 SaaS de Atendimento, Filas e Painéis Digitais

**Plataforma multi-tenant para gerenciamento de atendimento, filas de espera e painéis digitais em tempo real.**

![Status](https://img.shields.io/badge/status-em_desenvolvimento-orange?style=for-the-badge)
![Fase](https://img.shields.io/badge/fase-1_base_da_aplicação-blue?style=for-the-badge)
![Código](https://img.shields.io/badge/base-criada-brightgreen?style=for-the-badge)
![Tarefa](https://img.shields.io/badge/próxima_tarefa-009_layout-lightgrey?style=for-the-badge)

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square)

> 🚧 **Em desenvolvimento — Fase 2 (tenant).** **Progresso: 12/64 tarefas.**
> **Fase 1 (base) está concluída — Marco M1 atingido:** esqueleto navegável com layouts, navegação, componentes e sistema visual.
> A **Fase 0 (preparação) está concluída**: diagnóstico real, arquitetura aprovada e documentação consolidada.
> **Nenhuma funcionalidade descrita neste README foi implementada ainda.**

</div>

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Exemplos de uso](#-exemplos-de-uso)
- [Como funciona](#-como-funciona)
- [Status atual](#-status-atual)
- [Stack](#-stack)
- [Visão geral do domínio](#-visão-geral-do-domínio)
- [Multi-tenancy](#️-multi-tenancy)
- [Painéis (Displays)](#-painéis-displays)
- [Pareamento de painéis](#-pareamento-de-painéis)
- [Status da fila](#-status-da-fila)
- [Eventos em tempo real](#-eventos-em-tempo-real)
- [Objetivo do MVP](#-objetivo-do-mvp)
- [Fases planejadas](#-fases-planejadas)
- [Marcos do projeto](#-marcos-do-projeto)
- [Fora do MVP inicial](#-fora-do-mvp-inicial)
- [Documentação](#-documentação)
- [Ambiente de desenvolvimento](#-ambiente-de-desenvolvimento)
- [Regras de desenvolvimento](#-regras-de-desenvolvimento)
- [Objetivo de longo prazo](#-objetivo-de-longo-prazo)

---

## 🎯 Sobre o projeto

O **SaaS de Atendimento, Filas e Painéis Digitais** é uma plataforma multi-tenant que permite
que diferentes tipos de empresas organizem o atendimento ao público, controlem filas de espera,
realizem chamadas e exibam informações em TVs ou outros dispositivos conectados.

### O problema que resolve

Em negócios com atendimento presencial, é comum:

- Filas sem controle, com senhas perdidas ou disputadas informalmente;
- Clientes chamados por grito ou por passar de sala em sala;
- Nenhuma visão de quanto tempo o cliente espera;
- TVs nas salas de espera sem integração com o atendimento;
- Sistemas rígidos, presos a um segmento (só clínica, só banco...).

### A proposta

Um sistema **genérico e configurável**, sem vocabulário de segmento fixo no código, no qual a
recepção controla a fila, o backend centraliza as regras e os painéis exibem as chamadas em
tempo real — funcionando igual para uma clínica, um salão, uma assistência técnica ou um órgão público.

---

## 💡 Exemplos de uso

| Segmento | Como o sistema se adapta |
|---|---|
| 🏥 Clínicas | Setores por especialidade, salas como locais, profissionais por consultório |
| 💈 Salões de beleza | Serviços por categoria, cadeiras/sala como locais, atendentes por função |
| 🔧 Assistências técnicas | Ordens de serviço na fila, balcões como locais, técnicos por setor |
| 🏦 Bancos | Senhas por tipo de serviço, guichês como locais, fila prioritária |
| 🏛️ Órgãos públicos | Atendimento ao cidadano, setores por área, salas de atendimento |
| 🏢 Recepção empresarial | Visitantes na fila, recepcionistas como atendentes, salas de reunião |
| ✨ Outros | Qualquer negócio com atendimento presencial — basta configurar setores, serviços e locais |

---

## ⚙️ Como funciona

### Conceito central

```
   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
   │  RECEPÇÃO    │ ──────► │   BACKEND    │ ──────► │    PAINEL    │
   │  (web)       │  HTTP   │  fonte da    │ eventos │  (TV/web)    │
   │              │         │  verdade     │ tempo   │              │
   │ • cadastro   │         │ • regras     │ real    │ • exibe      │
   │ • fila       │         │ • isolamento │         │   chamadas   │
   │ • chamada    │         │ • auditoria  │         │ • playlists  │
   └──────────────┘         └──────────────┘         └──────────────┘
```

- A **recepção** realiza o atendimento e o controle da fila.
- O **backend** é a fonte central de verdade: valida, persiste e distribui.
- Os **painéis** recebem os eventos em tempo real e exibem as chamadas.

> 🔐 A recepção e o painel **nunca** conversam diretamente. Toda comunicação passa pelo backend.

### Exemplo visual

Um atendente clica em **CHAMAR** e o sistema registra:

```
CHAMAR → João Silva → Atendimento → Maria → Sala 04
```

O painel na TV interrompe a mídia e apresenta:

```
┌─────────────────────────────────┐
│                                 │
│          JOÃO SILVA             │
│                                 │
│        DIRIJA-SE À              │
│                                 │
│           SALA 04               │
│                                 │
└─────────────────────────────────┘
```

Após o tempo configurado, o painel **retoma automaticamente** a playlist de mídia.

---

## 📊 Status atual

| Item | Situação |
|---|---|
| 🎯 **Fase 0 — Preparação (001–007)** | ✅ **Concluída (7/7)** — diagnóstico real, ADR-003 aprovada, docs consolidados |
| 📄 Documentação (plano, tarefas, arquitetura) | ✅ Atualizada — com *Registro de execução* |
| 🏗️ Base da aplicação (Tarefa 008) | ✅ Concluída — install/lint/build/dev validados (0 avisos de lint) |
| 🧱 Layouts base (Tarefa 009) | ✅ Concluída — rotas `/login`, `/dashboard`, `/fila`, `/display` com layouts auth, admin, recepção e painel 16:9 |
| 🧭 Navegação (Tarefa 010) | ✅ Concluída — menu admin/recepção responsivo, rota ativa, itens em `constants/navigation.ts` |
| 🧩 Componentes (Tarefa 011) | ✅ Concluída — 9 componentes em `src/components/ui/`, demo em `/dev/components`, docs em `docs/componentes.md` |
| 🎨 Sistema visual (Tarefa 012) | ✅ Concluída — tokens `--color-brand-*`, contraste AA+, `docs/sistema-visual.md` — **Fase 1 completa (5/5), M1 atingido** |
| 🏢 Empresa/Tenant (Tarefa 013) | ✅ Concluída — PostgreSQL + Prisma 6 (ADR-005), coluna + RLS (ADR-006), migração do zero no Neon, `TenantContext` obrigatório, **9/9 testes** — Fase 2 em andamento |
| 📁 Estrutura de pastas (Tarefa 006) | ✅ Aplicada — `src/` conforme `docs/arquitetura.md` §5 |
| 💻 Funcionalidades | ⬜ Nenhuma implementada (nenhuma tela, regra ou API) |
| 📦 Dependências | ✅ Instaladas — `prisma`, `@prisma/client`, `vitest`, `dotenv` adicionados (autorizados) |
| 🗄️ Banco de dados | ✅ Definido — PostgreSQL (Neon free tier) + Prisma 6; RLS ativo (ADR-005/006) |
| 🔐 Autenticação | ⏸️ Não definida — aguarda decisão (Tarefa 017) |
| ⚡ Tempo real | ⏸️ Não definido — aguarda decisão (Tarefa 038) |
| ☁️ Hospedagem | ⏸️ Não definida — aguarda decisão |
| 🧪 Testes automatizados | ✅ Vitest — **9/9 passando** (8 unit + 1 integração RLS) |

> **Progresso: 13/64 tarefas** · **Próxima tarefa:** 014 — Configuração.

---

## 🧰 Stack

| Camada | Tecnologia | Versão | Observação |
|---|---|---|---|
| Framework | **Next.js** | 16.4.0 | App Router, Turbopack, Route Handlers |
| Biblioteca | **React** | 19.3.0 | Interface das três áreas (admin, recepção, painel) |
| Linguagem | **TypeScript** | 5.x (`strict`) | Sem `any` sem justificativa |
| Runtime | **Node.js** | 22+ | Execução do backend |
| Gerenciador de pacotes | **npm** | — | `package-lock.json` presente |
| Estilo | **Tailwind CSS** | 4.x | Tokens visuais e identidade por tenant |
| Lint | **ESLint** | 9.x | `eslint-config-next` |
| Tempo real | **WebSocket ou equivalente** | — | 🔎 **A ser definido na arquitetura** |

> ⚠️ A tecnologia de tempo real exata (SSE, WebSocket ou serviço gerenciado) será decidida na
> fase de arquitetura, **juntamente com a decisão de hospedagem**, pois uma depende da outra.

---

## 🧩 Visão geral do domínio

Conceitos centrais do sistema:

| Conceito | Descrição |
|---|---|
| 👔 **Empresas / Tenants** | Raiz de isolamento — cada empresa é um mundo independente |
| 👤 **Usuários** | Pessoas que acessam o sistema com e-mail e senha |
| 🎭 **Perfis e permissões** | Papéis (Admin, Recepção/Atendente) com capacidades granulares |
| 🗂️ **Setores** | Subdivisões livres do negócio (ex.: Clínica Geral, Financeiro) |
| 🛠️ **Serviços** | O que é oferecido ao público (ex.: Atendimento, Retirada) |
| 👨‍💼 **Profissionais / Atendentes** | Quem realiza o atendimento, com função livre |
| 📍 **Locais** | Onde o atendimento ocorre (ex.: Sala 04, Guichê 02) |
| 🙋 **Clientes / Público** | Quem é atendido — coleta mínima de dados (LGPD) |
| 📋 **Filas** | Containers lógicos com itens em ordem de chegada |
| 🎫 **Atendimentos** | Histórico de cada chamada e sua conclusão |
| 📺 **Painéis** | Dispositivos que exibem chamadas e mídia |
| 🔗 **Pareamento** | Vinculação segura do painel à empresa, sem login na TV |
| 🖼️ **Mídias** | Imagens e vídeos exibidos nos painéis |
| ▶️ **Playlists** | Sequência de mídias associadas a cada painel |
| ⚡ **Chamadas em tempo real** | Evento `CALL_CLIENT` do backend para o painel |

---

## 🏗️ Multi-tenancy

Cada empresa é um **tenant independente**. Os dados de cada empresa permanecem isolados:

| Dado | Isolado por tenant |
|---|:---:|
| Usuários | ✅ |
| Clientes | ✅ |
| Serviços | ✅ |
| Setores | ✅ |
| Profissionais | ✅ |
| Locais | ✅ |
| Filas e atendimentos | ✅ |
| Painéis | ✅ |
| Mídias e playlists | ✅ |
| Configurações e identidade visual | ✅ |

### Defesa em profundidade (planejada)

1. **Identidade** — o `tenantId` vem apenas da sessão/token, nunca do cliente.
2. **Aplicação** — contexto de requisição obrigatório; repositórios filtram sempre por tenant.
3. **Dados** — índices e chaves iniciando por `tenantId`; referências que impedem cruzamento.
4. **Banco** — Row Level Security (se PostgreSQL) como rede de segurança.
5. **Tempo real** — canais nomeados por tenant, assinatura validada no servidor.
6. **Verificação** — testes automatizados com dois tenants em toda mudança relevante.

> O isolamento é aplicado **no backend e no banco de dados**. O frontend nunca é barreira de segurança.

---

## 📺 Painéis (Displays)

### O que é

O painel é uma **página web** que acessa uma URL da aplicação — sem sistema operacional próprio,
sem aplicativo instalado.

```
/display/empresa123/painel01
```

### Disposiços suportados (planejados)

`📺 Smart TV` · `🤖 Android TV` · `📺 TV Box` · `💻 Mini PC` · `🍇 Raspberry Pi` · `🖥️ Notebook` · `🖥️ Computador comum`

### Capacidades do painel

| Capacidade | Descrição |
|---|---|
| 🖼️ Exibir imagens | Reprodução por duração configurável |
| 🎬 Exibir vídeos | MP4 mudo (limitação de autoplay dos navegadores) |
| ▶️ Executar playlists | Laço contínuo com pré-carregamento do próximo item |
| ⚡ Receber chamadas | Interrupção imediata da mídia ao chegar `CALL_CLIENT` |
| 🙋 Mostrar o cliente | Nome de exibição em destaque |
| 📍 Mostrar o local | "DIRIJA-SE À SALA 04" |
| 🔁 Retomar a playlist | Volta ao ponto correto após a chamada |
| 📶 Informar status | Indicador de conexão online/offline |

### Estados do painel (planejados)

```
[sem token] ──abre /display──► PAREANDO ──código informado──► CONECTANDO
                                                                   │
                                                          EXIBINDO_MIDIA ◄──┐
                                                                   │        │
                                                           CALL_CLIENT       │ tempo esgotado
                                                                   ▼        │
                                                          EXIBINDO_CHAMADA ──┘
                                                                   │
                                                            queda de rede
                                                                   ▼
                                                                OFFLINE ──reconecta──► CONECTANDO
```

---

## 🔗 Pareamento de painéis

O painel **não** exige e-mail e senha na TV — o pareamento é feito por código de uso único.

```
 📺 PAINEL                      🖥️ ADMIN                      ⚙️ BACKEND
    │                              │                              │
    │  1. abre /display            │                              │
    │─────────────────────────────────────────────────────────────►│
    │  2. recebe código (ex.: K7M2Q9)                              │
    │◄─────────────────────────────────────────────────────────────│
    │                              │                              │
    │                              │  3. informa o código + nome  │
    │                              │     + local do painel        │
    │                              │─────────────────────────────►│
    │                              │                              │ 4. valida
    │                              │                              │    (existe?
    │                              │                              │    não expirou?
    │                              │                              │    não usado?)
    │                              │                              │
    │  5. recebe token (1 única vez)                              │
    │◄─────────────────────────────────────────────────────────────│
    │                              │                              │
    │  6. reconecta sozinho        │                              │
    │─────────────────────────────────────────────────────────────►│
```

**Segurança planejada:**

- Código de **uso único**, validade curta e alfabeto sem caracteres ambíguos (sem `0/O`, `1/I/L`);
- **Limite de tentativas** por IP/tenant contra adivinhação;
- Token de alta entropia armazenado no servidor **apenas como hash**;
- **Revogação imediata** pelo administrador derruba a conexão ativa.

---

## 🚦 Status da fila

| # | Status | Significado | Transições de saída |
|---|---|---|---|
| 1 | `AGUARDANDO` | Cliente na fila, aguardando chamada | `CHAMADO`, `CANCELADO` |
| 2 | `CHAMADO` | Cliente chamado no painel | `EM_ATENDIMENTO`, `NAO_COMPARECEU`, `CANCELADO` |
| 3 | `EM_ATENDIMENTO` | Atendimento em andamento | `CONCLUIDO` |
| 4 | `CONCLUIDO` | Atendimento finalizado | — (estado final) |
| 5 | `CANCELADO` | Item cancelado pela recepção | — (estado final) |
| 6 | `NAO_COMPARECEU` | Cliente não compareceu após a chamada | — (estado final) |

### Máquina de estados (planejada)

```
                ┌──────────────► CANCELADO
                │
 AGUARDANDO ──► CHAMADO ──► EM_ATENDIMENTO ──► CONCLUIDO
      │             │
      │             └──────────► NAO_COMPARECEU
      └────────────────────────► CANCELADO
```

- Transições válidas centralizadas em **um único módulo** (tabela de transições).
- Atualizações **atômicas** — dois atendentes não chamam o mesmo cliente.

---

## ⚡ Eventos em tempo real

### Evento principal: `CALL_CLIENT`

```json
{
  "event": "CALL_CLIENT",
  "client": "João Silva",
  "service": "Atendimento",
  "professional": "Maria",
  "location": "Sala 04",
  "timestamp": "2026-10-06T14:30:00.000Z"
}
```

### Garantia de confiabilidade

| Regra | Significado |
|---|---|
| **Persistir antes de emitir** | O evento só é publicado depois de gravado no banco |
| **Direcionamento** | Só os painéis do setor/local correto, do mesmo tenant, recebem |
| **Ressincronização** | Ao reconectar, o painel busca o estado atual (não perde chamada) |
| **Fila no painel** | Chamadas simultâneas exibidas em sequência, sem perda |

### Eventos previstos para evolução

`CALL_CLIENT` *(v1)* · `CANCEL_CALL` · `QUEUE_UPDATED` · `PLAYLIST_UPDATED` · `DISPLAY_STATUS` · `DISPLAY_CONFIG_UPDATED`

---

## 🎯 Objetivo do MVP

O primeiro objetivo funcional é executar este fluxo ponta a ponta:

```
┌─────────────────┐                                  ┌─────────────────┐
│   NOTEBOOK 1    │                                  │   NOTEBOOK 2    │
│   Recepção      │                                  │   Painel        │
│                 │                                  │                 │
│  [CHAMAR] ──────┼──► Backend ──► CALL_CLIENT ──────┼──►  JOÃO SILVA  │
│                 │                                  │  DIRIJA-SE À    │
│                 │                                  │    SALA 04      │
└─────────────────┘                                  └─────────────────┘
```

### Critérios de aceite do MVP

- [ ] Cadastro mínimo de cliente, setor, serviço, profissional e local;
- [ ] Cliente entra na fila e aparece na listagem da recepção;
- [ ] Atendente clica em **CHAMAR** e o backend registra o evento;
- [ ] O segundo notebook recebe `CALL_CLIENT` e exibe **JOÃO SILVA — DIRIJA-SE À SALA 04**;
- [ ] Após o tempo configurado, o painel retorna ao estado normal;
- [ ] Dois tenants em paralelo não acessam dados um do outro.

> 🖥️ Neste estágio **não são necessários equipamentos físicos** — dois notebooks bastam.

---

## 🗓️ Fases planejadas

| # | Fase | Entrega esperada |
|---|---|---|
| 1 | **Preparação** | Diagnóstico real do projeto, arquitetura e estrutura validadas |
| 2 | **Base da aplicação** | Layout, navegação, componentes e sistema visual |
| 3 | **Multi-tenancy** | Empresa configurada com logo e identidade visual |
| 4 | **Autenticação e acesso** | Login, papéis e permissões funcionando |
| 5 | **Cadastros** | Setores, serviços, profissionais, locais e clientes |
| 6 | **Atendimento e filas** | Fila operando de ponta a ponta na recepção |
| 7 | **Painéis** | Painel, identificação, pareamento e status |
| 8 | **Comunicação em tempo real** | Chamada recepciona → painel exibe |
| 9 | **Mídias** | Uploads, playlists, reprodução e interrupção |
| 10 | **Dashboard e relatórios** | Indicadores e relatórios básicos |
| 11 | **Segurança** | Isolamento, API, upload e painel auditados |
| 12 | **Piloto** | Testes ponta a ponta e correções |

---

## 🏁 Marcos do projeto

| Marco | Após fase | Entrega demonstrável |
|---|---|---|
| **M1** | 2 | Esqueleto navegável com layout e sistema visual |
| **M2** | 3 | Empresa configurada com logo e identidade |
| **M3** | 4 | Acesso protegido (login, papéis, permissões) |
| **M4** | 6 | Recepção opera a fila sem painel |
| **M5** | 8 | 🎯 **Notebook 1 chama → Notebook 2 exibe a chamada** |
| **M6** | 9 | Painel completo com mídia e playlist |
| **M7** | 12 | Piloto pronto e testado |

---

## ❌ Fora do MVP inicial

Não fazem parte da primeira versão — e **não devem ser criadas prematuramente**:

| Item | Motivo |
|---|---|
| 🤖 Inteligência Artificial | Fora do escopo inicial |
| 💬 WhatsApp | Fora do escopo inicial |
| 💰 Sistema financeiro / pagamentos | Fora do escopo inicial |
| 📦 Estoque | Fora do escopo inicial |
| 📱 Aplicativos Android/iOS nativos | O painel é web, não app nativo |
| 🧾 Integrações fiscais | Fora do escopo inicial |
| 🛒 Marketplace de anúncios | Fora do escopo inicial |
| 🖥️ Hardware dedicado | O piloto usa notebooks comuns |
| 📊 CRM complexo | Fora do escopo inicial |

> Essas funcionalidades **poderão ser avaliadas futuramente**, sem comprometer a arquitetura atual.

---

## 📚 Documentação

A documentação do projeto está organizada em:

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Porta de entrada do projeto (este documento) |
| `PLANO-PROJETO.md` | Plano geral, decisões, modelo de dados, riscos e fases |
| `TAREFAS.md` | 64 tarefas em 12 fases, com checklist, checkpoint e *Registro de execução* |
| `docs/arquitetura.md` | Arquitetura, camadas, fluxos e registro de decisões (ADRs) |
| `docs/desenvolvimento.md` | Como rodar, convenções, fluxo de commits e definição de pronto |
| `docs/analise-checklist.md` | Análise de consistência e riscos do roadmap (2026-10-06) |
| `docs/componentes.md` | Componentes visuais reutilizáveis, props, estados e convenções |
| `docs/sistema-visual.md` | Tokens de marca, tipografia, espaçamento e contraste (Tarefa 012) |
| `docs/api.md`, `banco-de-dados.md`, `painel.md`, `seguranca.md`, `tempo-real.md`, `testes.md` | Esqueletos — preenchidos conforme as fases |

> 📁 **Insumos originais** (fora do repositório, na pasta do workspace `doc_projetos/prompts/`):
> `01-especificacao-saas-atendimento-painel-digital.txt` — especificação do produto;
> `02-prompt-inicio-projeto-piloto.txt` — regras de disciplina e processo de desenvolvimento.

---

## 🖥️ Ambiente de desenvolvimento

### Pré-requisitos

| Ferramenta | Versão | Finalidade |
|---|---|---|
| Node.js | 22 (versão usada na criação da base) | Runtime do projeto |
| npm | junto com o Node.js | Gerenciador de pacotes |
| Git | qualquer versão estável | Controle de versão |
| Editor | VS Code (recomendado) | Edição do código |

### Comandos

```bash
npm install      # instalar dependências
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (valida tipos)
npm run lint     # verificação do ESLint
npm run start    # executa o build de produção
```

> ✅ Validado em 2026-10-06 nesta máquina: `install` (72,5 s) · `lint` (10,3 s, 0 avisos) ·
> `build` (9,4 s) · `dev` (ready em 728 ms). Antes de escrever código Next.js, consultar a
> documentação local indicada em `AGENTS.md` e o guia em [`docs/desenvolvimento.md`](docs/desenvolvimento.md).

---

## 📜 Regras de desenvolvimento

- ❌ Não alterar a stack sem autorização.
- ❌ Não implementar funcionalidades fora da tarefa atual.
- ❌ Não criar funcionalidades prematuramente.
- ❌ Não instalar dependências sem necessidade.
- ❌ Não utilizar comandos destrutivos sem autorização.
- ❌ Não ignorar erros de build ou lint.
- ⚠️ Não utilizar `any` sem justificativa.
- 🧩 Manter componentes e funções com responsabilidade clara.
- 🔐 Priorizar segurança e isolamento entre tenants.
- ✅ Testar cada etapa antes de avançar.
- 📝 Documentar decisões arquiteturais importantes.

### Processo de trabalho

Cada tarefa segue o mesmo ciclo:

```
 objetivo → pré-requisitos → implementação → teste → documentação → checkpoint → validação
```

Quando uma tarefa envolve decisão importante (banco, autenticação, tempo real, armazenamento),
a execução **para e aguarda autorização** antes de continuar.

---

## 🚀 Objetivo de longo prazo

Transformar o projeto em um **SaaS comercial** no qual empresas possam:

1. Criar uma conta;
2. Configurar sua empresa;
3. Cadastrar usuários e serviços;
4. Criar filas;
5. Utilizar a recepção para realizar atendimentos;
6. Conectar painéis digitais;
7. Configurar mídias e playlists;
8. Realizar chamadas em tempo real;
9. Acompanhar indicadores;
10. Contratar e utilizar o sistema de forma independente.

---

<div align="center">

**🚧 Projeto em desenvolvimento — fase de arquitetura e planejamento.**

*Documento vivo: atualizado conforme as decisões do projeto forem tomadas.*

</div>
