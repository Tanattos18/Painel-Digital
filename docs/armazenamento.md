# Armazenamento de arquivos

> **Status:** decisão da **Tarefa 015** (2026-10-07) — logo em disco local.
> **Finalidade:** onde e como os arquivos dos tenants são guardados e servidos.
> Relacionado: **ADR-010** (`docs/arquitetura.md` — PARCIAL: mídia completa
> continua pendente até a Tarefa 043).

## Decisão (Tarefa 015)

**Opção A — disco local**, com uma abstração `Storage` para que a troca por
armazenamento de objeto (S3/R2/etc., se a 043 decidir) seja localizada num
único ponto.

- **O que fica no disco:** o logo do tenant (e, na 043, a mídia).
- **O que fica no banco:** apenas o **caminho** (`tenants.logo_path`), sempre
  relativo à base e com prefixo `{tenantId}/`. O cliente nunca informa caminho.
- **SVG fica de fora** por padrão (risco de script embutido); só entra se
  autorizado com sanitização.

## Abstração

| Arquivo | Papel |
|---|---|
| `src/lib/storage/types.ts` | interface `Storage`: `salvar`, `ler`, `remover` |
| `src/lib/storage/local.ts` | `criarStorageLocal(baseDir)` — implementação de disco |
| `src/lib/storage/index.ts` | `getStorage()` — fábrica do armazenamento ativo |

Garantias da implementação local:

- **Anti path-traversal:** o caminho relativo é resolvido contra a base e
  precisa permanecer dentro dela (recusa `../`, caminhos absolutos etc.).
- **Escrita atômica:** grava em arquivo temporário e renomeia (evita logo
  pela metade se o processo cair no meio).
- **Arquivo inexistente** → `ler` devolve `null`; `remover` é idempotente.
- Base configurável por `STORAGE_DIR` (padrão `storage/`, fora do Git).

## Regras do logo (Tarefa 015)

- **Formato decidido pelo conteúdo** (magic bytes), nunca pela extensão do
  arquivo: PNG (assinatura + `IHDR`), JPEG (`FF D8 FF` + segmento SOF) e
  WEBP (`RIFF/WEBP` + `VP8`/`VP8L`/`VP8X`).
- **Limites:** até **1 MiB**; dimensões de **16 a 4096 px** por lado.
- **Nome gerado pelo servidor:** `{tenantId}/logo-{uuid8}.{ext}` — o upload
  substitui o arquivo anterior (o antigo é removido após a troca no banco).
- **Auditoria:** gravar/limpar `tenants.logo_path` audita em `audit_log`
  (mesma transação), como na Tarefa 014.

## Entrega (`GET /api/logo`)

- O caminho vem **sempre do banco** no contexto do tenant; o serviço recusa
  caminho fora do prefixo do tenant (defesa extra de isolamento).
- Respostas: `200` com a imagem e `Content-Type` correto; `404` sem logo;
  `304` quando o `If-None-Match` bate com o `ETag` (sha1 dos bytes).
- Cache: `Cache-Control: private, max-age=300` (privado — é conteúdo de tenant).

## O que NÃO está aqui

- **Mídia dos painéis** (imagens/vídeos de playlist): estrutura, limites por
  tenant e custos ficam na **Tarefa 043** (ADR-010 completa). Se ela decidir
  por objeto, só `src/lib/storage/index.ts` muda de implementação.
- **Backup/limpeza de arquivos órfãos:** sem processo ainda (reavaliar na 043
  e na 054 — segurança de uploads).
