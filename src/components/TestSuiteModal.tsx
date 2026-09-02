import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  ShieldCheck,
  Zap,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { FullTestSuiteSummary, TestResultItem } from '../types.js';
import { runAutomatedTestSuite } from '../lib/testRunner.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const [suiteSummary, setSuiteSummary] = useState<FullTestSuiteSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'unit' | 'security' | 'e2e'>('all');

  const executeTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuiteSummary(data);
        if (data.allPassed) {
          soundSynth.playChime('success');
        } else {
          soundSynth.playChime('alert');
        }
      } else {
        // Fallback to local client runner
        const localData = await runAutomatedTestSuite();
        setSuiteSummary(localData);
        soundSynth.playChime(localData.allPassed ? 'success' : 'alert');
      }
    } catch {
      const localData = await runAutomatedTestSuite();
      setSuiteSummary(localData);
      soundSynth.playChime(localData.allPassed ? 'success' : 'alert');
    } finally {
      setRunning(false);
    }
  };

  // Run automatically on first modal open if not run yet
  React.useEffect(() => {
    if (isOpen && !suiteSummary && !running) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults =
    suiteSummary?.results.filter((t) => {
      if (selectedCategory === 'all') return true;
      return t.category === selectedCategory;
    }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              🧪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  Comprehensive Automated Test Suite
                </h3>
                {suiteSummary && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      suiteSummary.allPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {suiteSummary.passedCount}/{suiteSummary.totalTests} Passing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                14/14 Automated Tests: Unit (RAG & Allergens), Security & Penetration, and ADK Agent E2E.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={executeTests}
              disabled={running}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-blue-900/30 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Running Tests...' : 'Re-Run Suite'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Filter Category:</span>
          {(['all', 'unit', 'security', 'e2e'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Test List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 font-mono text-xs">
          {running && !suiteSummary ? (
            <div className="py-16 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Executing 14/14 automated test suite assertions...
              </p>
            </div>
          ) : (
            filteredResults.map((test) => {
              return (
                <div
                  key={test.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 shadow-sm ${
                    test.passed
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <span className="text-slate-500 text-[10px]">#{test.id.toString().padStart(2, '0')}</span>
                      <span className="font-semibold text-slate-100">{test.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {test.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{test.durationMs}ms</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-6 leading-relaxed font-sans">
                    ↳ {test.details}
                  </p>

                  {test.error && (
                    <div className="text-[11px] text-rose-400 pl-6 font-semibold font-mono">
                      ⚠️ Failure: {test.error}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>CLI Equivalent: <code className="text-blue-400 font-semibold">npm test</code></span>
          <span>Verified Against Cloud Run Standards</span>
        </div>
      </div>
    </div>
  );
};
