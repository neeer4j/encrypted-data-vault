import { GlassCard } from "./GlassCard";

export function DashboardPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Vault status</p>
        <h3 className="text-xl font-semibold">All systems normal</h3>
        <p className="text-sm text-ink-600">Encryption active. Session secured.</p>
      </GlassCard>
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Recent activity</p>
        <h3 className="text-xl font-semibold">No recent changes</h3>
        <p className="text-sm text-ink-600">Upload files or create a note.</p>
      </GlassCard>
      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Storage</p>
        <h3 className="text-xl font-semibold">Vault Drive</h3>
        <p className="text-sm text-ink-600">Organize files into folders.</p>
      </GlassCard>
      <GlassCard className="lg:col-span-3 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Quick tips</p>
        <ul className="text-sm text-ink-600 space-y-1">
          <li>Use the Drive tab to manage folders and file placement.</li>
          <li>Upload from the top bar or drag files into the window.</li>
          <li>Lock the vault from the left panel when stepping away.</li>
        </ul>
      </GlassCard>
    </div>
  );
}
