import { GlassCard } from "./GlassCard";

export function SettingsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold">Vault settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Auto-lock</p>
            <p className="text-xs text-ink-300">Locks after inactivity</p>
          </div>
          <button className="px-3 py-2 rounded-xl bg-white/10">5 minutes</button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Hidden folders</p>
            <p className="text-xs text-ink-300">Mask sensitive collections</p>
          </div>
          <button className="px-3 py-2 rounded-xl bg-white/10">Manage</button>
        </div>
      </GlassCard>
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold">Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Session cleanup</p>
            <p className="text-xs text-ink-300">Secure memory zeroization</p>
          </div>
          <span className="text-xs text-ink-100">Enabled</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Backup/export</p>
            <p className="text-xs text-ink-300">Encrypted vault archive</p>
          </div>
          <button className="px-3 py-2 rounded-xl bg-white/10">Create</button>
        </div>
      </GlassCard>
    </div>
  );
}
