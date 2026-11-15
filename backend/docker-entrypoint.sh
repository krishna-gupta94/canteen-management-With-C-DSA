#!/bin/sh
set -e

echo "===================================================="
echo " Starting Canteen Management System Container"
echo " PORT: ${PORT:-8080}"
echo " HOST: ${HOST:-0.0.0.0}"
echo " DATA_DIR: ${DATA_DIR:-/app/data}"
echo "===================================================="

mkdir -p "${DATA_DIR:-/app/data}"

# Run initial seed if data files do not exist
if [ ! -f "${DATA_DIR:-/app/data}/foods.dat" ]; then
    echo "First-time start: Seeding demo records..."
    ./seed_demo
fi

# 1. Start MongoDB Atlas Synchronizer in background supervisor loop
echo "Launching background Atlas sync supervisor..."
(
    while true; do
        node sync_atlas.js || true
        echo "Atlas sync loop cycled. Retrying in 5 seconds..."
        sleep 5
    done
) &
SYNC_PID=$!

# 2. Trap signals to cleanly shutdown
cleanup() {
    echo "Stopping container services..."
    kill -TERM $SYNC_PID 2>/dev/null || true
    kill -TERM $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# 3. Start Canteen C backend server in foreground
echo "Launching C Backend Web Server..."
./canteen_server &
SERVER_PID=$!

# Wait on the core C server (primary application process)
wait $SERVER_PID
