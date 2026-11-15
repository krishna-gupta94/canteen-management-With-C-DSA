const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Read MONGODB_URI from .env file or environment
function loadEnv() {
  const envPaths = [
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '.env'),
    path.resolve('/app', '.env')
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://krishnagupta94112_db_user:q5RFINxiaNhkULLa@cluster0.t1l7ozq.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || '8080';
const DEFAULT_BACKEND = `http://127.0.0.1:${PORT}/api`;
const BACKEND_URL = (process.env.BACKEND_URL || DEFAULT_BACKEND).replace(/\/+$/, '');
const DB_NAME = process.env.MONGODB_DB || 'canteen_db';

async function fetchJson(endpoint) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    return null;
  }
}

async function syncToAtlas(client) {
  const db = client.db(DB_NAME);

  // 1. Sync Foods
  const foods = await fetchJson('/foods');
  if (Array.isArray(foods) && foods.length > 0) {
    for (const item of foods) {
      const foodId = item.food_id || item.id;
      if (foodId) {
        await db.collection('foods').updateOne(
          { food_id: foodId },
          {
            $set: {
              food_id: foodId,
              name: item.name,
              category: item.category,
              description: item.description || '',
              price: item.price,
              stock: item.stock,
              availability: item.availability ? 1 : 0,
              active: 1,
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
      }
    }
  }

  // 2. Sync Students
  const students = await fetchJson('/internal/students');
  if (Array.isArray(students) && students.length > 0) {
    for (const s of students) {
      const stuId = s.student_id || s.id;
      if (stuId) {
        await db.collection('students').updateOne(
          { student_id: stuId },
          {
            $set: {
              student_id: stuId,
              name: s.name,
              email: s.email,
              phone: s.phone || '',
              active: s.active !== undefined ? s.active : 1,
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
      }
    }
  }

  // 3. Sync Admin
  const admins = await fetchJson('/internal/admins');
  if (Array.isArray(admins) && admins.length > 0) {
    for (const a of admins) {
      const adminId = a.admin_id || a.id;
      if (adminId) {
        await db.collection('admin').updateOne(
          { admin_id: adminId },
          {
            $set: {
              admin_id: adminId,
              name: a.name,
              email: a.email,
              active: 1,
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
      }
    }
  }

  // 4. Sync Orders
  const orders = await fetchJson('/internal/orders');
  if (Array.isArray(orders) && orders.length > 0) {
    for (const o of orders) {
      const orderId = o.order_id || o.id;
      if (orderId) {
        await db.collection('orders').updateOne(
          { order_id: orderId },
          {
            $set: {
              order_id: orderId,
              student_id: o.student_id,
              status: o.status,
              item_count: o.item_count,
              total_amount: o.total_amount,
              items: o.items || [],
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
      }
    }
  }

  // 5. Sync Sales Records
  const sales = await fetchJson('/admin/sales/daily');
  if (sales && sales.date) {
    await db.collection('selesrecords').updateOne(
      { date: sales.date },
      {
        $set: {
          date: sales.date,
          total_orders: sales.total_orders || 0,
          total_revenue: sales.total_revenue || 0,
          completed_orders: sales.completed_orders || 0,
          cancelled_orders: sales.cancelled_orders || 0,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }

  return {
    foods: foods ? foods.length : 0,
    students: students ? students.length : 0,
    admins: admins ? admins.length : 0,
    orders: orders ? orders.length : 0
  };
}

async function main() {
  console.log('====================================================');
  console.log(' CANTEEN MANAGEMENT SYSTEM - MONGODB ATLAS SYNC');
  console.log('====================================================');
  console.log(`Target database: [${DB_NAME}]`);
  console.log(`Backend endpoint: [${BACKEND_URL}]`);

  const isOnce = process.argv.includes('--once');

  while (true) {
    let client = null;
    try {
      console.log('Connecting to MongoDB Atlas...');
      client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      });
      await client.connect();
      console.log('✓ Successfully connected to MongoDB Atlas cluster!');

      // Run initial sync
      const stats = await syncToAtlas(client);
      console.log(`[${new Date().toLocaleTimeString()}] Initial Sync: ${stats.foods} foods, ${stats.students} students, ${stats.admins} admins, ${stats.orders} orders.`);

      if (isOnce) {
        console.log('One-shot sync complete. Exiting.');
        await client.close();
        return;
      }

      console.log('Live Watch Mode Active: Polling backend for real-time changes every 3s...');
      let lastSummary = `${stats.foods}-${stats.students}-${stats.admins}-${stats.orders}`;

      while (true) {
        await new Promise(r => setTimeout(r, 3000));
        try {
          const currentStats = await syncToAtlas(client);
          const summary = `${currentStats.foods}-${currentStats.students}-${currentStats.admins}-${currentStats.orders}`;
          if (summary !== lastSummary) {
            lastSummary = summary;
            console.log(`[${new Date().toLocaleTimeString()}] Live Update Pushed: ${currentStats.foods} foods, ${currentStats.students} students, ${currentStats.orders} orders updated in Atlas.`);
          }
        } catch (pollErr) {
          console.error('Atlas sync poll notice:', pollErr.message);
          if (pollErr.message && (pollErr.message.includes('closed') || pollErr.message.includes('topology was destroyed') || pollErr.message.includes('not connected'))) {
            break;
          }
        }
      }
    } catch (err) {
      console.error('⚠️ Atlas connection notice (will retry in 5s):', err.message);
      if (isOnce) {
        process.exit(1);
      }
    } finally {
      if (client) {
        try { await client.close(); } catch (_) {}
      }
    }

    if (isOnce) return;
    await new Promise(r => setTimeout(r, 5000));
  }
}

main();
