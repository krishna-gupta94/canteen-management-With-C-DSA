#include "../include/storage.h"
#include "../include/models.h"
#include "../include/config.h"
#include <stdio.h>
#include <string.h>

int main(void) {
    printf("--- Running Storage Tests ---\n");

    // Mock config for testing (using default data dir)
    config_get(); // initializes default values

    if (!storage_init()) {
        printf("FAILED: storage_init()\n");
        return 1;
    }
    printf("OK: storage_init()\n");

    // Test Student
    Student s;
    memset(&s, 0, sizeof(s));
    strcpy(s.name, "John Doe");
    strcpy(s.email, "john@example.com");
    
    int s_id = save_student(&s);
    if (s_id > 0) {
        printf("OK: save_student() returned ID %d\n", s_id);
    } else {
        printf("FAILED: save_student()\n");
        return 1;
    }

    Student s_loaded;
    if (load_student_by_id(s_id, &s_loaded) && strcmp(s_loaded.name, "John Doe") == 0) {
        printf("OK: load_student_by_id()\n");
    } else {
        printf("FAILED: load_student_by_id()\n");
    }

    if (find_student_by_email("john@example.com", &s_loaded)) {
        printf("OK: find_student_by_email()\n");
    } else {
        printf("FAILED: find_student_by_email()\n");
    }

    // Test Admin
    Admin a;
    memset(&a, 0, sizeof(a));
    strcpy(a.name, "Admin User");
    int a_id = save_admin(&a);
    if (a_id > 0) printf("OK: save_admin()\n");

    // Test Food
    Food f;
    memset(&f, 0, sizeof(f));
    strcpy(f.name, "Pizza");
    f.price = 10.99;
    f.stock = 50;
    int f_id = save_food(&f);
    if (f_id > 0) printf("OK: save_food()\n");

    f.stock = 40;
    if (update_food(&f)) printf("OK: update_food()\n");

    // Test Order
    Order o;
    memset(&o, 0, sizeof(o));
    o.student_id = s_id;
    o.total_amount = 21.98;
    o.item_count = 2;
    int o_id = save_order(&o);
    if (o_id > 0) printf("OK: save_order()\n");

    // Test SalesRecord
    SalesRecord r;
    memset(&r, 0, sizeof(r));
    strcpy(r.date, "2026-09-16");
    r.total_orders = 10;
    r.total_revenue = 150.50;
    if (save_sales_record(&r)) printf("OK: save_sales_record()\n");

    SalesRecord r2;
    if (load_sales_record("2026-09-16", &r2) && r2.total_orders == 10) {
        printf("OK: load_sales_record()\n");
    }

    printf("--- All Storage Tests Passed ---\n");
    return 0;
}
