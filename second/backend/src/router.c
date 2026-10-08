#include "router.h"
#include "response.h"
#include "handlers_auth.h"
#include "handlers_food.h"
#include "handlers_order.h"
#include "handlers_analytics.h"

static void handle_health_check(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("GET")) == 0) {
        send_json_message(c, 200, 1, "Canteen backend is running");
    } else {
        send_405_method_not_allowed(c, "Use GET for /api/health");
    }
}

static void handle_root(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("GET")) == 0) {
        send_json_message(c, 200, 1, "Welcome to Canteen API");
    } else {
        send_405_method_not_allowed(c, "Use GET for /");
    }
}

void route_request(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("OPTIONS")) == 0) {
        mg_http_reply(c, 204, "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: *\r\nAccess-Control-Allow-Methods: *\r\n", "");
        return;
    }

    if (mg_match(hm->uri, mg_str("/api/health"), NULL)) {
        handle_health_check(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/student/register"), NULL)) {
        handle_student_register(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/student/login"), NULL)) {
        handle_student_login(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/login"), NULL)) {
        handle_admin_login(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/auth/logout"), NULL)) {
        handle_logout(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/auth/me"), NULL)) {
        handle_auth_me(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/test/student-only"), NULL)) {
        handle_test_student_only(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/test/admin-only"), NULL)) {
        handle_test_admin_only(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods/low-stock"), NULL)) {
        handle_admin_low_stock(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods/out-of-stock"), NULL)) {
        handle_admin_out_of_stock(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods/*/price"), NULL)) {
        handle_admin_update_price(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods/*/stock"), NULL)) {
        handle_admin_update_stock(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods/*"), NULL)) {
        if (mg_strcasecmp(hm->method, mg_str("PUT")) == 0) handle_admin_update_food(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("DELETE")) == 0) handle_admin_delete_food(c, hm);
        else send_405_method_not_allowed(c, "PUT or DELETE required");
    } else if (mg_match(hm->uri, mg_str("/api/admin/foods"), NULL)) {
        if (mg_strcasecmp(hm->method, mg_str("POST")) == 0) handle_admin_add_food(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("GET")) == 0) handle_admin_get_foods(c, hm);
        else send_405_method_not_allowed(c, "POST or GET required");
    } else if (mg_match(hm->uri, mg_str("/api/admin/dashboard"), NULL)) {
        handle_admin_dashboard(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/inventory/summary"), NULL)) {
        handle_admin_inventory_summary(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/sales/daily"), NULL)) {
        handle_admin_daily_sales(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/popular-foods"), NULL)) {
        handle_admin_popular_foods(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/orders/queue"), NULL)) {
        handle_admin_orders_queue(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/orders/next"), NULL)) {
        handle_admin_process_next_order(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/orders/*/status"), NULL)) {
        handle_admin_update_order_status(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/admin/orders"), NULL)) {
        handle_admin_get_orders(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/orders/history"), NULL)) {
        handle_get_student_orders(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/orders/*/receipt"), NULL)) {
        handle_get_order_receipt(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/orders/*"), NULL)) {
        handle_get_order_detail(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/orders"), NULL)) {
        if (mg_strcasecmp(hm->method, mg_str("POST")) == 0) handle_place_order(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("GET")) == 0) handle_get_student_orders(c, hm);
        else send_405_method_not_allowed(c, "POST or GET required");
    } else if (mg_match(hm->uri, mg_str("/api/cart/*"), NULL)) {
        if (mg_strcasecmp(hm->method, mg_str("PUT")) == 0) handle_update_cart_item(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("DELETE")) == 0) handle_remove_cart_item(c, hm);
        else send_405_method_not_allowed(c, "PUT or DELETE required");
    } else if (mg_match(hm->uri, mg_str("/api/cart"), NULL)) {
        if (mg_strcasecmp(hm->method, mg_str("POST")) == 0) handle_add_cart_item(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("GET")) == 0) handle_get_cart(c, hm);
        else if (mg_strcasecmp(hm->method, mg_str("DELETE")) == 0) handle_clear_cart(c, hm);
        else send_405_method_not_allowed(c, "POST, GET, or DELETE required");
    } else if (mg_match(hm->uri, mg_str("/api/foods/search"), NULL)) {
        handle_search_food(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/foods/filter"), NULL)) {
        handle_filter_food(c, hm);
    } else if (mg_match(hm->uri, mg_str("/api/foods"), NULL)) {
        handle_get_menu(c, hm);
    } else if (mg_match(hm->uri, mg_str("/"), NULL)) {
        handle_root(c, hm);
    } else {
        send_404_not_found(c, "Endpoint not found");
    }
}
