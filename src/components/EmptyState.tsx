import { GlassCard } from "./GlassCard";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassCard className="text-center py-16">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-ink-600 mt-3 max-w-md mx-auto text-sm">{description}</p>
    </GlassCard>
  );
}
