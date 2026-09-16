#ifndef ROUTER_H
#define ROUTER_H

#include "mongoose.h"

// Dispatches the incoming HTTP request to the appropriate handler
void route_request(struct mg_connection *c, struct mg_http_message *hm);

#endif // ROUTER_H
