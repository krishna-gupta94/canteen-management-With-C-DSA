#include "auth.h"
#include "dsa/linked_list.h"
#include "storage.h"
#include "response.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "auth_crypto.h"

static LinkedList active_sessions;

void auth_init(void) {
    ll_init(&active_sessions);
    crypto_init();
    seed_admin();
}

static void free_session(void *data) {
    crypto_secure_erase(data, sizeof(Session));
    free(data);
}

void auth_cleanup(void) {
    ll_clear(&active_sessions, free_session);
    crypto_cleanup();
}

void create_session(int user_id, int role, char *out_token) {
    Session *s = (Session *)malloc(sizeof(Session));
    if (!s) {
        out_token[0] = '\0';
        return;
    }
    
    // Generate secure 64-char hex token
    if (!crypto_generate_token(s->token, 64)) {
        free(s);
        out_token[0] = '\0';
        return;
    }
    
    s->user_id = user_id;
    s->role = role;
    s->expires_at = time(NULL) + (24 * 3600); // 24 hours
    
    ll_insert_last(&active_sessions, s);
    strncpy(out_token, s->token, 65);
}

static bool cmp_token(void *a, void *b) {
    Session *s = (Session *)a;
    char *token = (char *)b;
    return strcmp(s->token, token) == 0;
}

bool validate_session(const char *token, int *out_user_id, int *out_role) {
    Node *found = ll_search(&active_sessions, cmp_token, (void *)token);
    if (found) {
        Session *s = (Session *)found->data;
        if (s->expires_at > time(NULL)) {
            if (out_user_id) *out_user_id = s->user_id;
            if (out_role) *out_role = s->role;
            return true;
        } else {
            // Expired, let's remove it
            ll_delete(&active_sessions, cmp_token, (void *)token, free_session);
        }
    }
    return false;
}

bool revoke_session(const char *token) {
    return ll_delete(&active_sessions, cmp_token, (void *)token, free_session);
}

bool require_auth(struct mg_connection *c, struct mg_http_message *hm, int *out_user_id, int *out_role) {
    struct mg_str *auth_header = mg_http_get_header(hm, "Authorization");
    if (!auth_header || auth_header->len < 8 || strncmp(auth_header->buf, "Bearer ", 7) != 0) {
        send_401_unauthorized(c, "Missing or malformed Authorization header");
        return false;
    }
    
    char token[65] = {0};
    size_t token_len = auth_header->len - 7;
    if (token_len >= 65) token_len = 64;
    strncpy(token, auth_header->buf + 7, token_len);
    
    if (!validate_session(token, out_user_id, out_role)) {
        send_401_unauthorized(c, "Invalid or expired token");
        return false;
    }
    return true;
}

bool require_role(struct mg_connection *c, struct mg_http_message *hm, int required_role, int *out_user_id) {
    int role;
    if (!require_auth(c, hm, out_user_id, &role)) return false;
    
    if (role != required_role) {
        send_403_forbidden(c, "Insufficient permissions");
        return false;
    }
    return true;
}

void seed_admin(void) {
    if (count_admins() == 0) {
        Admin a;
        memset(&a, 0, sizeof(a));
        strcpy(a.name, "Super Admin");
        strcpy(a.email, "admin@canteen.com");
        crypto_hash_password("admin123", a.password_hash, sizeof(a.password_hash));
        save_admin(&a);
        printf("Seeded default admin (admin@canteen.com / admin123)\n");
    }
}
