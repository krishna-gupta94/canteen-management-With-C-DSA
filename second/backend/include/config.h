#ifndef CONFIG_H
#define CONFIG_H

#define DEFAULT_PORT "8080"
#define DEFAULT_HOST "0.0.0.0"
#define DEFAULT_DATA_DIR "./data"

typedef struct {
    const char *port;
    const char *host;
    const char *data_dir;
} AppConfig;

// Initialize and get the configuration
AppConfig* config_get(void);

#endif // CONFIG_H
