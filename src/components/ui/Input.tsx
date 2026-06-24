import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-linea-dim">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "rounded-md border bg-black/20 px-3 py-2.5 text-sm text-linea placeholder:text-linea-dim/50",
            "focus:outline-none focus:ring-2 focus:ring-cono/50",
            error ? "border-rojo" : "border-white/15",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rojo">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
