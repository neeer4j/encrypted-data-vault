import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface GlassCardProps {
  className?: string;
}

export function GlassCard({ className, children }: PropsWithChildren<GlassCardProps>) {
  return (
    <div className={clsx("glass-panel rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}
