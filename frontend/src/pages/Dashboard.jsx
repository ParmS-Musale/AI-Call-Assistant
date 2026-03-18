import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CallSimulator from '../components/dashboard/CallSimulator';
import {
  Phone,
  PhoneMissed,
  Voicemail,
  ShieldAlert,
  Activity,
  Smile,
  Car,
  Moon,
  Briefcase,
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Here's what's happening with your calls today
          </p>
        </div>
        
        <div className="w-full md:w-auto min-w-[320px]">
          <CallSimulator />
        </div>
      </div>

      {/* Status Toggle */}
      <div className="animate-slide-up [animation-delay:100ms]">
        <Card glass>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-surface-900 dark:text-white">Current Status</h2>
              <p className="text-xs text-surface-500 mt-0.5">Your AI assistant responds based on your status</p>
            </div>
            <StatusBadge status={user?.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {statusConfig.map(({ key, icon: Icon, gradient }, index) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key)}
                disabled={updatingStatus}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 text-sm font-medium
                  ${user?.status === key
                    ? `bg-gradient-to-br ${gradient} text-white shadow-lg ring-2 ring-offset-2 dark:ring-offset-surface-900 ring-transparent`
                    : 'bg-surface-100/50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 hover:scale-[1.02]'
                  }
                `}
                style={{ animationDelay: `${index * 50 + 200}ms` }}
              >
                <div className={`p-2 rounded-xl ${user?.status === key ? 'bg-white/20' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs">{key}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up [animation-delay:200ms]">
        {statCards.map(({ label, value, icon: Icon, color }, index) => (
          <Card key={label} hover className="group hover-lift relative overflow-hidden">
             {/* Subtle background glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{label}</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1 tracking-tight">{value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up [animation-delay:300ms]">
        {/* Chart */}
        <Card glass className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-6">Call Volume — Last 30 Days</h2>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    tickFormatter={(d) => d.slice(5)} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    allowDecimals={false} 
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fill="url(#colorCalls)" 
                    name="Total" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="missed" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    fill="url(#colorMissed)" 
                    name="Missed" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-surface-400 text-sm">
              No call data available yet
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card glass className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentLogs.length === 0 && (
              <div className="text-center py-12">
                <Phone className="mx-auto text-surface-200 dark:text-surface-700 mb-2" size={32} />
                <p className="text-sm text-surface-400">No recent calls</p>
              </div>
            )}
            {recentLogs.map((log, index) => (
              <div
                key={log._id}
                className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/50 dark:hover:bg-surface-800/40 transition-all duration-300 group cursor-pointer"
                style={{ animation: `slideUp 400ms ease-out ${index * 50 + 400}ms forwards`, opacity: 0 }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  log.callType === 'missed' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                  log.callType === 'voicemail' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                  log.callType === 'spam' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                }`}>
                  <Phone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-surface-900 dark:text-white truncate">
                    {log.callerName || log.callerNumber}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate mt-0.5">
                    {log.callSummary || log.callerNumber}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge type={log.callType} />
                  <p className="text-[10px] font-medium text-surface-400 mt-1.5 uppercase tracking-wider">
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
