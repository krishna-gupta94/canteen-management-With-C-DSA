#include "handlers_food.h"
#include "auth.h"
#include "storage.h"
#include "response.h"
#include "cJSON.h"
#include "dsa/linked_list.h"
#include "dsa/search.h"
#include "dsa/sort.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

// ---------------------------------------------------------
// Helper: Load all foods into a generic Linked List
// ---------------------------------------------------------
static void load_all_foods_to_list(LinkedList *list) {
    ll_init(list);
    int count = count_foods();
    for (int i = 1; i <= count; i++) {
        Food *f = (Food*)malloc(sizeof(Food));
        if (f) {
            if (load_food_by_id(i, f) && f->active == STATUS_ACTIVE) {
                ll_insert_last(list, f);
            } else {
                free(f);
            }
        }
    }
}

static void free_food_node(void *data) {
    free(data);
}

// ---------------------------------------------------------
// Helpers: Convert list to array for sorting/searching
// ---------------------------------------------------------
static void** list_to_array(LinkedList *list, int *out_size) {
    *out_size = ll_size(list);
    if (*out_size == 0) return NULL;
    
    void **arr = (void**)malloc(*out_size * sizeof(void*));
    if (!arr) return NULL;
    
    Node *curr = list->head;
    int i = 0;
    while (curr) {
        arr[i++] = curr->data;
        curr = curr->next;
    }
    return arr;
}

static void array_to_list(void **arr, int size, LinkedList *list) {
    ll_clear(list, NULL); // Don't free data, just nodes
    for (int i = 0; i < size; i++) {
        ll_insert_last(list, arr[i]);
    }
}

// ---------------------------------------------------------
// Comparators
// ---------------------------------------------------------
static int cmp_price_asc(void *a, void *b) {
    double diff = ((Food*)a)->price - ((Food*)b)->price;
    if (diff > 0) return 1;
    if (diff < 0) return -1;
    return 0;
}

static int cmp_price_desc(void *a, void *b) {
    return cmp_price_asc(b, a);
}

static int cmp_name_asc(void *a, void *b) {
    return strcmp(((Food*)a)->name, ((Food*)b)->name);
}

static int cmp_name_desc(void *a, void *b) {
    return cmp_name_asc(b, a);
}

// Substring case-insensitive search
static bool cmp_food_name_search(void *element, void *target) {
    Food *f = (Food*)element;
    const char *query = (const char*)target;
    
    // Simple case-insensitive substring search
    char name_lower[MAX_STR];
    char query_lower[MAX_STR];
    strncpy(name_lower, f->name, MAX_STR);
    strncpy(query_lower, query, MAX_STR);
    
    for (int i = 0; name_lower[i]; i++) name_lower[i] = tolower(name_lower[i]);
    for (int i = 0; query_lower[i]; i++) query_lower[i] = tolower(query_lower[i]);
    
    return strstr(name_lower, query_lower) != NULL;
}

// ---------------------------------------------------------
// JSON Serialization
// ---------------------------------------------------------
static cJSON* food_to_json(Food *f) {
    cJSON *obj = cJSON_CreateObject();
    cJSON_AddNumberToObject(obj, "food_id", f->id);
    cJSON_AddStringToObject(obj, "name", f->name);
    cJSON_AddStringToObject(obj, "category", f->category);
    cJSON_AddNumberToObject(obj, "price", f->price);
    cJSON_AddNumberToObject(obj, "stock", f->stock);
    cJSON_AddBoolToObject(obj, "availability", f->availability == 1);
    
    if (f->stock == 0) {
        cJSON_AddStringToObject(obj, "stock_status", "Out of Stock");
    } else if (f->stock <= 5) {
        cJSON_AddStringToObject(obj, "stock_status", "Low Stock");
    } else {
        cJSON_AddStringToObject(obj, "stock_status", "Available");
    }
    
    cJSON_AddStringToObject(obj, "description", f->description);
    return obj;
}

static void send_food_list_response(struct mg_connection *c, LinkedList *list) {
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    cJSON *arr = cJSON_CreateArray();
    
    Node *curr = list->head;
    while (curr) {
        cJSON_AddItemToArray(arr, food_to_json((Food*)curr->data));
        curr = curr->next;
    }
    
    cJSON_AddItemToObject(root, "data", arr);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

// ---------------------------------------------------------
// Extract ID from URL (e.g., /api/admin/foods/123/price)
// ---------------------------------------------------------
static int extract_id(struct mg_http_message *hm, const char *prefix) {
    // skip prefix
    const char *p = hm->uri.ptr + strlen(prefix);
    if (*p == '/') p++;
    return atoi(p);
}

// ---------------------------------------------------------
// ADMIN ROUTES
// ---------------------------------------------------------

void handle_admin_add_food(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "POST") != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *name = cJSON_GetObjectItem(json, "name");
    cJSON *cat = cJSON_GetObjectItem(json, "category");
    cJSON *price = cJSON_GetObjectItem(json, "price");
    cJSON *stock = cJSON_GetObjectItem(json, "stock");
    cJSON *avail = cJSON_GetObjectItem(json, "availability");
    cJSON *desc = cJSON_GetObjectItem(json, "description");
    
    if (!name || !cJSON_IsString(name) || strlen(name->valuestring) == 0 ||
        !cat || !cJSON_IsString(cat) || strlen(cat->valuestring) == 0 ||
        !price || !cJSON_IsNumber(price) || price->valuedouble <= 0 ||
        !stock || !cJSON_IsNumber(stock) || stock->valueint < 0) {
        send_400_bad_request(c, "Invalid fields. Price > 0, stock >= 0 required.");
        cJSON_Delete(json); return;
    }
    
    Food f;
    memset(&f, 0, sizeof(f));
    strncpy(f.name, name->valuestring, MAX_STR-1);
    strncpy(f.category, cat->valuestring, MAX_STR-1);
    if (desc && cJSON_IsString(desc)) strncpy(f.description, desc->valuestring, MAX_DESC-1);
    f.price = price->valuedouble;
    f.stock = stock->valueint;
    f.availability = (avail && cJSON_IsTrue(avail)) ? 1 : 0;
    
    int id = save_food(&f);
    cJSON_Delete(json);
    
    if (id > 0) {
        char buf[128];
        snprintf(buf, sizeof(buf), "{\"success\":true, \"food_id\":%d}", id);
        send_201_created(c, buf);
    } else {
        send_500_internal_server_error(c, "Failed to save food");
    }
}

void handle_admin_get_foods(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    LinkedList list;
    load_all_foods_to_list(&list);
    send_food_list_response(c, &list);
    ll_clear(&list, free_food_node);
}

void handle_admin_update_food(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "PUT") != 0) { send_405_method_not_allowed(c, "PUT required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int id = extract_id(hm, "/api/admin/foods");
    if (id <= 0) { send_400_bad_request(c, "Invalid ID"); return; }
    
    Food f;
    if (!load_food_by_id(id, &f) || f.active == STATUS_INACTIVE) { send_404_not_found(c, "Food not found"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *name = cJSON_GetObjectItem(json, "name");
    cJSON *cat = cJSON_GetObjectItem(json, "category");
    cJSON *price = cJSON_GetObjectItem(json, "price");
    cJSON *stock = cJSON_GetObjectItem(json, "stock");
    cJSON *avail = cJSON_GetObjectItem(json, "availability");
    cJSON *desc = cJSON_GetObjectItem(json, "description");
    
    if (name && cJSON_IsString(name) && strlen(name->valuestring) > 0) strncpy(f.name, name->valuestring, MAX_STR-1);
    if (cat && cJSON_IsString(cat) && strlen(cat->valuestring) > 0) strncpy(f.category, cat->valuestring, MAX_STR-1);
    if (desc && cJSON_IsString(desc)) strncpy(f.description, desc->valuestring, MAX_DESC-1);
    if (price && cJSON_IsNumber(price) && price->valuedouble > 0) f.price = price->valuedouble;
    if (stock && cJSON_IsNumber(stock) && stock->valueint >= 0) f.stock = stock->valueint;
    if (avail) f.availability = cJSON_IsTrue(avail) ? 1 : 0;
    
    update_food(&f);
    cJSON_Delete(json);
    send_json_message(c, 200, 1, "Food updated");
}

void handle_admin_delete_food(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "DELETE") != 0) { send_405_method_not_allowed(c, "DELETE required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int id = extract_id(hm, "/api/admin/foods");
    if (id <= 0) { send_400_bad_request(c, "Invalid ID"); return; }
    
    if (delete_food(id)) {
        send_json_message(c, 200, 1, "Food deactivated");
    } else {
        send_404_not_found(c, "Food not found");
    }
}

void handle_admin_update_price(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "PUT") != 0) { send_405_method_not_allowed(c, "PUT required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int id = extract_id(hm, "/api/admin/foods");
    Food f;
    if (id <= 0 || !load_food_by_id(id, &f) || f.active == STATUS_INACTIVE) { send_404_not_found(c, "Food not found"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *price = cJSON_GetObjectItem(json, "price");
    if (!price || !cJSON_IsNumber(price) || price->valuedouble <= 0) {
        send_400_bad_request(c, "Invalid price"); cJSON_Delete(json); return;
    }
    
    f.price = price->valuedouble;
    update_food(&f);
    cJSON_Delete(json);
    send_json_message(c, 200, 1, "Price updated");
}

void handle_admin_update_stock(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "PUT") != 0) { send_405_method_not_allowed(c, "PUT required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int id = extract_id(hm, "/api/admin/foods");
    Food f;
    if (id <= 0 || !load_food_by_id(id, &f) || f.active == STATUS_INACTIVE) { send_404_not_found(c, "Food not found"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *stock = cJSON_GetObjectItem(json, "stock");
    if (!stock || !cJSON_IsNumber(stock) || stock->valueint < 0) {
        send_400_bad_request(c, "Invalid stock"); cJSON_Delete(json); return;
    }
    
    f.stock = stock->valueint;
    update_food(&f);
    cJSON_Delete(json);
    send_json_message(c, 200, 1, "Stock updated");
}

void handle_admin_low_stock(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    LinkedList list;
    load_all_foods_to_list(&list);
    
    // Filter linked list manually
    Node *curr = list.head;
    Node *prev = NULL;
    while (curr) {
        Food *f = (Food*)curr->data;
        if (!(f->stock > 0 && f->stock <= 5)) {
            // Remove node without freeing data yet since we'll free all at end
            Node *del = curr;
            if (prev) prev->next = curr->next;
            else list.head = curr->next;
            curr = curr->next;
            free_food_node(del->data); // free unwanted food
            free(del);
            list.size--;
        } else {
            prev = curr;
            curr = curr->next;
        }
    }
    
    send_food_list_response(c, &list);
    ll_clear(&list, free_food_node);
}

void handle_admin_out_of_stock(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    LinkedList list;
    load_all_foods_to_list(&list);
    
    Node *curr = list.head;
    Node *prev = NULL;
    while (curr) {
        Food *f = (Food*)curr->data;
        if (f->stock != 0) {
            Node *del = curr;
            if (prev) prev->next = curr->next;
            else list.head = curr->next;
            curr = curr->next;
            free_food_node(del->data);
            free(del);
            list.size--;
        } else {
            prev = curr;
            curr = curr->next;
        }
    }
    
    send_food_list_response(c, &list);
    ll_clear(&list, free_food_node);
}

// ---------------------------------------------------------
// PUBLIC / STUDENT ROUTES
// ---------------------------------------------------------

static void filter_public_foods(LinkedList *list) {
    Node *curr = list->head;
    Node *prev = NULL;
    while (curr) {
        Food *f = (Food*)curr->data;
        if (f->availability == 0 || f->stock == 0) { // Student cannot see disabled or 0-stock (if we strictly hide them. Requirements: "An item is visible as purchasable only when: active, availability enabled, stock > 0")
            Node *del = curr;
            if (prev) prev->next = curr->next;
            else list->head = curr->next;
            curr = curr->next;
            free_food_node(del->data);
            free(del);
            list->size--;
        } else {
            prev = curr;
            curr = curr->next;
        }
    }
}

void handle_get_menu(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    
    LinkedList list;
    load_all_foods_to_list(&list);
    filter_public_foods(&list);
    
    // Sort logic
    char sort_param[32] = {0};
    mg_http_get_var(&hm->query, "sort", sort_param, sizeof(sort_param));
    
    if (strlen(sort_param) > 0) {
        int size = 0;
        void **arr = list_to_array(&list, &size);
        if (arr) {
            if (strcmp(sort_param, "price_asc") == 0) {
                bubble_sort(arr, size, cmp_price_asc);
            } else if (strcmp(sort_param, "price_desc") == 0) {
                selection_sort(arr, size, cmp_price_desc);
            } else if (strcmp(sort_param, "name_asc") == 0) {
                insertion_sort(arr, size, cmp_name_asc);
            } else if (strcmp(sort_param, "name_desc") == 0) {
                bubble_sort(arr, size, cmp_name_desc);
            }
            array_to_list(arr, size, &list);
            free(arr);
        }
    }
    
    send_food_list_response(c, &list);
    ll_clear(&list, free_food_node);
}

void handle_search_food(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    
    char q[MAX_STR] = {0};
    mg_http_get_var(&hm->query, "q", q, sizeof(q));
    if (strlen(q) == 0) { send_400_bad_request(c, "Missing 'q' parameter"); return; }
    
    LinkedList list;
    load_all_foods_to_list(&list);
    filter_public_foods(&list);
    
    int size = 0;
    void **arr = list_to_array(&list, &size);
    
    LinkedList results;
    ll_init(&results);
    
    // Use Linear Search from Phase 4 across array
    if (arr) {
        int offset = 0;
        int remaining = size;
        while (remaining > 0) {
            int idx = linear_search(&arr[offset], remaining, q, cmp_food_name_search);
            if (idx == -1) break; // no more matches
            
            // Add match to results
            Food *f_copy = (Food*)malloc(sizeof(Food));
            memcpy(f_copy, arr[offset + idx], sizeof(Food));
            ll_insert_last(&results, f_copy);
            
            // advance past this match
            offset = offset + idx + 1;
            remaining = size - offset;
        }
        free(arr);
    }
    
    send_food_list_response(c, &results);
    ll_clear(&results, free_food_node);
    ll_clear(&list, free_food_node);
}

void handle_filter_food(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    
    char cat[MAX_STR] = {0};
    mg_http_get_var(&hm->query, "category", cat, sizeof(cat));
    
    LinkedList list;
    load_all_foods_to_list(&list);
    filter_public_foods(&list);
    
    if (strlen(cat) > 0) {
        Node *curr = list.head;
        Node *prev = NULL;
        while (curr) {
            Food *f = (Food*)curr->data;
            if (mg_vcasecmp(&mg_str(f->category), cat) != 0) {
                Node *del = curr;
                if (prev) prev->next = curr->next;
                else list.head = curr->next;
                curr = curr->next;
                free_food_node(del->data);
                free(del);
                list.size--;
            } else {
                prev = curr;
                curr = curr->next;
            }
        }
    }
    
    send_food_list_response(c, &list);
    ll_clear(&list, free_food_node);
}
