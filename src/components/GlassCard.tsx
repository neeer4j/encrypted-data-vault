import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface GlassCardProps {
  className?: string;
}

export function GlassCard({ className, children }: PropsWithChildren<GlassCardProps>) {
  return (
    <div className={clsx("glass-panel p-4", className)}>
      {children}
    </div>
  );
}
