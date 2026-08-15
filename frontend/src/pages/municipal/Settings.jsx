import React, { useState } from 'react';
import { Bell, Shield, Globe, Palette, Database, Save } from 'lucide-react';
import Input, { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const SECTIONS = [
  { id: 'general',  label: 'General',       icon: Globe   },
  { id: 'notif',    label: 'Notifications', icon: Bell    },
  { id: 'access',   label: 'Access',        icon: Shield  },
  { id: 'display',  label: 'Display',       icon: Palette },
  { id: 'data',     label: 'Data',          icon: Database},
];

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-primary-500 ${checked ? 'bg-primary-600' : 'bg-secondary-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-fast ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-secondary-100 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-secondary-800">{label}</p>
        {description && <p className="text-xs text-secondary-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const [active, setActive] = useState('general');
  const [saving, setSaving] = useState(false);
  const [toggles, setToggles] = useState({
    emailNotif:      true,
    smsNotif:        false,
    weeklyReport:    true,
    autoAssign:      true,
    citizenVerify:   true,
    publicFeed:      true,
    darkMode:        false,
    compactView:     false,
    autoExport:      false,
  });

  const setToggle = (key) => (val) => setToggles((t) => ({ ...t, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-secondary-900">Settings</h2>
        <p className="text-sm text-secondary-400">Manage portal configuration</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                id={`settings-tab-${id}`}
                className={[
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left',
                  active === id ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700',
                ].join(' ')}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface border border-secondary-200 rounded-lg shadow-card p-6">
          {active === 'general' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">General Settings</h3>
              <div className="space-y-4 mb-6">
                <Input label="Municipality Name" defaultValue="Bruhat Bengaluru Mahanagara Palike" id="settings-muni-name" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" defaultValue="Bengaluru" id="settings-city" />
                  <Input label="State" defaultValue="Karnataka" id="settings-state" />
                </div>
                <Select label="Default Language" id="settings-lang">
                  <option>English</option>
                  <option>Kannada</option>
                  <option>Hindi</option>
                </Select>
                <Select label="Timezone" id="settings-timezone">
                  <option>Asia/Kolkata (IST +5:30)</option>
                </Select>
              </div>
              <SettingRow label="Public Feed" description="Allow citizens to view all complaints in a public feed">
                <Toggle id="toggle-publicfeed" checked={toggles.publicFeed} onChange={setToggle('publicFeed')} />
              </SettingRow>
            </div>
          )}

          {active === 'notif' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Notification Settings</h3>
              <SettingRow label="Email Notifications" description="Receive email alerts for new high-priority complaints">
                <Toggle id="toggle-email" checked={toggles.emailNotif} onChange={setToggle('emailNotif')} />
              </SettingRow>
              <SettingRow label="SMS Notifications" description="Receive SMS for urgent escalations">
                <Toggle id="toggle-sms" checked={toggles.smsNotif} onChange={setToggle('smsNotif')} />
              </SettingRow>
              <SettingRow label="Weekly Summary Report" description="Receive a weekly digest every Monday morning">
                <Toggle id="toggle-weekly" checked={toggles.weeklyReport} onChange={setToggle('weeklyReport')} />
              </SettingRow>
            </div>
          )}

          {active === 'access' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Access & Workflow</h3>
              <SettingRow label="Auto-assign Complaints" description="Automatically route complaints to departments based on category">
                <Toggle id="toggle-autoassign" checked={toggles.autoAssign} onChange={setToggle('autoAssign')} />
              </SettingRow>
              <SettingRow label="Citizen Resolution Verification" description="Ask citizens to confirm resolution before closing complaints">
                <Toggle id="toggle-citizenverify" checked={toggles.citizenVerify} onChange={setToggle('citizenVerify')} />
              </SettingRow>
            </div>
          )}

          {active === 'display' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Display Preferences</h3>
              <SettingRow label="Dark Mode" description="Switch the portal to dark mode (coming soon)">
                <Toggle id="toggle-dark" checked={toggles.darkMode} onChange={setToggle('darkMode')} />
              </SettingRow>
              <SettingRow label="Compact Table View" description="Reduce row height in tables for higher information density">
                <Toggle id="toggle-compact" checked={toggles.compactView} onChange={setToggle('compactView')} />
              </SettingRow>
            </div>
          )}

          {active === 'data' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Data Management</h3>
              <SettingRow label="Auto Export Reports" description="Automatically export monthly reports to CSV">
                <Toggle id="toggle-export" checked={toggles.autoExport} onChange={setToggle('autoExport')} />
              </SettingRow>
              <div className="mt-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <p className="text-xs font-medium text-secondary-700 mb-2">Data Export</p>
                <p className="text-xs text-secondary-400 mb-3">Download all complaint data as CSV for external analysis.</p>
                <Button variant="ghost" size="sm">Export All Data (CSV)</Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-secondary-100 flex justify-end">
            <Button variant="primary" icon={Save} loading={saving} onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
