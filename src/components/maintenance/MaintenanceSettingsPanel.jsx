import React from 'react';
import {
  Wrench,
  Globe,
  Megaphone,
  Phone,
  UserCheck,
  Headphones,
  Clock,
  Bell,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Settings,
} from 'lucide-react';

/* ─── Toggle (matches PlatformConfig toggle) ─────────────────────────── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    } ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

/* ─── Status Badge ────────────────────────────────────────────────────── */
const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
      active
        ? 'bg-amber-50 text-amber-600 border border-amber-200'
        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

/* ─── Module Config ───────────────────────────────────────────────────── */
const MODULE_CONFIG = [
  { id: 'marketing', label: 'Marketing', icon: Megaphone, color: 'blue' },
  { id: 'sales', label: 'Sales', icon: Phone, color: 'green' },
  { id: 'post-sales', label: 'Post-Sales', icon: UserCheck, color: 'purple' },
  { id: 'support', label: 'Support', icon: Headphones, color: 'orange' },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-200' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50',  icon: 'text-orange-600',  border: 'border-orange-200' },
};

/* ═══════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

const MaintenanceSettingsPanel = ({ config, setConfig, onSave, saving }) => {
  const maintenance = config.maintenance || {
    global: { enabled: false, reason: '', eta: '', scheduled_start: '', scheduled_end: '', notify_users: false },
    modules: {
      marketing: { enabled: false, reason: '', eta: '' },
      sales: { enabled: false, reason: '', eta: '' },
      'post-sales': { enabled: false, reason: '', eta: '' },
      support: { enabled: false, reason: '', eta: '' },
    },
  };

  const updateGlobal = (field, value) => {
    setConfig(prev => ({
      ...prev,
      maintenance_mode: field === 'enabled' ? value : (prev.maintenance?.global?.enabled || false),
      maintenance: {
        ...prev.maintenance,
        global: {
          ...(prev.maintenance?.global || {}),
          [field]: value,
        },
      },
    }));
  };

  const updateModule = (moduleId, field, value) => {
    setConfig(prev => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        modules: {
          ...(prev.maintenance?.modules || {}),
          [moduleId]: {
            ...(prev.maintenance?.modules?.[moduleId] || {}),
            [field]: value,
          },
        },
      },
    }));
  };

  const globalEnabled = maintenance.global?.enabled || false;
  const anyModuleActive = Object.values(maintenance.modules || {}).some(m => m?.enabled);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Maintenance Mode</h3>
            <p className="text-sm text-gray-500 mt-0.5">Control platform access during maintenance windows</p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ─── Global Maintenance ──────────────────────────────────────── */}
      <div className="p-6 border-b border-gray-100">
        <div
          className={`rounded-xl border-2 p-5 transition-all duration-200 ${
            globalEnabled
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                globalEnabled ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <Globe size={20} className={globalEnabled ? 'text-amber-600' : 'text-gray-400'} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <p className="font-bold text-gray-900">Enable Global Maintenance Mode</p>
                  <StatusBadge active={globalEnabled} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  Disables access to the entire platform for all non-admin users
                </p>
              </div>
            </div>
            <Toggle
              checked={globalEnabled}
              onChange={(val) => updateGlobal('enabled', val)}
            />
          </div>

          {/* Expanded fields when enabled */}
          {globalEnabled && (
            <div className="space-y-4 mt-5 pt-5 border-t border-amber-200">
              {/* Reason */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <MessageSquare size={12} />
                  Maintenance Reason
                </label>
                <input
                  type="text"
                  value={maintenance.global?.reason || ''}
                  onChange={(e) => updateGlobal('reason', e.target.value)}
                  placeholder="e.g. Database migration in progress"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* ETA */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                  <Clock size={12} />
                  Estimated Downtime
                </label>
                <input
                  type="text"
                  value={maintenance.global?.eta || ''}
                  onChange={(e) => updateGlobal('eta', e.target.value)}
                  placeholder="e.g. 30 minutes"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Calendar size={12} />
                    Scheduled Start
                  </label>
                  <input
                    type="datetime-local"
                    value={maintenance.global?.scheduled_start || ''}
                    onChange={(e) => updateGlobal('scheduled_start', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                    <Calendar size={12} />
                    Scheduled End
                  </label>
                  <input
                    type="datetime-local"
                    value={maintenance.global?.scheduled_end || ''}
                    onChange={(e) => updateGlobal('scheduled_end', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Notify Users */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-700">Notify users about maintenance</span>
                </div>
                <Toggle
                  checked={maintenance.global?.notify_users || false}
                  onChange={(val) => updateGlobal('notify_users', val)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Module-Level Maintenance ────────────────────────────────── */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={16} className="text-gray-400" />
          <h4 className="text-sm font-bold text-gray-900">Module-Level Maintenance</h4>
          {anyModuleActive && (
            <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {Object.values(maintenance.modules || {}).filter(m => m?.enabled).length} module(s) active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULE_CONFIG.map((mod) => {
            const Icon = mod.icon;
            const colors = colorMap[mod.color];
            const moduleState = maintenance.modules?.[mod.id] || { enabled: false, reason: '', eta: '' };
            const isActive = moduleState.enabled;

            return (
              <div
                key={mod.id}
                className={`border rounded-xl p-4 transition-all duration-200 ${
                  isActive
                    ? 'border-amber-300 bg-amber-50'
                    : `${colors.border} ${colors.bg}`
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-amber-100' : colors.bg
                    }`}>
                      <Icon size={20} className={isActive ? 'text-amber-600' : colors.icon} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{mod.label}</p>
                      <StatusBadge active={isActive} />
                    </div>
                  </div>
                  <Toggle
                    checked={isActive}
                    onChange={(val) => updateModule(mod.id, 'enabled', val)}
                  />
                </div>

                {/* Expanded fields when active */}
                {isActive && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-amber-200">
                    <input
                      type="text"
                      value={moduleState.reason || ''}
                      onChange={(e) => updateModule(mod.id, 'reason', e.target.value)}
                      placeholder="Reason (optional)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <input
                      type="text"
                      value={moduleState.eta || ''}
                      onChange={(e) => updateModule(mod.id, 'eta', e.target.value)}
                      placeholder="ETA (e.g. 15 min)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSettingsPanel;
