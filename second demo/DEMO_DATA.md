# Demo Data & Canteen System Seeding Mechanism

The Canteen Management System uses a bespoke C-based demo data seeder (seed_demo.c) to populate the system with realistic data for local development and UI demonstrations.

## Single Source of Truth
The architecture guarantees a **Single Source of Truth (SSOT)**.
The mock data is *not* generated on the frontend using hardcoded arrays or disconnected datasets. Instead, the seeding script directly manipulates the C backend's .dat storage APIs. 

Both the Student and Admin React frontends communicate with the canteen_server.exe through standard REST APIs to fetch this exact same underlying data. A student action that alters data (e.g. placing an order) synchronously reflects on the Admin side, and vice versa.

## The Seeding Tool
Located at ackend/tools/seed_demo.c, the utility utilizes the system's storage.h APIs to populate:

1. **Authentication Records (uth.dat)**:
   - dmin.demo@canteen.local (Admin)
   - arav.demo@canteen.local (Student)
   - priya.demo@canteen.local (Student)
   - ahul.demo@canteen.local (Student)
   
2. **Food Menu (ood.dat)**:
   - Realistic food items across categories (Fast Food, Beverages, Indian, Chinese).
   - Simulates varying stock levels: Available, Low Stock, and Out of Stock.
   
3. **Order History (orders.dat)**:
   - Historical completed orders with item snapshots.
   - Pending/Preparing orders to populate the Admin queue natively.

## How to use
To completely reset the system state and inject the demo data:
1. Navigate to the project root.
2. Run the eset_and_seed_demo.bat utility script.
`ash
.\reset_and_seed_demo.bat
`
This script will safely clean the ackend/data/*.dat files, compile the seeder, and run it. The frontend UI will instantly reflect the populated datasets on refresh.
