import type { ReactNode } from "react";

export type SimpleTableColumn<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
};

type SimpleTableProps<T> = {
  columns: readonly SimpleTableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  caption?: string;
};

export function SimpleTable<T>({
  columns,
  rows,
  rowKey,
  caption,
}: SimpleTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && (
          <caption className="mb-2 text-left text-sm text-zinc-500 dark:text-zinc-400">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-3 py-2 text-left font-medium text-zinc-700 dark:text-zinc-200"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-zinc-100 dark:border-zinc-800/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-3 py-2 text-zinc-700 dark:text-zinc-300"
                >
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
