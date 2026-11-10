import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Calendar, Tag, MapPin, DollarSign } from 'lucide-react';
import { api } from '../api';
import { ShoppingList } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  shoppingLists: ShoppingList[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
  shoppingLists
}) => {
  const [targetType, setTargetType] = useState<'pantry' | 'shopping'>('pantry');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pantry');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [location, setLocation] = useState('Pantry');
  const [shelfLifeDays, setShelfLifeDays] = useState(14);
  const [estimatedPrice, setEstimatedPrice] = useState(3.50);
  const [selectedListId, setSelectedListId] = useState<number>(shoppingLists[0]?.id || 1);
  const [notes, setNotes] = useState('');
  const [isSmartGuessed, setIsSmartGuessed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shoppingLists.length > 0 && !selectedListId) {
      setSelectedListId(shoppingLists[0].id);
    }
  }, [shoppingLists, selectedListId]);

  // Handle smart item autocomplete and suggestion
  useEffect(() => {
    if (name.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const guess = await api.guessItem(name);
          setCategory(guess.category);
          setLocation(guess.recommended_location);
          setUnit(guess.unit);
          setShelfLifeDays(guess.estimated_shelf_life_days);
          setIsSmartGuessed(true);
        } catch {
          // Fallback silently if offline
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSmartGuessed(false);
    }
  }, [name]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (targetType === 'pantry') {
        const today = new Date();
        const expiry = new Date(today);
        expiry.setDate(today.getDate() + (shelfLifeDays || 14));
        const expiryStr = expiry.toISOString().split('T')[0];

        await api.addPantryItem({
          name: name.trim(),
          category,
          quantity: Number(quantity),
          unit,
          location,
          expiry_date: expiryStr,
          notes: notes.trim() || undefined
        });
      } else {
        await api.addShoppingItem(selectedListId, {
          name: name.trim(),
          category,
          quantity: Number(quantity),
          unit,
          estimated_price: Number(estimatedPrice) || 0,
          notes: notes.trim() || undefined
        });
      }

      onItemAdded();
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Error adding item. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setNotes('');
    setQuantity(1);
    setIsSmartGuessed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Add New Grocery Item</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-2 gap-2">
          <button
            type="button"
            onClick={() => setTargetType('pantry')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              targetType === 'pantry'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add to Pantry / Fridge (In Stock)
          </button>
          <button
            type="button"
            onClick={() => setTargetType('shopping')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              targetType === 'shopping'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add to Shopping List (To Buy)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target List selector if shopping list */}
          {targetType === 'shopping' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Shopping List</label>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(Number(e.target.value))}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {shoppingLists.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Item Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Item Name</label>
              {isSmartGuessed && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-detected properties</span>
                </span>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Greek Yogurt, Whole Milk, Bananas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
              autoFocus
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="liters">liters</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="loaf">loaf</option>
                <option value="cans">cans</option>
                <option value="bottles">bottles</option>
                <option value="box">box</option>
                <option value="bunch">bunch</option>
              </select>
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Bakery">Bakery</option>
                <option value="Pantry">Pantry & Grains</option>
                <option value="Condiments">Condiments & Spices</option>
                <option value="Frozen">Frozen</option>
                <option value="Beverages">Beverages</option>
                <option value="Snacks">Snacks</option>
                <option value="General">General</option>
              </select>
            </div>

            {targetType === 'pantry' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Storage Location</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="Fridge">Fridge</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Freezer">Freezer</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est. Price ($)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Pantry specific: Shelf life */}
          {targetType === 'pantry' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Shelf Life (Days from today)</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                  className="w-24 text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">
                  Expires around {new Date(Date.now() + shelfLifeDays * 86400000).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Organic, Brand preference, or recipe use"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
            >
              {isSubmitting ? 'Adding...' : targetType === 'pantry' ? 'Add to Pantry' : 'Add to Shopping List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
