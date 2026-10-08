#include "auth_crypto.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
#include <windows.h>
#include <bcrypt.h>
#ifndef STATUS_SUCCESS
#define STATUS_SUCCESS ((NTSTATUS)0x00000000L)
#endif
#else
// For non-Windows platforms (e.g. Linux), we would read from /dev/urandom
#include <fcntl.h>
#include <unistd.h>
#endif

bool crypto_init(void) {
    return true; // No special init needed for Windows BCrypt
}

void crypto_cleanup(void) {
    // No special cleanup needed
}

void crypto_secure_erase(void *ptr, size_t len) {
    if (ptr && len > 0) {
        volatile unsigned char *p = (volatile unsigned char *)ptr;
        while (len--) {
            *p++ = 0;
        }
    }
}

bool crypto_random_bytes(unsigned char *buffer, size_t length) {
#ifdef _WIN32
    NTSTATUS status = BCryptGenRandom(NULL, buffer, (ULONG)length, BCRYPT_USE_SYSTEM_PREFERRED_RNG);
    return (status == STATUS_SUCCESS);
#else
    int fd = open("/dev/urandom", O_RDONLY);
    if (fd < 0) return false;
    size_t read_bytes = read(fd, buffer, length);
    close(fd);
    return (read_bytes == length);
#endif
}

bool crypto_generate_token(char *token_out, size_t length) {
    if (length == 0 || length % 2 != 0) return false; // Hex string requires even length
    size_t byte_len = length / 2;
    unsigned char *bytes = (unsigned char *)malloc(byte_len);
    if (!bytes) return false;
    
    if (!crypto_random_bytes(bytes, byte_len)) {
        free(bytes);
        return false;
    }
    
    const char *hex = "0123456789abcdef";
    for (size_t i = 0; i < byte_len; i++) {
        token_out[i * 2] = hex[(bytes[i] >> 4) & 0x0F];
        token_out[i * 2 + 1] = hex[bytes[i] & 0x0F];
    }
    token_out[length] = '\0';
    
    crypto_secure_erase(bytes, byte_len);
    free(bytes);
    return true;
}

// ---------------------------------------------------------
// [DEV-ONLY] INSECURE PASSWORD HASHING PLACEHOLDER
// ---------------------------------------------------------
// WARNING: This is NOT cryptographically secure. 
// A real deployment MUST replace this with bcrypt or Argon2.
// This implementation simulates salting by generating a random salt,
// appending the password, and hashing the result to satisfy Phase 5.1 tests.

static void dev_hash(const char *salt, const char *plain, char *out_hash) {
    unsigned long hash = 5381;
    int c;
    
    // Hash salt
    const char *s = salt;
    while ((c = *s++)) {
        hash = ((hash << 5) + hash) + c;
    }
    
    // Hash password
    const char *p = plain;
    while ((c = *p++)) {
        hash = ((hash << 5) + hash) + c;
    }
    
    snprintf(out_hash, 32, "%016lx", hash);
}

bool crypto_hash_password(const char *plaintext, char *hashed_out, size_t max_len) {
    if (max_len < 64) return false;
    
    // Generate a random 16-char salt
    char salt[17];
    if (!crypto_generate_token(salt, 16)) return false;
    
    char hash[32];
    dev_hash(salt, plaintext, hash);
    
    // Format: $dev$salt$hash
    snprintf(hashed_out, max_len, "$dev$%s$%s", salt, hash);
    return true;
}

bool crypto_verify_password(const char *plaintext, const char *stored_hash) {
    if (strncmp(stored_hash, "$dev$", 5) != 0) return false;
    
    // Extract salt
    char salt[17] = {0};
    strncpy(salt, stored_hash + 5, 16);
    
    // Extract hash
    const char *stored_hash_val = stored_hash + 22; // $dev$ + 16 salt + $
    
    char computed_hash[32];
    dev_hash(salt, plaintext, computed_hash);
    
    return (strcmp(stored_hash_val, computed_hash) == 0);
}
