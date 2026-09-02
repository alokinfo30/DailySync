import React, { useState } from 'react';
import {
  Rocket,
  ThumbsUp,
  Tag,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { UpcomingFeature } from '../types.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface UpcomingFeaturesViewProps {
  features: UpcomingFeature[];
  onVote: (featureId: string) => Promise<void>;
}

export const UpcomingFeaturesView: React.FC<UpcomingFeaturesViewProps> = ({ features, onVote }) => {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleVoteClick = async (featId: string) => {
    if (votedIds.has(featId)) return;
    try {
      await onVote(featId);
      setVotedIds((prev) => new Set(prev).add(featId));
      soundSynth.playChime('action');
    } catch {
      // quiet fallback
    }
  };

  const getStatusBadge = (status: UpcomingFeature['status']) => {
    switch (status) {
      case 'launched':
        return {
          label: 'Launched',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'beta_ready':
        return {
          label: 'Beta Ready',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      case 'in_progress':
        return {
          label: 'In Development',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
      case 'in_design':
        return {
          label: 'In Architecture',
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Rocket className="w-5 h-5" />
            </span>
            <h3 className="text-base font-semibold text-slate-100">
              Product Roadmap & Task Automation Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Upcoming operational and agent features for business automation on Google Cloud Run. Upvote priority features to accelerate deployment.
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-950 text-blue-400 border border-slate-800">
          Track 3: Operations Assistant
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feat) => {
          const badge = getStatusBadge(feat.status);
          const hasVoted = votedIds.has(feat.id);

          return (
            <div
              key={feat.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{feat.targetRelease}</span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 mt-1">{feat.title}</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {feat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vote Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Priority: <span className="text-blue-400 font-bold uppercase">{feat.priority}</span>
                </span>

                <button
                  onClick={() => handleVoteClick(feat.id)}
                  disabled={hasVoted}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    hasVoted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-emerald-400' : ''}`} />
                  <span>{feat.votes} Votes</span>
                  {hasVoted && <span className="text-[10px] font-mono">(Voted)</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
