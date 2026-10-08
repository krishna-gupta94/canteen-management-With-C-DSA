#ifndef AUTH_CRYPTO_H
#define AUTH_CRYPTO_H

#include <stddef.h>
#include <stdbool.h>

// Initialize cryptographic subsystem if required
bool crypto_init(void);

// Cleanup cryptographic subsystem
void crypto_cleanup(void);

// Generates cryptographically secure random bytes
bool crypto_random_bytes(unsigned char *buffer, size_t length);

// Generates a cryptographically secure hex token of specified length
// The buffer must be at least length + 1 in size.
bool crypto_generate_token(char *token_out, size_t length);

// --- PASSWORD HASHING ABSTRACTION ---
// In a production environment, this should wrap bcrypt or Argon2.
// Currently uses a development-only placeholder hash.

// Hashes a plaintext password (creates salt, hashes, returns formatted string)
// hashed_out must be at least 64 bytes.
bool crypto_hash_password(const char *plaintext, char *hashed_out, size_t max_len);

// Verifies a plaintext password against a stored hash
bool crypto_verify_password(const char *plaintext, const char *stored_hash);

// Secure memory clearing
void crypto_secure_erase(void *ptr, size_t len);

#endif // AUTH_CRYPTO_H
