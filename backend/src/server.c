#include "server.h"
#include "mongoose.h"
#include "config.h"
#include "router.h"
#include <stdio.h>
#include <signal.h>
#include <stdlib.h>

static int s_signo = 0;

static void signal_handler(int signo) {
    s_signo = signo;
}

static void server_event_handler(struct mg_connection *c, int ev, void *ev_data) {
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *) ev_data;
        route_request(c, hm);
    }
}

bool server_start(void) {
    struct mg_mgr mgr;
    struct mg_connection *c;
    AppConfig *config = config_get();
    
    char listen_url[256];
    snprintf(listen_url, sizeof(listen_url), "http://%s:%s", config->host, config->port);

    mg_mgr_init(&mgr);
    
    c = mg_http_listen(&mgr, listen_url, server_event_handler, NULL);
    if (c == NULL) {
        fprintf(stderr, "Error: Cannot listen on %s\n", listen_url);
        mg_mgr_free(&mgr);
        return false;
    }

    printf("Starting Canteen Server on %s\n", listen_url);
    printf("Data directory set to: %s\n", config->data_dir);
    printf("Press Ctrl+C to stop.\n");

    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);

    while (s_signo == 0) {
        mg_mgr_poll(&mgr, 1000); // 1000 ms timeout
    }

    printf("\nShutting down server gracefully...\n");
    mg_mgr_free(&mgr);
    return true;
}
