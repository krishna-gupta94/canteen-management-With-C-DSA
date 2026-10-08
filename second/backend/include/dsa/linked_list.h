#ifndef LINKED_LIST_H
#define LINKED_LIST_H

#include <stdbool.h>

// Generic Node
typedef struct Node {
    void *data;
    struct Node *next;
} Node;

typedef struct {
    Node *head;
    Node *tail;
    int size;
} LinkedList;

// Initialize a new linked list
void ll_init(LinkedList *list);

// Insert data at the beginning of the list
bool ll_insert_first(LinkedList *list, void *data);

// Insert data at the end of the list
bool ll_insert_last(LinkedList *list, void *data);

// Insert at a specific index (0-based)
bool ll_insert_at(LinkedList *list, int index, void *data);

// Find a node by comparing data using a custom compare function
// compare_func should return true if the data matches the criteria
Node* ll_search(LinkedList *list, bool (*compare_func)(void*, void*), void *target);

// Update data (assumes finding the node first, then swapping data)
bool ll_update(LinkedList *list, bool (*compare_func)(void*, void*), void *target, void *new_data);

// Delete a node containing specific data
bool ll_delete(LinkedList *list, bool (*compare_func)(void*, void*), void *target, void (*free_data)(void*));

// Delete node at index
bool ll_delete_at(LinkedList *list, int index, void (*free_data)(void*));

// Traverse list and apply function to each element
void ll_traverse(LinkedList *list, void (*action)(void*));

// Clear the entire list
void ll_clear(LinkedList *list, void (*free_data)(void*));

// Get size
int ll_size(LinkedList *list);

#endif // LINKED_LIST_H
