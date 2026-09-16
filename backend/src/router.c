#include "router.h"
#include "response.h"

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
    } else if (mg_http_match_uri(hm, "/")) {
        handle_root(c, hm);
    } else {
        // Unknown route
        send_404_not_found(c, "Endpoint not found");
    }
}
