import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </p>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
