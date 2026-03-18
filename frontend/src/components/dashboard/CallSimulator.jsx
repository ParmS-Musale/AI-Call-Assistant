import { useState } from 'react';
import axios from 'axios';
import { Play, Square, Loader2, PhoneCall } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function CallSimulator() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastMessage, setLastMessage] = useState('');

  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const startSimulation = async () => {
    if (loading || isPlaying) return;
    
    setLoading(true);
    setLastMessage('');
    
    try {
      // Use raw axios to bypass the /api base URL
      const response = await axios.post('/webhook/incoming-call', {
        From: '+15550009999', // Test number
        To: user?.phone || '+1234567890',
        CallSid: 'SIM_' + Math.random().toString(36).substring(7)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Parse the TwiML XML to find <Say> tags
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const sayTags = xmlDoc.getElementsByTagName('Say');
      
      const messages = Array.from(sayTags).map(tag => tag.textContent);
      const fullText = messages.join('. ');
      
      if (!fullText) {
        throw new Error('No AI response generated');
      }

      setLastMessage(fullText);
      playVoice(fullText);
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Simulation failed. Make sure your Phone Number in Settings matches the Twilio number!');
    } finally {
      setLoading(false);
    }
  };

  const playVoice = (text) => {
    // Basic Web Speech API usage
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Pick a good voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') && v.name.includes('English')) 
                         || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = 1.0;
    utterance.rate = 0.9; // Slightly slower for clarity
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100/50 dark:border-brand-900/20">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <PhoneCall size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">Call Simulator (Free)</h3>
          <p className="text-xs text-surface-500 dark:text-surface-400">Hear how your AI sounds right now</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Button 
            variant="danger" 
            size="sm" 
            className="rounded-xl flex items-center gap-2"
            onClick={stopPlayback}
          >
            <Square size={16} fill="currentColor" />
            Stop
          </Button>
        ) : (
          <Button 
            variant="brand" 
            size="sm" 
            className="rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/20"
            onClick={startSimulation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            Simulate Call
          </Button>
        )}
      </div>

      {lastMessage && (
        <div className="hidden lg:block absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full pt-2 w-full max-w-md">
           <div className="p-3 rounded-2xl bg-white dark:bg-surface-800 shadow-xl border border-surface-100 dark:border-surface-700 animate-fade-in relative">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-surface-800 rotate-45 border-l border-t border-surface-100 dark:border-surface-700" />
              <p className="text-[11px] text-surface-600 dark:text-surface-300 italic">"{lastMessage}"</p>
           </div>
        </div>
      )}
    </div>
  );
}
