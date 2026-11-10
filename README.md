# 🥑 PantryPulse - Smart Grocery and Shopping Manager

A modern, intelligent, local-first grocery inventory, smart shopping assistant, meal planner, and food-waste reduction system built with **Python (FastAPI)** and **TypeScript (React + Tailwind CSS)**.

> **Privacy & Security First**:
> - **Zero Credentials**: No live, expired, or rotated API keys, secrets, private keys, session tokens, or external auth required.
> - **Zero Personal Data (PII)**: No user names, emails, phone numbers, addresses, government IDs, or payment details. Operates entirely locally.
> - **No Docker Needed**: Runs directly and natively on your host machine with Python 3 and Node.js.

---

## 🚀 Key Features

### 1. 🥫 Pantry & Refrigerator Inventory
- **Multi-Zone Tracking**: Organize items across **Fridge**, **Pantry**, and **Freezer**.
- **Expiration Intelligence**: Real-time traffic light status (Fresh, Expiring Soon within 3 days, Expired) with countdown badges.
- **Low Stock Monitoring**: Visual alerts when inventory drops below custom thresholds.
- **Fast Consumption**: Quick increment, decrement, and one-click consume portion buttons.

### 2. 🛒 Smart Shopping Lists with In-Store Mode
- **Multi-List Management**: Manage separate lists (e.g. *Weekly Groceries*, *Weekend BBQ*, *Costco Run*).
- **In-Store Shopping Mode**: Interactive checklist that crosses off items as you walk through aisles.
- **Budget Monitor**: Live progress bar comparing cart total against custom list budgets.
- **Auto-Restock from Pantry**: One-click action detects low-stock pantry items and populates your shopping list.
- **One-Click Stock to Pantry**: Moving through checkout? One click transfers all purchased items into your pantry inventory, auto-calculates expiration dates based on food science defaults, and records the expense.

### 3. 🍳 Smart Recipe & Meal Planner
- **Pantry Match Percentage**: Automatically scans your unexpired pantry to show what percentage of ingredients you already have (e.g., *80% In Stock*).
- **Missing Ingredients Detection**: Instantly see what's in stock vs. what needs to be bought.
- **Auto-Add Missing Items**: 1-click button adds only the missing recipe ingredients directly into your active shopping list.
- **Custom Recipes**: Save and plan your own family dishes.

### 4. ♻️ Food Waste Rescue Engine
- Proactive banner highlighting items expiring in the next 1–3 days.
- Matches expiring ingredients to library recipes so you cook them before they spoil, saving money and reducing waste.

### 5. 📊 Spending & Inventory Analytics
- Category breakdown charts (Produce, Dairy, Meat, Bakery, Pantry, Condiments).
- Historical grocery spending tracking.
- Inventory health distribution.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite, Pydantic v2.
- **Frontend**: TypeScript, React 18, Vite, Tailwind CSS, Lucide React icons.
- **Storage**: Local SQLite database (`grocery_manager.db`) — self-contained and file-based.

---

## ⚡ Quick Start (One Command)

You can launch both the FastAPI backend and the Vite frontend simultaneously with:

```bash
./run.sh
```

- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🖥️ Manual Start (Separate Terminals)

If you prefer to run services in separate terminal tabs:

### 1. Backend (Python + FastAPI)
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend (TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

A comprehensive unit and integration test suite is included:

```bash
cd backend
./venv/bin/python3 -m unittest test_api.py
```

Tests validate:
1. Health check & database initialization
2. Pantry CRUD, expiry filters, and alerts
3. Smart item categorizer and shelf-life prediction
4. Shopping list creation and item manipulation
5. Smart checkout (transferring cart items to pantry + expense logging)
6. Recipe inventory matching & auto-add missing ingredients
7. Waste prevention recommendations & analytics aggregation

---

## 📁 Project Structure

```
grocery-shopping/
├── run.sh                     # Single-command startup script
├── .gitignore                 # Excludes secrets, databases, venvs & build files
├── README.md                  # Documentation
├── backend/
│   ├── database.py            # SQLite connection and session management
│   ├── models.py              # SQLAlchemy ORM models (Pantry, Shopping, Recipe, Expense)
│   ├── schemas.py             # Pydantic v2 schemas for request/response validation
│   ├── smart_engine.py        # Heuristic categorizer, shelf-life estimator & recipe matcher
│   ├── seed_data.py           # Generic sample grocery items and recipes
│   ├── main.py                # FastAPI endpoints & CORS configuration
│   ├── requirements.txt       # Python dependencies
│   └── test_api.py            # Automated test suite
└── frontend/
    ├── index.html             # HTML entry point
    ├── package.json           # React, TypeScript, Tailwind dependencies
    ├── vite.config.ts         # Vite configuration with API proxy
    ├── tailwind.config.js     # Tailwind CSS configuration
    └── src/
        ├── App.tsx            # Main application layout and state
        ├── api.ts             # Typed API client
        ├── types.ts           # TypeScript interfaces
        └── components/
            ├── Header.tsx             # Navbar with badges and tab switching
            ├── DashboardView.tsx      # Overview KPIs, waste alerts & quick meal ideas
            ├── PantryView.tsx         # Inventory management, filters & stock adjustments
            ├── ShoppingView.tsx       # In-store checklist, budget bar & pantry transfer
            ├── RecipeView.tsx         # Recipe matching & missing ingredient adder
            ├── AnalyticsView.tsx      # Spend & inventory visual charts
            ├── AddItemModal.tsx       # Smart autocomplete & attribute guesser
            └── SmartWasteBanner.tsx   # Food waste rescue alert
```

---

## 🔒 Security & Privacy Guarantees

- **No Credentials**: No API keys, passwords, database credentials, or tokens are required or stored in this repository.
- **No PII**: All models and seeded entries are strictly generic food staples and mock data.
- **Local Persistence**: All data is written only to a local SQLite database that never leaves your machine.
