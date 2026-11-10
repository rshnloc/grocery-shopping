import {
  PantryItem,
  ShoppingList,
  ShoppingItem,
  Recipe,
  WasteRecommendation,
  AnalyticsSummary,
  ItemGuess
} from './types';

const BASE_URL = '/api';

export const api = {
  // --- Pantry ---
  async getPantry(params?: { category?: string; location?: string; status?: string; search?: string }): Promise<PantryItem[]> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.location && params.location !== 'All') query.append('location', params.location);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${BASE_URL}/pantry?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch pantry items');
    return res.json();
  },

  async addPantryItem(item: Partial<PantryItem>): Promise<PantryItem> {
    const res = await fetch(`${BASE_URL}/pantry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create pantry item');
    return res.json();
  },

  async updatePantryItem(id: number, item: Partial<PantryItem>): Promise<PantryItem> {
    const res = await fetch(`${BASE_URL}/pantry/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update pantry item');
    return res.json();
  },

  async deletePantryItem(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/pantry/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete pantry item');
  },

  async consumePantryItem(id: number, amount: number = 1.0): Promise<void> {
    const res = await fetch(`${BASE_URL}/pantry/${id}/consume?amount=${amount}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to consume item');
  },

  // --- Shopping Lists ---
  async getShoppingLists(): Promise<ShoppingList[]> {
    const res = await fetch(`${BASE_URL}/shopping-lists`);
    if (!res.ok) throw new Error('Failed to fetch shopping lists');
    return res.json();
  },

  async createShoppingList(list: { title: string; budget_limit?: number }): Promise<ShoppingList> {
    const res = await fetch(`${BASE_URL}/shopping-lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    if (!res.ok) throw new Error('Failed to create shopping list');
    return res.json();
  },

  async deleteShoppingList(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/shopping-lists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shopping list');
  },

  async addShoppingItem(listId: number, item: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const res = await fetch(`${BASE_URL}/shopping-lists/${listId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add item to shopping list');
    return res.json();
  },

  async updateShoppingItem(id: number, item: Partial<ShoppingItem>): Promise<ShoppingItem> {
    const res = await fetch(`${BASE_URL}/shopping-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update shopping item');
    return res.json();
  },

  async deleteShoppingItem(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/shopping-items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shopping item');
  },

  async addLowStockToShoppingList(listId: number): Promise<{ message: string; added_count: number }> {
    const res = await fetch(`${BASE_URL}/shopping-lists/${listId}/add-low-stock`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync low stock items');
    return res.json();
  },

  async checkoutShoppingList(listId: number): Promise<{ message: string; transferred_count: number; total_spent: number }> {
    const res = await fetch(`${BASE_URL}/shopping-lists/${listId}/checkout`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to complete checkout');
    return res.json();
  },

  // --- Recipes ---
  async getRecipes(category?: string): Promise<Recipe[]> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${BASE_URL}/recipes${query}`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  async createRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
    const res = await fetch(`${BASE_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  },

  async addRecipeMissingToList(recipeId: number, listId?: number): Promise<{ message: string; added_items: string[] }> {
    const query = listId ? `?list_id=${listId}` : '';
    const res = await fetch(`${BASE_URL}/recipes/${recipeId}/add-missing-to-list${query}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to add recipe ingredients to shopping list');
    return res.json();
  },

  // --- Smart Engine & Analytics ---
  async guessItem(name: string): Promise<ItemGuess> {
    const res = await fetch(`${BASE_URL}/smart/guess-item?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Failed to guess item');
    return res.json();
  },

  async getWasteRecommendations(): Promise<{ expiring_count: number; recommendations: WasteRecommendation[] }> {
    const res = await fetch(`${BASE_URL}/smart/waste-prevention`);
    if (!res.ok) throw new Error('Failed to fetch waste recommendations');
    return res.json();
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};
