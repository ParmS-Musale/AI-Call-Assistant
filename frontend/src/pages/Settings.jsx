import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toggle from '../components/ui/Toggle';
import { User, Phone as PhoneIcon, Save, Sun, Moon, MessageSquare } from 'lucide-react';

const statuses = ['Available', 'Busy', 'Playing', 'Driving', 'Sleeping'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [customMessages, setCustomMessages] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setNotificationsEnabled(user.notificationsEnabled ?? true);
      // customMessages may be a Map-like object
      const msgs = {};
      if (user.customMessages) {
        if (user.customMessages instanceof Map) {
          user.customMessages.forEach((v, k) => { msgs[k] = v; });
        } else {
          Object.assign(msgs, user.customMessages);
        }
      }
      statuses.forEach((s) => {
        if (!msgs[s]) msgs[s] = '';
      });
      setCustomMessages(msgs);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/user/profile', { name, phone, notificationsEnabled });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleSaveMessage = async (status) => {
    try {
      const res = await api.put('/user/custom-message', { status, message: customMessages[status] });
      updateUser(res.data);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
          <User size={20} className="text-brand-500" />
          Profile
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-surface-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-surface-500">{user?.email}</p>
            </div>
          </div>
          <Input label="Full Name" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone Number" icon={PhoneIcon} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />

          <Button onClick={handleSaveProfile} disabled={saving} className="mt-2">
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : saved ? (
              'Saved ✓'
            ) : (
              <><Save size={16} /> Save Profile</>
            )}
          </Button>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-surface-500">
                {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`
              relative w-14 h-8 rounded-full transition-colors duration-300
              ${theme === 'dark' ? 'bg-brand-500' : 'bg-surface-300'}
            `}
          >
            <span
              className={`
                absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm
                flex items-center justify-center transition-transform duration-300
                ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
              `}
            >
              {theme === 'dark' ? <Moon size={12} className="text-brand-500" /> : <Sun size={12} className="text-amber-500" />}
            </span>
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Notifications</h2>
        <Toggle
          checked={notificationsEnabled}
          onChange={(val) => {
            setNotificationsEnabled(val);
            api.put('/user/profile', { notificationsEnabled: val }).then((res) => updateUser(res.data)).catch(() => {});
          }}
          label="Push Notifications"
          description="Receive notifications for incoming calls and voicemails"
        />
      </Card>

      {/* Custom Messages */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1 flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-500" />
          Custom AI Messages
        </h2>
        <p className="text-sm text-surface-500 mb-4">Customize what your AI assistant says when you can't take a call</p>

        <div className="space-y-4">
          {statuses.map((status) => (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full status-${status.toLowerCase()}`} />
                  {status}
                </label>
                <span className="text-[10px] text-surface-400">
                  {(customMessages[status] || '').length} / 200
                </span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={customMessages[status] || ''}
                  onChange={(e) => setCustomMessages({ ...customMessages, [status]: e.target.value.slice(0, 200) })}
                  maxLength={200}
                  rows={2}
                  className="flex-1 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-2.5 text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 resize-none transition-all duration-200 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none"
                  placeholder={`Message when you're ${status.toLowerCase()}...`}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="self-end"
                  onClick={() => handleSaveMessage(status)}
                >
                  <Save size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
