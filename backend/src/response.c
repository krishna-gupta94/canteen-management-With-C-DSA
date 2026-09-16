#include "response.h"

void send_json_response(struct mg_connection *c, int status_code, const char *json_body) {
    mg_http_reply(c, status_code, "Content-Type: application/json\r\n", "%s", json_body);
}

void send_json_message(struct mg_connection *c, int status_code, int success, const char *message) {
    // Basic JSON string builder for messages
    // To prevent buffer overflow, limit message size or use mg_http_reply format directly
    mg_http_reply(c, status_code, "Content-Type: application/json\r\n",
                  "{\"success\": %s, \"message\": \"%s\"}", 
                  success ? "true" : "false", 
                  message ? message : "");
}

void send_200_ok(struct mg_connection *c, const char *json_body) {
    send_json_response(c, 200, json_body);
}

void send_201_created(struct mg_connection *c, const char *json_body) {
    send_json_response(c, 201, json_body);
}

void send_400_bad_request(struct mg_connection *c, const char *message) {
    send_json_message(c, 400, 0, message ? message : "Bad Request");
}

void send_401_unauthorized(struct mg_connection *c, const char *message) {
    send_json_message(c, 401, 0, message ? message : "Unauthorized");
}

void send_403_forbidden(struct mg_connection *c, const char *message) {
    send_json_message(c, 403, 0, message ? message : "Forbidden");
}

void send_404_not_found(struct mg_connection *c, const char *message) {
    send_json_message(c, 404, 0, message ? message : "Not Found");
}

void send_405_method_not_allowed(struct mg_connection *c, const char *message) {
    send_json_message(c, 405, 0, message ? message : "Method Not Allowed");
}

void send_500_internal_server_error(struct mg_connection *c, const char *message) {
    send_json_message(c, 500, 0, message ? message : "Internal Server Error");
}
