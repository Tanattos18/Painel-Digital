# Componentes (`src/components/ui/`)

Conjunto mínimo de componentes visuais reutilizáveis criado na **Tarefa 011**.
Todos são **genéricos, sem regra de negócio e sem dependências novas** (HTML
nativo + Tailwind). As cores da marca vêm das variáveis `--color-brand-*`
(definidas na **Tarefa 012** — ver `docs/sistema-visual.md`); os neutros usam a
escala `zinc`.

## Componentes

| Arquivo | Componente | Props principais | Estados |
|---|---|---|---|
| `button.tsx` | `Button` | `variant: primary \| secondary \| ghost \| danger`, `size: sm \| md` | padrão, `disabled` |
| `text-field.tsx` | `TextField` | `label`, `hint?`, `error?` | normal, com dica, com erro (`aria-invalid`) |
| `select-field.tsx` | `SelectField` | `label`, `options: SelectOption[]`, `hint?`, `error?` | normal, com dica, com erro |
| `card.tsx` | `Card` | `title?`, `children` | com/sem título |
| `simple-table.tsx` | `SimpleTable<T>` | `columns`, `rows`, `rowKey`, `caption?` | com renderizador de célula ou valor direto |
| `modal.tsx` | `Modal` | `open`, `onClose`, `title` | aberto/fechado; fecha no **Esc** e no clique fora |
| `alert.tsx` | `Alert` | `variant: info \| success \| warning \| error`, `title?` | 4 variações (`role="alert"`) |
| `empty-state.tsx` | `EmptyState` | `title`, `description?`, `action?` | com/sem ação |
| `spinner.tsx` | `Spinner` | `label?` | `role="status"` com texto acessível |

## Convenções

- Arquivo kebab-case exportando componente PascalCase (mesma regra de `area-nav.tsx`).
- Tipagem forte nas props, sem `any`; props nativas estendidas via
  `ButtonHTMLAttributes` / `InputHTMLAttributes` / `SelectHTMLAttributes`.
- Acessibilidade: elementos nativos, `focus-visible:ring`, `label` associado
  (`htmlFor`/`id` via `useId`), `aria-invalid` + `aria-describedby`, `aria-modal`
  no diálogo.
- **Nenhuma** dependência nova: bibliotecas de UI/ícones exigem justificativa,
  alternativas, verificação de compatibilidade e autorização (prompt do projeto,
  "Regra sobre dependências").
- `components/ui` **não** importa de `features` (ver `docs/arquitetura.md` §5).

## Página de demonstração

Rota interna **`/dev/components`** (`src/app/dev/components/page.tsx`) exibe cada
componente em seus estados. Não está no menu de navegação e deve ser **removida**
quando deixar de ser necessária.
