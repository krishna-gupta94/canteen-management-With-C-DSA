#ifndef HANDLERS_FOOD_H
#define HANDLERS_FOOD_H

#include "mongoose.h"

// Admin Endpoints
void handle_admin_add_food(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_get_foods(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_update_food(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_delete_food(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_update_price(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_update_stock(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_low_stock(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_out_of_stock(struct mg_connection *c, struct mg_http_message *hm);

// Public / Student Endpoints
void handle_get_menu(struct mg_connection *c, struct mg_http_message *hm);
void handle_search_food(struct mg_connection *c, struct mg_http_message *hm);
void handle_filter_food(struct mg_connection *c, struct mg_http_message *hm);

#endif // HANDLERS_FOOD_H
