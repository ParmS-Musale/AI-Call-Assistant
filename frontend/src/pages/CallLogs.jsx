import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Search, ChevronLeft, ChevronRight, Phone, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const callTypes = ['all', 'answered', 'missed', 'voicemail', 'spam'];

export default function CallLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (type !== 'all') params.type = type;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/call-logs', { params });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, [type, search]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/call-logs/${id}`);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch {}
  };

  const formatDuration = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Call Logs</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">View and manage your call history</p>
      </div>

      {/* Filters */}
      <Card glass className="!p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by name, number, or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-surface-900 dark:text-surface-100 placeholder-surface-400 transition-all duration-200 outline-none"
            />
          </div>

          {/* Type tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-surface-100 dark:bg-surface-800">
            {callTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
                  type === t
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="mt-16" />
      ) : logs.length === 0 ? (
        <Card className="text-center py-16">
          <Phone size={40} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
          <p className="text-surface-500 dark:text-surface-400">No call logs found</p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400">Caller</th>
                  <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400 hidden md:table-cell">Status During</th>
                  <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400 hidden lg:table-cell">Duration</th>
                  <th className="text-left px-5 py-3 font-medium text-surface-500 dark:text-surface-400">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-surface-500 dark:text-surface-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <>
                    <tr
                      key={log._id}
                      className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-surface-900 dark:text-white">{log.callerName || 'Unknown'}</p>
                        <p className="text-xs text-surface-500">{log.callerNumber}</p>
                      </td>
                      <td className="px-5 py-3"><StatusBadge type={log.callType} /></td>
                      <td className="px-5 py-3 hidden md:table-cell"><StatusBadge status={log.userStatusDuringCall} /></td>
                      <td className="px-5 py-3 hidden lg:table-cell text-surface-600 dark:text-surface-400">{formatDuration(log.duration)}</td>
                      <td className="px-5 py-3 text-surface-600 dark:text-surface-400">
                        {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        <span className="text-xs text-surface-400 ml-1">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === log._id ? null : log._id); }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          >
                            {expandedId === log._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(log._id); }}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === log._id && (
                      <tr key={`${log._id}-detail`} className="bg-surface-50 dark:bg-surface-800/30">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {log.aiResponse && (
                              <div>
                                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">AI Response</p>
                                <p className="text-surface-700 dark:text-surface-300">{log.aiResponse}</p>
                              </div>
                            )}
                            {log.callSummary && (
                              <div>
                                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Call Summary</p>
                                <p className="text-surface-700 dark:text-surface-300">{log.callSummary}</p>
                              </div>
                            )}
                            {log.transcription && (
                              <div className="md:col-span-2">
                                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Transcription</p>
                                <p className="text-surface-700 dark:text-surface-300">{log.transcription}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-200 dark:border-surface-700">
              <p className="text-xs text-surface-500">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
