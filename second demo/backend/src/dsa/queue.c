#include "dsa/queue.h"
#include <stdlib.h>

void queue_init(Queue *q) {
    if (!q) return;
    q->front = NULL;
    q->rear = NULL;
    q->count = 0;
}

bool enqueue(Queue *q, void *data) {
    if (!q) return false;
    QNode *node = (QNode*)malloc(sizeof(QNode));
    if (!node) return false;
    
    node->data = data;
    node->next = NULL;
    
    if (q->rear == NULL) {
        q->front = node;
        q->rear = node;
    } else {
        q->rear->next = node;
        q->rear = node;
    }
    q->count++;
    return true;
}

void* dequeue(Queue *q) {
    if (queue_is_empty(q)) return NULL;
    
    QNode *temp = q->front;
    void *data = temp->data;
    
    q->front = q->front->next;
    if (q->front == NULL) {
        q->rear = NULL;
    }
    
    free(temp);
    q->count--;
    return data;
}

void* queue_peek(Queue *q) {
    if (queue_is_empty(q)) return NULL;
    return q->front->data;
}

bool queue_is_empty(Queue *q) {
    return (!q || q->count == 0);
}

int queue_size(Queue *q) {
    return q ? q->count : 0;
}

void queue_clear(Queue *q, void (*free_data)(void*)) {
    if (!q) return;
    QNode *current = q->front;
    while (current != NULL) {
        QNode *next = current->next;
        if (free_data && current->data) {
            free_data(current->data);
        }
        free(current);
        current = next;
    }
    q->front = NULL;
    q->rear = NULL;
    q->count = 0;
}
