# 🗄️ Database Architecture & Storage Documentation
> **Canteen Management System — Multi-Model Storage Specification**  
> *Storage Engines:* C Native Binary Persistence (`.dat`), SQL DDL (MySQL/PostgreSQL), MongoDB Atlas Document Store

---

## 1. Storage Architecture Overview

The Canteen Management System is architected with a decoupled, high-performance data tier supporting three complementary storage paradigms:

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA ACCESS ARCHITECTURE                  │
└──────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
  ┌──────────────────┐┌───────────────┐┌──────────────────┐
  │  C Binary Engine ││ Relational DDL││  MongoDB Atlas   │
  │  (`backend/data`)││(`database/..`)││ (Cloud Document) │
  ├──────────────────┤├───────────────┤├──────────────────┤
  │ • Zero overhead  ││ • ACID RDBMS  ││ • Flexible JSON  │
  │ • O(1) seek/read ││ • Foreign keys││ • Cloud cluster  │
  │ • Struct mapped  ││ • Analytics   ││ • Web scale      │
  └──────────────────┘└───────────────┘└──────────────────┘
```

1. **Embedded C Binary Storage Engine (`backend/data/*.dat`):**
   - High-throughput, zero-dependency binary file engine implemented in `backend/src/storage.c`.
   - Direct memory-to-disk struct serializations with `fseek` and fixed-size record reads:
     - `admins.dat`: Administrator credentials and status records.
     - `foods.dat`: Complete cafeteria menu with real-time stock counters.
     - `students.dat`: Student user profiles, hashed credentials, and contact info.
     - `orders.dat`: Placed orders, line items, and queue states.
     - `sales.dat`: Daily aggregated sales figures and analytics.

2. **Relational Schema (`database/schema/schema.sql`):**
   - Canonical SQL 99 / ANSI DDL compatible with MySQL 8.0, MariaDB, and PostgreSQL.
   - Strictly mirrors `backend/include/models.h` structs with proper foreign keys (`CASCADE` on delete, `RESTRICT` on referenced menu items) and compound indexes.

3. **Cloud Document Store (MongoDB Atlas):**
   - Configured via connection string in `.env`: `cluster0.t1l7ozq.mongodb.net/canteen_db`.
   - Collections: `admin`, `foods`, `students`, `orders`, `selesrecords`.
   - Fixtures available in `database/seeds/seed_data.json`.

---

## 2. Relational Schema Reference

### `admins`
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(64))
- `email` (VARCHAR(64), Unique Index)
- `password_hash` (VARCHAR(64))
- `active` (TINYINT(1), Default: 1)
- `created_at`, `updated_at` (TIMESTAMP)

### `students`
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(64))
- `email` (VARCHAR(64), Unique Index)
- `phone` (VARCHAR(32))
- `password_hash` (VARCHAR(64))
- `active` (TINYINT(1), Default: 1)
- `created_at`, `updated_at` (TIMESTAMP)

### `foods`
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(64))
- `category` (VARCHAR(64), Indexed)
- `description` (VARCHAR(128))
- `price` (DECIMAL(10,2))
- `stock` (INT)
- `availability` (TINYINT(1), Indexed)
- `active` (TINYINT(1), Soft delete flag)

### `orders`
- `id` (INT, Primary Key, Auto Increment)
- `student_id` (INT, Foreign Key -> `students.id`)
- `status` (TINYINT: 0=Pending, 1=Preparing, 2=Ready, 3=Completed, 4=Cancelled)
- `item_count` (INT)
- `total_amount` (DECIMAL(10,2))
- `created_at` (TIMESTAMP)

### `order_items`
- `id` (INT, Primary Key, Auto Increment)
- `order_id` (INT, Foreign Key -> `orders.id` ON DELETE CASCADE)
- `food_id` (INT, Foreign Key -> `foods.id` ON DELETE RESTRICT)
- `quantity` (INT)
- `unit_price` (DECIMAL(10,2))
- `subtotal` (DECIMAL(10,2))

### `sales_records`
- `id` (INT, Primary Key, Auto Increment)
- `sale_date` (DATE, Unique Index)
- `total_orders` (INT)
- `total_revenue` (DECIMAL(12,2))
- `completed_orders` (INT)
- `cancelled_orders` (INT)

---

## 3. How to Seed the Database

### Native C Binary Seeder (Development Default)
From repository root:
```cmd
.\scripts\seed_database.bat
```
or directly in the backend directory:
```cmd
cd backend
gcc -Iinclude tools/seed_demo.c src/storage.c src/auth_crypto.c -o seed_demo.exe
.\seed_demo.exe
```

### Relational Database (MySQL / MariaDB)
```cmd
mysql -u root -p < database/schema/schema.sql
mysql -u root -p canteen_db < database/seeds/seed_data.sql
```

### MongoDB Atlas Import
Using `mongoimport` CLI:
```cmd
mongoimport --uri "YOUR_MONGODB_URI" --collection foods --file database/seeds/seed_data.json --jsonArray
```
