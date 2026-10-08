#include "dsa/stack.h"
#include <stdlib.h>

void stack_init(Stack *s) {
    if (!s) return;
    s->top = NULL;
    s->count = 0;
}

bool push(Stack *s, void *data) {
    if (!s) return false;
    SNode *node = (SNode*)malloc(sizeof(SNode));
    if (!node) return false;
    
    node->data = data;
    node->next = s->top;
    s->top = node;
    s->count++;
    return true;
}

void* pop(Stack *s) {
    if (stack_is_empty(s)) return NULL;
    
    SNode *temp = s->top;
    void *data = temp->data;
    
    s->top = s->top->next;
    free(temp);
    s->count--;
    return data;
}

void* stack_peek(Stack *s) {
    if (stack_is_empty(s)) return NULL;
    return s->top->data;
}

bool stack_is_empty(Stack *s) {
    return (!s || s->count == 0);
}

int stack_size(Stack *s) {
    return s ? s->count : 0;
}

void stack_clear(Stack *s, void (*free_data)(void*)) {
    if (!s) return;
    SNode *current = s->top;
    while (current != NULL) {
        SNode *next = current->next;
        if (free_data && current->data) {
            free_data(current->data);
        }
        free(current);
        current = next;
    }
    s->top = NULL;
    s->count = 0;
}
