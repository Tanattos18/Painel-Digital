# Desenvolvimento

## Requisitos

- Node.js 22 (versão usada na criação da base) e npm 10.
- Qualquer sistema operacional com Node; o piloto usa notebooks comuns.

## Comandos

| Comando | Para que serve |
|---|---|
| `npm install` | Instala as dependências |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run lint` | Verificação do ESLint |
| `npm run build` | Build de produção (valida tipos) |
| `npm run start` | Executa o build de produção |

## Ambiente

Copie `.env.example` para `.env.local`. Nunca versione `.env.local`.

## Antes de escrever código Next.js

O projeto usa Next.js 16 e o `AGENTS.md` da raiz orienta a consultar a documentação
local em `node_modules/next/dist/docs/` antes de usar APIs, porque as convenções mudaram.
O `next.config.ts` gerado habilita `cacheComponents` e `partialPrefetching`; isso afeta
como dados dinâmicos (cookies, sessão) devem ser lidos. Consultar o guia de autenticação
com Cache Components na documentação local antes da Tarefa 017.

## Convenções

- Organização por feature (`src/features/<feature>`); ver `docs/arquitetura.md` §5.
- `src/app` importa de `features`; `features` não importam de `app`; `components/ui` não importa de `features`.
- TypeScript estrito, sem `any`, sem strings mágicas (constantes em `src/constants`).
- Nenhum acesso direto a `process.env` fora de `src/lib/config/env.ts`.
- Lógica de negócio fora de componentes visuais.

## Fluxo de trabalho

Uma tarefa por vez (`TAREFAS.md`). Cada tarefa termina com checkpoint.

Commits sugeridos: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
Não usar `git reset --hard` nem `git clean -fd` sem autorização.

## Definição de pronto

Código funcionando, sem erros conhecidos, testes executados, documentação atualizada
e checklist da tarefa marcado.
