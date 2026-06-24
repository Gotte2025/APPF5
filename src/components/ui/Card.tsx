import { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
}

export function Card({ className, highlight, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border bg-cancha-800 p-5",
        highlight ? "border-cono/40" : "border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx("text-base font-semibold text-linea", className)} {...props}>
      {children}
    </h3>
  );
}
