"""
Seed initial generic grocery items, shopping lists, and recipes.
All data is strictly generic mock/sample data: zero PII, zero credentials.
"""
import sys
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import date, timedelta
from sqlalchemy.orm import Session
from models import PantryItem, ShoppingList, ShoppingItem, Recipe, RecipeIngredient, ExpenseLog


def seed_database(db: Session):
    # Only seed if database is empty
    if db.query(PantryItem).count() > 0:
        return

    today = date.today()

    # 1. Pantry items (Generic grocery staples)
    sample_pantry = [
        PantryItem(
            name="Whole Milk",
            category="Dairy",
            quantity=1.5,
            unit="liters",
            purchase_date=today - timedelta(days=4),
            expiry_date=today + timedelta(days=2),  # Expiring soon!
            minimum_stock=1.0,
            location="Fridge",
            notes="Fresh organic whole milk"
        ),
        PantryItem(
            name="Eggs",
            category="Dairy",
            quantity=12,
            unit="pcs",
            purchase_date=today - timedelta(days=2),
            expiry_date=today + timedelta(days=16),
            minimum_stock=6.0,
            location="Fridge",
            notes="Grade A large brown eggs"
        ),
        PantryItem(
            name="Greek Yogurt",
            category="Dairy",
            quantity=0.2,
            unit="kg",
            purchase_date=today - timedelta(days=6),
            expiry_date=today + timedelta(days=1),  # Expiring tomorrow!
            minimum_stock=0.5,
            is_low_stock=True,
            location="Fridge",
            notes="Plain unsweetened"
        ),
        PantryItem(
            name="Baby Spinach",
            category="Produce",
            quantity=200,
            unit="g",
            purchase_date=today - timedelta(days=3),
            expiry_date=today + timedelta(days=2),  # Expiring soon!
            minimum_stock=100.0,
            location="Fridge",
            notes="Pre-washed salad greens"
        ),
        PantryItem(
            name="Bananas",
            category="Produce",
            quantity=5,
            unit="pcs",
            purchase_date=today - timedelta(days=2),
            expiry_date=today + timedelta(days=3),
            minimum_stock=2.0,
            location="Pantry",
            notes="Ripe, ready to eat"
        ),
        PantryItem(
            name="Avocados",
            category="Produce",
            quantity=3,
            unit="pcs",
            purchase_date=today - timedelta(days=1),
            expiry_date=today + timedelta(days=4),
            minimum_stock=1.0,
            location="Pantry"
        ),
        PantryItem(
            name="Garlic",
            category="Produce",
            quantity=1,
            unit="bulb",
            purchase_date=today - timedelta(days=10),
            expiry_date=today + timedelta(days=20),
            minimum_stock=1.0,
            location="Pantry"
        ),
        PantryItem(
            name="Onions",
            category="Produce",
            quantity=4,
            unit="pcs",
            purchase_date=today - timedelta(days=5),
            expiry_date=today + timedelta(days=25),
            minimum_stock=2.0,
            location="Pantry"
        ),
        PantryItem(
            name="Rolled Oats",
            category="Pantry",
            quantity=0.8,
            unit="kg",
            purchase_date=today - timedelta(days=15),
            expiry_date=today + timedelta(days=120),
            minimum_stock=0.5,
            location="Pantry",
            notes="Gluten-free oats"
        ),
        PantryItem(
            name="Extra Virgin Olive Oil",
            category="Condiments",
            quantity=0.4,
            unit="liters",
            purchase_date=today - timedelta(days=30),
            expiry_date=today + timedelta(days=240),
            minimum_stock=0.5,
            is_low_stock=True,
            location="Pantry"
        ),
        PantryItem(
            name="Penne Pasta",
            category="Pantry",
            quantity=500,
            unit="g",
            purchase_date=today - timedelta(days=20),
            expiry_date=today + timedelta(days=300),
            minimum_stock=250.0,
            location="Pantry"
        ),
        PantryItem(
            name="Canned Diced Tomatoes",
            category="Pantry",
            quantity=2,
            unit="cans",
            purchase_date=today - timedelta(days=25),
            expiry_date=today + timedelta(days=400),
            minimum_stock=2.0,
            location="Pantry"
        ),
        PantryItem(
            name="Chicken Breast",
            category="Meat & Seafood",
            quantity=0.6,
            unit="kg",
            purchase_date=today - timedelta(days=1),
            expiry_date=today + timedelta(days=2),  # Expiring soon!
            minimum_stock=0.5,
            location="Fridge"
        ),
        PantryItem(
            name="Sourdough Bread",
            category="Bakery",
            quantity=0.5,
            unit="loaf",
            purchase_date=today - timedelta(days=3),
            expiry_date=today + timedelta(days=2),
            minimum_stock=1.0,
            is_low_stock=True,
            location="Pantry"
        )
    ]
    db.add_all(sample_pantry)
    db.commit()

    # 2. Sample Shopping List
    weekly_list = ShoppingList(
        title="Weekly Groceries & Restock",
        budget_limit=75.0,
        is_archived=False
    )
    db.add(weekly_list)
    db.commit()
    db.refresh(weekly_list)

    sample_items = [
        ShoppingItem(
            list_id=weekly_list.id,
            name="Greek Yogurt",
            category="Dairy",
            quantity=1,
            unit="tub",
            estimated_price=4.50,
            is_purchased=False,
            notes="Low stock in fridge"
        ),
        ShoppingItem(
            list_id=weekly_list.id,
            name="Olive Oil",
            category="Condiments",
            quantity=1,
            unit="bottle",
            estimated_price=11.99,
            is_purchased=False,
            notes="Pantry restock"
        ),
        ShoppingItem(
            list_id=weekly_list.id,
            name="Fresh Parmesan Cheese",
            category="Dairy",
            quantity=200,
            unit="g",
            estimated_price=5.25,
            is_purchased=False,
            notes="For pasta recipes"
        ),
        ShoppingItem(
            list_id=weekly_list.id,
            name="Honeycrisp Apples",
            category="Produce",
            quantity=4,
            unit="pcs",
            estimated_price=3.99,
            is_purchased=True,
            notes="Snacks"
        ),
        ShoppingItem(
            list_id=weekly_list.id,
            name="Fresh Basil",
            category="Produce",
            quantity=1,
            unit="bunch",
            estimated_price=2.49,
            is_purchased=False,
            notes="For homemade tomato sauce"
        )
    ]
    db.add_all(sample_items)
    db.commit()

    # 3. Sample Recipes
    r1 = Recipe(
        name="Mediterranean Garlic & Tomato Penne",
        category="Dinner",
        prep_time_minutes=10,
        cook_time_minutes=15,
        servings=2,
        difficulty="Easy",
        image_emoji="🍝",
        instructions="1. Bring a large pot of salted water to boil and cook penne according to package directions.\n2. In a skillet, heat 2 tbsp olive oil over medium heat. Add sliced garlic and sauté until fragrant (1 min).\n3. Pour in canned diced tomatoes and simmer for 8 minutes.\n4. Toss cooked pasta with tomato sauce, fresh spinach, and grated parmesan.\n5. Season with salt, pepper, and fresh basil."
    )
    db.add(r1)
    db.commit()
    db.refresh(r1)

    r1_ingredients = [
        RecipeIngredient(recipe_id=r1.id, item_name="Penne Pasta", quantity=250, unit="g"),
        RecipeIngredient(recipe_id=r1.id, item_name="Garlic", quantity=2, unit="cloves"),
        RecipeIngredient(recipe_id=r1.id, item_name="Canned Diced Tomatoes", quantity=1, unit="can"),
        RecipeIngredient(recipe_id=r1.id, item_name="Baby Spinach", quantity=100, unit="g"),
        RecipeIngredient(recipe_id=r1.id, item_name="Olive Oil", quantity=2, unit="tbsp"),
        RecipeIngredient(recipe_id=r1.id, item_name="Fresh Basil", quantity=1, unit="sprig", is_optional=True),
        RecipeIngredient(recipe_id=r1.id, item_name="Parmesan Cheese", quantity=50, unit="g", is_optional=True),
    ]
    db.add_all(r1_ingredients)

    r2 = Recipe(
        name="Classic Pan-Seared Chicken & Greens",
        category="Dinner",
        prep_time_minutes=10,
        cook_time_minutes=18,
        servings=2,
        difficulty="Easy",
        image_emoji="🍗",
        instructions="1. Pat chicken breasts dry and season generously with salt and pepper.\n2. Heat olive oil in a skillet over medium-high heat. Sear chicken 6-7 minutes per side until golden brown and cooked through.\n3. Remove chicken to rest. In the same skillet, add minced garlic and baby spinach.\n4. Sauté spinach for 2 minutes until wilted.\n5. Slice chicken and serve atop greens with a squeeze of fresh lemon."
    )
    db.add(r2)
    db.commit()
    db.refresh(r2)

    r2_ingredients = [
        RecipeIngredient(recipe_id=r2.id, item_name="Chicken Breast", quantity=0.5, unit="kg"),
        RecipeIngredient(recipe_id=r2.id, item_name="Baby Spinach", quantity=100, unit="g"),
        RecipeIngredient(recipe_id=r2.id, item_name="Garlic", quantity=2, unit="cloves"),
        RecipeIngredient(recipe_id=r2.id, item_name="Olive Oil", quantity=1, unit="tbsp"),
    ]
    db.add_all(r2_ingredients)

    r3 = Recipe(
        name="Energizing Banana Oatmeal Bowl",
        category="Breakfast",
        prep_time_minutes=5,
        cook_time_minutes=5,
        servings=1,
        difficulty="Easy",
        image_emoji="🥣",
        instructions="1. In a small saucepan, combine rolled oats and milk.\n2. Cook over medium heat for 4-5 minutes, stirring frequently until creamy.\n3. Pour into a bowl and top with sliced fresh banana, a dollop of greek yogurt, and a sprinkle of cinnamon or nuts."
    )
    db.add(r3)
    db.commit()
    db.refresh(r3)

    r3_ingredients = [
        RecipeIngredient(recipe_id=r3.id, item_name="Rolled Oats", quantity=60, unit="g"),
        RecipeIngredient(recipe_id=r3.id, item_name="Whole Milk", quantity=200, unit="ml"),
        RecipeIngredient(recipe_id=r3.id, item_name="Bananas", quantity=1, unit="pcs"),
        RecipeIngredient(recipe_id=r3.id, item_name="Greek Yogurt", quantity=50, unit="g", is_optional=True),
    ]
    db.add_all(r3_ingredients)

    # 4. Sample Expense logs for spending analytics
    sample_expenses = [
        ExpenseLog(item_name="Weekly Produce Restock", category="Produce", amount=24.50, date=today - timedelta(days=12)),
        ExpenseLog(item_name="Dairy & Eggs Essentials", category="Dairy", amount=16.80, date=today - timedelta(days=9)),
        ExpenseLog(item_name="Artisan Bakery Loaf", category="Bakery", amount=6.50, date=today - timedelta(days=7)),
        ExpenseLog(item_name="Pantry Grains & Beans", category="Pantry", amount=19.20, date=today - timedelta(days=5)),
        ExpenseLog(item_name="Chicken & Salmon", category="Meat & Seafood", amount=31.40, date=today - timedelta(days=3)),
        ExpenseLog(item_name="Midweek Fruits", category="Produce", amount=8.90, date=today - timedelta(days=1)),
    ]
    db.add_all(sample_expenses)
    db.commit()
