# Canteen Management System - Backend

## Phase 2: C Backend Foundation

This project is a C-based HTTP API backend for a Canteen Management System. It uses Mongoose (a lightweight C networking library) to handle HTTP requests.

### Project Purpose
To provide a DSA-focused C backend that serves a frontend via HTTP APIs. Currently, business features (like auth, carts, food management) are intentionally **NOT** implemented yet. Only the foundational routing, HTTP server, and configuration layers exist.

### C Backend Architecture
- **Server Wrapper (`server.c`)**: Initializes the Mongoose event manager and listens on a configured port.
- **Router (`router.c`)**: Dispatches incoming URLs and methods to specific handler functions.
- **Config (`config.c`)**: Reads environment variables with sensible defaults.
- **Response (`response.c`)**: Provides reusable helpers for sending standard HTTP status codes and JSON messages.
- **Mongoose**: Used to abstract raw TCP/socket management and HTTP parsing safely.

### Requirements
- A C compiler (GCC/MinGW on Windows, or Clang).
- `make` (optional, Windows batch script is provided).
- Winsock2 library (`-lws2_32`) on Windows.

### Installation & Build Commands

Using Makefile (if you have MinGW `make` installed):
```sh
cd backend
make
```

Using Batch Script (Windows):
```cmd
cd backend
build.bat
```

To clean the build (Makefile):
```sh
make clean
```

### Run Commands

```cmd
cd backend
canteen_server.exe
```

### Configuration (Environment Variables)
- `PORT` (default: 8080)
- `HOST` (default: 0.0.0.0)
- `DATA_DIR` (default: ./data)

### Available Foundation Endpoints
- `GET /` - Root endpoint. Returns 200 OK.
- `GET /api/health` - Health check endpoint. Returns 200 OK.

Unsupported endpoints will return a `404 Not Found` JSON response.
Unsupported HTTP methods will return a `405 Method Not Allowed` JSON response.

### Current Limitations
- Business logic is completely un-implemented.
- No database or persistent file storage is currently active.
- Data structures are pending implementation.

### Next Development Phase (Phase 3)
Data Models + Storage: Implementing the C Structs and File I/O mechanisms to save and load data persistently.
