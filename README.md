# SaaS de Atendimento, Filas e Painéis Digitais

> 🚧 **Em desenvolvimento — fase de arquitetura e planejamento.**
> Este documento descreve o projeto **como está planejado**. Nada do que está descrito abaixo
> foi implementado ainda: não existe código funcional, nem dependências instaladas.

---

## Sumário

1. [Descrição](#descrição)
2. [Exemplos de uso](#exemplos-de-uso)
3. [Conceito](#conceito)
4. [Stack planejada](#stack-planejada)
5. [Principais conceitos do sistema](#principais-conceitos-do-sistema)
6. [Multi-tenancy](#multi-tenancy)
7. [Painéis](#painéis)
8. [Pareamento](#pareamento)
9. [Status da fila](#status-da-fila)
10. [Evento principal](#evento-principal)
11. [Objetivo do MVP](#objetivo-do-mvp)
12. [Desenvolvimento](#desenvolvimento)
13. [Fases planejadas](#fases-planejadas)
14. [Fora do MVP inicial](#fora-do-mvp-inicial)
15. [Status do projeto](#status-do-projeto)
16. [Documentação](#documentação)
17. [Regras de desenvolvimento](#regras-de-desenvolvimento)
18. [Objetivo de longo prazo](#objetivo-de-longo-prazo)

---

## Descrição

Plataforma SaaS multi-tenant para **gerenciamento de atendimento, filas e painéis digitais**.

O sistema será desenvolvido para permitir que diferentes tipos de empresas organizem seu
atendimento ao público, controlem filas, realizem chamadas e exibam informações em TVs ou
outros dispositivos conectados.

O conceito é **genérico e configurável**, permitindo adaptar o sistema para diferentes negócios —
sem vocabulário clínico ou de segmento fixo no código.

## Exemplos de uso

- Clínicas
- Salões de beleza
- Assistências técnicas
- Bancos
- Órgãos públicos
- Recepção empresarial
- Outros negócios que utilizem atendimento presencial

## Conceito

```
Recepção ──────► Backend ──────► Painel
```

- A **recepção** realiza o atendimento e o controle da fila.
- O **backend** funciona como fonte central de verdade.
- Os **painéis** recebem os eventos em tempo real e exibem as chamadas.

A recepção e o painel **nunca** conversam diretamente entre si.

### Exemplo

Um atendente chama:

```
JOÃO SILVA
```

O painel apresenta:

```
JOÃO SILVA
DIRIJA-SE À
SALA 04
```

## Stack planejada

| Camada | Tecnologia |
|---|---|
| Framework | Next.js |
| Biblioteca | React |
| Linguagem | TypeScript |
| Runtime | Node.js |
| Estilo | Tailwind CSS |
| Lint | ESLint |
| Tempo real | WebSocket ou tecnologia equivalente — **a ser definida na arquitetura** |

> A escolha exata da tecnologia de tempo real (SSE, WebSocket ou serviço gerenciado) será
> decidida durante a fase de arquitetura, junto com a decisão de hospedagem.

## Principais conceitos do sistema

- Empresas / Tenants
- Usuários
- Perfis e permissões
- Setores
- Serviços
- Profissionais / Atendentes
- Locais
- Clientes / Público
- Filas
- Atendimentos
- Painéis
- Pareamento de painéis
- Mídias
- Playlists
- Chamadas em tempo real

## Multi-tenancy

Cada empresa será um **tenant independente**. Os dados de cada empresa deverão permanecer
isolados, incluindo:

- Usuários
- Clientes
- Serviços
- Setores
- Profissionais
- Locais
- Filas
- Atendimentos
- Painéis
- Mídias
- Configurações

A aplicação deverá aplicar o isolamento **no backend e no banco de dados**. O frontend nunca
é barreira de segurança.

## Painéis

Os painéis serão dispositivos que acessam uma URL da aplicação.

Exemplo:

```
/display/empresa123/painel01
```

O dispositivo poderá futuramente ser:

- Smart TV
- Android TV
- TV Box
- Mini PC
- Raspberry Pi
- Notebook
- Computador comum

O painel deverá:

- Exibir imagens
- Exibir vídeos
- Executar playlists
- Receber chamadas
- Mostrar o cliente chamado
- Mostrar o local de atendimento
- Retomar a playlist após a chamada
- Informar seu status de conexão

## Pareamento

O painel **não** deverá exigir que o usuário digite e-mail e senha na TV.

O fluxo planejado será:

1. O painel acessa a página de configuração.
2. O sistema apresenta um código de pareamento.
3. O administrador informa esse código no painel administrativo.
4. O servidor associa o dispositivo à empresa.
5. O painel recebe uma identidade/token.
6. O painel passa a se reconectar automaticamente.

## Status da fila

| Status | Significado |
|---|---|
| `AGUARDANDO` | Cliente na fila, aguardando chamada |
| `CHAMADO` | Cliente chamado no painel |
| `EM_ATENDIMENTO` | Atendimento em andamento |
| `CONCLUIDO` | Atendimento finalizado |
| `CANCELADO` | Item cancelado |
| `NAO_COMPARECEU` | Cliente não compareceu após a chamada |

## Evento principal

`CALL_CLIENT`

```json
{
  "event": "CALL_CLIENT",
  "client": "João Silva",
  "service": "Atendimento",
  "professional": "Maria",
  "location": "Sala 04",
  "timestamp": "..."
}
```

## Objetivo do MVP

O primeiro objetivo funcional do projeto será executar o seguinte fluxo:

```
Notebook 1 — Recepção
      │
      ▼
   Backend
      │
      ▼
  CALL_CLIENT
      │
      ▼
Notebook 2 — Painel
```

O segundo notebook deverá receber a chamada e apresentar:

```
JOÃO SILVA
DIRIJA-SE À
SALA 04
```

Neste estágio **não serão necessários equipamentos físicos**.

## Desenvolvimento

O projeto será desenvolvido em **etapas controladas**. Cada tarefa deverá:

1. Possuir objetivo definido.
2. Ter pré-requisitos.
3. Ser implementada individualmente.
4. Ser testada.
5. Ser documentada.
6. Gerar um checkpoint.
7. Aguardar validação antes da próxima tarefa quando houver uma decisão importante.

## Fases planejadas

| # | Fase |
|---|---|
| 1 | Preparação |
| 2 | Base da aplicação |
| 3 | Multi-tenancy |
| 4 | Autenticação e acesso |
| 5 | Cadastros |
| 6 | Atendimento e filas |
| 7 | Painéis |
| 8 | Comunicação em tempo real |
| 9 | Mídias |
| 10 | Dashboard e relatórios |
| 11 | Segurança |
| 12 | Piloto |

## Fora do MVP inicial

Não fazem parte da primeira versão:

- Inteligência Artificial
- WhatsApp
- Sistema financeiro
- Pagamentos
- Estoque
- Aplicativos Android/iOS nativos
- Integrações fiscais
- Marketplace de anúncios
- Hardware dedicado
- Funcionalidades complexas de CRM

Essas funcionalidades poderão ser avaliadas futuramente.

## Status do projeto

🚧 **Em desenvolvimento — fase de arquitetura e planejamento.**

| Item | Situação |
|---|---|
| Documentação de plano e arquitetura | Em elaboração |
| Código funcional | Ainda não iniciado |
| Dependências do projeto | Ainda não instaladas |
| Banco de dados | Não definido (aguarda decisão) |
| Autenticação | Não definida (aguarda decisão) |
| Tempo real | Não definido (aguarda decisão) |

## Documentação

A documentação do projeto está organizada principalmente em:

- `PLANO-PROJETO.md` — plano geral, decisões, riscos e fases
- `TAREFAS.md` — 64 tarefas organizadas em 12 fases
- `docs/arquitetura.md` — arquitetura, camadas e ADRs
- `README.md` — este documento (porta de entrada do projeto)

## Regras de desenvolvimento

- Não alterar a stack sem autorização.
- Não implementar funcionalidades fora da tarefa atual.
- Não criar funcionalidades prematuramente.
- Não instalar dependências sem necessidade.
- Não utilizar comandos destrutivos sem autorização.
- Não ignorar erros de build ou lint.
- Não utilizar `any` sem justificativa.
- Manter componentes e funções com responsabilidade clara.
- Priorizar segurança e isolamento entre tenants.
- Testar cada etapa antes de avançar.
- Documentar decisões arquiteturais importantes.

## Objetivo de longo prazo

Transformar o projeto em um **SaaS comercial** no qual empresas possam:

1. Criar uma conta.
2. Configurar sua empresa.
3. Cadastrar usuários e serviços.
4. Criar filas.
5. Utilizar a recepção para realizar atendimentos.
6. Conectar painéis digitais.
7. Configurar mídias e playlists.
8. Realizar chamadas em tempo real.
9. Acompanhar indicadores.
10. Contratar e utilizar o sistema de forma independente.
