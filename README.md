<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=45&pause=1000&color=2563EB&center=true&vCenter=true&width=800&height=100&lines=Canteen+Management+System;Custom+C+Data+Structures;Modern+React+Frontend;Real-Time+Order+Queue" alt="Typing SVG" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/C-00599C?style=for-the-badge&logo=c&logoColor=white" alt="C" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" />
</div>

<br />

A full-stack **Canteen Management System** built with a **C Backend** (utilizing custom Data Structures and Algorithms like Linked Lists and Queues) and a modern **React (TypeScript) Frontend**. 

## 🚀 Tech Stack Highlights
* 🗄️ **Backend:** C, Mongoose (Embedded Web Server), cJSON (JSON parsing)
* 💾 **Database:** Custom file-based storage (`.dat` files) using custom C Data Structures.
* 🎨 **Frontend:** React, TypeScript, Vite, Tailwind CSS.
* 🧪 **Testing:** Playwright for E2E Cross-Role Synchronization Tests.

## ✨ Key Features
- 🎓 **Student Portal:** Browse the menu, manage cart, place orders, and track order status in real-time.
- 👨‍🍳 **Admin Portal:** Manage food inventory (update stock and availability), view all orders, and process the active order queue (`Pending` -> `Preparing` -> `Ready` -> `Completed`).
- 🔐 **Unified Login:** Single login interface that securely routes to the correct portal based on user role (Admin vs Student).
- 🔄 **Cross-Role Sync:** Actions taken by a student (like placing an order) are immediately available in the Admin's queue.
- 🌱 **Mock Data Seeding:** Easy-to-use C script to seed realistic demo data for local development and testing.

## ⚙️ How to Run

### 1. Reset and Seed Demo Data (Recommended)
To start fresh with demo accounts and food items, run the seeding script from the root directory:
```bat
.\reset_and_seed_demo.bat
```

### 2. Start the Backend Server (C)
Open a terminal in the root folder and run:
```bat
cd backend
.\canteen_server.exe
```
*The server will start on `http://localhost:8080`.*

### 3. Start the Frontend (React)
Open a **new** terminal window and run:
```bat
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173/`.*

## 🔑 Demo Accounts
Use the following credentials to test the application:

**👨‍🍳 Admin Account:**
- **Email:** `admin.demo@canteen.local`
- **Password:** `demo_admin123`

**🎓 Student Account:**
- **Email:** `aarav.demo@canteen.local`
- **Password:** `demo_pass123`

## 🧪 Running Tests
To run the Playwright end-to-end tests for cross-role synchronization:
```bat
cd frontend
npx playwright test
```