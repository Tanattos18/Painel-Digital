type SpinnerProps = {
  label?: string;
  className?: string;
};

export function Spinner({ label = "Carregando", className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={[
        "inline-block size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900",
        "dark:border-zinc-700 dark:border-t-zinc-100",
        className ?? "",
      ].join(" ")}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
