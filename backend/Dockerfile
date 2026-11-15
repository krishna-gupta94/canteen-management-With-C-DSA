# Multi-stage Dockerfile for Canteen Management System C Backend
FROM alpine:3.19 AS builder

RUN apk add --no-cache gcc musl-dev make

WORKDIR /build

COPY include/ ./include/
COPY src/ ./src/
COPY tools/ ./tools/

# Compile C server and seeder for Linux
RUN gcc -Wall -Wextra -Iinclude -O2 src/*.c src/dsa/*.c -o canteen_server
RUN gcc -Wall -Wextra -Iinclude -O2 tools/seed_demo.c src/storage.c src/auth_crypto.c src/config.c src/dsa/*.c -o seed_demo

# Final lightweight runtime image (<20MB)
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /build/canteen_server /app/canteen_server
COPY --from=builder /build/seed_demo /app/seed_demo
COPY data/ /app/data/

ENV PORT=8080
ENV HOST=0.0.0.0
ENV DATA_DIR=/app/data

EXPOSE 8080

CMD ["./canteen_server"]
