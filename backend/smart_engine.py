"""
Smart heuristic engine for grocery categorization, shelf-life estimation,
recipe ingredient matching, and food waste reduction insights.
Zero external API calls, completely self-contained, no credentials required.
"""
from datetime import date, timedelta
from typing import Dict, Any, List, Optional
import re

# Comprehensive knowledge base of grocery categories, default locations, and shelf life (days)
KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    # Dairy & Eggs
    "milk": {"category": "Dairy", "location": "Fridge", "shelf_life": 7, "unit": "liters"},
    "almond milk": {"category": "Dairy", "location": "Fridge", "shelf_life": 10, "unit": "liters"},
    "oat milk": {"category": "Dairy", "location": "Fridge", "shelf_life": 10, "unit": "liters"},
    "cheese": {"category": "Dairy", "location": "Fridge", "shelf_life": 21, "unit": "g"},
    "cheddar": {"category": "Dairy", "location": "Fridge", "shelf_life": 28, "unit": "g"},
    "mozzarella": {"category": "Dairy", "location": "Fridge", "shelf_life": 14, "unit": "g"},
    "parmesan": {"category": "Dairy", "location": "Fridge", "shelf_life": 60, "unit": "g"},
    "butter": {"category": "Dairy", "location": "Fridge", "shelf_life": 30, "unit": "g"},
    "yogurt": {"category": "Dairy", "location": "Fridge", "shelf_life": 14, "unit": "g"},
    "greek yogurt": {"category": "Dairy", "location": "Fridge", "shelf_life": 14, "unit": "g"},
    "cream": {"category": "Dairy", "location": "Fridge", "shelf_life": 7, "unit": "ml"},
    "heavy cream": {"category": "Dairy", "location": "Fridge", "shelf_life": 7, "unit": "ml"},
    "sour cream": {"category": "Dairy", "location": "Fridge", "shelf_life": 14, "unit": "ml"},
    "egg": {"category": "Dairy", "location": "Fridge", "shelf_life": 28, "unit": "pcs"},
    "eggs": {"category": "Dairy", "location": "Fridge", "shelf_life": 28, "unit": "pcs"},

    # Produce (Fruits & Vegetables)
    "apple": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "pcs"},
    "banana": {"category": "Produce", "location": "Pantry", "shelf_life": 5, "unit": "pcs"},
    "orange": {"category": "Produce", "location": "Fridge", "shelf_life": 14, "unit": "pcs"},
    "lemon": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "pcs"},
    "lime": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "pcs"},
    "berry": {"category": "Produce", "location": "Fridge", "shelf_life": 4, "unit": "g"},
    "strawberries": {"category": "Produce", "location": "Fridge", "shelf_life": 4, "unit": "g"},
    "blueberries": {"category": "Produce", "location": "Fridge", "shelf_life": 7, "unit": "g"},
    "avocado": {"category": "Produce", "location": "Pantry", "shelf_life": 5, "unit": "pcs"},
    "tomato": {"category": "Produce", "location": "Pantry", "shelf_life": 7, "unit": "pcs"},
    "tomatoes": {"category": "Produce", "location": "Pantry", "shelf_life": 7, "unit": "pcs"},
    "onion": {"category": "Produce", "location": "Pantry", "shelf_life": 30, "unit": "pcs"},
    "garlic": {"category": "Produce", "location": "Pantry", "shelf_life": 60, "unit": "pcs"},
    "potato": {"category": "Produce", "location": "Pantry", "shelf_life": 30, "unit": "kg"},
    "potatoes": {"category": "Produce", "location": "Pantry", "shelf_life": 30, "unit": "kg"},
    "spinach": {"category": "Produce", "location": "Fridge", "shelf_life": 5, "unit": "g"},
    "lettuce": {"category": "Produce", "location": "Fridge", "shelf_life": 7, "unit": "pcs"},
    "kale": {"category": "Produce", "location": "Fridge", "shelf_life": 6, "unit": "g"},
    "carrot": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "kg"},
    "carrots": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "kg"},
    "broccoli": {"category": "Produce", "location": "Fridge", "shelf_life": 7, "unit": "pcs"},
    "cucumber": {"category": "Produce", "location": "Fridge", "shelf_life": 7, "unit": "pcs"},
    "bell pepper": {"category": "Produce", "location": "Fridge", "shelf_life": 10, "unit": "pcs"},
    "mushroom": {"category": "Produce", "location": "Fridge", "shelf_life": 5, "unit": "g"},
    "mushrooms": {"category": "Produce", "location": "Fridge", "shelf_life": 5, "unit": "g"},
    "ginger": {"category": "Produce", "location": "Fridge", "shelf_life": 21, "unit": "g"},

    # Meat & Seafood
    "chicken": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 3, "unit": "kg"},
    "chicken breast": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 3, "unit": "kg"},
    "beef": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 4, "unit": "kg"},
    "ground beef": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 2, "unit": "kg"},
    "pork": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 4, "unit": "kg"},
    "salmon": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 2, "unit": "kg"},
    "fish": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 2, "unit": "kg"},
    "shrimp": {"category": "Meat & Seafood", "location": "Freezer", "shelf_life": 60, "unit": "kg"},
    "turkey": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 3, "unit": "kg"},
    "bacon": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 10, "unit": "pack"},
    "tofu": {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 14, "unit": "pack"},

    # Bakery
    "bread": {"category": "Bakery", "location": "Pantry", "shelf_life": 6, "unit": "loaf"},
    "sourdough": {"category": "Bakery", "location": "Pantry", "shelf_life": 6, "unit": "loaf"},
    "bagel": {"category": "Bakery", "location": "Pantry", "shelf_life": 5, "unit": "pcs"},
    "bagels": {"category": "Bakery", "location": "Pantry", "shelf_life": 5, "unit": "pcs"},
    "tortilla": {"category": "Bakery", "location": "Pantry", "shelf_life": 14, "unit": "pack"},
    "tortillas": {"category": "Bakery", "location": "Pantry", "shelf_life": 14, "unit": "pack"},
    "croissant": {"category": "Bakery", "location": "Pantry", "shelf_life": 3, "unit": "pcs"},

    # Pantry & Grains
    "rice": {"category": "Pantry", "location": "Pantry", "shelf_life": 365, "unit": "kg"},
    "pasta": {"category": "Pantry", "location": "Pantry", "shelf_life": 365, "unit": "pack"},
    "spaghetti": {"category": "Pantry", "location": "Pantry", "shelf_life": 365, "unit": "pack"},
    "oats": {"category": "Pantry", "location": "Pantry", "shelf_life": 180, "unit": "kg"},
    "rolled oats": {"category": "Pantry", "location": "Pantry", "shelf_life": 180, "unit": "kg"},
    "quinoa": {"category": "Pantry", "location": "Pantry", "shelf_life": 365, "unit": "kg"},
    "flour": {"category": "Pantry", "location": "Pantry", "shelf_life": 240, "unit": "kg"},
    "sugar": {"category": "Pantry", "location": "Pantry", "shelf_life": 720, "unit": "kg"},
    "canned beans": {"category": "Pantry", "location": "Pantry", "shelf_life": 720, "unit": "cans"},
    "black beans": {"category": "Pantry", "location": "Pantry", "shelf_life": 720, "unit": "cans"},
    "chickpeas": {"category": "Pantry", "location": "Pantry", "shelf_life": 720, "unit": "cans"},
    "canned tomatoes": {"category": "Pantry", "location": "Pantry", "shelf_life": 540, "unit": "cans"},
    "cereal": {"category": "Pantry", "location": "Pantry", "shelf_life": 120, "unit": "box"},
    "peanut butter": {"category": "Pantry", "location": "Pantry", "shelf_life": 180, "unit": "jar"},
    "honey": {"category": "Pantry", "location": "Pantry", "shelf_life": 720, "unit": "jar"},
    "lentils": {"category": "Pantry", "location": "Pantry", "shelf_life": 365, "unit": "kg"},

    # Condiments & Spices
    "olive oil": {"category": "Condiments", "location": "Pantry", "shelf_life": 365, "unit": "bottles"},
    "oil": {"category": "Condiments", "location": "Pantry", "shelf_life": 365, "unit": "bottles"},
    "soy sauce": {"category": "Condiments", "location": "Fridge", "shelf_life": 365, "unit": "bottles"},
    "vinegar": {"category": "Condiments", "location": "Pantry", "shelf_life": 720, "unit": "bottles"},
    "salt": {"category": "Condiments", "location": "Pantry", "shelf_life": 1000, "unit": "g"},
    "pepper": {"category": "Condiments", "location": "Pantry", "shelf_life": 720, "unit": "g"},
    "black pepper": {"category": "Condiments", "location": "Pantry", "shelf_life": 720, "unit": "g"},
    "oregano": {"category": "Condiments", "location": "Pantry", "shelf_life": 365, "unit": "g"},
    "basil": {"category": "Condiments", "location": "Pantry", "shelf_life": 7, "unit": "bunch"},
    "ketchup": {"category": "Condiments", "location": "Fridge", "shelf_life": 180, "unit": "bottles"},
    "mustard": {"category": "Condiments", "location": "Fridge", "shelf_life": 365, "unit": "bottles"},
    "mayo": {"category": "Condiments", "location": "Fridge", "shelf_life": 60, "unit": "jar"},
    "mayonnaise": {"category": "Condiments", "location": "Fridge", "shelf_life": 60, "unit": "jar"},

    # Beverages & Snacks
    "coffee": {"category": "Beverages", "location": "Pantry", "shelf_life": 120, "unit": "pack"},
    "tea": {"category": "Beverages", "location": "Pantry", "shelf_life": 365, "unit": "box"},
    "orange juice": {"category": "Beverages", "location": "Fridge", "shelf_life": 10, "unit": "liters"},
    "sparkling water": {"category": "Beverages", "location": "Pantry", "shelf_life": 365, "unit": "cans"},
    "almonds": {"category": "Snacks", "location": "Pantry", "shelf_life": 180, "unit": "g"},
    "chips": {"category": "Snacks", "location": "Pantry", "shelf_life": 60, "unit": "pack"},
    "crackers": {"category": "Snacks", "location": "Pantry", "shelf_life": 90, "unit": "box"},
    "dark chocolate": {"category": "Snacks", "location": "Pantry", "shelf_life": 365, "unit": "bar"},

    # Frozen
    "frozen berries": {"category": "Frozen", "location": "Freezer", "shelf_life": 180, "unit": "pack"},
    "frozen peas": {"category": "Frozen", "location": "Freezer", "shelf_life": 240, "unit": "pack"},
    "ice cream": {"category": "Frozen", "location": "Freezer", "shelf_life": 90, "unit": "tub"},
    "frozen pizza": {"category": "Frozen", "location": "Freezer", "shelf_life": 120, "unit": "pcs"},
}


def guess_item_metadata(name: str) -> Dict[str, Any]:
    """
    Intelligently infer category, storage location, estimated shelf life,
    and standard units from an item name.
    """
    cleaned = name.strip().lower()
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)

    # 1. Exact match
    if cleaned in KNOWLEDGE_BASE:
        return KNOWLEDGE_BASE[cleaned]

    # 2. Check substring matching
    for key, data in KNOWLEDGE_BASE.items():
        if key in cleaned or cleaned in key:
            return data

    # 3. Keyword / suffix rules
    if any(w in cleaned for w in ["milk", "cheese", "cream", "butter", "curd"]):
        return {"category": "Dairy", "location": "Fridge", "shelf_life": 10, "unit": "pcs"}
    if any(w in cleaned for w in ["chicken", "beef", "pork", "steak", "meat", "salmon", "tuna", "prawn", "fillet"]):
        return {"category": "Meat & Seafood", "location": "Fridge", "shelf_life": 3, "unit": "kg"}
    if any(w in cleaned for w in ["apple", "berry", "fruit", "green", "leaf", "salad", "vegetable", "herb"]):
        return {"category": "Produce", "location": "Fridge", "shelf_life": 7, "unit": "pcs"}
    if any(w in cleaned for w in ["frozen", "ice"]):
        return {"category": "Frozen", "location": "Freezer", "shelf_life": 90, "unit": "pack"}
    if any(w in cleaned for w in ["bread", "roll", "bun", "muffin", "loaf", "pastry"]):
        return {"category": "Bakery", "location": "Pantry", "shelf_life": 5, "unit": "loaf"}
    if any(w in cleaned for w in ["juice", "soda", "water", "tea", "coffee", "beer", "wine", "drink"]):
        return {"category": "Beverages", "location": "Fridge", "shelf_life": 30, "unit": "liters"}
    if any(w in cleaned for w in ["sauce", "spice", "seasoning", "salt", "pepper", "dip"]):
        return {"category": "Condiments", "location": "Pantry", "shelf_life": 180, "unit": "jar"}
    if any(w in cleaned for w in ["snack", "chip", "cookie", "nut", "candy"]):
        return {"category": "Snacks", "location": "Pantry", "shelf_life": 60, "unit": "pack"}

    # Default fallback
    return {"category": "Pantry", "location": "Pantry", "shelf_life": 30, "unit": "pcs"}


def compute_pantry_item_status(item) -> Dict[str, Any]:
    """
    Computes days until expiry and visual status badge for a pantry item.
    """
    today = date.today()
    days_left = None
    status = "fresh"

    if item.expiry_date:
        days_left = (item.expiry_date - today).days
        if days_left < 0:
            status = "expired"
        elif days_left <= 3:
            status = "expiring_soon"

    if status == "fresh" and item.quantity <= item.minimum_stock:
        status = "low_stock"

    return {
        "days_until_expiry": days_left,
        "status": status,
        "is_low_stock": item.quantity <= item.minimum_stock
    }


def normalize_ingredient_name(name: str) -> str:
    """Standardize ingredient names for fuzzy comparison."""
    n = name.lower().strip()
    # Remove common plurals and qualifiers
    n = re.sub(r'\b(fresh|dried|chopped|sliced|diced|cooked|raw|ground|minced|organic|clove|cloves)\b', '', n)
    n = re.sub(r'[^a-z0-9\s]', '', n)
    return n.strip()


def matches_ingredient(pantry_name: str, recipe_ingredient: str) -> bool:
    """
    Checks if a pantry item satisfies a recipe ingredient.
    """
    p = normalize_ingredient_name(pantry_name)
    r = normalize_ingredient_name(recipe_ingredient)

    if not p or not r:
        return False

    if p == r or p in r or r in p:
        return True

    # Common word overlap
    p_words = set(p.split())
    r_words = set(r.split())
    if p_words.intersection(r_words):
        return True

    return False


def evaluate_recipe_match(recipe, pantry_items) -> Dict[str, Any]:
    """
    Evaluates how many recipe ingredients are available in active, unexpired pantry stock.
    Returns matched count, total count, match percentage, and list of missing ingredients.
    """
    # Filter active, non-consumed, non-expired items
    valid_pantry = [
        item for item in pantry_items
        if not item.is_consumed and (not item.expiry_date or item.expiry_date >= date.today())
    ]

    total_ingredients = len(recipe.ingredients)
    if total_ingredients == 0:
        return {
            "match_percentage": 100.0,
            "missing_ingredients_count": 0,
            "ingredients_detail": []
        }

    matched_count = 0
    ingredients_detail = []

    for ingredient in recipe.ingredients:
        found_item = None
        for item in valid_pantry:
            if matches_ingredient(item.name, ingredient.item_name):
                found_item = item
                break

        in_stock = found_item is not None
        if in_stock:
            matched_count += 1

        ingredients_detail.append({
            "id": ingredient.id,
            "recipe_id": ingredient.recipe_id,
            "item_name": ingredient.item_name,
            "quantity": ingredient.quantity,
            "unit": ingredient.unit,
            "is_optional": ingredient.is_optional,
            "in_stock": in_stock,
            "stock_quantity": found_item.quantity if found_item else 0.0
        })

    match_percentage = round((matched_count / total_ingredients) * 100, 1)
    missing_count = total_ingredients - matched_count

    return {
        "match_percentage": match_percentage,
        "missing_ingredients_count": missing_count,
        "ingredients_detail": ingredients_detail
    }
