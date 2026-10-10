#ifndef AUTH_H
#define AUTH_H

#include "mongoose.h"
#include <time.h>
#include <stdbool.h>

#define ROLE_STUDENT 0
#define ROLE_ADMIN 1

typedef struct {
    char token[65];
    int user_id;
    int role;
    time_t expires_at;
} Session;

// Initialize session store (Linked List)
void auth_init(void);
void auth_cleanup(void);

// Create a session for a user and role, returns token string
void create_session(int user_id, int role, char *out_token);

// Validate token, sets user_id and role if valid. Returns true if valid.
bool validate_session(const char *token, int *out_user_id, int *out_role);

// Revoke a session token
bool revoke_session(const char *token);

// Middleware-style auth checker
// Extracts Bearer token from header. Returns true if authorized. 
// If it fails, it automatically sends 401/403 response.
bool require_auth(struct mg_connection *c, struct mg_http_message *hm, int *out_user_id, int *out_role);
bool require_role(struct mg_connection *c, struct mg_http_message *hm, int required_role, int *out_user_id);

// Admin initialization (creates default admin if none exist)
void seed_admin(void);

#endif // AUTH_H
