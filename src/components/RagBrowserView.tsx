import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
  Tag,
} from 'lucide-react';
import { RagKnowledgeChunk, RagSearchResult } from '../types.js';
import { searchKnowledgeBase } from '../lib/ragEngine.js';
import { RAG_KNOWLEDGE_BASE } from '../lib/mockData.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

export const RagBrowserView: React.FC = () => {
  const [query, setQuery] = useState('allergen separation and steam wand cleaning');
  const [results, setResults] = useState<RagSearchResult[]>(() =>
    searchKnowledgeBase('allergen separation and steam wand cleaning', 5)
  );

  const handleSearch = (q: string) => {
    setQuery(q);
    const searchRes = searchKnowledgeBase(q, 5);
    setResults(searchRes);
    soundSynth.playChime('action');
  };

  const sampleQueries = [
    'allergen separation protocols',
    'decaf caffeine limits',
    'authoritative pricing security',
    'inventory reorder buffer formulas',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-slate-100">
            Interactive RAG Knowledge Base & Cosine Similarity Engine
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Query store operational manuals, dietary allergen policies, decaf extraction thresholds, and pricing security specs using vectorized cosine similarity.
        </p>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search store knowledge base (e.g., 'allergen', 'decaf', 'tampering')..."
              className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
          <span className="text-slate-400 text-[11px] font-mono">Sample Probes:</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(sample)}
              className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 text-[11px] font-mono transition-all"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* RAG Search Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Found {results.length} relevant chunks</span>
          <span>Knowledge Corpus: {RAG_KNOWLEDGE_BASE.length} Operational Manuals</span>
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
            No chunks matched cosine threshold (&gt;0.05). Try searching for "allergen", "decaf", or "pricing".
          </div>
        ) : (
          results.map((res) => {
            const scorePct = Math.round(res.similarityScore * 100);
            return (
              <div
                key={res.chunk.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {res.chunk.id}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {res.chunk.category}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 mt-1.5">{res.chunk.title}</h4>
                  </div>

                  {/* Cosine Similarity Score Badge */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      Cosine: {res.similarityScore.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">{scorePct}% Relevance</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 font-sans">
                  {res.chunk.content}
                </p>

                <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Matched Terms:</span>
                    {res.matchedTerms.map((term, i) => (
                      <span key={i} className="text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {term}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    {res.chunk.tags.map((t) => (
                      <span key={t} className="text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
