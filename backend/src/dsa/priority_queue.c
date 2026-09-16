#include "dsa/priority_queue.h"
#include <stdlib.h>

void pq_init(PriorityQueue *pq) {
    if (!pq) return;
    pq->head = NULL;
    pq->count = 0;
}

bool pq_insert(PriorityQueue *pq, void *data, int priority) {
    if (!pq) return false;
    PQNode *node = (PQNode*)malloc(sizeof(PQNode));
    if (!node) return false;
    
    node->data = data;
    node->priority = priority;
    node->next = NULL;
    
    // Empty list or new node has strictly higher priority (lower value) than head
    if (pq->head == NULL || priority < pq->head->priority) {
        node->next = pq->head;
        pq->head = node;
    } else {
        // Traverse to find insertion point (maintain FIFO for same priority)
        PQNode *current = pq->head;
        while (current->next != NULL && current->next->priority <= priority) {
            current = current->next;
        }
        node->next = current->next;
        current->next = node;
    }
    pq->count++;
    return true;
}

void* pq_extract(PriorityQueue *pq) {
    if (pq_is_empty(pq)) return NULL;
    
    PQNode *temp = pq->head;
    void *data = temp->data;
    pq->head = pq->head->next;
    free(temp);
    pq->count--;
    return data;
}

void* pq_peek(PriorityQueue *pq) {
    if (pq_is_empty(pq)) return NULL;
    return pq->head->data;
}

bool pq_is_empty(PriorityQueue *pq) {
    return (!pq || pq->count == 0);
}

int pq_size(PriorityQueue *pq) {
    return pq ? pq->count : 0;
}

void pq_clear(PriorityQueue *pq, void (*free_data)(void*)) {
    if (!pq) return;
    PQNode *current = pq->head;
    while (current != NULL) {
        PQNode *next = current->next;
        if (free_data && current->data) {
            free_data(current->data);
        }
        free(current);
        current = next;
    }
    pq->head = NULL;
    pq->count = 0;
}
