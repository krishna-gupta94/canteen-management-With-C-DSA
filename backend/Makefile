CC = gcc
CFLAGS = -Wall -Wextra -Werror -Iinclude
# For Windows socket (if needed by mongoose) add -lws2_32
LDFLAGS = -lws2_32

SRC_DIR = src
INC_DIR = include
OBJ_DIR = obj

# Find all C files
SRCS = $(wildcard $(SRC_DIR)/*.c)
# Create matching object file names
OBJS = $(patsubst $(SRC_DIR)/%.c, $(OBJ_DIR)/%.o, $(SRCS))

TARGET = canteen_server.exe

.PHONY: all clean debug release

all: debug

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

$(OBJ_DIR):
	mkdir $(OBJ_DIR)

clean:
	if exist $(OBJ_DIR) rmdir /s /q $(OBJ_DIR)
	if exist $(TARGET) del $(TARGET)
