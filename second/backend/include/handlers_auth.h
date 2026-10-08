#ifndef HANDLERS_AUTH_H
#define HANDLERS_AUTH_H

#include "mongoose.h"

// Handlers
void handle_student_register(struct mg_connection *c, struct mg_http_message *hm);
void handle_student_login(struct mg_connection *c, struct mg_http_message *hm);
void handle_admin_login(struct mg_connection *c, struct mg_http_message *hm);
void handle_logout(struct mg_connection *c, struct mg_http_message *hm);
void handle_auth_me(struct mg_connection *c, struct mg_http_message *hm);

void handle_test_student_only(struct mg_connection *c, struct mg_http_message *hm);
void handle_test_admin_only(struct mg_connection *c, struct mg_http_message *hm);

#endif // HANDLERS_AUTH_H
