# 🍽️ CampusFeast - Canteen Management System (C + DSA & Modern React)

A full-stack, production-grade Canteen Management System featuring a high-performance **C + DSA Native Backend** and a modern, responsive **React (TypeScript) Frontend**.

---

## 🏗️ Architecture Overview

```
canteen-management-With-C-DSA/
├── backend/                  # C + DSA Native Backend
│   ├── src/                  # C Source files
│   │   ├── main.c            # Application entrypoint
│   │   ├── server.c          # Mongoose HTTP event loop
│   │   ├── router.c          # REST API endpoint router (37 endpoints)
│   │   ├── handlers_*.c      # Auth, Food, Order & Analytics handlers
│   │   ├── cart.c            # In-memory DSA cart management
│   │   ├── storage.c         # Binary record persistence (.dat files)
│   │   ├── auth.c            # Session token manager (Linked List)
│   │   ├── auth_crypto.c     # SHA-256 password hashing & verification
│   │   └── response.c        # JSON serialization & CORS middleware
│   ├── src/dsa/              # Data Structures & Algorithms Library
│   │   ├── linked_list.c     # Doubly/Singly Linked List
│   │   ├── queue.c           # FIFO Queue (Kitchen order workflow)
│   │   ├── priority_queue.c  # Max-Heap / Priority Queue (Best-sellers)
│   │   ├── stack.c           # LIFO Stack
│   │   ├── search.c          # Linear & Binary search algorithms
│   │   └── sort.c            # QuickSort & MergeSort algorithms
│   ├── include/              # Header definitions
│   ├── data/                 # Binary storage files (.dat)
│   ├── tests/                # Native DSA & storage test runners
│   └── build.bat             # GCC compilation script
│
├── frontend/                 # Redesigned Modern Frontend
│   ├── src/
│   │   ├── api/              # Centralized API client modules
│   │   ├── context/          # Reactive AuthContext & session state
│   │   ├── hooks/            # useAuth, useFoods, useCart, useOrders
│   │   ├── types/            # TypeScript interfaces for all entities
│   │   ├── App.tsx           # Modern responsive single-page application
│   │   └── index.css         # Styling system (Monochrome + Royal Blue)
│   ├── dist/                 # Production-built bundle
│   └── package.json
│
├── frontend_old_backup/      # Complete safety backup of old frontend
├── tests/
│   └── integration_test.ps1  # Automated 32-test API integration suite
└── docs/
    ├── API_INVENTORY.md          # Complete 37-endpoint REST API audit
    ├── FEATURE_PARITY_MATRIX.md  # 28-feature frontend-to-backend parity mapping
    └── INTEGRATION_TEST_REPORT.md# Complete integration test & architecture report
```

---

## ⚡ Key Features

### Student Portal
- **Authentication:** Student registration and secure login with session tokens.
- **Dynamic Menu:** Live food catalog with category filters, substring search, and price sorting.
- **Cart Management:** Add, increment, decrement, and clear cart items synchronized directly with the C backend.
- **Order Placement:** Atomic checkout with backend stock deduction.
- **Live Order Tracking:** Stepper visualizing progress (`Pending` → `Preparing` → `Ready` → `Completed`).
- **Order Receipts:** Formatted printable receipt with itemized breakdown and student metadata.

### Administrator Workspace
- **Executive Dashboard:** Live metrics for revenue, pending orders, completed orders, and stock alerts.
- **FIFO Order Queue:** Real-time queue view with one-click "Process Next Order" dequeueing.
- **Master Orders Table:** Filter orders by status and advance preparation states.
- **Food Catalog Management:** Add new dishes, modify prices/stocks, and delete items.
- **Inventory Warnings:** Automated detection of low-stock and out-of-stock items.
- **Analytics & Sales:** Best-selling leaderboard powered by the C Priority Queue algorithm and daily revenue breakdown.

---

## 🚀 How to Run the Application

### 1. Start the C Backend Server
Make sure you have GCC (MinGW-w64) installed:
```bash
cd backend
.\build.bat
.\canteen_server.exe
```
The backend server runs on `http://localhost:8080` with native CORS enabled.

### 2. Start the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Build Frontend for Production
```bash
cd frontend
npm run build
```
Generates optimized, minified production assets in `frontend/dist/`.

---

## 🧪 Run Automated Integration Tests

To run the automated 32-test integration test suite against the running C backend:
```powershell
powershell -ExecutionPolicy Bypass -File tests/integration_test.ps1
```
All 32 tests verify health, authentication, menu search, cart synchronization, checkout, FIFO order processing, admin catalog operations, and analytics.

---

## 🔑 Default Credentials

- **Administrator:**
  - Email: `admin@gmail.com` or `admin.demo@canteen.local`
  - Password: `941046`
- **Student:**
  - Register any student account directly in the UI (`/register`) or use `tester@college.edu` / `password123`.

---

## 📖 Technical Documentation

- [API Inventory (`docs/API_INVENTORY.md`)](file:///d:/canteen-management-With-C-DSA/docs/API_INVENTORY.md)
- [Feature Parity Matrix (`docs/FEATURE_PARITY_MATRIX.md`)](file:///d:/canteen-management-With-C-DSA/docs/FEATURE_PARITY_MATRIX.md)
- [Integration Test Report (`docs/INTEGRATION_TEST_REPORT.md`)](file:///d:/canteen-management-With-C-DSA/docs/INTEGRATION_TEST_REPORT.md)
