import { useState } from 'react';
import { Save, User, Bell, AlertTriangle, Clock, Globe, Shield } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { Field, Toggle, inputClass, selectClass } from '../components/common/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STORAGE_KEY = 'cloudops.settings';

const DEFAULT_SETTINGS = {
  notifications: { emailAlerts: true, slackAlerts: false, smsAlerts: false, weeklyDigest: true },
  alertPrefs: { cpuThreshold: 80, memoryThreshold: 80, diskThreshold: 85 },
  refreshInterval: '30',
  defaultRegion: 'us-east-1',
  security: { twoFactor: true, sessionTimeout: false },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const stored = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...stored.notifications },
      alertPrefs: { ...DEFAULT_SETTINGS.alertPrefs, ...stored.alertPrefs },
      security: { ...DEFAULT_SETTINGS.security, ...stored.security },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-navy-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-navy-100 p-2">
          <Icon size={20} className="text-navy-700" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { success } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@cloudops.io',
  });
  const [savedSettings] = useState(loadSettings);
  const [notifications, setNotifications] = useState(savedSettings.notifications);
  const [alertPrefs, setAlertPrefs] = useState(savedSettings.alertPrefs);
  const [refreshInterval, setRefreshInterval] = useState(savedSettings.refreshInterval);
  const [defaultRegion, setDefaultRegion] = useState(savedSettings.defaultRegion);
  const [security, setSecurity] = useState(savedSettings.security);
  const [currentPassword, setCurrentPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ notifications, alertPrefs, refreshInterval, defaultRegion, security })
      );
      setSaved(true);
      success('Settings saved');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Storage unavailable (private mode/quota) — keep in-memory state only.
      setSaved(false);
      success('Settings applied for this session (storage unavailable)');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your CloudOps Command Center preferences" />

      <div className="space-y-6">
        <SettingsSection icon={User} title="Profile Settings">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" htmlFor="settings-name">
              <input id="settings-name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Email Address" htmlFor="settings-email">
              <input id="settings-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection icon={Bell} title="Notification Preferences">
          <Toggle id="notify-email" enabled={notifications.emailAlerts} onChange={(v) => setNotifications({ ...notifications, emailAlerts: v })} label="Email Alerts" description="Receive alert notifications via email" />
          <Toggle id="notify-slack" enabled={notifications.slackAlerts} onChange={(v) => setNotifications({ ...notifications, slackAlerts: v })} label="Slack Notifications" description="Send alerts to Slack channel" />
          <Toggle id="notify-sms" enabled={notifications.smsAlerts} onChange={(v) => setNotifications({ ...notifications, smsAlerts: v })} label="SMS Alerts" description="Critical alerts via SMS" />
          <Toggle id="notify-digest" enabled={notifications.weeklyDigest} onChange={(v) => setNotifications({ ...notifications, weeklyDigest: v })} label="Weekly Digest" description="Weekly summary of infrastructure health" />
        </SettingsSection>

        <SettingsSection icon={AlertTriangle} title="Alert Thresholds">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="CPU Threshold (%)" htmlFor="threshold-cpu">
              <input id="threshold-cpu" type="number" min="0" max="100" value={alertPrefs.cpuThreshold} onChange={(e) => setAlertPrefs({ ...alertPrefs, cpuThreshold: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Memory Threshold (%)" htmlFor="threshold-memory">
              <input id="threshold-memory" type="number" min="0" max="100" value={alertPrefs.memoryThreshold} onChange={(e) => setAlertPrefs({ ...alertPrefs, memoryThreshold: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Disk Threshold (%)" htmlFor="threshold-disk">
              <input id="threshold-disk" type="number" min="0" max="100" value={alertPrefs.diskThreshold} onChange={(e) => setAlertPrefs({ ...alertPrefs, diskThreshold: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection icon={Clock} title="Dashboard Preferences">
          <Field label="Dashboard Refresh Interval" htmlFor="settings-refresh">
            <select id="settings-refresh" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className={selectClass}>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </Field>
        </SettingsSection>

        <SettingsSection icon={Globe} title="Default Region">
          <Field label="Default AWS Region" htmlFor="settings-region">
            <select id="settings-region" value={defaultRegion} onChange={(e) => setDefaultRegion(e.target.value)} className={selectClass}>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </Field>
        </SettingsSection>

        <SettingsSection icon={Shield} title="Security Settings">
          <Toggle id="security-2fa" enabled={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} label="Two-Factor Authentication" description="Add an extra layer of security to your account" />
          <Toggle id="security-timeout" enabled={security.sessionTimeout} onChange={(v) => setSecurity({ ...security, sessionTimeout: v })} label="Session Timeout" description="Auto-logout after 30 minutes of inactivity" />
          <div className="mt-3">
            <Field label="Current Password" htmlFor="settings-password">
              <input
                id="settings-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password to confirm changes"
                className={inputClass}
              />
            </Field>
          </div>
        </SettingsSection>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-sm">
            <Save size={16} aria-hidden="true" />
            Save Settings
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Settings saved successfully!</span>}
        </div>
      </div>
    </div>
  );
}
