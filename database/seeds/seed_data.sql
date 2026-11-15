-- =====================================================================
-- CANTEEN MANAGEMENT SYSTEM - INITIAL SEED DATA (SQL)
-- Matches backend/tools/seed_demo.c initial dataset
-- =====================================================================

USE canteen_db;

-- 1. Seed Demo Admin (password: demo_admin123)
INSERT INTO admins (id, name, email, password_hash, active) VALUES
(1, 'Demo Admin', 'admin.demo@canteen.local', '$dev$0f476fa92f1bab54$1f556533feeddb16', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Seed Demo Students (password: demo_pass123)
INSERT INTO students (id, name, email, phone, password_hash, active) VALUES
(1, 'Aarav Sharma', 'aarav.demo@canteen.local', '9876543210', '$dev$3818e6ec2950da1c$240c3ff411a0daec', 1),
(2, 'Priya Verma', 'priya.demo@canteen.local', '9876543211', '$dev$3818e6ec2950da1c$240c3ff411a0daec', 1),
(3, 'Rahul Singh', 'rahul.demo@canteen.local', '9876543212', '$dev$3818e6ec2950da1c$240c3ff411a0daec', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Seed Food Menu
INSERT INTO foods (id, name, category, description, price, stock, availability, active) VALUES
(1, 'Veg Burger', 'Fast Food', 'Crispy spiced vegetable patty with fresh lettuce and sauce', 60.00, 20, 1, 1),
(2, 'Cheese Burger', 'Fast Food', 'Double cheese loaded grilled burger with herb seasoning', 80.00, 10, 1, 1),
(3, 'Veg Momos', 'Chinese', 'Steamed savoury vegetable dumplings with spicy red dip', 50.00, 8, 1, 1),
(4, 'Paneer Momos', 'Chinese', 'Juicy paneer stuffed steamed momos with mint chutney', 70.00, 5, 1, 1),
(5, 'Masala Dosa', 'South Indian', 'Golden crispy dosa served with potato masala, sambar & chutneys', 90.00, 15, 1, 1),
(6, 'Paneer Dosa', 'South Indian', 'Butter roasted dosa filled with spiced grated cottage cheese', 110.00, 12, 1, 1),
(7, 'Veg Pizza', 'Fast Food', 'Freshly baked thin-crust pizza with bell peppers & olives', 150.00, 6, 1, 1),
(8, 'Cold Coffee', 'Beverages', 'Thick creamy blended cold coffee with chocolate drizzle', 60.00, 10, 1, 1),
(9, 'Masala Chai', 'Beverages', 'Authentic fragrant Indian spiced milk tea brewed fresh', 20.00, 20, 1, 1),
(10, 'Arrabbiata Pasta', 'Fast Food', 'Penne pasta tossed in spicy Italian tomato and garlic herb sauce', 120.00, 25, 1, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), stock = VALUES(stock);

-- 4. Seed Historical Orders
INSERT INTO orders (id, student_id, status, item_count, total_amount, created_at) VALUES
(1, 1, 3, 2, 110.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 3, 1, 90.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, 3, 1, 100.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 2, 1, 1, 110.00, DATE_SUB(NOW(), INTERVAL 1 HOUR))
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);

-- 5. Seed Order Items
INSERT INTO order_items (id, order_id, food_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 60.00, 60.00),
(2, 1, 3, 1, 50.00, 50.00),
(3, 2, 5, 1, 90.00, 90.00),
(4, 3, 3, 2, 50.00, 100.00),
(5, 4, 6, 1, 110.00, 110.00)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- 6. Seed Daily Sales Record
INSERT INTO sales_records (sale_date, total_orders, total_revenue, completed_orders, cancelled_orders) VALUES
(CURDATE(), 4, 410.00, 3, 0)
ON DUPLICATE KEY UPDATE total_revenue = VALUES(total_revenue);
