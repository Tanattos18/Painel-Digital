import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  error:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
};

export function Alert({ variant = "info", title, children }: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        "rounded-lg border px-4 py-3 text-sm",
        VARIANT_CLASSES[variant],
      ].join(" ")}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <p>{children}</p>
    </div>
  );
}
