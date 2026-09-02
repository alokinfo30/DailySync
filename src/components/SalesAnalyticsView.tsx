import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Award,
  Zap,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { SalesMetrics } from '../types.js';

interface SalesAnalyticsViewProps {
  sales: SalesMetrics;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({ sales }) => {
  const percentOfGoal = Math.min(100, (sales.totalRevenue / sales.targetDailyRevenue) * 100);
  const maxHourlyRev = Math.max(...sales.hourlySales.map((h) => h.revenue), 1000);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
            <span>Today's Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
            ${sales.totalRevenue.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% vs yesterday</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
            <span>Orders Processed</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
            {sales.orderCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Avg Velocity: <span className="text-blue-300 font-semibold">53 orders/hr</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
            <span>Avg Order Value (AOV)</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
            ${sales.averageOrderValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Target: <span className="text-slate-300">$7.50</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 font-medium">
            <span>Peak Velocity Window</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-mono truncate">
            {sales.peakHour}
          </div>
          <div className="text-[11px] text-purple-300 font-medium mt-2">
            Morning Espresso Rush
          </div>
        </div>
      </div>

      {/* Target Daily Revenue Progress Bar */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="flex items-center gap-1.5 text-slate-200">
            <Zap className="w-4 h-4 text-blue-400" />
            Daily Revenue Target Progress
          </span>
          <span className="font-mono text-blue-400">
            ${sales.totalRevenue.toFixed(2)} / ${sales.targetDailyRevenue.toFixed(2)} ({percentOfGoal.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700 shadow-sm"
            style={{ width: `${percentOfGoal}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Pacing at 85.5% of daily quota. Expected closure: ~$4,120 by 6:00 PM.
        </p>
      </div>

      {/* Hourly Sales Velocity & Category Breakdown Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Velocity Histogram */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Hourly Revenue & Order Velocity
            </h3>
            <span className="text-[11px] font-mono text-slate-400">POS Stream Live</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-2">
            {sales.hourlySales.map((hour, idx) => {
              const heightPct = Math.max(12, (hour.revenue / maxHourlyRev) * 100);
              const isPeak = hour.revenue === Math.max(...sales.hourlySales.map((h) => h.revenue));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-950 text-slate-100 text-[10px] font-mono py-1 px-2 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    ${hour.revenue.toFixed(2)} ({hour.orders} ord)
                  </div>

                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isPeak
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[36px]">
                    {hour.hour.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Category Mix
            </h3>
            <div className="space-y-3">
              {sales.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-300">{cat.category}</span>
                    <span className="text-slate-400 font-mono">${cat.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-blue-500'
                          : idx === 1
                          ? 'bg-cyan-400'
                          : idx === 2
                          ? 'bg-emerald-400'
                          : 'bg-purple-400'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">{cat.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Items Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Top Selling Drink & Food Menu Items
          </h3>
          <span className="text-xs text-slate-400 font-mono">Ranked by volume</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Menu Item</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {sales.topSellingItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-blue-400 font-bold">#{idx + 1}</td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">{item.name}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {item.quantitySold}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">
                    ${item.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
