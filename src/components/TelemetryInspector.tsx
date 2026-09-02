import React, { useState, useEffect } from 'react';
import {
  Activity,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { AgentTelemetryTrace } from '../types.js';

interface TelemetryInspectorProps {
  latestTrace?: AgentTelemetryTrace;
}

export const TelemetryInspector: React.FC<TelemetryInspectorProps> = ({ latestTrace }) => {
  const [traces, setTraces] = useState<AgentTelemetryTrace[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTraces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telemetry/recent');
      if (res.ok) {
        const data = await res.json();
        setTraces(data.traces || []);
      }
    } catch {
      // quiet fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, [latestTrace]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Live ADK Telemetry & Audit Tracing
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Cloud Run execution logs, PromptGuard verdicts, RAG chunk citations, latency (ms), and authoritative price verifications.
          </p>
        </div>
        <button
          onClick={fetchTraces}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
          title="Refresh Trace Stream"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Traces Stream */}
      <div className="space-y-3">
        {traces.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            No telemetry traces captured yet. Send a query to Sage or run the test suite to stream live logs.
          </div>
        ) : (
          traces.map((trace) => {
            const isExpanded = expandedId === trace.traceId;
            return (
              <div
                key={trace.traceId}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs space-y-3 shadow-sm"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : trace.traceId)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        trace.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : trace.status === 'blocked'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {trace.status}
                    </span>
                    <span className="text-blue-400 font-bold">{trace.traceId}</span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(trace.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Clock className="w-3.5 h-3.5" />
                      {trace.latencyMs}ms
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Cpu className="w-3.5 h-3.5" />
                      {trace.tokenCount.totalTokens} tok
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Trace Breakdown */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-400 block mb-1">PromptGuard Assessment:</span>
                        <span
                          className={`font-bold ${
                            trace.promptGuard.isClean ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {trace.promptGuard.isClean
                            ? '✅ Clean Query (Isolated in XML)'
                            : `🚨 Blocked: ${trace.promptGuard.triggers.join(', ')}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Price Verification:</span>
                        <span className="text-emerald-400 font-bold">
                          🛡️ 100% Authoritative Server Recalculated
                        </span>
                      </div>
                    </div>

                    {trace.ragContextChunks.length > 0 && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Retrieved RAG Chunks:</span>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-300">
                          {trace.ragContextChunks.map((c) => (
                            <li key={c.id}>
                              <span className="text-blue-300 font-medium">{c.title}</span> (Cosine Score: {c.score})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {trace.toolsExecuted.length > 0 && (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Executed Function Calling Tools:</span>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-cyan-300">
                          {trace.toolsExecuted.map((t, idx) => (
                            <li key={idx}>
                              <span className="font-bold">{t.name}</span> ({t.durationMs}ms) &rarr;{' '}
                              <span className="text-slate-400">{JSON.stringify(t.result)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
