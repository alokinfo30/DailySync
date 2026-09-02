import React from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Sparkles,
  ShieldCheck,
  Clock,
  User,
} from 'lucide-react';
import { OperationalTask } from '../types.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface OperationalTasksViewProps {
  tasks: OperationalTask[];
  onToggleTask: (taskId: string) => Promise<void>;
}

export const OperationalTasksView: React.FC<OperationalTasksViewProps> = ({ tasks, onToggleTask }) => {
  const shifts: ('opening' | 'midday' | 'closing')[] = ['opening', 'midday', 'closing'];

  const completedCount = tasks.filter((t) => t.completed).length;
  const automatedCount = tasks.filter((t) => t.automatedByAgent).length;

  const handleCheck = async (taskId: string) => {
    soundSynth.playChime('action');
    await onToggleTask(taskId);
  };

  return (
    <div className="space-y-6">
      {/* Shift Overview Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
            Daily Shift Checklists & Automated Workflows
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Automated task executions verified across Opening, Midday, and Closing shift operations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {completedCount}/{tasks.length} Completed
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {automatedCount} Agent-Automated
          </span>
        </div>
      </div>

      {/* Shifts Breakdown */}
      <div className="space-y-6">
        {shifts.map((shift) => {
          const shiftTasks = tasks.filter((t) => t.shift === shift);
          const shiftTitle =
            shift === 'opening'
              ? '🌅 Opening Shift (06:30 - 08:00 AM)'
              : shift === 'midday'
              ? '☀️ Midday Operations & Replenishment (11:00 AM - 02:00 PM)'
              : '🌙 Closing & Register Reconciliation (05:30 - 07:00 PM)';

          return (
            <div key={shift} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {shiftTitle}
              </h4>
              <div className="space-y-2.5">
                {shiftTasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleCheck(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 shadow-sm ${
                        task.completed
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="mt-0.5 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-medium ${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.automatedByAgent && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                Agent Automated
                              </span>
                            )}
                          </div>
                          {task.notes && (
                            <p className="text-[11px] text-slate-400 mt-1 italic">
                              ↳ {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 flex-shrink-0">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {task.assignedRole}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
