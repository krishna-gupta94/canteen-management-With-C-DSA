#ifndef RESPONSE_H
#define RESPONSE_H

#include "mongoose.h"

// Reusable response helpers
void send_json_response(struct mg_connection *c, int status_code, const char *json_body);
void send_json_message(struct mg_connection *c, int status_code, int success, const char *message);

void send_200_ok(struct mg_connection *c, const char *json_body);
void send_201_created(struct mg_connection *c, const char *json_body);
void send_400_bad_request(struct mg_connection *c, const char *message);
void send_401_unauthorized(struct mg_connection *c, const char *message);
void send_403_forbidden(struct mg_connection *c, const char *message);
void send_404_not_found(struct mg_connection *c, const char *message);
void send_405_method_not_allowed(struct mg_connection *c, const char *message);
void send_500_internal_server_error(struct mg_connection *c, const char *message);

#endif // RESPONSE_H
