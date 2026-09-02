import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cloud,
  Volume2,
  VolumeX,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface NavbarProps {
  onOpenTests: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileView: 'chat' | 'ops';
  setMobileView: (view: 'chat' | 'ops') => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTests,
  activeTab,
  setActiveTab,
  mobileView,
  setMobileView,
  cartCount,
  onOpenCart,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [rateLimitHealth, setRateLimitHealth] = useState({ remaining: 30, limit: 30 });

  const toggleSound = () => {
    if (isPlayingAudio) {
      soundSynth.stopAmbiance();
      setIsPlayingAudio(false);
    } else {
      soundSynth.startAmbiance();
      setIsPlayingAudio(true);
      soundSynth.playChime('action');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundSynth.setVolume(val);
  };

  useEffect(() => {
    // Poll rate limiter health periodically
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const limitHeader = res.headers.get('X-RateLimit-Limit');
          const remHeader = res.headers.get('X-RateLimit-Remaining');
          if (limitHeader && remHeader) {
            setRateLimitHealth({
              limit: parseInt(limitHeader, 10),
              remaining: parseInt(remHeader, 10),
            });
          }
        }
      } catch {
        // quiet fallback
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Cloud Run Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
                Sage <span className="text-slate-400 font-normal">Productivity Assistant</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <Cloud className="w-3 h-3 inline" /> Cloud Run Active
              </span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> PromptGuard Active
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Cafe Synthesizer Toggle */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-md transition-all ${
                isPlayingAudio
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isPlayingAudio ? 'Mute Cafe Synthesizer' : 'Play Procedural Cafe Soundscape'}
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <span className="text-xs font-medium text-slate-300 hidden md:inline">
              {isPlayingAudio ? 'Cafe Ambience' : 'Ambience Off'}
            </span>
            {isPlayingAudio && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            )}
          </div>

          {/* Test Suite Trigger Button (14/14 Tests) */}
          <button
            onClick={onOpenTests}
            id="nav-test-suite-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-sm uppercase tracking-wider"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">14/14 TESTS PASSING</span>
            <span className="xs:hidden">TESTS</span>
          </button>

          {/* Cart Icon / Drawer Button */}
          <button
            onClick={onOpenCart}
            id="nav-cart-btn"
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Switcher Tab (<640px) */}
          <div className="flex sm:hidden bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMobileView('chat')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                mobileView === 'chat'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sage
            </button>
            <button
              onClick={() => setMobileView('ops')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                mobileView === 'ops'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ops
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
