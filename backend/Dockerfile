# Multi-stage Dockerfile for Canteen Management System C Backend & MongoDB Atlas Sync
FROM alpine:3.19 AS builder

RUN apk add --no-cache gcc musl-dev make

WORKDIR /build

COPY include/ ./include/
COPY src/ ./src/
COPY tools/ ./tools/

# Compile C server and seeder for Linux
RUN gcc -Wall -Wextra -Iinclude -O2 src/*.c src/dsa/*.c -o canteen_server
RUN gcc -Wall -Wextra -Iinclude -O2 tools/seed_demo.c src/storage.c src/auth_crypto.c src/config.c src/dsa/*.c -o seed_demo

# Final runtime image with C server + lightweight Node Atlas synchronizer
FROM alpine:3.19

RUN apk add --no-cache ca-certificates nodejs npm

WORKDIR /app

COPY --from=builder /build/canteen_server /app/canteen_server
COPY --from=builder /build/seed_demo /app/seed_demo
COPY package.json /app/package.json
COPY sync_atlas.js /app/sync_atlas.js

# Install mongodb driver for Atlas sync
RUN npm install --omit=dev

# Initialize storage directory and seed demo records during build
RUN mkdir -p /app/data
ENV DATA_DIR=/app/data
RUN ./seed_demo

ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

# Start C server and background Atlas synchronization service
CMD ["sh", "-c", "./canteen_server & node sync_atlas.js"]
