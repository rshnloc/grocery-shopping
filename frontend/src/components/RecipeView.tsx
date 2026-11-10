import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ShoppingCart,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Recipe, ShoppingList } from '../types';
import { api } from '../api';

interface RecipeViewProps {
  recipes: Recipe[];
  shoppingLists: ShoppingList[];
  selectedRecipeId: number | null;
  onClearSelectedRecipe: () => void;
  onRecipeAdded: () => void;
  onShoppingListUpdated: () => void;
}

export const RecipeView: React.FC<RecipeViewProps> = ({
  recipes,
  shoppingLists,
  selectedRecipeId,
  onClearSelectedRecipe,
  onRecipeAdded,
  onShoppingListUpdated
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalRecipe, setActiveModalRecipe] = useState<Recipe | null>(
    selectedRecipeId ? recipes.find((r) => r.id === selectedRecipeId) || null : null
  );
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);

  // New recipe state
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState('Dinner');
  const [newRecipePrep, setNewRecipePrep] = useState(15);
  const [newRecipeCook, setNewRecipeCook] = useState(20);
  const [newRecipeServings, setNewRecipeServings] = useState(2);
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newRecipeEmoji, setNewRecipeEmoji] = useState('🥗');
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');
  const [newRecipeIngredientsText, setNewRecipeIngredientsText] = useState('');

  // Keep modal in sync if external selection changes
  React.useEffect(() => {
    if (selectedRecipeId) {
      const found = recipes.find((r) => r.id === selectedRecipeId);
      if (found) setActiveModalRecipe(found);
    }
  }, [selectedRecipeId, recipes]);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

  const filteredRecipes = recipes.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  const handleAddMissingToList = async (recipeId: number) => {
    setIsAddingToList(true);
    try {
      const activeList = shoppingLists[0];
      const res = await api.addRecipeMissingToList(recipeId, activeList?.id);
      alert(res.message);
      onShoppingListUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim() || !newRecipeInstructions.trim()) return;

    // Parse ingredients from text (e.g., "1 cup Rice", "2 pcs Eggs")
    const lines = newRecipeIngredientsText.split('\n').filter((l) => l.trim().length > 0);
    const parsedIngredients = lines.map((line) => {
      const parts = line.trim().split(' ');
      const qty = parseFloat(parts[0]) || 1.0;
      const unit = isNaN(parseFloat(parts[0])) ? 'pcs' : (parts[1] || 'pcs');
      const itemName = isNaN(parseFloat(parts[0]))
        ? line.trim()
        : parts.slice(2).join(' ') || parts.slice(1).join(' ');
      return {
        item_name: itemName || line.trim(),
        quantity: qty,
        unit: unit,
        is_optional: false
      };
    });

    try {
      await api.createRecipe({
        name: newRecipeName.trim(),
        category: newRecipeCategory,
        prep_time_minutes: Number(newRecipePrep),
        cook_time_minutes: Number(newRecipeCook),
        servings: Number(newRecipeServings),
        difficulty: newRecipeDifficulty,
        image_emoji: newRecipeEmoji || '🍲',
        instructions: newRecipeInstructions.trim(),
        ingredients: parsedIngredients as any
      });

      setIsCreatingRecipe(false);
      setNewRecipeName('');
      setNewRecipeInstructions('');
      setNewRecipeIngredientsText('');
      onRecipeAdded();
    } catch (err) {
      console.error(err);
      alert('Error saving recipe.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Recipe & Meal Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover meals matching what you already have in stock and automatically add missing ingredients to your shopping list.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingRecipe(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setActiveModalRecipe(recipe)}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{recipe.image_emoji}</span>
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

              <h3 className="font-bold text-slate-900 text-base">{recipe.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{recipe.category}</p>

              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{recipe.prep_time_minutes + recipe.cook_time_minutes} mins</span>
                </span>
                <span>•</span>
                <span>{recipe.difficulty}</span>
                <span>•</span>
                <span>{recipe.servings} Servings</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {recipe.missing_ingredients_count === 0 ? (
                  <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>All ingredients ready!</span>
                  </span>
                ) : (
                  <span>Missing {recipe.missing_ingredients_count} ingredient{recipe.missing_ingredients_count > 1 ? 's' : ''}</span>
                )}
              </span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-0.5">
                <span>Cook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {activeModalRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{activeModalRecipe.image_emoji}</span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeModalRecipe.name}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>{activeModalRecipe.category}</span>
                    <span>•</span>
                    <span>Prep: {activeModalRecipe.prep_time_minutes}m</span>
                    <span>•</span>
                    <span>Cook: {activeModalRecipe.cook_time_minutes}m</span>
                    <span>•</span>
                    <span>{activeModalRecipe.servings} servings</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModalRecipe(null);
                  onClearSelectedRecipe();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Ingredients match checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <ChefHat className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      Pantry Ingredients ({activeModalRecipe.match_percentage}% Match)
                    </h4>
                  </div>
                  {activeModalRecipe.missing_ingredients_count > 0 && (
                    <button
                      onClick={() => handleAddMissingToList(activeModalRecipe.id)}
                      disabled={isAddingToList}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isAddingToList ? 'Adding...' : 'Add Missing to Shopping List'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalRecipe.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        ing.in_stock
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        {ing.in_stock ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className={`font-medium truncate ${ing.in_stock ? 'text-slate-900' : 'text-slate-600'}`}>
                          {ing.item_name}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0 ml-2">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Instructions</h4>
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                  {activeModalRecipe.instructions}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => {
                  setActiveModalRecipe(null);
                  onClearSelectedRecipe();
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Recipe Modal */}
      {isCreatingRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Recipe</h3>
              <button
                onClick={() => setIsCreatingRecipe(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipe Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado Toast with Poached Egg"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newRecipeCategory}
                    onChange={(e) => setNewRecipeCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-2 py-2"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                    <option value="Dessert">Dessert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prep (mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipePrep}
                    onChange={(e) => setNewRecipePrep(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 px-2 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cook (mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRecipeCook}
                    onChange={(e) => setNewRecipeCook(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-200 px-2 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingredients (One per line, e.g. "2 pcs Eggs", "1 loaf Sourdough")
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="2 pcs Eggs&#10;1 avocado&#10;2 slices sourdough"
                  value={newRecipeIngredientsText}
                  onChange={(e) => setNewRecipeIngredientsText(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="1. Toast the sourdough...&#10;2. Mash the avocado..."
                  value={newRecipeInstructions}
                  onChange={(e) => setNewRecipeInstructions(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingRecipe(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
