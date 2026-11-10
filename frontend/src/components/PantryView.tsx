import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Minus,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
import { PantryItem } from '../types';
import { api } from '../api';

interface PantryViewProps {
  items: PantryItem[];
  onItemUpdated: () => void;
  onOpenAddModal: () => void;
}

export const PantryView: React.FC<PantryViewProps> = ({
  items,
  onItemUpdated,
  onOpenAddModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const locations = ['All', 'Fridge', 'Pantry', 'Freezer'];
  const categories = [
    'All',
    'Produce',
    'Dairy',
    'Meat & Seafood',
    'Bakery',
    'Pantry',
    'Condiments',
    'Frozen',
    'Beverages',
    'Snacks'
  ];
  const statuses = [
    { id: 'All', label: 'All Items' },
    { id: 'expiring_soon', label: 'Expiring Soon (<3d)' },
    { id: 'low_stock', label: 'Low Stock' },
    { id: 'expired', label: 'Expired' }
  ];

  const filteredItems = items.filter((item) => {
    if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleConsume = async (id: number, amount: number = 1.0) => {
    try {
      await api.consumePantryItem(id, amount);
      onItemUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustQuantity = async (item: PantryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      if (newQty === 0) {
        await api.consumePantryItem(item.id, item.quantity);
      } else {
        await api.updatePantryItem(item.id, { quantity: Math.round(newQty * 10) / 10 });
      }
      onItemUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this item from your pantry?')) {
      try {
        await api.deletePantryItem(id);
        onItemUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pantry & Refrigerator Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track shelf life, manage stock levels, and minimize kitchen food waste.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search in pantry (e.g. Milk, Apples, Pasta...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Location Filters */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedLocation === loc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc === 'Fridge' ? '🧊 Fridge' : loc === 'Pantry' ? '🥫 Pantry' : loc === 'Freezer' ? '❄️ Freezer' : 'All Zones'}
              </button>
            ))}
          </div>

          {/* Status & Category dropdowns */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3 text-2xl">
            🥫
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">No items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or add new groceries to your pantry.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isExpiringSoon = item.status === 'expiring_soon';
            const isExpired = item.status === 'expired';
            const isLow = item.is_low_stock;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isExpired
                    ? 'border-rose-300 bg-rose-50/10'
                    : isExpiringSoon
                    ? 'border-amber-300 bg-amber-50/10'
                    : isLow
                    ? 'border-orange-200'
                    : 'border-slate-200/80'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.location}</span>
                    </span>

                    {/* Expiry Pill */}
                    {item.expiry_date && (
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isExpired
                            ? 'bg-rose-100 text-rose-700'
                            : isExpiringSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>
                          {isExpired
                            ? 'Expired'
                            : item.days_until_expiry === 0
                            ? 'Expires Today'
                            : item.days_until_expiry === 1
                            ? '1 day left'
                            : `${item.days_until_expiry} days left`}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Item Name & Category */}
                  <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{item.category}</span>
                    </span>
                    {item.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[140px] italic">{item.notes}</span>
                      </>
                    )}
                  </div>

                  {/* Low stock warning */}
                  {isLow && (
                    <div className="mt-2 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block">
                      Low Stock Alert
                    </div>
                  )}
                </div>

                {/* Bottom Controls: Quantity & Quick Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Quantity Counter */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAdjustQuantity(item, -1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      title="Decrement quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 min-w-10 text-center">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      onClick={() => handleAdjustQuantity(item, 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      title="Increment quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Use / Delete buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleConsume(item.id, 1)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Consume / Use 1 portion"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
