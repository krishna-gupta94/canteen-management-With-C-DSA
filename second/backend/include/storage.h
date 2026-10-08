#ifndef STORAGE_H
#define STORAGE_H

#include "models.h"
#include <stdbool.h>

// Initializes the storage system (ensures files exist)
bool storage_init(void);

// ---------------------------------------------------------
// STUDENTS
// ---------------------------------------------------------
// Saves a new student and assigns an ID (returns the new ID, or -1 on error)
int save_student(Student *student);
// Loads a student by ID (returns true if found and active)
bool load_student_by_id(int id, Student *student);
// Finds a student by exact email (returns true if found and active)
bool find_student_by_email(const char *email, Student *student);
// Updates an existing student's record
bool update_student(const Student *student);
// Marks a student as inactive (logical delete)
bool delete_student(int id);
// Returns total number of student records (including inactive)
int count_students(void);

// ---------------------------------------------------------
// ADMINS
// ---------------------------------------------------------
int save_admin(Admin *admin);
bool load_admin_by_id(int id, Admin *admin);
bool find_admin_by_email(const char *email, Admin *admin);
bool update_admin(const Admin *admin);
bool delete_admin(int id);
int count_admins(void);

// ---------------------------------------------------------
// FOODS
// ---------------------------------------------------------
int save_food(Food *food);
bool load_food_by_id(int id, Food *food);
bool update_food(const Food *food);
bool delete_food(int id);
int count_foods(void);

// ---------------------------------------------------------
// ORDERS
// ---------------------------------------------------------
int save_order(Order *order);
bool load_order_by_id(int id, Order *order);
bool update_order(const Order *order);
int count_orders(void);

// ---------------------------------------------------------
// SALES
// ---------------------------------------------------------
// Saves or updates a sales record for a specific date
bool save_sales_record(const SalesRecord *record);
// Loads the sales record for a specific date
bool load_sales_record(const char *date, SalesRecord *record);

#endif // STORAGE_H
