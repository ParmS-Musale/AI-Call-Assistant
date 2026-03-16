import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  Phone,
  PhoneMissed,
  Voicemail,
  ShieldAlert,
  Activity,
  Clock,
  User,
  Smile,
  Car,
  Moon,
  Briefcase,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const statusConfig = [
  { key: 'Available', icon: Smile, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'Busy', icon: Briefcase, color: 'red', gradient: 'from-red-500 to-red-600' },
  { key: 'Playing', icon: Activity, color: 'amber', gradient: 'from-amber-500 to-amber-600' },
  { key: 'Driving', icon: Car, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
  { key: 'Sleeping', icon: Moon, color: 'violet', gradient: 'from-violet-500 to-violet-600' },
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/call-logs/stats'),
      api.get('/call-logs?limit=5'),
    ]).then(([statsRes, logsRes]) => {
      setStats(statsRes.data);
      setRecentLogs(logsRes.data.logs);
    }).catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const handleStatusChange = async (status) => {
    if (status === user?.status || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put('/user/status', { status });
      updateUser(res.data);
    } catch {}
    setUpdatingStatus(false);
  };

  if (loadingStats) {
    return <LoadingSpinner size="lg" className="mt-32" />;
  }

  const statCards = [
    { label: 'Total Calls', value: stats?.totalCalls || 0, icon: Phone, color: 'brand' },
    { label: 'Missed Calls', value: stats?.missedCalls || 0, icon: PhoneMissed, color: 'red' },
    { label: 'Voicemails', value: stats?.voicemails || 0, icon: Voicemail, color: 'blue' },
    { label: 'Spam Blocked', value: stats?.spamCalls || 0, icon: ShieldAlert, color: 'amber' },
  ];

  const chartData = (stats?.dailyStats || []).map((d) => ({
    date: d._id,
    calls: d.count,
    missed: d.missed,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Here's what's happening with your calls today
        </p>
      </div>

      {/* Status Toggle */}
      <Card glass>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Current Status</h2>
            <p className="text-xs text-surface-500 mt-0.5">Your AI assistant responds based on your status</p>
          </div>
          <StatusBadge status={user?.status} />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {statusConfig.map(({ key, icon: Icon, gradient }) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={updatingStatus}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 text-sm font-medium
                ${user?.status === key
                  ? `bg-gradient-to-br ${gradient} text-white shadow-lg scale-[1.02]`
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 hover:scale-[1.02]'
                }
              `}
            >
              <Icon size={20} />
              <span className="text-xs">{key}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} hover className="group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">{value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Call Volume — Last 30 Days</h2>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fill="url(#colorCalls)" name="Total" />
                  <Area type="monotone" dataKey="missed" stroke="#ef4444" strokeWidth={2} fill="url(#colorMissed)" name="Missed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-400 text-sm">
              No call data available yet
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentLogs.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-8">No recent calls</p>
            )}
            {recentLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.callType === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                  log.callType === 'voicemail' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                  log.callType === 'spam' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                }`}>
                  <Phone size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {log.callerName || log.callerNumber}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
                    {log.callSummary || log.callerNumber}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge type={log.callType} />
                  <p className="text-[10px] text-surface-400 mt-1">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
