#include "storage.h"
#include "config.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void get_filepath(const char *filename, char *buffer, size_t max_len) {
    AppConfig *cfg = config_get();
    snprintf(buffer, max_len, "%s/%s", cfg->data_dir, filename);
}

static void ensure_file(const char *filename) {
    char filepath[256]; get_filepath(filename, filepath, sizeof(filepath));
    FILE *fp = fopen(filepath, "ab+");
    if (fp) fclose(fp);
}

bool storage_init(void) {
    ensure_file("students.dat"); ensure_file("admins.dat");
    ensure_file("foods.dat"); ensure_file("orders.dat");
    ensure_file("sales.dat"); return true;
}

#define COUNT_RECORDS(filename, type) \
    char filepath[256]; get_filepath(filename, filepath, sizeof(filepath)); \
    FILE *fp = fopen(filepath, "rb"); if (!fp) return 0; \
    fseek(fp, 0, SEEK_END); long size = ftell(fp); fclose(fp); \
    return (int)(size / sizeof(type));

#define LOAD_BY_ID(filename, type, id, out_ptr) \
    if (id <= 0) return false; \
    char filepath[256]; get_filepath(filename, filepath, sizeof(filepath)); \
    FILE *fp = fopen(filepath, "rb"); if (!fp) return false; \
    fseek(fp, (id - 1) * sizeof(type), SEEK_SET); \
    size_t read = fread(out_ptr, sizeof(type), 1, fp); fclose(fp); \
    return (read == 1);

#define UPDATE_RECORD(filename, type, id, in_ptr) \
    if (id <= 0) return false; \
    char filepath[256]; get_filepath(filename, filepath, sizeof(filepath)); \
    FILE *fp = fopen(filepath, "rb+"); if (!fp) return false; \
    fseek(fp, (id - 1) * sizeof(type), SEEK_SET); \
    size_t written = fwrite(in_ptr, sizeof(type), 1, fp); fclose(fp); \
    return (written == 1);

#define SAVE_RECORD(filename, type, count_func, in_ptr) \
    int id = count_func() + 1; in_ptr->id = id; \
    char filepath[256]; get_filepath(filename, filepath, sizeof(filepath)); \
    FILE *fp = fopen(filepath, "ab"); if (!fp) return -1; \
    fwrite(in_ptr, sizeof(type), 1, fp); fclose(fp); return id;

// --- STUDENTS ---
int count_students(void) { COUNT_RECORDS("students.dat", Student) }
int save_student(Student *s) { s->active = STATUS_ACTIVE; s->created_at = time(NULL); SAVE_RECORD("students.dat", Student, count_students, s) }
bool load_student_by_id(int id, Student *s) { bool ok = LOAD_BY_ID("students.dat", Student, id, s); return ok && s->active; }
bool update_student(const Student *s) { UPDATE_RECORD("students.dat", Student, s->id, s) }
bool delete_student(int id) { Student s; if (load_student_by_id(id, &s)) { s.active = STATUS_INACTIVE; return update_student(&s); } return false; }
bool find_student_by_email(const char *email, Student *out) {
    char p[256]; get_filepath("students.dat", p, sizeof(p));
    FILE *fp = fopen(p, "rb"); if (!fp) return false;
    while (fread(out, sizeof(Student), 1, fp) == 1) {
        if (out->active && strcmp(out->email, email) == 0) { fclose(fp); return true; }
    }
    fclose(fp); return false;
}

// --- ADMINS ---
int count_admins(void) { COUNT_RECORDS("admins.dat", Admin) }
int save_admin(Admin *a) { a->active = STATUS_ACTIVE; SAVE_RECORD("admins.dat", Admin, count_admins, a) }
bool load_admin_by_id(int id, Admin *a) { bool ok = LOAD_BY_ID("admins.dat", Admin, id, a); return ok && a->active; }
bool update_admin(const Admin *a) { UPDATE_RECORD("admins.dat", Admin, a->id, a) }
bool delete_admin(int id) { Admin a; if (load_admin_by_id(id, &a)) { a.active = STATUS_INACTIVE; return update_admin(&a); } return false; }
bool find_admin_by_email(const char *email, Admin *out) {
    char p[256]; get_filepath("admins.dat", p, sizeof(p));
    FILE *fp = fopen(p, "rb"); if (!fp) return false;
    while (fread(out, sizeof(Admin), 1, fp) == 1) {
        if (out->active && strcmp(out->email, email) == 0) { fclose(fp); return true; }
    }
    fclose(fp); return false;
}

// --- FOODS ---
int count_foods(void) { COUNT_RECORDS("foods.dat", Food) }
int save_food(Food *f) { f->active = STATUS_ACTIVE; SAVE_RECORD("foods.dat", Food, count_foods, f) }
bool load_food_by_id(int id, Food *f) { bool ok = LOAD_BY_ID("foods.dat", Food, id, f); return ok && f->active; }
bool update_food(const Food *f) { UPDATE_RECORD("foods.dat", Food, f->id, f) }
bool delete_food(int id) { Food f; if (load_food_by_id(id, &f)) { f.active = STATUS_INACTIVE; return update_food(&f); } return false; }

// --- ORDERS ---
int count_orders(void) { COUNT_RECORDS("orders.dat", Order) }
int save_order(Order *o) { o->created_at = time(NULL); SAVE_RECORD("orders.dat", Order, count_orders, o) }
bool load_order_by_id(int id, Order *o) { LOAD_BY_ID("orders.dat", Order, id, o) }
bool update_order(const Order *o) { UPDATE_RECORD("orders.dat", Order, o->id, o) }

// --- SALES ---
bool save_sales_record(const SalesRecord *rec) {
    SalesRecord temp; char p[256]; get_filepath("sales.dat", p, sizeof(p));
    FILE *fp = fopen(p, "rb+");
    if (!fp) { fp = fopen(p, "wb"); if(!fp) return false; } // create if missing
    
    long pos = 0; bool found = false;
    while (fread(&temp, sizeof(SalesRecord), 1, fp) == 1) {
        if (strcmp(temp.date, rec->date) == 0) {
            found = true; break;
        }
        pos = ftell(fp);
    }
    
    if (found) { fseek(fp, pos, SEEK_SET); }
    else { fseek(fp, 0, SEEK_END); }
    
    fwrite(rec, sizeof(SalesRecord), 1, fp);
    fclose(fp); return true;
}

bool load_sales_record(const char *date, SalesRecord *out) {
    char p[256]; get_filepath("sales.dat", p, sizeof(p));
    FILE *fp = fopen(p, "rb"); if (!fp) return false;
    while (fread(out, sizeof(SalesRecord), 1, fp) == 1) {
        if (strcmp(out->date, date) == 0) { fclose(fp); return true; }
    }
    fclose(fp); return false;
}
