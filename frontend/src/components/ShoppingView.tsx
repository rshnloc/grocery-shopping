import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  DollarSign,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ListPlus,
  Tag
} from 'lucide-react';
import { ShoppingList, ShoppingItem } from '../types';
import { api } from '../api';

interface ShoppingViewProps {
  lists: ShoppingList[];
  onDataChanged: () => void;
  onOpenAddModal: () => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  lists,
  onDataChanged,
  onOpenAddModal
}) => {
  const [activeListId, setActiveListId] = useState<number>(lists[0]?.id || 1);
  const [quickItemName, setQuickItemName] = useState('');
  const [quickEstimatedPrice, setQuickEstimatedPrice] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListBudget, setNewListBudget] = useState(50);
  const [isSyncingLowStock, setIsSyncingLowStock] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const handleTogglePurchased = async (item: ShoppingItem) => {
    try {
      await api.updateShoppingItem(item.id, { is_purchased: !item.is_purchased });
      onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await api.deleteShoppingItem(itemId);
      onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickItemName.trim() || !activeList) return;

    try {
      await api.addShoppingItem(activeList.id, {
        name: quickItemName.trim(),
        quantity: 1,
        unit: 'pcs',
        estimated_price: Number(quickEstimatedPrice) || 0
      });
      setQuickItemName('');
      setQuickEstimatedPrice('');
      onDataChanged();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    try {
      const created = await api.createShoppingList({
        title: newListTitle.trim(),
        budget_limit: Number(newListBudget) || 0
      });
      setIsCreatingList(false);
      setNewListTitle('');
      onDataChanged();
      setActiveListId(created.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (window.confirm('Delete this shopping list?')) {
      try {
        await api.deleteShoppingList(listId);
        onDataChanged();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSyncLowStock = async () => {
    if (!activeList) return;
    setIsSyncingLowStock(true);
    try {
      const res = await api.addLowStockToShoppingList(activeList.id);
      alert(res.message);
      onDataChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingLowStock(false);
    }
  };

  const handleCheckoutAndStock = async () => {
    if (!activeList) return;
    const purchasedItems = activeList.items.filter((i) => i.is_purchased);
    if (purchasedItems.length === 0) {
      alert('Please check off items as purchased before stocking to pantry!');
      return;
    }

    if (
      window.confirm(
        `Transfer ${purchasedItems.length} purchased items into your Pantry inventory? This also logs your grocery spending.`
      )
    ) {
      setIsCheckingOut(true);
      try {
        const res = await api.checkoutShoppingList(activeList.id);
        alert(res.message);
        onDataChanged();
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingOut(false);
      }
    }
  };

  if (!activeList) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-lg">No Shopping Lists Found</h3>
        <p className="text-xs text-slate-500 mt-1">Create a shopping list to plan your next grocery trip.</p>
        <button
          onClick={() => setIsCreatingList(true)}
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create New List</span>
        </button>
      </div>
    );
  }

  const purchasedCount = activeList.items.filter((i) => i.is_purchased).length;
  const progressPercent = activeList.items.length > 0
    ? Math.round((purchasedCount / activeList.items.length) * 100)
    : 0;

  const budgetLimit = activeList.budget_limit || 0;
  const budgetPercent = budgetLimit > 0
    ? Math.min(100, Math.round((activeList.total_estimated / budgetLimit) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & List Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Smart Shopping Lists</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize lists, monitor cart budget, and transfer bought groceries straight to your pantry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* List selection pill */}
          <select
            value={activeList.id}
            onChange={(e) => setActiveListId(Number(e.target.value))}
            className="text-xs font-semibold rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.title} ({l.items.length})</option>
            ))}
          </select>

          <button
            onClick={() => setIsCreatingList(true)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-700 transition-colors"
            title="Create new list"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New List Modal Form (inline collapsible) */}
      {isCreatingList && (
        <form onSubmit={handleCreateList} className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="List name (e.g., Weekend Farmers Market)"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-emerald-800">$ Budget:</span>
            <input
              type="number"
              min="0"
              value={newListBudget}
              onChange={(e) => setNewListBudget(Number(e.target.value))}
              className="w-20 px-2 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsCreatingList(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              Save List
            </button>
          </div>
        </form>
      )}

      {/* List Overview Card: Progress & Budget Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{activeList.title}</h2>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
              <span>{activeList.items.length} items total</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{purchasedCount} checked off</span>
              <span>•</span>
              <span>Est. Total: ${activeList.total_estimated.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Smart Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncLowStock}
              disabled={isSyncingLowStock}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSyncingLowStock ? 'Syncing...' : 'Add Low Stock Items'}</span>
            </button>

            <button
              onClick={handleCheckoutAndStock}
              disabled={isCheckingOut || purchasedCount === 0}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-40"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isCheckingOut ? 'Transferring...' : `Stock to Pantry (${purchasedCount})`}</span>
            </button>

            {lists.length > 1 && (
              <button
                onClick={() => handleDeleteList(activeList.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Delete this list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress & Budget Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Shopping Checklist Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600">Shopping Progress</span>
              <span className="font-bold text-emerald-600">{progressPercent}% done</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Budget Limit Tracker */}
          {budgetLimit > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">
                  Estimated Cart: ${activeList.total_estimated.toFixed(2)}
                </span>
                <span className={`font-bold ${activeList.total_estimated > budgetLimit ? 'text-rose-600' : 'text-slate-700'}`}>
                  Budget: ${budgetLimit.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    activeList.total_estimated > budgetLimit ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Row */}
      <form
        onSubmit={handleQuickAddItem}
        className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Fast add item to list (e.g. Sourdough Bread, Butter, Eggs)..."
          value={quickItemName}
          onChange={(e) => setQuickItemName(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:outline-none"
        />
        <div className="flex items-center bg-slate-50 px-2 py-1.5 rounded-xl border border-transparent focus-within:border-slate-200 focus-within:bg-white">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={quickEstimatedPrice}
            onChange={(e) => setQuickEstimatedPrice(e.target.value)}
            className="w-16 text-xs bg-transparent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!quickItemName.trim()}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>

      {/* Shopping Items List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {activeList.items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-500">Your shopping list is empty. Add items using the bar above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeList.items.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:px-5 flex items-center justify-between transition-colors ${
                  item.is_purchased ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                }`}
              >
                {/* Checkbox and Name */}
                <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                  >
                    {item.is_purchased ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        item.is_purchased ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{item.category}</span>
                      </span>
                      <span>•</span>
                      <span>{item.quantity} {item.unit}</span>
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic truncate">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Delete */}
                <div className="flex items-center space-x-4 shrink-0 ml-3">
                  {item.estimated_price > 0 && (
                    <span className="text-xs font-bold text-slate-700">
                      ${(item.estimated_price * item.quantity).toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
