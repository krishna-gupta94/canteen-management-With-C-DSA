#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "models.h"
#include "storage.h"
#include "auth_crypto.h"


int find_food_by_name(const char *name) {
    int max = count_foods();
    Food f;
    for (int i = 1; i <= max; i++) {
        if (load_food_by_id(i, &f) && strcmp(f.name, name) == 0 && f.active) {
            return i;
        }
    }
    return -1;
}

void seed_demo_admin() {
    Admin a;
    if (find_admin_by_email("admin.demo@canteen.local", &a)) {
        printf("Demo Admin already exists.\n");
        return;
    }
    memset(&a, 0, sizeof(Admin));
    strcpy(a.name, "Demo Admin");
    strcpy(a.email, "admin.demo@canteen.local");
    crypto_hash_password("demo_admin123", a.password_hash, sizeof(a.password_hash));
    a.active = STATUS_ACTIVE;
    save_admin(&a);
    printf("Demo Admin created.\n");
}

int seed_demo_student(const char *name, const char *email) {
    Student s;
    if (find_student_by_email(email, &s)) {
        printf("Demo Student %s already exists (ID: %d).\n", name, s.id);
        return s.id;
    }
    memset(&s, 0, sizeof(Student));
    strcpy(s.name, name);
    strcpy(s.email, email);
    strcpy(s.phone, "0000000000");
    crypto_hash_password("demo_pass123", s.password_hash, sizeof(s.password_hash));
    s.created_at = time(NULL) - (3600 * 24 * 7); // 1 week ago
    s.active = STATUS_ACTIVE;
    int id = save_student(&s);
    printf("Demo Student %s created (ID: %d).\n", name, id);
    return id;
}

int seed_demo_food(const char *name, const char *cat, double price, int stock) {
    int id = find_food_by_name(name);
    if (id != -1) {
        Food f;
        load_food_by_id(id, &f);
        // Update stock and price just in case
        f.stock = stock;
        f.price = price;
        f.availability = stock > 0 ? 1 : 0;
        update_food(&f);
        printf("Demo Food %s updated (ID: %d).\n", name, id);
        return id;
    }
    Food f;
    memset(&f, 0, sizeof(Food));
    strcpy(f.name, name);
    strcpy(f.category, cat);
    strcpy(f.description, "Demo food item");
    f.price = price;
    f.stock = stock;
    f.availability = stock > 0 ? 1 : 0;
    f.active = STATUS_ACTIVE;
    id = save_food(&f);
    printf("Demo Food %s created (ID: %d).\n", name, id);
    return id;
}

int main() {
    if (!storage_init()) {
        printf("Failed to init storage\n");
        return 1;
    }
    crypto_init();

    printf("--- SEEDING DEMO DATA ---\n");
    seed_demo_admin();
    
    int stu1 = seed_demo_student("Aarav Sharma", "aarav.demo@canteen.local");
    int stu2 = seed_demo_student("Priya Verma", "priya.demo@canteen.local");
    int stu3 = seed_demo_student("Rahul Singh", "rahul.demo@canteen.local");

    int f_vburger = seed_demo_food("Veg Burger", "Fast Food", 60.0, 20);
    int f_cburger = seed_demo_food("Cheese Burger", "Fast Food", 80.0, 10);
    int f_vmomos = seed_demo_food("Veg Momos", "Chinese", 50.0, 4); // LOW STOCK
    int f_pmomos = seed_demo_food("Paneer Momos", "Chinese", 70.0, 5); // LOW STOCK
    int f_mdosa = seed_demo_food("Masala Dosa", "South Indian", 90.0, 15);
    int f_pdosa = seed_demo_food("Paneer Dosa", "South Indian", 110.0, 12);
    int f_pizza = seed_demo_food("Veg Pizza", "Fast Food", 150.0, 2); // LOW STOCK
    int f_coffee = seed_demo_food("Cold Coffee", "Beverages", 60.0, 0); // OUT OF STOCK
    int f_chai = seed_demo_food("Masala Chai", "Beverages", 20.0, 20);
    
    // We can also seed some historical orders if they don't exist yet!
    // To prevent spam, let's only seed orders if total orders < 10.
    if (count_orders() < 5) {
        printf("Seeding historical orders...\n");
        
        // Aarav: 3 completed, 1 cancelled
        Order o1; memset(&o1, 0, sizeof(Order));
        o1.student_id = stu1; o1.status = ORDER_COMPLETED; o1.item_count = 2;
        o1.items[0].food_id = f_vburger; o1.items[0].quantity = 2; o1.items[0].unit_price = 50.0; o1.items[0].subtotal = 100.0;
        o1.items[1].food_id = f_coffee; o1.items[1].quantity = 1; o1.items[1].unit_price = 50.0; o1.items[1].subtotal = 50.0;
        o1.total_amount = 150.0; o1.created_at = time(NULL) - 86400 * 2;
        save_order(&o1);

        Order o2; memset(&o2, 0, sizeof(Order));
        o2.student_id = stu1; o2.status = ORDER_COMPLETED; o2.item_count = 1;
        o2.items[0].food_id = f_mdosa; o2.items[0].quantity = 1; o2.items[0].unit_price = 90.0; o2.items[0].subtotal = 90.0;
        o2.total_amount = 90.0; o2.created_at = time(NULL) - 86400 * 1;
        save_order(&o2);

        Order o3; memset(&o3, 0, sizeof(Order));
        o3.student_id = stu1; o3.status = ORDER_CANCELLED; o3.item_count = 1;
        o3.items[0].food_id = f_pizza; o3.items[0].quantity = 1; o3.items[0].unit_price = 150.0; o3.items[0].subtotal = 150.0;
        o3.total_amount = 150.0; o3.created_at = time(NULL) - 3600 * 5;
        save_order(&o3);

        Order o4; memset(&o4, 0, sizeof(Order));
        o4.student_id = stu1; o4.status = ORDER_COMPLETED; o4.item_count = 1;
        o4.items[0].food_id = f_chai; o4.items[0].quantity = 2; o4.items[0].unit_price = 20.0; o4.items[0].subtotal = 40.0;
        o4.total_amount = 40.0; o4.created_at = time(NULL) - 3600 * 2;
        save_order(&o4);

        // Priya: 2 completed, 1 preparing
        Order o5; memset(&o5, 0, sizeof(Order));
        o5.student_id = stu2; o5.status = ORDER_COMPLETED; o5.item_count = 1;
        o5.items[0].food_id = f_vmomos; o5.items[0].quantity = 2; o5.items[0].unit_price = 50.0; o5.items[0].subtotal = 100.0;
        o5.total_amount = 100.0; o5.created_at = time(NULL) - 86400;
        save_order(&o5);

        Order o6; memset(&o6, 0, sizeof(Order));
        o6.student_id = stu2; o6.status = ORDER_COMPLETED; o6.item_count = 1;
        o6.items[0].food_id = f_cburger; o6.items[0].quantity = 1; o6.items[0].unit_price = 80.0; o6.items[0].subtotal = 80.0;
        o6.total_amount = 80.0; o6.created_at = time(NULL) - 3600;
        save_order(&o6);

        Order o7; memset(&o7, 0, sizeof(Order));
        o7.student_id = stu2; o7.status = ORDER_PREPARING; o7.item_count = 1;
        o7.items[0].food_id = f_pdosa; o7.items[0].quantity = 1; o7.items[0].unit_price = 110.0; o7.items[0].subtotal = 110.0;
        o7.total_amount = 110.0; o7.created_at = time(NULL) - 1800;
        save_order(&o7);

        // Rahul: 1 completed, 1 pending
        Order o8; memset(&o8, 0, sizeof(Order));
        o8.student_id = stu3; o8.status = ORDER_COMPLETED; o8.item_count = 1;
        o8.items[0].food_id = f_vburger; o8.items[0].quantity = 1; o8.items[0].unit_price = 60.0; o8.items[0].subtotal = 60.0;
        o8.total_amount = 60.0; o8.created_at = time(NULL) - 7200;
        save_order(&o8);

        Order o9; memset(&o9, 0, sizeof(Order));
        o9.student_id = stu3; o9.status = ORDER_PENDING; o9.item_count = 1;
        o9.items[0].food_id = f_pizza; o9.items[0].quantity = 1; o9.items[0].unit_price = 150.0; o9.items[0].subtotal = 150.0;
        o9.total_amount = 150.0; o9.created_at = time(NULL) - 600;
        save_order(&o9);
        
        printf("Demo orders seeded.\n");
    } else {
        printf("Orders already exist. Skipping order seeding to prevent duplication.\n");
    }
    
    printf("--- SEEDING COMPLETE ---\n");
    return 0;
}
