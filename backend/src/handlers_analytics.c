#include "handlers_analytics.h"
#include "auth.h"
#include "storage.h"
#include "response.h"
#include "cJSON.h"
#include "dsa/sort.h"
#include "dsa/search.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// ---------------------------------------------------------
// DAILY SALES
// ---------------------------------------------------------

void handle_admin_daily_sales(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    char date_filter[32] = {0};
    mg_http_get_var(&hm->query, "date", date_filter, sizeof(date_filter));
    
    // If no date provided, use today's date
    if (strlen(date_filter) == 0) {
        time_t now = time(NULL);
        struct tm *t = localtime(&now);
        strftime(date_filter, sizeof(date_filter), "%Y-%m-%d", t);
    }
    
    int total_orders = 0;
    int completed_orders = 0;
    int cancelled_orders = 0;
    double revenue = 0.0;
    
    int count = count_orders();
    for (int i = 1; i <= count; i++) {
        Order o;
        if (load_order_by_id(i, &o)) {
            char order_date[32];
            struct tm *t = localtime(&o.created_at);
            strftime(order_date, sizeof(order_date), "%Y-%m-%d", t);
            
            if (strcmp(order_date, date_filter) == 0) {
                total_orders++;
                if (o.status == ORDER_COMPLETED) {
                    completed_orders++;
                    revenue += o.total_amount;
                } else if (o.status == ORDER_CANCELLED) {
                    cancelled_orders++;
                }
            }
        }
    }
    
    cJSON *root = cJSON_CreateObject();
    cJSON_AddBoolToObject(root, "success", true);
    
    cJSON *data = cJSON_CreateObject();
    cJSON_AddStringToObject(data, "date", date_filter);
    cJSON_AddNumberToObject(data, "total_orders", total_orders);
    cJSON_AddNumberToObject(data, "completed_orders", completed_orders);
    cJSON_AddNumberToObject(data, "cancelled_orders", cancelled_orders);
    cJSON_AddNumberToObject(data, "revenue", revenue);
    
    cJSON_AddItemToObject(root, "data", data);
    char *json_str = cJSON_PrintUnformatted(root);
    send_200_ok(c, json_str);
    free(json_str);
    cJSON_Delete(root);
}

// ---------------------------------------------------------
// POPULAR FOODS
// ---------------------------------------------------------

typedef struct {
    int food_id;
    char name[MAX_STR];
    int quantity_sold;
    int order_count;
} PopularFood;

// Comparator for descending sort
static int cmp_popular_desc(void *a, void *b) {
    PopularFood *pa = (PopularFood*)a;
    PopularFood *pb = (PopularFood*)b;
    return pb->quantity_sold - pa->quantity_sold; // Descending
}

void handle_admin_popular_foods(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") != 0) { send_405_method_not_allowed(c, "GET required"); return; }
    int admin_id; if (!require_role(c, hm, ROLE_ADMIN, &admin_id)) return;
    
    int max_foods = count_foods();
    if (max_foods <= 0) max_foods = 100; // fallback capacity
    
    PopularFood *agg = (PopularFood*)calloc(max_foods, sizeof(PopularFood));
    int agg_count = 0;
    
    int count = count_orders();
    for (int i = 1; i <= count; i++) {
        Order o;
        if (load_order_by_id(i, &o) && o.status == ORDER_COMPLETED) {
            for (int j = 0; j < o.item_count; j++) {
                int fid = o.items[j].food_id;
                int qty = o.items[j].quantity;
                
                // Linear search through aggregation array
                int found_idx = -1;
                for (int k = 0; k < agg_count; k++) {
                    if (agg[k].food_id == fid) {
                        found_idx = k;
                        break;
                    }
                }
                
                if (found_idx != -1) {
                    agg[found_idx].quantity_sold += qty;
                    agg[found_idx].order_count++;
                } else {
                    if (agg_count < max_foods) {
                        agg[agg_count].food_id = fid;
                        agg[agg_count].quantity_sold = qty;
                        agg[agg_count].order_count = 1;
                        
                        Food f;
                        if (load_food_by_id(fid, &f)) {
                            strncpy(agg[agg_count].name, f.name, MAX_STR-1);
                        } else {
                            strncpy(agg[agg_count].name, "Deleted Item", MAX_STR-1);
                        }
                        agg_count++;
                    }
                }
            }
        }
    }
    
    // Sort array descending
    if (agg_count > 0) {
        // Convert to array of pointers for sort API
        void **ptr_arr = (void**)malloc(agg_count * sizeof(void*));
        for (int i = 0; i < agg_count; i++) {
            ptr_arr[i] = &agg[i];
        }
        
        bubble_sort(ptr_arr, agg_count, cmp_popular_desc);
        
        cJSON *root = cJSON_CreateObject();
        cJSON_AddBoolToObject(root, "success", true);
        cJSON *arr = cJSON_CreateArray();
        
        for (int i = 0; i < agg_count; i++) {
            PopularFood *pf = (PopularFood*)ptr_arr[i];
            cJSON *obj = cJSON_CreateObject();
            cJSON_AddNumberToObject(obj, "food_id", pf->food_id);
            cJSON_AddStringToObject(obj, "name", pf->name);
            cJSON_AddNumberToObject(obj, "quantity_sold", pf->quantity_sold);
            cJSON_AddNumberToObject(obj, "order_count", pf->order_count);
            cJSON_AddItemToArray(arr, obj);
        }
        
        cJSON_AddItemToObject(root, "data", arr);
        char *json_str = cJSON_PrintUnformatted(root);
        send_200_ok(c, json_str);
        free(json_str);
        cJSON_Delete(root);
        
        free(ptr_arr);
    } else {
        send_json_message(c, 200, 1, "No data available");
    }
    
    free(agg);
}
