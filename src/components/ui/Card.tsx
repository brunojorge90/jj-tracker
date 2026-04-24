import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`dojo-card rounded-2xl overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ${className}`}
      {...props}
    />
  );
}
