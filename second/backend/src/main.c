#include "server.h"
#include "storage.h"
#include "auth.h"
#include "handlers_order.h"
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("Initializing Canteen Backend System...\n");
    
    if (!storage_init()) {
        fprintf(stderr, "Fatal error: Failed to initialize storage.\n");
        return EXIT_FAILURE;
    }
    
    auth_init();
    order_system_init();

    if (!server_start()) {
        fprintf(stderr, "Fatal error: Server failed to start.\n");
        order_system_cleanup();
        auth_cleanup();
        return EXIT_FAILURE;
    }
    
    order_system_cleanup();
    auth_cleanup();
    printf("Server stopped.\n");
    return EXIT_SUCCESS;
}
