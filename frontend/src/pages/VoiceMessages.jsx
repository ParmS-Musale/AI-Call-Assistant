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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Voice Messages</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Listen to voicemails and read transcriptions</p>
      </div>

      {logs.length === 0 ? (
        <Card glass className="text-center py-24 animate-slide-up [animation-delay:100ms]">
          <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800/50 flex items-center justify-center mx-auto mb-6">
            <Voicemail size={40} className="text-surface-300 dark:text-surface-600" />
          </div>
          <p className="text-xl font-bold text-surface-900 dark:text-white">No voicemails yet</p>
          <p className="text-sm text-surface-500 mt-2 max-w-xs mx-auto">When people call you while you're away, their messages will appear here for you to review.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {logs.map((log, index) => (
            <Card 
              key={log._id} 
              hover 
              glass
              className="flex flex-col hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 50 + 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-brand-500/20">
                    <Phone size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-surface-900 dark:text-white truncate">
                      {log.callerName || 'Unknown Caller'}
                    </p>
                    <p className="text-xs text-surface-500 font-medium">
                      {log.callerNumber}
                    </p>
                  </div>
                </div>
                {log.isSpam && <StatusBadge type="spam" />}
              </div>

              {/* Audio Player */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50/50 dark:bg-surface-800/30 border border-surface-100 dark:border-surface-700/50 mb-4 group/player">
                <button
                  onClick={() => togglePlay(log._id)}
                  className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-brand-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  {playingId === log._id ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-end gap-[3px] h-8 mb-1.5">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          playingId === log._id
                            ? 'bg-brand-500 animate-pulse'
                            : 'bg-surface-300 dark:bg-surface-700 group-hover/player:bg-surface-400 dark:group-hover/player:bg-surface-600'
                        }`}
                        style={{
                          height: `${Math.max(15, Math.random() * 100)}%`,
                          animationDelay: `${i * 30}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[10px] font-bold text-brand-500 tabular-nums">
                      {playingId === log._id ? '0:12' : '0:00'}
                    </span>
                    <span className="text-[10px] font-medium text-surface-400 tabular-nums">
                      {Math.floor(log.duration / 60)}:{String(log.duration % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transcription */}
              {log.transcription && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                      <FileText size={12} className="text-surface-500" />
                    </div>
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Transcription</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-surface-900/30 border border-surface-100 dark:border-surface-800 text-sm text-surface-600 dark:text-surface-400 leading-relaxed italic line-clamp-3">
                    "{log.transcription}"
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-surface-400">
                  <Calendar size={13} className="text-surface-300" />
                  {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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
