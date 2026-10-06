# Sistema visual

Tokens visuais definidos na **Tarefa 012**. A meta é que a **Fase 2** troque a
cor de marca por tenant **sem alterar componentes** — apenas as variáveis CSS.

## Marca (variáveis CSS)

Definidas no bloco `@theme` de `src/app/globals.css`. Os utilitários do Tailwind
compilam para `var(--color-brand-*)` (verificado no CSS gerado), então qualquer
sobrescrita dessas variáveis no `:root` muda a interface inteira.

| Passo | Valor (padrão azul) | Uso atual |
|---|---|---|
| `--color-brand-50` | `#eff6ff` | fundo do item de menu ativo |
| `--color-brand-100` | `#dbeafe` | — |
| `--color-brand-200` | `#bfdbfe` | texto do menu ativo (tema escuro) |
| `--color-brand-300` | `#93c5fd` | — |
| `--color-brand-400` | `#60a5fa` | — |
| `--color-brand-500` | `#3b82f6` | hover do botão (escuro), spinner (escuro) |
| `--color-brand-600` | `#2563eb` | **botão primário**, spinner |
| `--color-brand-700` | `#1d4ed8` | hover do botão, texto do menu ativo |
| `--color-brand-800` | `#1e40af` | — |
| `--color-brand-900` | `#1e3a8a` | fundo do menu ativo (escuro, 30%) |

Componentes que usam a marca: `Button` (primary), `AreaNav` (item ativo),
`Spinner`. Os demais são neutros (`zinc`) e não mudam com a marca.

**Como trocar (Tarefa 016 — identidade por tenant):** sobrescrever
`--color-brand-*` no escopo da empresa. A página interna `/dev/components`
traz um seletor que faz isso em runtime (azul/verde/roxo) como teste.

## Neutros

Escala `zinc` do Tailwind (padrão), usada em fundos, bordas e textos.
Texto principal `zinc-900` (claro) / `zinc-50`–`zinc-100` (escuro); texto
secundário `zinc-600`.

## Tipografia

- `--font-sans`: pilha de fontes do sistema (sem rede externa — decisão da
  Tarefa 008, relevante para o painel operar offline). Reversível.
- Escala de tamanhos do Tailwind (`text-sm`, `text-base`, `text-xl`…).

## Espaçamento

Escala padrão do Tailwind (`p-1`…`p-8`, `gap-*`) adotada como canônica.

## Contraste (WCAG)

Razões calculadas com a fórmula WCAG 2.1 (≥ 4,5:1 para texto normal; ≥ 3:1
para elementos de interface):

| Par | Razão | Nível |
|---|---|---|
| `brand-600` sobre branco (botão primário) | 5,17 | AA ✅ |
| Branco sobre `brand-600` | 5,17 | AA ✅ |
| `brand-700` sobre `brand-50` (menu ativo) | 6,16 | AA ✅ |
| `brand-200` sobre `brand-900`/30% no escuro | 11,05 | AAA ✅ |
| `zinc-900` sobre branco (títulos) | 17,93 | AAA ✅ |
| `zinc-600` sobre branco (texto secundário) | 7,73 | AAA ✅ |
| Branco sobre `red-600` (botão perigo) | 4,83 | AA ✅ |
| `#ededed` sobre `#0a0a0a` (corpo escuro) | 16,91 | AAA ✅ |

## Animações

Somente `animate-spin` (indicador de carregamento). Nenhuma animação de
entrada/escala/pulso — critério de "interface sem animações exageradas".
