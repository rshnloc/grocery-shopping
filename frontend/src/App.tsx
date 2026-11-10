import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PantryView } from './components/PantryView';
import { ShoppingView } from './components/ShoppingView';
import { RecipeView } from './components/RecipeView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddItemModal } from './components/AddItemModal';
import { api } from './api';
import { PantryItem, ShoppingList, Recipe, WasteRecommendation, AnalyticsSummary } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pantry' | 'shopping' | 'recipes' | 'analytics'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  // Core Data States
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wasteRecs, setWasteRecs] = useState<WasteRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [pantryRes, listsRes, recipesRes, wasteRes, analyticsRes] = await Promise.all([
        api.getPantry(),
        api.getShoppingLists(),
        api.getRecipes(),
        api.getWasteRecommendations(),
        api.getAnalyticsSummary(),
      ]);

      setPantryItems(pantryRes);
      setShoppingLists(listsRes);
      setRecipes(recipesRes);
      setWasteRecs(wasteRes.recommendations);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectRecipeFromBanner = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setCurrentTab('recipes');
  };

  const expiringCount = pantryItems.filter(
    (i) => i.expiry_date && i.days_until_expiry !== null && i.days_until_expiry >= 0 && i.days_until_expiry <= 3
  ).length;

  const lowStockCount = pantryItems.filter((i) => i.is_low_stock).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        expiringCount={expiringCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading your smart pantry...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                pantryItems={pantryItems}
                recipes={recipes}
                wasteRecs={wasteRecs}
                analytics={analytics}
                onNavigateTab={(tab) => setCurrentTab(tab as any)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onSelectRecipe={handleSelectRecipeFromBanner}
              />
            )}

            {currentTab === 'pantry' && (
              <PantryView
                items={pantryItems}
                onItemUpdated={loadData}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {currentTab === 'shopping' && (
              <ShoppingView
                lists={shoppingLists}
                onDataChanged={loadData}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {currentTab === 'recipes' && (
              <RecipeView
                recipes={recipes}
                shoppingLists={shoppingLists}
                selectedRecipeId={selectedRecipeId}
                onClearSelectedRecipe={() => setSelectedRecipeId(null)}
                onRecipeAdded={loadData}
                onShoppingListUpdated={loadData}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView analytics={analytics} />
            )}
          </>
        )}
      </main>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={loadData}
        shoppingLists={shoppingLists}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">PantryPulse</span>
            <span>• Smart Grocery & Food Waste Manager</span>
          </div>
          <div>Local-First • Zero Credentials • Private & Anonymous</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

