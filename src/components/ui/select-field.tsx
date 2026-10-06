import { useId, type SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
  error?: string;
};

export function SelectField({
  label,
  options,
  hint,
  error,
  id,
  className,
  ...props
}: SelectFieldProps) {
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
      <select
        id={fieldId}
        aria-invalid={invalid || undefined}
        aria-describedby={
          invalid ? hintId : hint ? hintId : undefined
        }
        className={[
          "rounded-md border bg-white px-3 py-2 text-sm text-zinc-900",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500",
          invalid
            ? "border-red-500"
            : "border-zinc-300 dark:border-zinc-700",
          "dark:bg-zinc-900 dark:text-zinc-100",
          className ?? "",
        ].join(" ")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
