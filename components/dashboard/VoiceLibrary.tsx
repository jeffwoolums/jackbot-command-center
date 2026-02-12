'use client';

import { useState, useRef } from 'react';

interface Voice {
  id: string;
  name: string;
  persona: string;
  voiceId: string;
  file: string;
  color: string;
  emoji: string;
}

const voices: Voice[] = [
  {
    id: 'jackbot',
    name: 'Jackbot',
    persona: 'The Brain — sophisticated, strategic',
    voiceId: '9T9vSqRrPPxIs5wpyZfK',
    file: '/voices/jackbot.mp3',
    color: 'from-blue-500 to-cyan-500',
    emoji: '🤖'
  },
  {
    id: 'codex',
    name: 'Codex / Samuel',
    persona: 'The Muscle — rough, gets shit done',
    voiceId: 'vDchjyOZZytffNeZXfZK',
    file: '/voices/codex.mp3',
    color: 'from-orange-500 to-red-500',
    emoji: '💪'
  },
  {
    id: 'tayler',
    name: 'Tayler',
    persona: 'GenX — raspy undertones, no-nonsense',
    voiceId: '3AvFKjwBVQoGCFjmz5ib',
    file: '/voices/tayler.mp3',
    color: 'from-purple-500 to-pink-500',
    emoji: '🎸'
  },
  {
    id: 'kimi',
    name: 'KIMI / Amelie',
    persona: 'French pastry chef — professional, fun',
    voiceId: 'xNtG3W2oqJs0cJZuTyBc',
    file: '/voices/kimi.mp3',
    color: 'from-pink-500 to-rose-500',
    emoji: '🥐'
  },
  {
    id: 'surfsup',
    name: 'Surfs Up',
    persona: 'Chill surfer dude — laid back vibes',
    voiceId: 'Mtmp3KhFIjYpWYRycDe3',
    file: '/voices/surfsup.mp3',
    color: 'from-teal-500 to-emerald-500',
    emoji: '🏄'
  },
  {
    id: 'sara',
    name: 'SultrySara',
    persona: 'Sultry — premium voice option',
    voiceId: 'local-friday',
    file: '',
    color: 'from-red-500 to-pink-600',
    emoji: '🔥'
  }
];

export default function VoiceLibrary() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [testText, setTestText] = useState("Hello! I'm ready to help you build something amazing today.");
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoice = (voice: Voice) => {
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
    
    // Apply speed
    audio.playbackRate = speed;
    audio.play();
    setPlaying(voice.id);
    
    audio.onended = () => setPlaying(null);
  };

  const selectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
  };

  const generateCustom = async () => {
    if (!selectedVoice || !testText.trim()) return;
    
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
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = speed;
        audio.play();
        setPlaying('custom');
        audio.onended = () => setPlaying(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Generation failed');
      }
    } catch (e) {
      console.error('Generate failed:', e);
      alert('Failed to generate voice');
    }
    setGenerating(false);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          🎙️ Voice Library
        </h2>
        <span className="text-xs text-slate-500">ElevenLabs</span>
      </div>
      
      {/* Voice Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => voice.file ? selectVoice(voice) : null}
            className={`
              relative p-3 rounded-lg border transition-all text-left
              ${selectedVoice?.id === voice.id
                ? 'border-amber-500 bg-amber-500/10' 
                : playing === voice.id 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'}
              ${!voice.file ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${voice.color} opacity-5`} />
            
            <div className="relative flex items-center gap-2">
              <span className="text-xl">{voice.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-white text-sm block truncate">{voice.name}</span>
                <span className="text-xs text-slate-400 block truncate">{voice.persona.split('—')[0]}</span>
              </div>
              
              {/* Play button */}
              {voice.file && (
                <button
                  onClick={(e) => { e.stopPropagation(); playVoice(voice); }}
                  className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  {playing === voice.id ? (
                    <span className="text-green-400">⏹</span>
                  ) : (
                    <span className="text-slate-300">▶</span>
                  )}
                </button>
              )}
              
              {playing === voice.id && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Voice Controls */}
      {selectedVoice && (
        <div className="border-t border-slate-700 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="text-xl">{selectedVoice.emoji}</span>
            <span className="font-bold">{selectedVoice.name}</span>
            <span className="text-xs text-slate-500">selected</span>
          </div>
          
          {/* Test Text */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Test Text</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-amber-500"
              rows={2}
              placeholder="Enter text to speak..."
            />
          </div>
          
          {/* Sliders */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Stability</span>
                <span className="text-amber-400">{stability.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
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
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Clarity</span>
                <span className="text-amber-400">{similarity.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
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
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Speed</span>
                <span className="text-amber-400">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
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
          
          {/* Generate Button */}
          <button
            onClick={generateCustom}
            disabled={generating || !testText.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <span>🔊</span>
                Generate & Play
              </>
            )}
          </button>
        </div>
      )}
      
      {!selectedVoice && (
        <p className="text-xs text-slate-500 text-center">
          Select a voice to customize
        </p>
      )}
    </div>
  );
}
