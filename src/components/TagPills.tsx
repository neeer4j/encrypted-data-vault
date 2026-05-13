interface TagPillsProps {
  tags: string[];
}

export function TagPills({ tags }: TagPillsProps) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="text-xs px-2 py-1 retro-chip">
          {tag}
        </span>
      ))}
    </div>
  );
}
