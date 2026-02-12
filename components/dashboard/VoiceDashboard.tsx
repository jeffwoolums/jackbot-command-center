'use client';

import { useState, useRef } from 'react';

// Voice data with ElevenLabs IDs
const voices = [
  {
    id: 'jackbot',
    name: 'Jackbot',
    persona: 'The Brain — sophisticated, strategic',
    voiceId: '9T9vSqRrPPxIs5wpyZfK',
    file: '/voices/jackbot.mp3',
    color: 'from-blue-500 to-cyan-500',
    emoji: '🤖',
    quality: 95,
    provider: 'ElevenLabs'
  },
  {
    id: 'codex',
    name: 'Codex / Samuel',
    persona: 'The Muscle — rough, gets shit done',
    voiceId: 'vDchjyOZZytffNeZXfZK',
    file: '/voices/codex.mp3',
    color: 'from-orange-500 to-red-500',
    emoji: '💪',
    quality: 92,
    provider: 'ElevenLabs'
  },
  {
    id: 'tayler',
    name: 'Tayler',
    persona: 'GenX — raspy undertones, no-nonsense',
    voiceId: '3AvFKjwBVQoGCFjmz5ib',
    file: '/voices/tayler.mp3',
    color: 'from-purple-500 to-pink-500',
    emoji: '🎸',
    quality: 90,
    provider: 'ElevenLabs'
  },
  {
    id: 'kimi',
    name: 'KIMI / Amelie',
    persona: 'French pastry chef — professional, fun',
    voiceId: 'xNtG3W2oqJs0cJZuTyBc',
    file: '/voices/kimi.mp3',
    color: 'from-pink-500 to-rose-500',
    emoji: '🥐',
    quality: 94,
    provider: 'ElevenLabs'
  },
  {
    id: 'surfsup',
    name: 'Surfs Up',
    persona: 'Chill surfer dude — laid back vibes',
    voiceId: 'Mtmp3KhFIjYpWYRycDe3',
    file: '/voices/surfsup.mp3',
    color: 'from-teal-500 to-emerald-500',
    emoji: '🏄',
    quality: 88,
    provider: 'ElevenLabs'
  },
  {
    id: 'sara',
    name: 'SultrySara',
    persona: 'Sultry — FRIDAY voice clone',
    voiceId: 'local-friday',
    file: '',
    color: 'from-red-500 to-pink-600',
    emoji: '🔥',
    quality: 85,
    provider: 'Local XTTS'
  }
];

const ttsEngines = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    status: 'online',
    cost: '$5-22/mo',
    voices: 5,
    quality: 'Premium',
    color: 'text-green-400'
  },
  {
    id: 'xtts',
    name: 'Local XTTS v2',
    status: 'online',
    cost: 'FREE',
    voices: 1,
    quality: 'Good',
    color: 'text-blue-400'
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    status: 'standby',
    cost: '$30/1M chars',
    voices: 6,
    quality: 'Backup',
    color: 'text-yellow-400'
  }
];

type TabType = 'voices' | 'engines' | 'test';

export default function VoiceDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('voices');
  const [playing, setPlaying] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [testText, setTestText] = useState("Hello! I'm ready to help you build something amazing today.");
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoice = (voice: typeof voices[0]) => {
    if (!voice.file) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (playing === voice.id) {
      setPlaying(null);
      return;
    }
    
    const audio = new Audio(voice.file);
    audioRef.current = audio;
    audio.playbackRate = speed;
    audio.play();
    setPlaying(voice.id);
    audio.onended = () => setPlaying(null);
  };

  const generateCustom = async () => {
    if (!selectedVoice || !testText.trim() || selectedVoice.voiceId === 'local-friday') return;
    
    setGenerating(true);
    try {
      const res = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: selectedVoice.voiceId,
          text: testText,
          stability,
          similarity,
        })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) audioRef.current.pause();
        
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = speed;
        audio.play();
        setPlaying('custom');
        audio.onended = () => setPlaying(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Generation failed - check ElevenLabs credits');
      }
    } catch (e) {
      console.error('Generate failed:', e);
    }
    setGenerating(false);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🎙️ Voice Dashboard
        </h2>
        <div className="flex gap-1">
          {(['voices', 'engines', 'test'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'voices' && '🎭 Voices'}
              {tab === 'engines' && '⚙️ Engines'}
              {tab === 'test' && '🔊 Test'}
            </button>
          ))}
        </div>
      </div>

      {/* VOICES TAB */}
      {activeTab === 'voices' && (
        <div className="p-4">
          <div className="space-y-2">
            {voices.map((voice) => (
              <div
                key={voice.id}
                onClick={() => { setSelectedVoice(voice); setActiveTab('test'); }}
                className={`
                  relative p-3 rounded-lg border transition-all cursor-pointer group
                  ${selectedVoice?.id === voice.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'}
                `}
              >
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${voice.color} opacity-5`} />
                
                <div className="relative flex items-center gap-3">
                  <span className="text-2xl">{voice.emoji}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{voice.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        voice.provider === 'ElevenLabs' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {voice.provider}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{voice.persona}</span>
                  </div>
                  
                  {/* Quality Bar */}
                  <div className="w-20">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Quality</span>
                      <span className="text-amber-400">{voice.quality}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                        style={{ width: `${voice.quality}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  {voice.file && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playVoice(voice); }}
                      className={`p-2 rounded-full transition-colors ${
                        playing === voice.id 
                          ? 'bg-green-500 text-black' 
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {playing === voice.id ? '⏹' : '▶'}
                    </button>
                  )}
                  
                  {!voice.file && (
                    <span className="text-xs text-yellow-500 px-2">Setup needed</span>
                  )}
                  
                  {/* Go to Test hint */}
                  <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Test →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENGINES TAB */}
      {activeTab === 'engines' && (
        <div className="p-4 space-y-3">
          {ttsEngines.map((engine) => (
            <div 
              key={engine.id}
              className="p-4 rounded-lg bg-slate-800 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    engine.status === 'online' ? 'bg-green-500' :
                    engine.status === 'standby' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-bold text-white">{engine.name}</span>
                  <span className={`text-xs ${engine.color}`}>{engine.status}</span>
                </div>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                  {engine.cost}
                </span>
              </div>
              
              <div className="flex gap-4 text-sm text-slate-400">
                <span>🎭 {engine.voices} voices</span>
                <span>⭐ {engine.quality}</span>
              </div>
            </div>
          ))}
          
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <span>💡</span>
                <span>ElevenLabs = best quality. Local XTTS = free. OpenAI = backup.</span>
              </div>
              <button
                onClick={() => setActiveTab('test')}
                className="text-xs bg-amber-500 text-black px-3 py-1 rounded font-bold hover:bg-amber-400 transition-colors"
              >
                Test Voice →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST TAB */}
      {activeTab === 'test' && (
        <div className="p-4 space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => setActiveTab('voices')} className="hover:text-amber-400 transition-colors">
              🎭 Voices
            </button>
            <span>→</span>
            <span className="text-amber-400">{selectedVoice.name}</span>
            <span>→</span>
            <span className="text-white">🔊 Test</span>
          </div>
          
          {/* Selected Voice */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-amber-500/30">
            <span className="text-2xl">{selectedVoice.emoji}</span>
            <div>
              <span className="font-bold text-amber-400">{selectedVoice.name}</span>
              <span className="text-xs text-slate-400 block">{selectedVoice.persona}</span>
            </div>
            <button
              onClick={() => setActiveTab('voices')}
              className="ml-auto text-xs text-slate-400 hover:text-white"
            >
              Change ↗
            </button>
          </div>
          
          {/* Test Text */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Test Text</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500"
              rows={3}
              placeholder="Enter text to speak..."
            />
          </div>
          
          {/* Sliders */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Stability</span>
                <span className="text-amber-400">{stability.toFixed(2)}</span>
              </label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Variable</span>
                <span>Stable</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Clarity</span>
                <span className="text-amber-400">{similarity.toFixed(2)}</span>
              </label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={similarity}
                onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 flex justify-between mb-1">
                <span>Speed</span>
                <span className="text-amber-400">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range" min="0.5" max="2" step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.5x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => selectedVoice.file && playVoice(selectedVoice)}
              disabled={!selectedVoice.file}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ▶ Play Sample
            </button>
            
            <button
              onClick={generateCustom}
              disabled={generating || !testText.trim() || selectedVoice.voiceId === 'local-friday'}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {generating ? '⏳ Generating...' : '🔊 Generate New'}
            </button>
          </div>
          
          {selectedVoice.voiceId === 'local-friday' && (
            <p className="text-xs text-yellow-500 text-center">
              ⚠️ SultrySara uses local XTTS — generate not available in UI yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
