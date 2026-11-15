# 🌐 Canteen Management System — Cloud Hosting & Deployment Guide
> **Step-by-step guide to hosting both Frontend (React 19) and Backend (C + DSA) for 100% FREE**

---

## Architecture Overview

```
 ┌─────────────────────────┐          ┌─────────────────────────┐
 │   Vercel (Frontend)     │          │   Render.com (Backend)  │
 │  • React 19 + Vite      │  HTTPS   │  • Native C HTTP Engine │
 │  • Global CDN + SSL     ├─────────►│  • DSA Queue & Storage  │
 │  • https://canteen.app  │   /api   │  • Docker Container     │
 └─────────────────────────┘          └───────────┬─────────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────────┐
                                      │   MongoDB Atlas Cloud   │
                                      │  • cluster0.t1l7ozq...  │
                                      └─────────────────────────┘
```

---

## STEP 1: Deploy Backend on Render.com (Free)

Since the backend is written in **C + DSA**, it runs inside a lightweight, lightning-fast Alpine Docker container (<20 MB).

1. Go to **[https://dashboard.render.com](https://dashboard.render.com)** and Sign In with **GitHub**.
2. Click **New +** ➔ **Web Service**.
3. Select **Build and deploy from a Git repository** ➔ Click **Next**.
4. Choose your repository: `krishna-gupta94/canteen-management-With-C-DSA`.
5. Fill in the deployment details:
   - **Name:** `canteen-management-backend`
   - **Region:** Any (e.g. *Singapore* or *Oregon*)
   - **Branch:** `main`
   - **Root Directory:** `backend` (Leave blank if using the root docker context)
   - **Runtime:** `Docker`
   - **Instance Type:** `Free` ($0/month)
6. Click **Create Web Service**.
7. Render will automatically build the `Dockerfile` and compile the C code using GCC.
8. Once finished, copy your public backend URL, e.g.:
   `https://canteen-management-backend.onrender.com`

---

## STEP 2: Deploy Frontend on Vercel (Free)

1. Go to **[https://vercel.com](https://vercel.com)** and Sign In with **GitHub**.
2. Click **Add New…** ➔ **Project**.
3. Import `canteen-management-With-C-DSA`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select `frontend`.
5. Under **Environment Variables**, add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-url.onrender.com/api` (the URL from Step 1 with `/api`)
6. Click **Deploy**.
7. In ~30 seconds, your site will be live at `https://canteen-management-xxx.vercel.app`!

---

## Alternative: Full-Stack Docker Deployment (Railway)

If you prefer **Railway.app**:
1. Login to **[Railway.app](https://railway.app)** with GitHub.
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select `canteen-management-With-C-DSA`.
4. Railway will automatically detect `docker-compose.yml` or `backend/Dockerfile`.
5. Generate a domain under Service Settings.

---

## Local Testing with Docker Compose

If you have Docker Desktop running on your machine:
```cmd
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080/api`
