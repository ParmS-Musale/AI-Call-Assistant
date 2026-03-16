import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Voicemail, Play, Pause, Phone, FileText, Calendar } from 'lucide-react';

export default function VoiceMessages() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    api.get('/call-logs', { params: { type: 'voicemail', limit: 50 } })
      .then((res) => setLogs(res.data.logs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id);
  };

  if (loading) return <LoadingSpinner size="lg" className="mt-32" />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Voice Messages</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Listen to voicemails and read transcriptions</p>
      </div>

      {logs.length === 0 ? (
        <Card className="text-center py-16">
          <Voicemail size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
          <p className="text-lg font-medium text-surface-500 dark:text-surface-400">No voicemails yet</p>
          <p className="text-sm text-surface-400 mt-1">Voicemails from callers will appear here</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {logs.map((log) => (
            <Card key={log._id} hover className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{log.callerName || 'Unknown'}</p>
                    <p className="text-xs text-surface-500">{log.callerNumber}</p>
                  </div>
                </div>
                {log.isSpam && <StatusBadge type="spam" />}
              </div>

              {/* Audio Player (mock — shows play button + duration bar) */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 dark:bg-surface-800 mb-3">
                <button
                  onClick={() => togglePlay(log._id)}
                  className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-brand-500/20 hover:scale-105 transition-transform"
                >
                  {playingId === log._id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <div className="flex-1">
                  {/* Waveform placeholder */}
                  <div className="flex items-end gap-[2px] h-6">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-200 ${
                          playingId === log._id
                            ? 'bg-brand-500 animate-pulse'
                            : 'bg-surface-300 dark:bg-surface-600'
                        }`}
                        style={{
                          height: `${Math.max(15, Math.random() * 100)}%`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-surface-400">
                      {playingId === log._id ? '0:12' : '0:00'}
                    </span>
                    <span className="text-[10px] text-surface-400">
                      {Math.floor(log.duration / 60)}:{String(log.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcription */}
              {log.transcription && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={12} className="text-surface-400" />
                    <span className="text-[10px] font-semibold text-surface-400 uppercase">Transcription</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-3">
                    {log.transcription}
                  </p>
                </div>
              )}

              {/* AI Summary */}
              {log.callSummary && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={12} className="text-brand-400" />
                    <span className="text-[10px] font-semibold text-brand-400 uppercase">AI Summary</span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2">
                    {log.callSummary}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-surface-400">
                  <Calendar size={12} />
                  {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <StatusBadge status={log.userStatusDuringCall} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
