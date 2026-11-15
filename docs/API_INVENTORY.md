# Canteen Management System — Backend API Inventory

This inventory documents all live API endpoints implemented in the **C Backend (`backend/src/router.c`, `handlers_*.c`)**, verified directly against source code and runtime behavior.

---

## 1. System & Health Endpoints

### `GET /api/health`
- **Handler:** `handle_health_check` in `router.c`
- **Auth:** None
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Canteen backend is running"
  }
  ```

---

## 2. Authentication & Session Endpoints

### `POST /api/student/register`
- **Handler:** `handle_student_register` in `handlers_auth.c`
- **Auth:** None
- **Request Body:**
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.demo@canteen.local",
    "password": "demo_pass123",
    "phone": "9876543210"
  }
  ```
- **Validation:** `name`, `email`, `password` required; duplicate email check.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "student_id": 1
  }
  ```

### `POST /api/student/login`
- **Handler:** `handle_student_login` in `handlers_auth.c`
- **Auth:** None
- **Request Body:**
  ```json
  {
    "email": "aarav.demo@canteen.local",
    "password": "demo_pass123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "token": "3b3122c2ae77b8718670c55493b8e366...",
    "student": {
      "id": 1,
      "name": "Aarav Sharma",
      "email": "aarav.demo@canteen.local"
    }
  }
  ```

### `POST /api/admin/login`
- **Handler:** `handle_admin_login` in `handlers_auth.c`
- **Auth:** None
- **Request Body:**
  ```json
  {
    "email": "admin.demo@canteen.local",
    "password": "941046"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "token": "622d0663cf35c8e7a766e2225fbca016...",
    "role": "admin"
  }
  ```

### `POST /api/auth/logout`
- **Handler:** `handle_logout` in `handlers_auth.c`
- **Auth:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### `GET /api/auth/me`
- **Handler:** `handle_auth_me` in `handlers_auth.c`
- **Auth:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "id": 1,
    "role": 1
  }
  ```
  *(Note: Role 1 = Student, Role 2 = Admin).*

---

## 3. Food Catalog & Menu Endpoints

### `GET /api/foods`
- **Handler:** `handle_get_menu` in `handlers_food.c`
- **Auth:** Optional
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "food_id": 1,
        "name": "Veg Burger",
        "category": "Fast Food",
        "price": 60.0,
        "stock": 20,
        "availability": true,
        "stock_status": "Available",
        "description": "Demo food item"
      }
    ]
  }
  ```

### `GET /api/foods/search?q={query}`
- **Handler:** `handle_search_food` in `handlers_food.c`
- **Query Params:** `q` (case-insensitive substring match)

### `GET /api/foods/filter?category={cat}&sort={sort}`
- **Handler:** `handle_filter_food` in `handlers_food.c`
- **Query Params:**
  - `category`: exact category filter
  - `sort`: `price_asc`, `price_desc`, `name_asc`, `name_desc` (uses C Quick Sort / Bubble Sort)

---

## 4. Student Cart Endpoints

### `GET /api/cart`
- **Handler:** `handle_get_cart` in `handlers_order.c`
- **Auth:** Student (`role: 1`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "food_id": 1,
        "name": "Veg Burger",
        "quantity": 2,
        "unit_price": 60.0,
        "subtotal": 120.0
      }
    ],
    "total_amount": 120.0
  }
  ```

### `POST /api/cart`
- **Handler:** `handle_add_cart_item` in `handlers_order.c`
- **Auth:** Student
- **Body:** `{ "food_id": 1, "quantity": 1 }`
- **Response `201 Created`:** `{ "success": true, "message": "Item added to cart" }`

### `PUT /api/cart/:id`
- **Handler:** `handle_update_cart_item` in `handlers_order.c`
- **Auth:** Student
- **Body:** `{ "quantity": 3 }`
- **Response `200 OK`:** `{ "success": true, "message": "Cart item updated" }`

### `DELETE /api/cart/:id`
- **Handler:** `handle_remove_cart_item` in `handlers_order.c`
- **Auth:** Student
- **Response `200 OK`:** `{ "success": true, "message": "Item removed" }`

### `DELETE /api/cart`
- **Handler:** `handle_clear_cart` in `handlers_order.c`
- **Auth:** Student
- **Response `200 OK`:** `{ "success": true, "message": "Cart cleared" }`

---

## 5. Orders & Checkout Endpoints

### `POST /api/orders` (Checkout)
- **Handler:** `handle_place_order` in `handlers_order.c`
- **Auth:** Student
- **Mechanism:**
  1. Validates all cart items against live stock and availability.
  2. Atomically decrements stock from `foods.dat`.
  3. Generates next numeric `order_id` and writes order to `orders.dat`.
  4. Enqueues order in in-memory FIFO C queue (`Queue`).
  5. Clears student's cart.
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "order_id": 10,
    "total": 180.0
  }
  ```

### `GET /api/orders` / `GET /api/orders/history`
- **Handler:** `handle_get_student_orders` in `handlers_order.c`
- **Auth:** Student
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "order_id": 1,
        "student_id": 1,
        "status": 3,
        "total_amount": 140.0,
        "created_at": 1726550000,
        "items": [
          { "food_id": 1, "quantity": 2, "unit_price": 60.0, "subtotal": 120.0 }
        ]
      }
    ]
  }
  ```

### `GET /api/orders/:id`
- **Handler:** `handle_get_order_detail` in `handlers_order.c`
- **Auth:** Authenticated (Student owner or Admin)
- **Response `200 OK`:** `{ "success": true, "data": { ...order } }`

### `GET /api/orders/:id/receipt`
- **Handler:** `handle_get_order_receipt` in `handlers_order.c`
- **Auth:** Authenticated
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "canteen_name": "Campus Canteen",
      "order_id": 1,
      "date_time": "2026-09-17 12:30:00",
      "student_name": "Aarav Sharma",
      "student_email": "aarav.demo@canteen.local",
      "items": [
        { "name": "Veg Burger", "quantity": 2, "unit_price": 60.0, "subtotal": 120.0 }
      ],
      "total": 120.0,
      "status": "Completed"
    }
  }
  ```

---

## 6. Admin Management Endpoints

### `GET /api/admin/foods`
- **Handler:** `handle_admin_get_foods` in `handlers_food.c`
- **Auth:** Admin (`role: 2`)

### `POST /api/admin/foods`
- **Handler:** `handle_admin_add_food` in `handlers_food.c`
- **Auth:** Admin
- **Body:** `{ "name": "Paneer Roll", "category": "Snacks", "description": "...", "price": 90.0, "stock": 15, "availability": 1 }`
- **Response `201 Created`:** `{ "success": true, "food_id": 10 }`

### `PUT /api/admin/foods/:id`
- **Handler:** `handle_admin_update_food` in `handlers_food.c`
- **Auth:** Admin

### `DELETE /api/admin/foods/:id`
- **Handler:** `handle_admin_delete_food` in `handlers_food.c`
- **Auth:** Admin (Soft delete)

### `PUT /api/admin/foods/:id/price`
- **Handler:** `handle_admin_update_price` in `handlers_food.c`
- **Auth:** Admin
- **Body:** `{ "price": 95.0 }`

### `PUT /api/admin/foods/:id/stock`
- **Handler:** `handle_admin_update_stock` in `handlers_food.c`
- **Auth:** Admin
- **Body:** `{ "stock": 25 }`

### `GET /api/admin/foods/low-stock`
- **Handler:** `handle_admin_low_stock` in `handlers_food.c`
- **Auth:** Admin (Items where $1 \le \text{stock} \le 5$)

### `GET /api/admin/foods/out-of-stock`
- **Handler:** `handle_admin_out_of_stock` in `handlers_food.c`
- **Auth:** Admin (Items where $\text{stock} = 0$)

### `GET /api/admin/orders`
- **Handler:** `handle_admin_get_orders` in `handlers_order.c`
- **Auth:** Admin
- **Query Params:** `?status=pending|preparing|ready|completed|cancelled`

### `GET /api/admin/orders/queue`
- **Handler:** `handle_admin_orders_queue` in `handlers_order.c`
- **Auth:** Admin (Fetches active FIFO queue)

### `POST /api/admin/orders/next`
- **Handler:** `handle_admin_process_next_order` in `handlers_order.c`
- **Auth:** Admin (Pulls oldest pending order and marks status = 1 Preparing)

### `PUT /api/admin/orders/:id/status`
- **Handler:** `handle_admin_update_order_status` in `handlers_order.c`
- **Auth:** Admin
- **Body:** `{ "status": 2 }` (0: Pending, 1: Preparing, 2: Ready, 3: Completed, 4: Cancelled)
- **Effect:** If status = 3 (Completed), automatically tallies daily revenue into `sales.dat`.

### `GET /api/admin/dashboard`
- **Handler:** `handle_admin_dashboard` in `handlers_analytics.c`
- **Auth:** Admin
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "today_revenue": 240.0,
      "pending_orders": 2,
      "completed_orders_today": 5,
      "total_food_items": 9,
      "low_stock_items": 3,
      "out_of_stock_items": 1
    }
  }
  ```

### `GET /api/admin/inventory/summary`
- **Handler:** `handle_admin_inventory_summary` in `handlers_analytics.c`
- **Auth:** Admin
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "total_items": 9,
      "total_stock_value": 8450.0,
      "low_stock_items": 3,
      "out_of_stock_items": 1
    }
  }
  ```

### `GET /api/admin/sales/daily?date=YYYY-MM-DD`
- **Handler:** `handle_admin_daily_sales` in `handlers_analytics.c`
- **Auth:** Admin
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-11-13",
      "total_orders": 4,
      "completed_orders": 3,
      "cancelled_orders": 1,
      "revenue": 450.0
    }
  }
  ```

### `GET /api/admin/popular-foods`
- **Handler:** `handle_admin_popular_foods` in `handlers_analytics.c`
- **Auth:** Admin
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "food_id": 1,
        "name": "Veg Burger",
        "quantity_sold": 14,
        "order_count": 8
      }
    ]
  }
  ```
