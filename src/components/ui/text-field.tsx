import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const invalid = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
      >
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={invalid || undefined}
        aria-describedby={
          invalid ? hintId : hint ? hintId : undefined
        }
        className={[
          "rounded-md border bg-white px-3 py-2 text-sm text-zinc-900",
          "placeholder:text-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
          invalid
            ? "border-red-500"
            : "border-zinc-300 dark:border-zinc-700",
          className ?? "",
        ].join(" ")}
        {...props}
      />
      {(error ?? hint) && (
        <p
          id={hintId}
          className={
            invalid
              ? "text-sm text-red-600 dark:text-red-400"
              : "text-sm text-zinc-500 dark:text-zinc-400"
          }
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
