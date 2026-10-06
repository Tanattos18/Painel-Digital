import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-900 text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  secondary:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-md font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
