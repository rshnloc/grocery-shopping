"""
FastAPI Backend for Smart Grocery and Shopping Manager.
Local-first, zero-credentials, zero-PII architecture.
"""
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from typing import List, Optional
from datetime import date, timedelta
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, get_db
import models
import schemas
from smart_engine import (
    guess_item_metadata,
    compute_pantry_item_status,
    evaluate_recipe_match,
    matches_ingredient,
    KNOWLEDGE_BASE
)
from seed_data import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Grocery & Shopping Manager API",
    description="Intelligent grocery inventory, shopping lists, meal planning, and food waste reduction.",
    version="1.0.0"
)

# Enable CORS for local Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()


# ---------------- Health & Overview ----------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Smart Grocery and Shopping Manager"}


# ---------------- Pantry Endpoints ----------------
@app.get("/api/pantry", response_model=List[schemas.PantryItemResponse])
def get_pantry_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False)

    if category and category != "All":
        query = query.filter(models.PantryItem.category == category)
    if location and location != "All":
        query = query.filter(models.PantryItem.location == location)
    if search:
        query = query.filter(models.PantryItem.name.ilike(f"%{search}%"))

    items = query.order_by(models.PantryItem.expiry_date.asc().nullslast()).all()
    results = []

    for item in items:
        status_info = compute_pantry_item_status(item)
        if status and status != "All" and status_info["status"] != status:
            continue

        item_dict = {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "purchase_date": item.purchase_date,
            "expiry_date": item.expiry_date,
            "minimum_stock": item.minimum_stock,
            "is_low_stock": status_info["is_low_stock"],
            "is_consumed": item.is_consumed,
            "location": item.location,
            "notes": item.notes,
            "days_until_expiry": status_info["days_until_expiry"],
            "status": status_info["status"]
        }
        results.append(schemas.PantryItemResponse(**item_dict))

    return results


@app.post("/api/pantry", response_model=schemas.PantryItemResponse)
def create_pantry_item(item_in: schemas.PantryItemCreate, db: Session = Depends(get_db)):
    meta = guess_item_metadata(item_in.name)

    purchase_d = item_in.purchase_date or date.today()
    expiry_d = item_in.expiry_date

    # Auto-calculate expiry date if not provided
    if not expiry_d and meta.get("shelf_life"):
        expiry_d = purchase_d + timedelta(days=meta["shelf_life"])

    category = item_in.category or meta.get("category", "Pantry")
    location = item_in.location or meta.get("location", "Pantry")
    unit = item_in.unit or meta.get("unit", "pcs")

    new_item = models.PantryItem(
        name=item_in.name.strip(),
        category=category,
        quantity=item_in.quantity,
        unit=unit,
        purchase_date=purchase_d,
        expiry_date=expiry_d,
        minimum_stock=item_in.minimum_stock,
        location=location,
        notes=item_in.notes,
        is_low_stock=item_in.quantity <= item_in.minimum_stock,
        is_consumed=False
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    status_info = compute_pantry_item_status(new_item)
    return schemas.PantryItemResponse(
        id=new_item.id,
        name=new_item.name,
        category=new_item.category,
        quantity=new_item.quantity,
        unit=new_item.unit,
        purchase_date=new_item.purchase_date,
        expiry_date=new_item.expiry_date,
        minimum_stock=new_item.minimum_stock,
        is_low_stock=status_info["is_low_stock"],
        is_consumed=new_item.is_consumed,
        location=new_item.location,
        notes=new_item.notes,
        days_until_expiry=status_info["days_until_expiry"],
        status=status_info["status"]
    )


@app.put("/api/pantry/{item_id}", response_model=schemas.PantryItemResponse)
def update_pantry_item(item_id: int, item_in: schemas.PantryItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    item.is_low_stock = item.quantity <= item.minimum_stock
    db.commit()
    db.refresh(item)

    status_info = compute_pantry_item_status(item)
    return schemas.PantryItemResponse(
        id=item.id,
        name=item.name,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        purchase_date=item.purchase_date,
        expiry_date=item.expiry_date,
        minimum_stock=item.minimum_stock,
        is_low_stock=status_info["is_low_stock"],
        is_consumed=item.is_consumed,
        location=item.location,
        notes=item.notes,
        days_until_expiry=status_info["days_until_expiry"],
        status=status_info["status"]
    )


@app.delete("/api/pantry/{item_id}")
def delete_pantry_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    db.delete(item)
    db.commit()
    return {"message": "Pantry item deleted successfully"}


@app.post("/api/pantry/{item_id}/consume")
def consume_pantry_item(item_id: int, amount: float = Query(1.0, ge=0.1), db: Session = Depends(get_db)):
    item = db.query(models.PantryItem).filter(models.PantryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    item.quantity = max(0.0, item.quantity - amount)
    if item.quantity == 0:
        item.is_consumed = True
    item.is_low_stock = item.quantity <= item.minimum_stock
    db.commit()
    db.refresh(item)
    return {"id": item.id, "quantity": item.quantity, "is_consumed": item.is_consumed, "is_low_stock": item.is_low_stock}


@app.get("/api/pantry/alerts")
def get_pantry_alerts(db: Session = Depends(get_db)):
    today = date.today()
    three_days_later = today + timedelta(days=3)

    active_items = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()

    expiring_soon = []
    expired = []
    low_stock = []

    for item in active_items:
        if item.expiry_date:
            if item.expiry_date < today:
                expired.append({"id": item.id, "name": item.name, "expiry_date": str(item.expiry_date), "category": item.category})
            elif item.expiry_date <= three_days_later:
                expiring_soon.append({
                    "id": item.id,
                    "name": item.name,
                    "expiry_date": str(item.expiry_date),
                    "days_left": (item.expiry_date - today).days,
                    "category": item.category
                })

        if item.quantity <= item.minimum_stock:
            low_stock.append({
                "id": item.id,
                "name": item.name,
                "quantity": item.quantity,
                "unit": item.unit,
                "minimum_stock": item.minimum_stock,
                "category": item.category
            })

    return {
        "expiring_soon": expiring_soon,
        "expired": expired,
        "low_stock": low_stock,
        "total_active_items": len(active_items)
    }


# ---------------- Shopping Lists Endpoints ----------------
@app.get("/api/shopping-lists", response_model=List[schemas.ShoppingListResponse])
def get_shopping_lists(db: Session = Depends(get_db)):
    lists = db.query(models.ShoppingList).filter(models.ShoppingList.is_archived == False).all()
    results = []

    for sl in lists:
        total_est = sum(i.estimated_price * (i.quantity or 1.0) for i in sl.items)
        total_bought = sum(i.estimated_price * (i.quantity or 1.0) for i in sl.items if i.is_purchased)
        items_res = [schemas.ShoppingItemResponse.model_validate(i) for i in sl.items]

        results.append(schemas.ShoppingListResponse(
            id=sl.id,
            title=sl.title,
            created_at=sl.created_at,
            budget_limit=sl.budget_limit,
            is_archived=sl.is_archived,
            items=items_res,
            total_estimated=round(total_est, 2),
            total_purchased=round(total_bought, 2)
        ))
    return results


@app.post("/api/shopping-lists", response_model=schemas.ShoppingListResponse)
def create_shopping_list(list_in: schemas.ShoppingListCreate, db: Session = Depends(get_db)):
    sl = models.ShoppingList(title=list_in.title, budget_limit=list_in.budget_limit)
    db.add(sl)
    db.commit()
    db.refresh(sl)
    return schemas.ShoppingListResponse(
        id=sl.id,
        title=sl.title,
        created_at=sl.created_at,
        budget_limit=sl.budget_limit,
        is_archived=sl.is_archived,
        items=[],
        total_estimated=0.0,
        total_purchased=0.0
    )


@app.delete("/api/shopping-lists/{list_id}")
def delete_shopping_list(list_id: int, db: Session = Depends(get_db)):
    sl = db.query(models.ShoppingList).filter(models.ShoppingList.id == list_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    db.delete(sl)
    db.commit()
    return {"message": "Shopping list deleted"}


@app.post("/api/shopping-lists/{list_id}/items", response_model=schemas.ShoppingItemResponse)
def add_item_to_shopping_list(list_id: int, item_in: schemas.ShoppingItemBase, db: Session = Depends(get_db)):
    sl = db.query(models.ShoppingList).filter(models.ShoppingList.id == list_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    meta = guess_item_metadata(item_in.name)
    category = item_in.category if item_in.category != "General" else meta.get("category", "General")
    unit = item_in.unit if item_in.unit != "pcs" else meta.get("unit", "pcs")

    new_item = models.ShoppingItem(
        list_id=list_id,
        name=item_in.name.strip(),
        category=category,
        quantity=item_in.quantity,
        unit=unit,
        estimated_price=item_in.estimated_price,
        is_purchased=False,
        notes=item_in.notes
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return schemas.ShoppingItemResponse.model_validate(new_item)


@app.put("/api/shopping-items/{item_id}", response_model=schemas.ShoppingItemResponse)
def update_shopping_item(item_id: int, item_in: schemas.ShoppingItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return schemas.ShoppingItemResponse.model_validate(item)


@app.delete("/api/shopping-items/{item_id}")
def delete_shopping_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    db.delete(item)
    db.commit()
    return {"message": "Shopping item deleted"}


@app.post("/api/shopping-lists/{list_id}/add-low-stock")
def add_low_stock_to_list(list_id: int, db: Session = Depends(get_db)):
    """
    Intelligently inspects pantry items that are low in stock and adds missing quantities to this shopping list.
    """
    sl = db.query(models.ShoppingList).filter(models.ShoppingList.id == list_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    low_stock_items = db.query(models.PantryItem).filter(
        models.PantryItem.is_consumed == False,
        models.PantryItem.quantity <= models.PantryItem.minimum_stock
    ).all()

    existing_names = {i.name.lower() for i in sl.items}
    added_count = 0

    for p_item in low_stock_items:
        if p_item.name.lower() not in existing_names:
            restock_qty = max(1.0, (p_item.minimum_stock * 2) - p_item.quantity)
            shop_item = models.ShoppingItem(
                list_id=sl.id,
                name=p_item.name,
                category=p_item.category,
                quantity=round(restock_qty, 1),
                unit=p_item.unit,
                estimated_price=0.0,
                is_purchased=False,
                notes="Auto-added from low stock alert"
            )
            db.add(shop_item)
            added_count += 1

    db.commit()
    return {"message": f"Added {added_count} low-stock items to list '{sl.title}'", "added_count": added_count}


@app.post("/api/shopping-lists/{list_id}/checkout")
def checkout_shopping_list(list_id: int, db: Session = Depends(get_db)):
    """
    Smart Checkout:
    1. Transfers all checked (is_purchased=True) items into the Pantry inventory.
    2. If item already exists in Pantry, tops up quantity and updates expiry date.
    3. If new, sets up category, location, and estimated shelf life automatically.
    4. Automatically logs the spending to ExpenseLog for analytics.
    5. Clears purchased items from the shopping list.
    """
    sl = db.query(models.ShoppingList).filter(models.ShoppingList.id == list_id).first()
    if not sl:
        raise HTTPException(status_code=404, detail="Shopping list not found")

    purchased_items = [i for i in sl.items if i.is_purchased]
    if not purchased_items:
        return {"message": "No purchased items to transfer", "transferred_count": 0, "total_spent": 0.0}

    today = date.today()
    transferred_count = 0
    total_spent = 0.0

    for s_item in purchased_items:
        meta = guess_item_metadata(s_item.name)
        shelf_life = meta.get("shelf_life", 14)
        new_expiry = today + timedelta(days=shelf_life)
        item_cost = s_item.estimated_price * (s_item.quantity or 1.0)
        total_spent += item_cost

        # Log expense
        expense = models.ExpenseLog(
            item_name=s_item.name,
            category=s_item.category,
            amount=round(item_cost, 2),
            date=today,
            notes=f"Purchased from list '{sl.title}'"
        )
        db.add(expense)

        # Check existing pantry item
        p_item = db.query(models.PantryItem).filter(
            models.PantryItem.name.ilike(s_item.name),
            models.PantryItem.is_consumed == False
        ).first()

        if p_item:
            # Top up existing pantry item
            p_item.quantity += s_item.quantity
            p_item.purchase_date = today
            p_item.expiry_date = new_expiry
            p_item.is_low_stock = p_item.quantity <= p_item.minimum_stock
        else:
            # Create fresh pantry entry
            new_pantry = models.PantryItem(
                name=s_item.name,
                category=s_item.category if s_item.category != "General" else meta["category"],
                quantity=s_item.quantity,
                unit=s_item.unit,
                purchase_date=today,
                expiry_date=new_expiry,
                minimum_stock=1.0,
                location=meta["location"],
                notes="Transferred from shopping list",
                is_low_stock=False,
                is_consumed=False
            )
            db.add(new_pantry)

        transferred_count += 1
        db.delete(s_item)

    db.commit()
    return {
        "message": f"Successfully stocked {transferred_count} items to pantry!",
        "transferred_count": transferred_count,
        "total_spent": round(total_spent, 2)
    }


# ---------------- Recipe & Meal Planner Endpoints ----------------
@app.get("/api/recipes", response_model=List[schemas.RecipeResponse])
def get_recipes(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Recipe)
    if category and category != "All":
        query = query.filter(models.Recipe.category == category)

    recipes = query.all()
    pantry_items = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()

    results = []
    for r in recipes:
        eval_data = evaluate_recipe_match(r, pantry_items)
        results.append(schemas.RecipeResponse(
            id=r.id,
            name=r.name,
            category=r.category,
            prep_time_minutes=r.prep_time_minutes,
            cook_time_minutes=r.cook_time_minutes,
            servings=r.servings,
            instructions=r.instructions,
            difficulty=r.difficulty,
            image_emoji=r.image_emoji,
            ingredients=[schemas.RecipeIngredientResponse(**ing) for ing in eval_data["ingredients_detail"]],
            match_percentage=eval_data["match_percentage"],
            missing_ingredients_count=eval_data["missing_ingredients_count"]
        ))

    # Sort recipes by highest pantry match %
    results.sort(key=lambda x: x.match_percentage, reverse=True)
    return results


@app.post("/api/recipes", response_model=schemas.RecipeResponse)
def create_recipe(recipe_in: schemas.RecipeCreate, db: Session = Depends(get_db)):
    new_recipe = models.Recipe(
        name=recipe_in.name,
        category=recipe_in.category,
        prep_time_minutes=recipe_in.prep_time_minutes,
        cook_time_minutes=recipe_in.cook_time_minutes,
        servings=recipe_in.servings,
        instructions=recipe_in.instructions,
        difficulty=recipe_in.difficulty,
        image_emoji=recipe_in.image_emoji or "🍲"
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    for ing in recipe_in.ingredients:
        db_ing = models.RecipeIngredient(
            recipe_id=new_recipe.id,
            item_name=ing.item_name,
            quantity=ing.quantity,
            unit=ing.unit,
            is_optional=ing.is_optional
        )
        db.add(db_ing)
    db.commit()
    db.refresh(new_recipe)

    pantry_items = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()
    eval_data = evaluate_recipe_match(new_recipe, pantry_items)

    return schemas.RecipeResponse(
        id=new_recipe.id,
        name=new_recipe.name,
        category=new_recipe.category,
        prep_time_minutes=new_recipe.prep_time_minutes,
        cook_time_minutes=new_recipe.cook_time_minutes,
        servings=new_recipe.servings,
        instructions=new_recipe.instructions,
        difficulty=new_recipe.difficulty,
        image_emoji=new_recipe.image_emoji,
        ingredients=[schemas.RecipeIngredientResponse(**ing) for ing in eval_data["ingredients_detail"]],
        match_percentage=eval_data["match_percentage"],
        missing_ingredients_count=eval_data["missing_ingredients_count"]
    )


@app.post("/api/recipes/{recipe_id}/add-missing-to-list")
def add_recipe_missing_to_shopping_list(
    recipe_id: int,
    list_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Adds missing ingredients for a specific recipe directly into the specified shopping list."""
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    target_list = None
    if list_id:
        target_list = db.query(models.ShoppingList).filter(models.ShoppingList.id == list_id).first()
    if not target_list:
        target_list = db.query(models.ShoppingList).filter(models.ShoppingList.is_archived == False).first()
        if not target_list:
            target_list = models.ShoppingList(title="Recipe Ingredients Shopping", budget_limit=50.0)
            db.add(target_list)
            db.commit()
            db.refresh(target_list)

    pantry_items = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()
    eval_data = evaluate_recipe_match(recipe, pantry_items)

    added_items = []
    for ing in eval_data["ingredients_detail"]:
        if not ing["in_stock"]:
            meta = guess_item_metadata(ing["item_name"])
            shop_item = models.ShoppingItem(
                list_id=target_list.id,
                name=ing["item_name"],
                category=meta["category"],
                quantity=ing["quantity"],
                unit=ing["unit"],
                estimated_price=2.99,
                is_purchased=False,
                notes=f"For recipe: {recipe.name}"
            )
            db.add(shop_item)
            added_items.append(ing["item_name"])

    db.commit()
    return {
        "message": f"Added {len(added_items)} missing ingredients to '{target_list.title}'",
        "added_items": added_items,
        "list_id": target_list.id
    }


# ---------------- Smart Helper & Analytics Endpoints ----------------
@app.get("/api/smart/guess-item", response_model=schemas.SmartCategorySuggestion)
def guess_item_api(name: str = Query(..., min_length=1)):
    meta = guess_item_metadata(name)
    return schemas.SmartCategorySuggestion(
        category=meta["category"],
        estimated_shelf_life_days=meta["shelf_life"],
        recommended_location=meta["location"],
        unit=meta["unit"]
    )


@app.get("/api/smart/waste-prevention")
def get_waste_prevention_recommendations(db: Session = Depends(get_db)):
    """
    Finds food items expiring soon and recommends recipes in the library
    that actively use them before they go bad!
    """
    today = date.today()
    expiring_window = today + timedelta(days=3)

    expiring_items = db.query(models.PantryItem).filter(
        models.PantryItem.is_consumed == False,
        models.PantryItem.expiry_date != None,
        models.PantryItem.expiry_date >= today,
        models.PantryItem.expiry_date <= expiring_window
    ).order_by(models.PantryItem.expiry_date.asc()).all()

    recipes = db.query(models.Recipe).all()
    all_pantry = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()

    recommendations = []
    for p_item in expiring_items:
        matching_recipes = []
        for r in recipes:
            for ing in r.ingredients:
                if matches_ingredient(p_item.name, ing.item_name):
                    eval_data = evaluate_recipe_match(r, all_pantry)
                    matching_recipes.append({
                        "recipe_id": r.id,
                        "recipe_name": r.name,
                        "image_emoji": r.image_emoji,
                        "match_percentage": eval_data["match_percentage"]
                    })
                    break

        recommendations.append({
            "item_id": p_item.id,
            "name": p_item.name,
            "days_left": (p_item.expiry_date - today).days,
            "expiry_date": str(p_item.expiry_date),
            "quantity": p_item.quantity,
            "unit": p_item.unit,
            "suggested_recipes": matching_recipes
        })

    return {
        "expiring_count": len(expiring_items),
        "recommendations": recommendations
    }


@app.get("/api/analytics/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Provides grocery spending stats, category breakdown, and waste metrics."""
    # Active pantry stats
    active_items = db.query(models.PantryItem).filter(models.PantryItem.is_consumed == False).all()
    today = date.today()

    expiring_count = sum(1 for i in active_items if i.expiry_date and 0 <= (i.expiry_date - today).days <= 3)
    expired_count = sum(1 for i in active_items if i.expiry_date and (i.expiry_date - today).days < 0)
    low_stock_count = sum(1 for i in active_items if i.quantity <= i.minimum_stock)

    # Spending by category
    expenses = db.query(models.ExpenseLog).all()
    total_spent = sum(e.amount for e in expenses)

    category_spend: dict = {}
    for e in expenses:
        category_spend[e.category] = category_spend.get(e.category, 0.0) + e.amount

    category_breakdown = [
        {"category": cat, "amount": round(amt, 2), "percentage": round((amt / total_spent * 100), 1) if total_spent > 0 else 0}
        for cat, amt in sorted(category_spend.items(), key=lambda x: x[1], reverse=True)
    ]

    # Pantry category distribution
    pantry_categories: dict = {}
    for i in active_items:
        pantry_categories[i.category] = pantry_categories.get(i.category, 0) + 1

    return {
        "total_pantry_items": len(active_items),
        "expiring_soon_count": expiring_count,
        "expired_count": expired_count,
        "low_stock_count": low_stock_count,
        "total_spent_historical": round(total_spent, 2),
        "category_spending": category_breakdown,
        "pantry_distribution": [
            {"category": k, "count": v} for k, v in sorted(pantry_categories.items(), key=lambda x: x[1], reverse=True)
        ]
    }
