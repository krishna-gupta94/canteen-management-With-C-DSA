# 📋 Project File Inventory — Canteen Management System
> **Repository-Wide Comprehensive Audit, Usage Analysis & Lifecycle Action Matrix**  
> *Date:* November 15, 2026 | *Auditor:* Senior Software Architect & DevOps Engineer  
> *Active Baseline:* C + DSA Backend, React 19 + Vite Frontend, MongoDB Atlas / Dual-Store Architecture

---

## 1. Executive Summary

A comprehensive recursive scan of the entire repository was performed. Every source file, configuration, asset, test suite, and document was categorized by its role, active dependency graph, and recommended lifecycle action (**KEEP**, **MODIFY**, **DELETE**, **REVIEW**).

- **Total Assessed Files:** ~115
- **Files Scheduled for Retention (KEEP):** 74
- **Files Scheduled for Modification/Optimization (MODIFY):** 8
- **Files Scheduled for Safe Deletion (DELETE):** 33 (Obsolete backups, duplicate redesign downloads, redundant configs)

---

## 2. Backend Inventory (`backend/`)

| Relative Path | File Type | Purpose | Actively Used | References / Dependencies | Action |
|---|---|---|---|---|---|
| `backend/src/main.c` | C Source | Application entrypoint, signals, server initialization | Yes | `server.h`, `config.h`, `storage.h` | **KEEP** |
| `backend/src/server.c` | C Source | Mongoose HTTP network server loop & dispatcher | Yes | `server.h`, `router.h`, `mongoose.h` | **KEEP** |
| `backend/src/router.c` | C Source | REST routing table, regex path matching, middleware | Yes | `router.h`, `handlers_*.h` | **KEEP** |
| `backend/src/auth.c` | C Source | Token authentication, session state, role validation | Yes | `auth.h`, `storage.h`, `auth_crypto.h` | **KEEP** |
| `backend/src/auth_crypto.c` | C Source | Salted password hashing & secure token generation | Yes | `auth_crypto.h` | **KEEP** |
| `backend/src/cart.c` | C Source | Student shopping cart state & stock pre-reservation | Yes | `cart.h`, `storage.h` | **KEEP** |
| `backend/src/storage.c` | C Source | Binary file persistence engine (`.dat` binary records) | Yes | `storage.h`, `models.h` | **KEEP** |
| `backend/src/config.c` | C Source | Environment & port configuration loader | Yes | `config.h` | **KEEP** |
| `backend/src/response.c` | C Source | Standardized JSON HTTP response helpers | Yes | `response.h`, `cJSON.h` | **KEEP** |
| `backend/src/cJSON.c` | C Source | Fast, zero-dependency JSON parser & serializer | Yes | `cJSON.h` | **KEEP** |
| `backend/src/mongoose.c` | C Source | Embedded Mongoose v7.13 HTTP engine | Yes | `mongoose.h` | **KEEP** |
| `backend/src/handlers_auth.c` | C Source | Student/admin registration and login endpoints | Yes | `handlers_auth.h`, `auth.h` | **KEEP** |
| `backend/src/handlers_food.c` | C Source | Menu listing, search, filter, stock mutations | Yes | `handlers_food.h`, `dsa/*.h` | **KEEP** |
| `backend/src/handlers_order.c` | C Source | Checkout, queue dispatch, order status tracking | Yes | `handlers_order.h`, `queue.h` | **KEEP** |
| `backend/src/handlers_analytics.c` | C Source | Daily revenue, popular foods, sales reporting | Yes | `handlers_analytics.h`, `storage.h` | **KEEP** |
| `backend/src/dsa/linked_list.c` | C Source | Singly & doubly linked list data structures | Yes | `linked_list.h` | **KEEP** |
| `backend/src/dsa/queue.c` | C Source | FIFO queue for canteen kitchen order processing | Yes | `queue.h` | **KEEP** |
| `backend/src/dsa/priority_queue.c` | C Source | Min/Max heap priority queue for VIP/urgent orders | Yes | `priority_queue.h` | **KEEP** |
| `backend/src/dsa/stack.c` | C Source | LIFO stack for order actions and undo history | Yes | `stack.h` | **KEEP** |
| `backend/src/dsa/search.c` | C Source | Binary & linear search implementations for food items | Yes | `search.h` | **KEEP** |
| `backend/src/dsa/sort.c` | C Source | QuickSort / MergeSort for food prices and ratings | Yes | `sort.h` | **KEEP** |
| `backend/include/*.h` (18 files) | C Headers | Public APIs, structs (`models.h`), DSA prototypes | Yes | Linked across all `backend/src/*.c` | **KEEP** |
| `backend/data/*.dat` (5 files) | Binary Data | `admins.dat`, `foods.dat`, `orders.dat`, `sales.dat`, `students.dat` | Yes | `storage.c` runtime persistence | **KEEP** |
| `backend/tools/seed_demo.c` | C Source | Seed script generating realistic canteen demo data | Yes | Standalone compilation tool | **KEEP** |
| `backend/build.bat` | Batch Script | MinGW GCC compilation script for Windows | Yes | Primary build utility for C server | **MODIFY** |
| `backend/Makefile` | Make Script | Cross-platform build instructions (Linux/macOS/GCC) | Yes | Cross-platform build automation | **KEEP** |
| `backend/README.md` | Markdown | Comprehensive architecture & API documentation | Yes | Developer onboarding | **KEEP** |
| `backend/tests/test_dsa.c` | C Source | DSA unit test harness | Yes | Run via `test_dsa.exe` | **KEEP** |
| `backend/tests/test_storage.c` | C Source | Storage unit test harness | Yes | Run via `test_storage.exe` | **KEEP** |
| `backend/tests/*.ps1` (5 files) | PowerShell | Granular backend module integration tests | Yes | Automated testing | **KEEP** |

---

## 3. Active Frontend Inventory (`frontend/`)

| Relative Path | File Type | Purpose | Actively Used | References / Dependencies | Action |
|---|---|---|---|---|---|
| `frontend/index.html` | HTML | Application shell, font imports (Poppins, Inter) | Yes | Vite HTML entrypoint | **KEEP** |
| `frontend/package.json` | JSON | NPM configuration, scripts, React 19 deps | Yes | Project dependency definitions | **MODIFY** |
| `frontend/package-lock.json`| JSON | Exact lockfile for NPM dependencies | Yes | NPM dependency integrity | **KEEP** |
| `frontend/pnpm-lock.yaml` | YAML | Legacy pnpm lockfile (project uses npm) | No | None (redundant to package-lock) | **DELETE** |
| `frontend/tsconfig.json` | JSON | TypeScript compiler configuration | Yes | Vite + React TS validation | **KEEP** |
| `frontend/vite.config.ts` | TypeScript | Vite build config with Tailwind v4 plugin | Yes | Vite bundler | **MODIFY** |
| `frontend/.env` | Env File | Frontend environment variables (`VITE_API_URL`) | Yes | Runtime API client | **KEEP** |
| `frontend/.mise.toml` | TOML | Redundant Mise tool version file from download | No | None | **DELETE** |
| `frontend/AGENTS.md` | Markdown | Redundant agent instructions from download | No | None | **DELETE** |
| `frontend/CLAUDE.md` | Markdown | Redundant single-line stub from download | No | None | **DELETE** |
| `frontend/.figma/` (all) | Directory | Figma Make scaffolding scripts | No | None | **DELETE** |
| `frontend/src/main.tsx` | TypeScript | React 19 root bootstrap & DOM mount | Yes | `App.tsx`, `index.css` | **KEEP** |
| `frontend/src/App.tsx` | TypeScript | Active modern single-page canteen application | Yes | Core UI view & state | **KEEP** |
| `frontend/src/index.css` | CSS | Modern dark theme styles, Tailwind utilities | Yes | Core styling | **KEEP** |
| `frontend/src/vite-env.d.ts`| TypeScript | Vite client types declaration | Yes | TypeScript compilation | **KEEP** |
| `frontend/src/api/*.ts` (7 files) | TypeScript | Axios/fetch API clients (`auth`, `foods`, `cart`, etc.) | Yes | State hooks & context | **KEEP** |
| `frontend/src/context/AuthContext.tsx` | TypeScript | Session provider & local storage persistence | Yes | Authentication state | **KEEP** |
| `frontend/src/hooks/*.ts` (4 files) | TypeScript | Custom React hooks (`useAuth`, `useCart`, `useFoods`, `useOrders`) | Yes | State management | **KEEP** |
| `frontend/src/types/*.ts` (5 files) | TypeScript | Strongly-typed interfaces matching backend models | Yes | Full-stack type safety | **KEEP** |
| `frontend/public/cards-3d.jpg` | Image | High-resolution 3D food card showcase asset | Yes | UI visual design | **KEEP** |
| `frontend/public/hero-3d.jpg` | Image | High-resolution 3D hero showcase asset | Yes | UI visual design | **KEEP** |
| `frontend/public/favicon.png` | Image | Application favicon | Yes | `index.html` browser tab | **KEEP** |

---

## 4. Database Inventory & Target Architecture (`database/`)

| Target Path | File Type | Purpose | Actively Used | References / Dependencies | Action |
|---|---|---|---|---|---|
| `database/schema/schema.sql` | SQL | Canonical relational DDL schema (MySQL/PostgreSQL) | Planned | Matches `models.h` exactly | **CREATE** |
| `database/seeds/seed_data.sql` | SQL | Canonical seed data for relational databases | Planned | Matches `seed_demo.c` | **CREATE** |
| `database/seeds/seed_data.json`| JSON | Seed fixtures for MongoDB Atlas collections | Planned | MongoDB Atlas collections | **CREATE** |
| `database/README.md` | Markdown | Comprehensive database documentation & architecture | Planned | Multi-database documentation | **CREATE** |

---

## 5. Repository Utilities & Scripts (`scripts/`)

| Relative Path | File Type | Purpose | Actively Used | References / Dependencies | Action |
|---|---|---|---|---|---|
| `run_backend.bat` | Batch Script | Launches backend C server from workspace root | Yes | Consolidated into `scripts/` | **MODIFY** |
| `seed_database.bat` | Batch Script | Compiles and runs `seed_demo.c` | Yes | Consolidated into `scripts/` | **MODIFY** |
| `scripts/run_backend.bat` | Batch Script | Clean execution script inside `scripts/` | Planned | Development workflow | **CREATE** |
| `scripts/seed_database.bat` | Batch Script | Clean seed script inside `scripts/` | Planned | Development workflow | **CREATE** |
| `scripts/test_all.bat` | Batch Script | Unified verification runner for backend & frontend | Planned | CI/CD automation | **CREATE** |

---

## 6. Tests Directory (`tests/`)

| Relative Path | File Type | Purpose | Actively Used | References / Dependencies | Action |
|---|---|---|---|---|---|
| `tests/integration_test.ps1` | PowerShell | 32-test end-to-end integration test suite | Yes | Automated full-system verification | **MODIFY** (Fix stock fixture) |

---

## 7. Obsolete & Redundant Directories Scheduled for Safe Deletion

| Directory / File Path | Approximate Size | Justification for Deletion | Safe to Delete? |
|---|---|---|---|
| `frontend_old_backup/` | ~45 MB | Outdated pre-redesign frontend. Completely replaced by `frontend/`. Fully preserved in Git history and tag `backup-pre-cleanup`. | **YES** |
| `Redesign Canteen Management App/` | ~1.5 MB | Temporary unzipped download directory from Figma Make. All assets and code were already merged into `frontend/`. | **YES** |
| `frontend/.figma/` | ~3 KB | Leftover Figma make platform helper scripts not used in production builds. | **YES** |
| `frontend/pnpm-lock.yaml` | ~34 KB | Redundant lockfile; repository uses NPM standard `package-lock.json`. | **YES** |
| `frontend/.mise.toml` | ~43 B | External tool environment file not part of standard Node.js workflow. | **YES** |
| `frontend/AGENTS.md` | ~2.5 KB | Generic scaffolding instructions from third-party template. | **YES** |
| `frontend/CLAUDE.md` | ~11 B | Empty stub file. | **YES** |
| `UI_UX_AUDIT.md` (root) | ~32 KB | Root audit markdown. Moving to `docs/UI_UX_AUDIT.md` for clean root organization. | **YES (Relocate)** |

---

## 8. Retention Verification & Final Plan

1. **Safety:** Confirmed tag `backup-pre-cleanup` and branch `pre-cleanup-backup` exist.
2. **Phase 2 & 3:** Remove `frontend_old_backup/`, `Redesign Canteen Management App/`, and scaffolding clutter.
3. **Phase 4 & 5:** Clean obsolete assets and fix test fixture in `tests/integration_test.ps1`.
4. **Phase 7 & 8:** Establish `database/` and `scripts/` canonical directories.
5. **Phase 9, 10, 11:** Verify frontend builds, backend compiles, and all 32/32 tests pass.
6. **Phase 12:** Produce final `docs/CLEANUP_REPORT.md`.
