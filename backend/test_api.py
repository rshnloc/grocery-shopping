"""
Comprehensive automated tests for Smart Grocery & Shopping Manager.
Validates zero credentials, local SQLite operation, smart engine, and API routes.
"""
import sys
from pathlib import Path

backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import unittest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
from seed_data import seed_database
import models


class TestGroceryManagerAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        seed_database(db)
        db.close()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_02_pantry_list_and_alerts(self):
        res = self.client.get("/api/pantry")
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertGreater(len(items), 0)

        # Alerts
        alerts_res = self.client.get("/api/pantry/alerts")
        self.assertEqual(alerts_res.status_code, 200)
        alerts = alerts_res.json()
        self.assertIn("expiring_soon", alerts)
        self.assertIn("low_stock", alerts)

    def test_03_smart_guess_item(self):
        # Test intelligent auto-categorization
        res = self.client.get("/api/smart/guess-item?name=Almond%20Milk")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["category"], "Dairy")
        self.assertEqual(data["recommended_location"], "Fridge")

        # Test produce
        res2 = self.client.get("/api/smart/guess-item?name=Fresh%20Strawberries")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["category"], "Produce")

    def test_04_create_and_consume_pantry_item(self):
        payload = {
            "name": "Test Organic Apples",
            "category": "Produce",
            "quantity": 6.0,
            "unit": "pcs",
            "location": "Fridge"
        }
        res = self.client.post("/api/pantry", json=payload)
        self.assertEqual(res.status_code, 200)
        item_data = res.json()
        item_id = item_data["id"]
        self.assertEqual(item_data["name"], "Test Organic Apples")

        # Consume 2 portions
        consume_res = self.client.post(f"/api/pantry/{item_id}/consume?amount=2.0")
        self.assertEqual(consume_res.status_code, 200)
        self.assertEqual(consume_res.json()["quantity"], 4.0)

        # Delete item
        del_res = self.client.delete(f"/api/pantry/{item_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_05_shopping_list_and_smart_checkout(self):
        # Create a list
        list_res = self.client.post("/api/shopping-lists", json={"title": "Test Weekend BBQ", "budget_limit": 40.0})
        self.assertEqual(list_res.status_code, 200)
        list_id = list_res.json()["id"]

        # Add item to list
        item_res = self.client.post(f"/api/shopping-lists/{list_id}/items", json={
            "name": "Barbecue Sauce",
            "category": "Condiments",
            "quantity": 1.0,
            "unit": "bottle",
            "estimated_price": 3.99
        })
        self.assertEqual(item_res.status_code, 200)
        item_id = item_res.json()["id"]

        # Mark as purchased
        mark_res = self.client.put(f"/api/shopping-items/{item_id}", json={"is_purchased": True})
        self.assertEqual(mark_res.status_code, 200)
        self.assertTrue(mark_res.json()["is_purchased"])

        # Smart Checkout & Stock to Pantry
        checkout_res = self.client.post(f"/api/shopping-lists/{list_id}/checkout")
        self.assertEqual(checkout_res.status_code, 200)
        self.assertEqual(checkout_res.json()["transferred_count"], 1)

        # Verify it transferred to Pantry
        pantry_res = self.client.get("/api/pantry?search=Barbecue%20Sauce")
        self.assertEqual(pantry_res.status_code, 200)
        self.assertEqual(len(pantry_res.json()), 1)

    def test_06_recipe_matching_and_missing_to_list(self):
        recipes_res = self.client.get("/api/recipes")
        self.assertEqual(recipes_res.status_code, 200)
        recipes = recipes_res.json()
        self.assertGreater(len(recipes), 0)

        # Test adding missing items to list
        recipe_id = recipes[0]["id"]
        add_res = self.client.post(f"/api/recipes/{recipe_id}/add-missing-to-list")
        self.assertEqual(add_res.status_code, 200)
        self.assertIn("message", add_res.json())

    def test_07_waste_prevention_and_analytics(self):
        waste_res = self.client.get("/api/smart/waste-prevention")
        self.assertEqual(waste_res.status_code, 200)
        self.assertIn("recommendations", waste_res.json())

        analytics_res = self.client.get("/api/analytics/summary")
        self.assertEqual(analytics_res.status_code, 200)
        analytics = analytics_res.json()
        self.assertIn("total_pantry_items", analytics)
        self.assertIn("category_spending", analytics)


if __name__ == "__main__":
    unittest.main()
