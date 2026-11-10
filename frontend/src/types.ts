export interface PantryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string | null;
  expiry_date: string | null;
  minimum_stock: number;
  is_low_stock: boolean;
  is_consumed: boolean;
  location: string;
  notes: string | null;
  days_until_expiry: number | null;
  status: 'fresh' | 'expiring_soon' | 'expired' | 'low_stock';
}

export interface ShoppingItem {
  id: number;
  list_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_price: number;
  is_purchased: boolean;
  notes: string | null;
}

export interface ShoppingList {
  id: number;
  title: string;
  created_at: string;
  budget_limit: number;
  is_archived: boolean;
  items: ShoppingItem[];
  total_estimated: number;
  total_purchased: number;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  item_name: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  in_stock: boolean;
  stock_quantity: number;
}

export interface Recipe {
  id: number;
  name: string;
  category: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  instructions: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image_emoji: string;
  ingredients: RecipeIngredient[];
  match_percentage: number;
  missing_ingredients_count: number;
}

export interface WasteRecommendation {
  item_id: number;
  name: string;
  days_left: number;
  expiry_date: string;
  quantity: number;
  unit: string;
  suggested_recipes: {
    recipe_id: number;
    recipe_name: string;
    image_emoji: string;
    match_percentage: number;
  }[];
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
}

export interface PantryDistribution {
  category: string;
  count: number;
}

export interface AnalyticsSummary {
  total_pantry_items: number;
  expiring_soon_count: number;
  expired_count: number;
  low_stock_count: number;
  total_spent_historical: number;
  category_spending: CategorySpend[];
  pantry_distribution: PantryDistribution[];
}

export interface ItemGuess {
  category: string;
  estimated_shelf_life_days: number;
  recommended_location: string;
  unit: string;
}

