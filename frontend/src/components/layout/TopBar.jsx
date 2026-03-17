import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Sun, Moon, Bell, Search } from 'lucide-react';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleDropdown = () => {
    if (!isDropdownOpen) fetchNotifications();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass-strong border-b border-surface-200 dark:border-surface-700">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search calls, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-surface-100 dark:bg-surface-800 border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-surface-900 dark:text-surface-100 placeholder-surface-400 transition-all duration-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300 group"
            aria-label="Toggle theme"
          >
            <div className="group-hover:rotate-12 group-active:scale-95 transition-transform duration-200">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleToggleDropdown}
              className="relative p-2.5 rounded-xl text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300 group"
              aria-label="Notifications"
            >
              <div className="group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                <Bell size={20} />
              </div>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse-slow ring-2 ring-white dark:ring-surface-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-xl overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                  <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && <span className="text-xs text-brand-500 font-medium">{unreadCount} new</span>}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-surface-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkAsRead(n._id)}
                        className={`p-4 border-b border-surface-50 dark:border-surface-800/50 flex gap-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors ${!n.read ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'voicemail' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          <Bell size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{n.title}</p>
                          <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-surface-400 mt-2">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          {user && (
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white text-sm font-bold ml-1 shadow-md shadow-brand-500/20">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
