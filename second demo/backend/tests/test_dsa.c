#include "../include/dsa/linked_list.h"
#include "../include/dsa/queue.h"
#include "../include/dsa/stack.h"
#include "../include/dsa/priority_queue.h"
#include "../include/dsa/search.h"
#include "../include/dsa/sort.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Helpers for testing
bool cmp_int_eq(void *a, void *target) {
    return *(int*)a == *(int*)target;
}

int cmp_int_sort(void *a, void *b) {
    return (*(int*)a) - (*(int*)b);
}

void test_linked_list() {
    printf("\n--- Testing Linked List ---\n");
    LinkedList list;
    ll_init(&list);
    
    int a=1, b=2, c=3;
    ll_insert_last(&list, &a);
    ll_insert_last(&list, &b);
    ll_insert_first(&list, &c); // list: 3, 1, 2
    
    if (ll_size(&list) == 3) printf("OK: ll_size\n");
    
    int target = 1;
    Node *found = ll_search(&list, cmp_int_eq, &target);
    if (found && *(int*)(found->data) == 1) printf("OK: ll_search\n");
    
    ll_delete_at(&list, 0, NULL); // list: 1, 2
    if (ll_size(&list) == 2 && *(int*)(list.head->data) == 1) printf("OK: ll_delete_at\n");
    
    ll_clear(&list, NULL);
    if (ll_size(&list) == 0) printf("OK: ll_clear\n");
}

void test_queue() {
    printf("\n--- Testing Queue ---\n");
    Queue q;
    queue_init(&q);
    
    int a=1, b=2;
    enqueue(&q, &a);
    enqueue(&q, &b);
    
    if (queue_size(&q) == 2) printf("OK: queue_size\n");
    if (*(int*)queue_peek(&q) == 1) printf("OK: queue_peek\n");
    
    int *dequeued = (int*)dequeue(&q);
    if (*dequeued == 1 && queue_size(&q) == 1) printf("OK: dequeue FIFO\n");
    
    queue_clear(&q, NULL);
}

void test_stack() {
    printf("\n--- Testing Stack ---\n");
    Stack s;
    stack_init(&s);
    
    int a=1, b=2;
    push(&s, &a);
    push(&s, &b);
    
    if (stack_size(&s) == 2) printf("OK: stack_size\n");
    if (*(int*)stack_peek(&s) == 2) printf("OK: stack_peek LIFO\n");
    
    int *popped = (int*)pop(&s);
    if (*popped == 2 && stack_size(&s) == 1) printf("OK: pop\n");
    
    stack_clear(&s, NULL);
}

void test_priority_queue() {
    printf("\n--- Testing Priority Queue ---\n");
    PriorityQueue pq;
    pq_init(&pq);
    
    int a=10, b=20, c=30;
    pq_insert(&pq, &a, 2);
    pq_insert(&pq, &b, 1); // highest priority
    pq_insert(&pq, &c, 3);
    
    if (*(int*)pq_peek(&pq) == 20) printf("OK: pq_insert ordering\n");
    
    int *extracted = (int*)pq_extract(&pq);
    if (*extracted == 20 && pq_size(&pq) == 2) printf("OK: pq_extract highest priority\n");
    
    pq_clear(&pq, NULL);
}

void test_search_sort() {
    printf("\n--- Testing Search & Sort ---\n");
    int vals[] = {5, 2, 9, 1, 5, 6};
    void *arr[6];
    for(int i=0; i<6; i++) arr[i] = &vals[i];
    
    int target = 9;
    int idx = linear_search(arr, 6, &target, cmp_int_eq);
    if (idx == 2) printf("OK: linear_search\n");
    
    bubble_sort(arr, 6, cmp_int_sort);
    // After sort: 1, 2, 5, 5, 6, 9
    if (*(int*)arr[0] == 1 && *(int*)arr[5] == 9) printf("OK: bubble_sort\n");
    
    idx = binary_search(arr, 6, &target, cmp_int_sort);
    if (idx == 5) printf("OK: binary_search\n");
}

int main(void) {
    printf("========== DSA CORE TESTS ==========\n");
    test_linked_list();
    test_queue();
    test_stack();
    test_priority_queue();
    test_search_sort();
    printf("\nAll basic DSA tests complete.\n");
    return 0;
}
