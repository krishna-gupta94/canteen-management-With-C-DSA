#ifndef PRIORITY_QUEUE_H
#define PRIORITY_QUEUE_H

#include <stdbool.h>

// Priority levels (1 is highest, larger numbers = lower priority)
typedef struct PQNode {
    void *data;
    int priority;
    struct PQNode *next;
} PQNode;

typedef struct {
    PQNode *head;
    int count;
} PriorityQueue;

void pq_init(PriorityQueue *pq);
// Insert according to priority (O(N) insertion)
bool pq_insert(PriorityQueue *pq, void *data, int priority);
// Remove highest priority element (O(1) extraction)
void* pq_extract(PriorityQueue *pq);
void* pq_peek(PriorityQueue *pq);
bool pq_is_empty(PriorityQueue *pq);
int pq_size(PriorityQueue *pq);
void pq_clear(PriorityQueue *pq, void (*free_data)(void*));

#endif // PRIORITY_QUEUE_H
