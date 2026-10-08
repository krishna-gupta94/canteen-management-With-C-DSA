#ifndef QUEUE_H
#define QUEUE_H

#include <stdbool.h>

typedef struct QNode {
    void *data;
    struct QNode *next;
} QNode;

typedef struct {
    QNode *front;
    QNode *rear;
    int count;
} Queue;

// Initialize queue
void queue_init(Queue *q);

// Add to rear of queue
bool enqueue(Queue *q, void *data);

// Remove from front of queue and return data
void* dequeue(Queue *q);

// Get front without removing
void* queue_peek(Queue *q);

// Check if empty
bool queue_is_empty(Queue *q);

// Get size
int queue_size(Queue *q);

// Clear queue and optionally free data
void queue_clear(Queue *q, void (*free_data)(void*));

#endif // QUEUE_H
