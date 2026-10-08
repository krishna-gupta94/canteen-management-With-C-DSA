#ifndef STACK_H
#define STACK_H

#include <stdbool.h>

typedef struct SNode {
    void *data;
    struct SNode *next;
} SNode;

typedef struct {
    SNode *top;
    int count;
} Stack;

void stack_init(Stack *s);
bool push(Stack *s, void *data);
void* pop(Stack *s);
void* stack_peek(Stack *s);
bool stack_is_empty(Stack *s);
int stack_size(Stack *s);
void stack_clear(Stack *s, void (*free_data)(void*));

#endif // STACK_H
