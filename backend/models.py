"""
SQLAlchemy ORM models for the Smart Grocery and Shopping Manager.
"""
import sys
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from database import Base


class PantryItem(Base):
    __tablename__ = "pantry_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="Pantry")
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(20), nullable=False, default="pcs")
    purchase_date = Column(Date, default=date.today)
    expiry_date = Column(Date, nullable=True)
    minimum_stock = Column(Float, default=1.0)
    is_low_stock = Column(Boolean, default=False)
    is_consumed = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)
    location = Column(String(50), default="Pantry")  # Pantry, Fridge, Freezer


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    budget_limit = Column(Float, default=0.0)
    is_archived = Column(Boolean, default=False)

    items = relationship("ShoppingItem", back_populates="shopping_list", cascade="all, delete-orphan")


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("shopping_lists.id"), nullable=False)
    name = Column(String(120), nullable=False)
    category = Column(String(50), nullable=False, default="General")
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(20), nullable=False, default="pcs")
    estimated_price = Column(Float, default=0.0)
    is_purchased = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)

    shopping_list = relationship("ShoppingList", back_populates="items")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), default="Dinner")  # Breakfast, Lunch, Dinner, Snack, Dessert
    prep_time_minutes = Column(Integer, default=15)
    cook_time_minutes = Column(Integer, default=20)
    servings = Column(Integer, default=2)
    instructions = Column(Text, nullable=False)
    difficulty = Column(String(20), default="Medium")  # Easy, Medium, Hard
    image_emoji = Column(String(10), default="🍲")

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    item_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(20), nullable=False, default="pcs")
    is_optional = Column(Boolean, default=False)

    recipe = relationship("Recipe", back_populates="ingredients")


class ExpenseLog(Base):
    __tablename__ = "expense_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(120), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, default=date.today)
    notes = Column(String(255), nullable=True)
