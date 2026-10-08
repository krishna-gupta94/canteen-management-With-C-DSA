#include "config.h"
#include <stdlib.h>
#include <string.h>

static AppConfig global_config;
static int config_initialized = 0;

AppConfig* config_get(void) {
    if (!config_initialized) {
        const char *env_port = getenv("PORT");
        const char *env_host = getenv("HOST");
        const char *env_data_dir = getenv("DATA_DIR");

        global_config.port = env_port ? env_port : DEFAULT_PORT;
        global_config.host = env_host ? env_host : DEFAULT_HOST;
        global_config.data_dir = env_data_dir ? env_data_dir : DEFAULT_DATA_DIR;
        
        config_initialized = 1;
    }
    return &global_config;
}
