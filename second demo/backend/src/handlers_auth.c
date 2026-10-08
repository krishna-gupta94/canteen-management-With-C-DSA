#include "handlers_auth.h"
#include "auth.h"
#include "auth_crypto.h"
#include "storage.h"
#include "response.h"
#include "cJSON.h"
#include <string.h>

void handle_student_register(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("POST")) != 0) {
        send_405_method_not_allowed(c, "POST required");
        return;
    }
    
    // Parse JSON
    cJSON *json = cJSON_ParseWithLength(hm->body.buf, hm->body.len);
    if (!json) {
        send_400_bad_request(c, "Malformed JSON");
        return;
    }
    
    cJSON *name = cJSON_GetObjectItem(json, "name");
    cJSON *email = cJSON_GetObjectItem(json, "email");
    cJSON *phone = cJSON_GetObjectItem(json, "phone");
    cJSON *password = cJSON_GetObjectItem(json, "password");
    
    if (!name || !email || !password || !cJSON_IsString(name) || !cJSON_IsString(email) || !cJSON_IsString(password)) {
        send_400_bad_request(c, "Missing required fields (name, email, password)");
        cJSON_Delete(json);
        return;
    }
    
    // Check duplicates
    Student existing;
    if (find_student_by_email(email->valuestring, &existing)) {
        send_400_bad_request(c, "Email already registered");
        cJSON_Delete(json);
        return;
    }
    
    Student s;
    memset(&s, 0, sizeof(s));
    strncpy(s.name, name->valuestring, MAX_STR - 1);
    strncpy(s.email, email->valuestring, MAX_STR - 1);
    if (phone && cJSON_IsString(phone)) {
        strncpy(s.phone, phone->valuestring, 31);
    }
    
    crypto_hash_password(password->valuestring, s.password_hash, MAX_STR);
    
    // Clean up temporary plain password memory inside JSON (best-effort)
    crypto_secure_erase(password->valuestring, strlen(password->valuestring));
    
    int id = save_student(&s);
    cJSON_Delete(json);
    
    if (id > 0) {
        char buf[256];
        snprintf(buf, sizeof(buf), "{\"success\": true, \"student_id\": %d}", id);
        send_201_created(c, buf);
    } else {
        send_500_internal_server_error(c, "Failed to save student");
    }
}

void handle_student_login(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("POST")) != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.buf, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *email = cJSON_GetObjectItem(json, "email");
    cJSON *password = cJSON_GetObjectItem(json, "password");
    if (!email || !password || !cJSON_IsString(email) || !cJSON_IsString(password)) {
        send_400_bad_request(c, "Missing email or password");
        cJSON_Delete(json); return;
    }
    
    Student s;
    if (!find_student_by_email(email->valuestring, &s)) {
        send_401_unauthorized(c, "Invalid credentials");
        cJSON_Delete(json); return;
    }
    
    if (!crypto_verify_password(password->valuestring, s.password_hash)) {
        send_401_unauthorized(c, "Invalid credentials");
        crypto_secure_erase(password->valuestring, strlen(password->valuestring));
        cJSON_Delete(json); return;
    }
    
    crypto_secure_erase(password->valuestring, strlen(password->valuestring));
    
    char token[65];
    create_session(s.id, ROLE_STUDENT, token);
    
    char res[512];
    snprintf(res, sizeof(res), "{\"success\":true, \"token\":\"%s\", \"student\":{\"id\":%d, \"name\":\"%s\", \"email\":\"%s\"}}",
             token, s.id, s.name, s.email);
    send_200_ok(c, res);
    cJSON_Delete(json);
}

void handle_admin_login(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("POST")) != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    
    cJSON *json = cJSON_ParseWithLength(hm->body.buf, hm->body.len);
    if (!json) { send_400_bad_request(c, "Malformed JSON"); return; }
    
    cJSON *email = cJSON_GetObjectItem(json, "email");
    cJSON *password = cJSON_GetObjectItem(json, "password");
    if (!email || !password) { send_400_bad_request(c, "Missing credentials"); cJSON_Delete(json); return; }
    
    Admin a;
    if (!find_admin_by_email(email->valuestring, &a)) {
        send_401_unauthorized(c, "Invalid credentials");
        cJSON_Delete(json); return;
    }
    
    if (!crypto_verify_password(password->valuestring, a.password_hash)) {
        send_401_unauthorized(c, "Invalid credentials");
        crypto_secure_erase(password->valuestring, strlen(password->valuestring));
        cJSON_Delete(json); return;
    }
    
    crypto_secure_erase(password->valuestring, strlen(password->valuestring));
    
    char token[65];
    create_session(a.id, ROLE_ADMIN, token);
    char res[256];
    snprintf(res, sizeof(res), "{\"success\":true, \"token\":\"%s\", \"role\":\"admin\"}", token);
    send_200_ok(c, res);
    cJSON_Delete(json);
}

void handle_logout(struct mg_connection *c, struct mg_http_message *hm) {
    if (mg_strcasecmp(hm->method, mg_str("POST")) != 0) { send_405_method_not_allowed(c, "POST required"); return; }
    
    struct mg_str *auth = mg_http_get_header(hm, "Authorization");
    if (auth && auth->len > 7) {
        char token[64] = {0};
        size_t len = auth->len - 7 < 64 ? auth->len - 7 : 63;
        strncpy(token, auth->buf + 7, len);
        revoke_session(token);
    }
    send_json_message(c, 200, 1, "Logged out successfully");
}

void handle_auth_me(struct mg_connection *c, struct mg_http_message *hm) {
    int user_id, role;
    if (!require_auth(c, hm, &user_id, &role)) return;
    
    char res[128];
    snprintf(res, sizeof(res), "{\"id\": %d, \"role\": %d}", user_id, role);
    send_200_ok(c, res);
}

void handle_test_student_only(struct mg_connection *c, struct mg_http_message *hm) {
    int user_id;
    if (!require_role(c, hm, ROLE_STUDENT, &user_id)) return;
    send_json_message(c, 200, 1, "Student access granted");
}

void handle_test_admin_only(struct mg_connection *c, struct mg_http_message *hm) {
    int user_id;
    if (!require_role(c, hm, ROLE_ADMIN, &user_id)) return;
    send_json_message(c, 200, 1, "Admin access granted");
}
