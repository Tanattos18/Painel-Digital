type SpinnerProps = {
  label?: string;
  className?: string;
};

export function Spinner({ label = "Carregando", className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={[
        "inline-block size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-600",
        "dark:border-zinc-700 dark:border-t-brand-500",
        className ?? "",
      ].join(" ")}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
