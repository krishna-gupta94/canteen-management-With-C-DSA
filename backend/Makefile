CC = gcc
CFLAGS = -Wall -Wextra -Werror -Iinclude
# For Windows socket and CNG crypto add -lws2_32 -lbcrypt
LDFLAGS = -lws2_32 -lbcrypt

SRC_DIR = src
INC_DIR = include
OBJ_DIR = obj

# Find all C files
SRCS = $(wildcard $(SRC_DIR)/*.c) $(wildcard $(SRC_DIR)/dsa/*.c)
# Create matching object file names
OBJS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(patsubst $(SRC_DIR)/dsa/%.c, $(OBJ_DIR)/dsa/%.o, $(SRCS)))

TARGET = canteen_server.exe
TEST_STORAGE_TARGET = test_storage.exe
TEST_DSA_TARGET = test_dsa.exe

.PHONY: all clean debug release test

all: debug test

# Debug build
debug: CFLAGS += -g -DDEBUG
debug: $(TARGET)

# Release build
release: CFLAGS += -O3
release: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $@ $(LDFLAGS)

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR)/dsa/%.o: $(SRC_DIR)/dsa/%.c | $(OBJ_DIR)
	mkdir -p $(OBJ_DIR)/dsa 2>nul || true
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJ_DIR):
	mkdir $(OBJ_DIR)

test: tests/test_storage.c src/storage.c src/config.c src/dsa/linked_list.c src/dsa/queue.c src/dsa/stack.c src/dsa/priority_queue.c src/dsa/search.c src/dsa/sort.c
	$(CC) $(CFLAGS) tests/test_storage.c src/storage.c src/config.c -o $(TEST_STORAGE_TARGET)
	$(CC) $(CFLAGS) tests/test_dsa.c src/dsa/linked_list.c src/dsa/queue.c src/dsa/stack.c src/dsa/priority_queue.c src/dsa/search.c src/dsa/sort.c -o $(TEST_DSA_TARGET)

clean:
	if exist $(OBJ_DIR) rmdir /s /q $(OBJ_DIR)
	if exist $(TARGET) del $(TARGET)
	if exist $(TEST_STORAGE_TARGET) del $(TEST_STORAGE_TARGET)
	if exist $(TEST_DSA_TARGET) del $(TEST_DSA_TARGET)
