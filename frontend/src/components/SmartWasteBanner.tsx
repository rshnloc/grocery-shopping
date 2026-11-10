import React from 'react';
import { AlertTriangle, ChefHat, ArrowRight, ShieldCheck } from 'lucide-react';
import { WasteRecommendation } from '../types';

interface SmartWasteBannerProps {
  recommendations: WasteRecommendation[];
  onSelectRecipe: (recipeId: number) => void;
  onNavigatePantry: () => void;
}

export const SmartWasteBanner: React.FC<SmartWasteBannerProps> = ({
  recommendations,
  onSelectRecipe,
  onNavigatePantry
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">Zero Waste Mode Active</h4>
            <p className="text-xs text-emerald-700">All pantry items have plenty of shelf life remaining. Great job!</p>
          </div>
        </div>
        <button
          onClick={onNavigatePantry}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1"
        >
          <span>View Stock</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-amber-900 text-sm">
                Food Waste Rescue Alert ({recommendations.length} {recommendations.length === 1 ? 'item' : 'items'} expiring soon)
              </h3>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Action Required
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Cook these ingredients in the next 1-3 days to keep them fresh and save on groceries:
            </p>

            {/* List of items */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {recommendations.map((item) => (
                <span
                  key={item.item_id}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-amber-200/90 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
                >
                  <span className="font-semibold text-amber-900">{item.name}</span>
                  <span className="text-slate-400">({item.quantity} {item.unit})</span>
                  <span className="text-rose-600 font-semibold text-[11px] ml-1">
                    {item.days_left <= 0 ? 'Today!' : `${item.days_left}d left`}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Recipes */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-2 border-t md:border-t-0 md:border-l border-amber-200 pt-3 md:pt-0 md:pl-5 shrink-0">
          <div className="text-xs text-amber-900 font-medium flex items-center space-x-1.5">
            <ChefHat className="w-4 h-4 text-amber-700" />
            <span>Suggested Recipe:</span>
          </div>
          {recommendations[0]?.suggested_recipes.length > 0 ? (
            <button
              onClick={() => onSelectRecipe(recommendations[0].suggested_recipes[0].recipe_id)}
              className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{recommendations[0].suggested_recipes[0].image_emoji}</span>
              <span>{recommendations[0].suggested_recipes[0].recipe_name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onNavigatePantry}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-amber-900 hover:text-amber-950 underline underline-offset-2"
            >
              <span>View in Pantry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
