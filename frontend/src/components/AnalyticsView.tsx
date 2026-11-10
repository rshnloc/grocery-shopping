import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldAlert,
  CheckCircle,
  PackageCheck
} from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-xs text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    Produce: 'bg-emerald-500',
    Dairy: 'bg-amber-500',
    'Meat & Seafood': 'bg-rose-500',
    Bakery: 'bg-orange-400',
    Pantry: 'bg-indigo-500',
    Condiments: 'bg-teal-500',
    Beverages: 'bg-blue-500',
    Snacks: 'bg-purple-500',
    General: 'bg-slate-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Spending & Inventory Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Actionable breakdown of your grocery spend, inventory distribution, and waste-reduction performance.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Recorded Spend</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              ${analytics.total_spent_historical.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">From shopping checkouts and logs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Stocked Items</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {analytics.total_pantry_items}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">items in pantry</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across Fridge, Pantry & Freezer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Inventory Health</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {analytics.total_pantry_items > 0
                ? Math.round(((analytics.total_pantry_items - analytics.expiring_soon_count - analytics.expired_count) / analytics.total_pantry_items) * 100)
                : 100}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold ml-1.5">Fresh items</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {analytics.expiring_soon_count} items expiring soon
          </p>
        </div>
      </div>

      {/* Two Column Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Expenditure by Food Category</h3>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.category_spending.map((cat) => {
              const colorClass = categoryColors[cat.category] || 'bg-slate-400';
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{cat.category}</span>
                    <span className="text-slate-600 font-semibold">
                      ${cat.amount.toFixed(2)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Current Pantry Stock Distribution</h3>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.pantry_distribution.map((cat) => {
              const total = analytics.total_pantry_items || 1;
              const percent = Math.round((cat.count / total) * 100);
              const colorClass = categoryColors[cat.category] || 'bg-indigo-400';
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{cat.category}</span>
                    <span className="text-slate-600 font-semibold">
                      {cat.count} items ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sustainable Kitchen Tips Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl mt-0.5">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Pantry Optimization & Savings Tips</h4>
            <ul className="text-xs text-emerald-800/90 mt-1.5 space-y-1 list-disc list-inside">
              <li>Keep herbs like cilantro or parsley in water cups like flowers to double their shelf life.</li>
              <li>Freezing sliced ripe bananas prevents waste and creates instant smoothie bases.</li>
              <li>Checking your pantry stock before shopping prevents duplicate purchases by up to 30%.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
