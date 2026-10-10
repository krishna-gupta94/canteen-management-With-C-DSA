#ifndef HANDLERS_ANALYTICS_H
#define HANDLERS_ANALYTICS_H

#include "mongoose.h"

// Admin endpoints
void handle_admin_daily_sales(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_popular_foods(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_dashboard(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_inventory_summary(struct mg_connection *c, struct mg_http_message *hm);

#endif // HANDLERS_ANALYTICS_H
