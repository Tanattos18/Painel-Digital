import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={[
        "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900",
        className ?? "",
      ].join(" ")}
    >
      {title && (
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
