import React from 'react';
import {
  Package,
  AlertTriangle,
  Flame,
  Wallet,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChefHat,
  Clock,
  Plus
} from 'lucide-react';
import { PantryItem, Recipe, WasteRecommendation, AnalyticsSummary } from '../types';
import { SmartWasteBanner } from './SmartWasteBanner';

interface DashboardViewProps {
  pantryItems: PantryItem[];
  recipes: Recipe[];
  wasteRecs: WasteRecommendation[];
  analytics: AnalyticsSummary | null;
  onNavigateTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onSelectRecipe: (recipeId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pantryItems,
  recipes,
  wasteRecs,
  analytics,
  onNavigateTab,
  onOpenAddModal,
  onSelectRecipe
}) => {
  const expiringSoonItems = pantryItems.filter(
    (i) => i.expiry_date && i.days_until_expiry !== null && i.days_until_expiry >= 0 && i.days_until_expiry <= 3
  );

  const lowStockItems = pantryItems.filter((i) => i.is_low_stock);

  // Top recipes ready to cook
  const topReadyRecipes = [...recipes].sort((a, b) => b.match_percentage - a.match_percentage).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Waste Alert Banner */}
      <SmartWasteBanner
        recommendations={wasteRecs}
        onSelectRecipe={onSelectRecipe}
        onNavigatePantry={() => onNavigateTab('pantry')}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pantry Items */}
        <div
          onClick={() => onNavigateTab('pantry')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Stock</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">{pantryItems.length}</span>
            <span className="text-xs text-slate-500 ml-1.5">items stored</span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold text-emerald-600">
            <span>Manage inventory</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => onNavigateTab('pantry')}
          className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            expiringSoonItems.length > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring in 3 Days</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-bold tracking-tight ${expiringSoonItems.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {expiringSoonItems.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">items at risk</span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold text-amber-600">
            <span>{expiringSoonItems.length > 0 ? 'Prioritize consumption' : 'All items fresh'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => onNavigateTab('shopping')}
          className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            lowStockItems.length > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock</span>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-bold tracking-tight ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {lowStockItems.length}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">need restock</span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold text-rose-600">
            <span>Add to shopping list</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Tracked Spending */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recorded Spend</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              ${analytics ? analytics.total_spent_historical.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold text-indigo-600">
            <span>View spending analytics</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Smart Meal Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <ChefHat className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-lg">Smart Meal Recommendations</h2>
            </div>
            <button
              onClick={() => onNavigateTab('recipes')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Explore all recipes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topReadyRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe.id)}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{recipe.image_emoji}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        recipe.match_percentage >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : recipe.match_percentage >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {recipe.match_percentage}% in stock
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{recipe.name}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.prep_time_minutes + recipe.cook_time_minutes}m</span>
                    </span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    <span>•</span>
                    <span>{recipe.servings} serv</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {recipe.missing_ingredients_count === 0
                      ? 'Ready to cook!'
                      : `Needs ${recipe.missing_ingredients_count} item${recipe.missing_ingredients_count > 1 ? 's' : ''}`}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View Recipe &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick low stock items preview */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h3 className="font-semibold text-slate-900 text-sm">Low Stock Essentials</h3>
                </div>
                <button
                  onClick={() => onNavigateTab('shopping')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sync to shopping list</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-rose-600 font-medium mt-0.5">
                      Only {item.quantity} {item.unit} left
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Actions & Pantry Storage Summary */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <h3 className="font-bold text-sm tracking-wide">Smart Kitchen Assistant</h3>
            </div>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Auto-categorize groceries, track expiration dates, minimize food waste, and plan delicious home meals.
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={onOpenAddModal}
                className="w-full flex items-center justify-center space-x-2 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add Grocery Item</span>
              </button>
              <button
                onClick={() => onNavigateTab('shopping')}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/50 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Open Active Shopping List</span>
              </button>
            </div>
          </div>

          {/* Storage Locations summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Storage Zones</h3>
            <div className="space-y-3">
              {[
                { name: 'Fridge', emoji: '🧊', count: pantryItems.filter((i) => i.location === 'Fridge').length },
                { name: 'Pantry', emoji: '🥫', count: pantryItems.filter((i) => i.location === 'Pantry').length },
                { name: 'Freezer', emoji: '❄️', count: pantryItems.filter((i) => i.location === 'Freezer').length }
              ].map((zone) => (
                <div
                  key={zone.name}
                  onClick={() => onNavigateTab('pantry')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">{zone.emoji}</span>
                    <span className="text-xs font-semibold text-slate-800">{zone.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                    {zone.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
