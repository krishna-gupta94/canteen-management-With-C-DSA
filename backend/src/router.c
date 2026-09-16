#include "router.h"
#include "response.h"
#include "handlers_auth.h"
#include "handlers_food.h"
#include "handlers_order.h"
#include "handlers_analytics.h"

static void handle_health_check(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") == 0) {
        send_json_message(c, 200, 1, "Canteen backend is running");
    } else {
        send_405_method_not_allowed(c, "Use GET for /api/health");
    }
}

static void handle_root(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_vcasecmp(&hm->method, "GET") == 0) {
        send_json_message(c, 200, 1, "Welcome to Canteen API");
    } else {
        send_405_method_not_allowed(c, "Use GET for /");
    }
}

void route_request(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_http_match_uri(hm, "/api/health")) {
        handle_health_check(c, hm);
    } else if (mg_http_match_uri(hm, "/api/student/register")) {
        handle_student_register(c, hm);
    } else if (mg_http_match_uri(hm, "/api/student/login")) {
        handle_student_login(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/login")) {
        handle_admin_login(c, hm);
    } else if (mg_http_match_uri(hm, "/api/auth/logout")) {
        handle_logout(c, hm);
    } else if (mg_http_match_uri(hm, "/api/auth/me")) {
        handle_auth_me(c, hm);
    } else if (mg_http_match_uri(hm, "/api/test/student-only")) {
        handle_test_student_only(c, hm);
    } else if (mg_http_match_uri(hm, "/api/test/admin-only")) {
        handle_test_admin_only(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/foods/low-stock")) {
        handle_admin_low_stock(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/foods/out-of-stock")) {
        handle_admin_out_of_stock(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/foods/*/price")) {
        handle_admin_update_price(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/foods/*/stock")) {
        handle_admin_update_stock(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/foods/*")) {
        if (mg_vcasecmp(&hm->method, "PUT") == 0) handle_admin_update_food(c, hm);
        else if (mg_vcasecmp(&hm->method, "DELETE") == 0) handle_admin_delete_food(c, hm);
        else send_405_method_not_allowed(c, "PUT or DELETE required");
    } else if (mg_http_match_uri(hm, "/api/admin/foods")) {
        if (mg_vcasecmp(&hm->method, "POST") == 0) handle_admin_add_food(c, hm);
        else if (mg_vcasecmp(&hm->method, "GET") == 0) handle_admin_get_foods(c, hm);
        else send_405_method_not_allowed(c, "POST or GET required");
    } else if (mg_http_match_uri(hm, "/api/admin/sales/daily")) {
        handle_admin_daily_sales(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/popular-foods")) {
        handle_admin_popular_foods(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/orders/next")) {
        handle_admin_process_next_order(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/orders/*/status")) {
        handle_admin_update_order_status(c, hm);
    } else if (mg_http_match_uri(hm, "/api/admin/orders")) {
        handle_admin_get_orders(c, hm);
    } else if (mg_http_match_uri(hm, "/api/orders/history")) {
        handle_get_student_orders(c, hm);
    } else if (mg_http_match_uri(hm, "/api/orders/*/receipt")) {
        handle_get_order_receipt(c, hm);
    } else if (mg_http_match_uri(hm, "/api/orders/*")) {
        handle_get_order_detail(c, hm);
    } else if (mg_http_match_uri(hm, "/api/orders")) {
        if (mg_vcasecmp(&hm->method, "POST") == 0) handle_place_order(c, hm);
        else if (mg_vcasecmp(&hm->method, "GET") == 0) handle_get_student_orders(c, hm);
        else send_405_method_not_allowed(c, "POST or GET required");
    } else if (mg_http_match_uri(hm, "/api/cart/*")) {
        if (mg_vcasecmp(&hm->method, "PUT") == 0) handle_update_cart_item(c, hm);
        else if (mg_vcasecmp(&hm->method, "DELETE") == 0) handle_remove_cart_item(c, hm);
        else send_405_method_not_allowed(c, "PUT or DELETE required");
    } else if (mg_http_match_uri(hm, "/api/cart")) {
        if (mg_vcasecmp(&hm->method, "POST") == 0) handle_add_cart_item(c, hm);
        else if (mg_vcasecmp(&hm->method, "GET") == 0) handle_get_cart(c, hm);
        else if (mg_vcasecmp(&hm->method, "DELETE") == 0) handle_clear_cart(c, hm);
        else send_405_method_not_allowed(c, "POST, GET, or DELETE required");
    } else if (mg_http_match_uri(hm, "/api/foods/search")) {
        handle_search_food(c, hm);
    } else if (mg_http_match_uri(hm, "/api/foods/filter")) {
        handle_filter_food(c, hm);
    } else if (mg_http_match_uri(hm, "/api/foods")) {
        handle_get_menu(c, hm);
    } else if (mg_http_match_uri(hm, "/")) {
        handle_root(c, hm);
    } else {
        send_404_not_found(c, "Endpoint not found");
    }
}
