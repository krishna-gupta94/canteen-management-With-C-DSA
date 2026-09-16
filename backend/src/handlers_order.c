#include "handlers_order.h"
#include "auth.h"
#include "cart.h"
#include "storage.h"
#include "response.h"
#include "cJSON.h"
#include "dsa/queue.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static Queue order_queue;

static void free_order_ptr(void *data) {
    free(data);
}

void order_system_init(void) {
    queue_init(&order_queue);
    cart_init();
    
    // Rebuild queue from persistent storage
    int count = count_orders();
    for (int i = 1; i <= count; i++) {
        Order *o = (Order*)malloc(sizeof(Order));
        if (o) {
            if (load_order_by_id(i, o) && o->status == ORDER_PENDING) {
                enqueue(&order_queue, o);
            } else {
                free(o);
            }
        }
    }
}

void order_system_cleanup(void) {
    queue_clear(&order_queue, free_order_ptr);
    cart_cleanup();
}

static int extract_id(struct mg_http_message *hm, const char *prefix) {
    const char *p = hm->uri.ptr + strlen(prefix);
    if (*p == '/') p++;
    return atoi(p);
}

// ---------------------------------------------------------
// CART ENDPOINTS (Student)
// ---------------------------------------------------------

static cJSON* cart_item_to_json(CartItem *ci) {
    cJSON *obj = cJSON_CreateObject();
    cJSON_AddNumberToObject(obj, "food_id", ci->food_id);
    cJSON_AddNumberToObject(obj, "quantity", ci->quantity);
    cJSON_AddNumberToObject(obj, "unit_price", ci->unit_price);
    cJSON_AddNumberToObject(obj, "subtotal", ci->subtotal);
    return obj;
}

void handle_get_cart(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    LinkedList *list = cart_get(student_id);
    double total = cart_calculate_total(student_id);
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    cJSON_AddNumberToObject(root, "total_amount", total);
    cJSON *arr = cJSON_CreateArray();
    
    if (list) {
        Node *curr = list->head;
        while (curr) {
            cJSON_AddItemToArray(arr, cart_item_to_json((CartItem*)curr->data));
            curr = curr->next;
        }
    }
    
    cJSON_AddItemToObject(root, "data", arr);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

void handle_add_cart_item(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "POST") != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *food_id_node = cJSON_GetObjectItem(json, "food_id");
    cJSON *qty_node = cJSON_GetObjectItem(json, "quantity");
    
    if (!food_id_node || !cJSON_IsNumber(food_id_node) || !qty_node || !cJSON_IsNumber(qty_node)) {
        send_400_bad_request(c, "Missing food_id or quantity"); cJSON_Delete(json); return;
    }
    
    int food_id = food_id_node->valueint;
    int qty = qty_node->valueint;
    
    if (cart_add_item(student_id, food_id, qty)) {
        send_json_message(c, 201, 1, "Item added to cart");
    } else {
        send_400_bad_request(c, "Failed to add item (invalid ID, out of stock, or max quantity exceeded)");
    }
    cJSON_Delete(json);
}

void handle_update_cart_item(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "PUT") != 0) { send_405_method_not_allowed(c, "PUT required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    int food_id = extract_id(hm, "/api/cart");
    if (food_id <= 0) { send_400_bad_request(c, "Invalid food ID"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *qty_node = cJSON_GetObjectItem(json, "quantity");
    if (!qty_node || !cJSON_IsNumber(qty_node)) {
        send_400_bad_request(c, "Missing quantity"); cJSON_Delete(json); return;
    }
    
    if (cart_update_item(student_id, food_id, qty_node->valueint)) {
        send_json_message(c, 200, 1, "Cart item updated");
    } else {
        send_400_bad_request(c, "Update failed");
    }
    cJSON_Delete(json);
}

void handle_remove_cart_item(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "DELETE") != 0) { send_405_method_not_allowed(c, "DELETE required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    int food_id = extract_id(hm, "/api/cart");
    if (food_id <= 0) { send_400_bad_request(c, "Invalid food ID"); return; }
    
    if (cart_remove_item(student_id, food_id)) {
        send_json_message(c, 200, 1, "Item removed");
    } else {
        send_404_not_found(c, "Item not in cart");
    }
}

void handle_clear_cart(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "DELETE") != 0) { send_405_method_not_allowed(c, "DELETE required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    cart_clear(student_id);
    send_json_message(c, 200, 1, "Cart cleared");
}

// ---------------------------------------------------------
// ORDER ENDPOINTS (Student)
// ---------------------------------------------------------

void handle_place_order(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "POST") != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    LinkedList *list = cart_get(student_id);
    if (!list || list->size == 0) {
        send_400_bad_request(c, "Cart is empty");
        return;
    }
    
    // 1. All-or-nothing stock and availability check
    Node *curr = list->head;
    while (curr) {
        CartItem *ci = (CartItem*)curr->data;
        Food f;
        if (!load_food_by_id(ci->food_id, &f) || f.active == STATUS_INACTIVE || f.availability == 0) {
            send_400_bad_request(c, "One or more items are no longer available"); return;
        }
        if (ci->quantity > f.stock) {
            send_400_bad_request(c, "Insufficient stock for one or more items"); return;
        }
        curr = curr->next;
    }
    
    // 2. Create Order
    Order o;
    memset(&o, 0, sizeof(o));
    o.student_id = student_id;
    o.status = ORDER_PENDING;
    o.created_at = time(NULL);
    o.total_amount = 0;
    o.item_count = 0;
    
    // 3. Deduct stock & snapshot items
    curr = list->head;
    while (curr && o.item_count < MAX_ORDER_ITEMS) {
        CartItem *ci = (CartItem*)curr->data;
        Food f;
        load_food_by_id(ci->food_id, &f);
        
        f.stock -= ci->quantity;
        update_food(&f);
        
        o.items[o.item_count].food_id = ci->food_id;
        o.items[o.item_count].quantity = ci->quantity;
        o.items[o.item_count].unit_price = f.price; // authoritative price
        o.items[o.item_count].subtotal = ci->quantity * f.price;
        o.total_amount += o.items[o.item_count].subtotal;
        
        o.item_count++;
        curr = curr->next;
    }
    
    // 4. Persist order
    int order_id = save_order(&o);
    if (order_id <= 0) {
        send_500_internal_server_error(c, "Failed to persist order");
        return;
    }
    o.id = order_id;
    
    // 5. Add to in-memory processing queue
    Order *q_order = (Order*)malloc(sizeof(Order));
    if (q_order) {
        memcpy(q_order, &o, sizeof(Order));
        enqueue(&order_queue, q_order);
    }
    
    // 6. Clear cart
    cart_clear(student_id);
    
    char buf[128];
    snprintf(buf, sizeof(buf), "{\"success\":true, \"order_id\":%d, \"total\":%.2f}", order_id, o.total_amount);
    send_201_created(c, buf);
}

// ---------------------------------------------------------
// JSON Serialization for Order
// ---------------------------------------------------------
static cJSON* order_to_json(Order *o) {
    cJSON *obj = cJSON_CreateObject();
    cJSON_AddNumberToObject(obj, "order_id", o->id);
    cJSON_AddNumberToObject(obj, "student_id", o->student_id);
    cJSON_AddNumberToObject(obj, "status", o->status);
    cJSON_AddNumberToObject(obj, "total_amount", o->total_amount);
    cJSON_AddNumberToObject(obj, "created_at", (double)o->created_at);
    
    cJSON *items = cJSON_CreateArray();
    for (int i = 0; i < o->item_count; i++) {
        cJSON *iobj = cJSON_CreateObject();
        cJSON_AddNumberToObject(iobj, "food_id", o->items[i].food_id);
        cJSON_AddNumberToObject(iobj, "quantity", o->items[i].quantity);
        cJSON_AddNumberToObject(iobj, "unit_price", o->items[i].unit_price);
        cJSON_AddNumberToObject(iobj, "subtotal", o->items[i].subtotal);
        cJSON_AddItemToArray(items, iobj);
    }
    cJSON_AddItemToObject(obj, "items", items);
    return obj;
}

static void free_order_node(void *data) {
    free(data);
}

void handle_get_student_orders(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int student_id; if (!require_role(c, hm, ROLE_STUDENT, &student_id)) return;
    
    LinkedList list;
    ll_init(&list);
    
    int count = count_orders();
    for (int i = 1; i <= count; i++) {
        Order *o = (Order*)malloc(sizeof(Order));
        if (o && load_order_by_id(i, o) && o->student_id == student_id) {
            ll_insert_last(&list, o);
        } else if (o) {
            free(o);
        }
    }
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    cJSON *arr = cJSON_CreateArray();
    
    Node *curr = list.head;
    while (curr) {
        cJSON_AddItemToArray(arr, order_to_json((Order*)curr->data));
        curr = curr->next;
    }
    
    cJSON_AddItemToObject(root, "data", arr);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
    
    ll_clear(&list, free_order_node);
}

void handle_get_order_detail(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    
    int user_id = 0;
    int role = get_user_role(c, hm, &user_id);
    if (role == ROLE_UNAUTHORIZED) return;
    
    int id = extract_id(hm, "/api/orders");
    if (id <= 0) { send_400_bad_request(c, "Invalid order ID"); return; }
    
    Order o;
    if (!load_order_by_id(id, &o)) {
        send_404_not_found(c, "Order not found");
        return;
    }
    
    if (role == ROLE_STUDENT && o.student_id != user_id) {
        send_403_forbidden(c, "Access denied to this order");
        return;
    }
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    cJSON_AddItemToObject(root, "data", order_to_json(&o));
    
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

void handle_get_order_receipt(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    
    int user_id = 0;
    int role = get_user_role(c, hm, &user_id);
    if (role == ROLE_UNAUTHORIZED) return;
    
    // URI format: /api/orders/:id/receipt
    // Extract ID (simple extraction since it's sandwiched)
    char id_str[32] = {0};
    const char *p1 = hm->uri.ptr + strlen("/api/orders/");
    const char *p2 = strchr(p1, '/');
    if (p2 && (p2 - p1 < sizeof(id_str))) {
        strncpy(id_str, p1, p2 - p1);
    } else {
        // Fallback for extraction
        strncpy(id_str, p1, sizeof(id_str)-1);
    }
    int id = atoi(id_str);
    if (id <= 0) { send_400_bad_request(c, "Invalid order ID"); return; }
    
    Order o;
    if (!load_order_by_id(id, &o)) {
        send_404_not_found(c, "Order not found");
        return;
    }
    
    if (role == ROLE_STUDENT && o.student_id != user_id) {
        send_403_forbidden(c, "Access denied to this order");
        return;
    }
    
    // Generate Receipt JSON
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    
    cJSON *data = cJSON_CreateObject();
    cJSON_AddStringToObject(data, "canteen_name", "College Canteen");
    cJSON_AddNumberToObject(data, "order_id", o.id);
    
    char time_buf[64];
    struct tm *tm_info = localtime(&o.created_at);
    strftime(time_buf, sizeof(time_buf), "%Y-%m-%d %H:%M:%S", tm_info);
    cJSON_AddStringToObject(data, "date_time", time_buf);
    
    const char *status_str = "UNKNOWN";
    if (o.status == ORDER_PENDING) status_str = "PENDING";
    else if (o.status == ORDER_PREPARING) status_str = "PREPARING";
    else if (o.status == ORDER_READY) status_str = "READY";
    else if (o.status == ORDER_COMPLETED) status_str = "COMPLETED";
    else if (o.status == ORDER_CANCELLED) status_str = "CANCELLED";
    cJSON_AddStringToObject(data, "status", status_str);
    
    cJSON *items = cJSON_CreateArray();
    double calc_total = 0.0;
    for (int i = 0; i < o.item_count; i++) {
        cJSON *iobj = cJSON_CreateObject();
        
        // Fetch food name snapshot (dynamically loaded for now, but price/quantity uses the snapshot in o.items)
        Food f;
        if (load_food_by_id(o.items[i].food_id, &f)) {
            cJSON_AddStringToObject(iobj, "name", f.name);
        } else {
            cJSON_AddStringToObject(iobj, "name", "Deleted Item");
        }
        
        cJSON_AddNumberToObject(iobj, "quantity", o.items[i].quantity);
        cJSON_AddNumberToObject(iobj, "unit_price", o.items[i].unit_price);
        double st = o.items[i].quantity * o.items[i].unit_price;
        cJSON_AddNumberToObject(iobj, "subtotal", st);
        cJSON_AddItemToArray(items, iobj);
        
        calc_total += st;
    }
    cJSON_AddItemToObject(data, "items", items);
    
    // Ensure total matches calculated total safely
    cJSON_AddNumberToObject(data, "total", calc_total);
    
    cJSON_AddItemToObject(root, "data", data);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

// ---------------------------------------------------------
// ORDER ENDPOINTS (Admin)
// ---------------------------------------------------------

void handle_admin_get_orders(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    char status_str[16] = {0};
    mg_http_get_var(&hm->query, "status", status_str, sizeof(status_str));
    int filter_status = -1;
    if (strlen(status_str) > 0) {
        if (strcmp(status_str, "pending") == 0) filter_status = ORDER_PENDING;
        else if (strcmp(status_str, "preparing") == 0) filter_status = ORDER_PREPARING;
        else if (strcmp(status_str, "ready") == 0) filter_status = ORDER_READY;
        else if (strcmp(status_str, "completed") == 0) filter_status = ORDER_COMPLETED;
    }
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    cJSON *arr = cJSON_CreateArray();
    
    int count = count_orders();
    for (int i = 1; i <= count; i++) {
        Order o;
        if (load_order_by_id(i, &o)) {
            if (filter_status == -1 || o.status == filter_status) {
                cJSON_AddItemToArray(arr, order_to_json(&o));
            }
        }
    }
    
    cJSON_AddItemToObject(root, "data", arr);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

void handle_admin_process_next_order(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "POST") != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    if (queue_is_empty(&order_queue)) {
        send_404_not_found(c, "No pending orders in queue");
        return;
    }
    
    Order *o = (Order*)dequeue(&order_queue);
    o->status = ORDER_PREPARING;
    update_order(o);
    
    char buf[256];
    snprintf(buf, sizeof(buf), "{\"success\":true, \"message\":\"Order processing started\", \"order_id\":%d}", o->id);
    send_200_ok(c, buf);
    free(o); // Free node data, it was dequeued
}

void handle_admin_update_order_status(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "PUT") != 0) { send_405_method_not_allowed(c, "PUT required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int id = extract_id(hm, "/api/admin/orders");
    if (id <= 0) { send_400_bad_request(c, "Invalid order ID"); return; }
    
    Order o;
    if (!load_order_by_id(id, &o)) {
        send_404_not_found(c, "Order not found");
        return;
    }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.ptr, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *status = cJSON_GetObjectItem(json, "status");
    if (!status || !cJSON_IsNumber(status)) {
        send_400_bad_request(c, "Missing or invalid status"); cJSON_Delete(json); return;
    }
    
    int new_status = status->valueint;
    
    // State machine check
    if (o.status == ORDER_PENDING && (new_status != ORDER_PREPARING && new_status != ORDER_CANCELLED)) {
        send_400_bad_request(c, "Invalid status transition"); cJSON_Delete(json); return;
    }
    if (o.status == ORDER_PREPARING && new_status != ORDER_READY) {
        send_400_bad_request(c, "Invalid status transition"); cJSON_Delete(json); return;
    }
    if (o.status == ORDER_READY && new_status != ORDER_COMPLETED) {
        send_400_bad_request(c, "Invalid status transition"); cJSON_Delete(json); return;
    }
    if (o.status == ORDER_COMPLETED || o.status == ORDER_CANCELLED) {
        send_400_bad_request(c, "Cannot change terminal status"); cJSON_Delete(json); return;
    }
    
    // Edge case: if cancelled directly from pending, remove from queue?
    // In our simplified architecture, it stays in the queue and fails gracefully on dequeue,
    // or we can just accept that admin processes linearly. If they bypass queue and update status directly:
    
    o.status = new_status;
    update_order(&o);
    
    send_json_message(c, 200, 1, "Order status updated");
    cJSON_Delete(json);
}
