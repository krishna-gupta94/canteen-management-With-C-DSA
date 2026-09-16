#include "server.h"
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("Initializing Canteen Backend System...\n");
    
    if (!server_start()) {
        fprintf(stderr, "Fatal error: Server failed to start.\n");
        return EXIT_FAILURE;
    }
    
    printf("Server stopped.\n");
    return EXIT_SUCCESS;
}
