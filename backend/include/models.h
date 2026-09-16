#ifndef MODELS_H
#define MODELS_H

#include <time.h>

#define MAX_STR 64
#define MAX_DESC 128
#define MAX_ORDER_ITEMS 20

typedef enum {
    STATUS_INACTIVE = 0,
    STATUS_ACTIVE = 1
} RecordStatus;

typedef enum {
    ORDER_PENDING = 0,
    ORDER_PREPARING = 1,
    ORDER_READY = 2,
    ORDER_COMPLETED = 3,
    ORDER_CANCELLED = 4
} OrderStatus;

typedef struct {
    int id;
    char name[MAX_STR];
    char email[MAX_STR];
    char phone[32];
    char password_hash[MAX_STR];
    time_t created_at;
    int active; // RecordStatus
} Student;

typedef struct {
    int id;
    char name[MAX_STR];
    char email[MAX_STR];
    char password_hash[MAX_STR];
    int active; // RecordStatus
} Admin;

typedef struct {
    int id;
    char name[MAX_STR];
    char category[MAX_STR];
    char description[MAX_DESC];
    double price;
    int stock;
    int availability; // 1 = available, 0 = unavailable
    int active; // RecordStatus (soft delete)
} Food;

typedef struct {
    int food_id;
    int quantity;
    double unit_price;
    double subtotal;
} OrderItem;

typedef struct {
    int id;
    int student_id;
    int status; // OrderStatus
    OrderItem items[MAX_ORDER_ITEMS];
    int item_count;
    double total_amount;
    time_t created_at;
} Order;

typedef struct {
    char date[16]; // YYYY-MM-DD
    int total_orders;
    double total_revenue;
    int completed_orders;
    int cancelled_orders;
} SalesRecord;

#endif // MODELS_H
