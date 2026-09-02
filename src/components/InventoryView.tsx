import React, { useState } from 'react';
import {
  Package,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Truck,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { InventoryItem } from '../types.js';
import { soundSynth } from '../lib/audioSynthesizer.js';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onRestock: (itemId: string, qty?: number) => Promise<void>;
  loading?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onRestock, loading }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'low' | 'healthy'>('all');
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [lastPoMessage, setLastPoMessage] = useState<string | null>(null);

  const criticalCount = inventory.filter((i) => i.status === 'critical').length;
  const lowCount = inventory.filter((i) => i.status === 'low').length;
  const healthyCount = inventory.filter((i) => i.status === 'healthy').length;

  const filtered = inventory.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleRestockClick = async (item: InventoryItem) => {
    const qtyNeeded = item.maxCapacity - item.currentStock;
    setRestockingId(item.id);
    try {
      await onRestock(item.id, qtyNeeded);
      soundSynth.playChime('success');
      setLastPoMessage(
        `Generated PO-${Date.now().toString().slice(-4)}: Ordered ${qtyNeeded} ${item.unit} of ${item.name} from ${item.supplier}.`
      );
    } catch {
      soundSynth.playChime('alert');
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterStatus(filterStatus === 'critical' ? 'all' : 'critical')}
          className={`p-5 rounded-xl border text-left transition-all shadow-sm ${
            criticalCount > 0
              ? 'bg-rose-950/25 border-rose-500/40 hover:border-rose-500/60'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Critical Depletion</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount} Items</div>
          <p className="text-[11px] text-rose-300/80 mt-1">Requires emergency reorder today</p>
        </button>

        <button
          onClick={() => setFilterStatus(filterStatus === 'low' ? 'all' : 'low')}
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-left transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{lowCount} Items</div>
          <p className="text-[11px] text-amber-300/80 mt-1">Within safety threshold buffer</p>
        </button>

        <button
          onClick={() => setFilterStatus(filterStatus === 'healthy' ? 'all' : 'healthy')}
          className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition-all shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
            <span>Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{healthyCount} Items</div>
          <p className="text-[11px] text-emerald-300/80 mt-1">Operating above min buffers</p>
        </button>
      </div>

      {/* Reorder Notification Banner */}
      {lastPoMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{lastPoMessage}</span>
          </div>
          <button
            onClick={() => setLastPoMessage(null)}
            className="text-[10px] uppercase font-bold text-emerald-400 hover:text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Inventory Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const fillPct = Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100));
          const isCritical = item.status === 'critical';
          const isLow = item.status === 'low';
          const isRestocking = restockingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between shadow-sm ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isLow
                  ? 'bg-amber-950/15 border-amber-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.sku}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 mt-1">{item.name}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isLow
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Stock Gauge */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Current Level:</span>
                    <span className="font-bold text-slate-200">
                      {item.currentStock} / {item.maxCapacity} {item.unit} ({fillPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Min Safety Buffer: {item.minThreshold} {item.unit}</span>
                    <span>Cost: ${item.unitCost.toFixed(2)}/unit</span>
                  </div>
                </div>

                {/* Supplier and Lead Time */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-800">
                  <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    {item.supplier}
                  </span>
                  <span className="font-mono text-slate-300">
                    Lead: {item.leadTimeDays}d
                  </span>
                </div>
              </div>

              {/* 1-Click Automated PO Reorder Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => handleRestockClick(item)}
                  disabled={isRestocking || loading || item.currentStock >= item.maxCapacity}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    isCritical
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30'
                      : isLow
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isRestocking ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Cloud Run PO...
                    </>
                  ) : item.currentStock >= item.maxCapacity ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Stock at Max Capacity
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      1-Click Restock PO (+{item.maxCapacity - item.currentStock} {item.unit})
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
