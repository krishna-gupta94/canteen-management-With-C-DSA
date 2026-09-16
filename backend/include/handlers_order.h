#ifndef HANDLERS_ORDER_H
#define HANDLERS_ORDER_H

#include "mongoose.h"

// Initialize queue system from pending orders in storage
void order_system_init(void);

// Clean up queue system
void order_system_cleanup(void);

// Cart endpoints (Student)
void handle_get_cart(struct mg_connection *c, struct mg_http_message *hm);
void handle_add_cart_item(struct mg_connection *c, struct mg_http_message *hm);
void handle_update_cart_item(struct mg_connection *c, struct mg_http_message *hm);
void handle_remove_cart_item(struct mg_connection *c, struct mg_http_message *hm);
void handle_clear_cart(struct mg_connection *c, struct mg_http_message *hm);

// Order endpoints (Student)
void handle_place_order(struct mg_connection *c, struct mg_http_message *hm);
void handle_get_student_orders(struct mg_connection *c, struct mg_http_message *hm);
void handle_get_order_detail(struct mg_connection *c, struct mg_http_message *hm);
void handle_get_order_receipt(struct mg_connection *c, struct mg_http_message *hm);

// Order endpoints (Admin)
void handle_admin_get_orders(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_process_next_order(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_update_order_status(struct mg_connection *c, struct mg_http_message *hm);

#endif // HANDLERS_ORDER_H
