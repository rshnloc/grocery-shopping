"""
Pydantic schemas for data validation and API contract.
Zero PII, zero credentials.
"""
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field


# ---------------- Pantry Schemas ----------------
class PantryItemBase(BaseModel):
    name: str = Field(..., example="Whole Milk")
    category: str = Field(default="Dairy", example="Dairy")
    quantity: float = Field(default=1.0, ge=0)
    unit: str = Field(default="liters", example="liters")
    purchase_date: Optional[date] = None
    expiry_date: Optional[date] = None
    minimum_stock: float = Field(default=1.0, ge=0)
    location: str = Field(default="Fridge", example="Fridge")
    notes: Optional[str] = None


class PantryItemCreate(PantryItemBase):
    pass


class PantryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiry_date: Optional[date] = None
    minimum_stock: Optional[float] = None
    is_low_stock: Optional[bool] = None
    is_consumed: Optional[bool] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class PantryItemResponse(PantryItemBase):
    id: int
    is_low_stock: bool
    is_consumed: bool
    days_until_expiry: Optional[int] = None
    status: str = "fresh"  # 'fresh', 'expiring_soon', 'expired', 'low_stock'

    class Config:
        from_attributes = True


# ---------------- Shopping List Schemas ----------------
class ShoppingItemBase(BaseModel):
    name: str
    category: str = "General"
    quantity: float = 1.0
    unit: str = "pcs"
    estimated_price: float = 0.0
    notes: Optional[str] = None


class ShoppingItemCreate(ShoppingItemBase):
    list_id: int


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_price: Optional[float] = None
    is_purchased: Optional[bool] = None
    notes: Optional[str] = None


class ShoppingItemResponse(ShoppingItemBase):
    id: int
    list_id: int
    is_purchased: bool

    class Config:
        from_attributes = True


class ShoppingListBase(BaseModel):
    title: str = "Weekly Groceries"
    budget_limit: float = 0.0


class ShoppingListCreate(ShoppingListBase):
    pass


class ShoppingListResponse(ShoppingListBase):
    id: int
    created_at: datetime
    is_archived: bool
    items: List[ShoppingItemResponse] = []
    total_estimated: float = 0.0
    total_purchased: float = 0.0

    class Config:
        from_attributes = True


# ---------------- Recipe Schemas ----------------
class RecipeIngredientBase(BaseModel):
    item_name: str
    quantity: float = 1.0
    unit: str = "pcs"
    is_optional: bool = False


class RecipeIngredientResponse(RecipeIngredientBase):
    id: int
    recipe_id: int
    in_stock: bool = False
    stock_quantity: float = 0.0

    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    name: str
    category: str = "Dinner"
    prep_time_minutes: int = 15
    cook_time_minutes: int = 20
    servings: int = 2
    instructions: str
    difficulty: str = "Medium"
    image_emoji: str = "🍲"


class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientBase] = []


class RecipeResponse(RecipeBase):
    id: int
    ingredients: List[RecipeIngredientResponse] = []
    match_percentage: float = 0.0
    missing_ingredients_count: int = 0

    class Config:
        from_attributes = True


# ---------------- Analytics & Smart Schemas ----------------
class ExpenseCreate(BaseModel):
    item_name: str
    category: str
    amount: float
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    item_name: str
    category: str
    amount: float
    date: date
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class SmartCategorySuggestion(BaseModel):
    category: str
    estimated_shelf_life_days: int
    recommended_location: str
    unit: str

