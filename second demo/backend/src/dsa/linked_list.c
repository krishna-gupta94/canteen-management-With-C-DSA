#include "dsa/linked_list.h"
#include <stdlib.h>

void ll_init(LinkedList *list) {
    if (!list) return;
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

static Node* create_node(void *data) {
    Node *new_node = (Node*)malloc(sizeof(Node));
    if (new_node) {
        new_node->data = data;
        new_node->next = NULL;
    }
    return new_node;
}

bool ll_insert_first(LinkedList *list, void *data) {
    if (!list) return false;
    Node *node = create_node(data);
    if (!node) return false;
    
    if (list->head == NULL) {
        list->head = node;
        list->tail = node;
    } else {
        node->next = list->head;
        list->head = node;
    }
    list->size++;
    return true;
}

bool ll_insert_last(LinkedList *list, void *data) {
    if (!list) return false;
    Node *node = create_node(data);
    if (!node) return false;
    
    if (list->tail == NULL) {
        list->head = node;
        list->tail = node;
    } else {
        list->tail->next = node;
        list->tail = node;
    }
    list->size++;
    return true;
}

bool ll_insert_at(LinkedList *list, int index, void *data) {
    if (!list || index < 0 || index > list->size) return false;
    if (index == 0) return ll_insert_first(list, data);
    if (index == list->size) return ll_insert_last(list, data);
    
    Node *node = create_node(data);
    if (!node) return false;
    
    Node *current = list->head;
    for (int i = 0; i < index - 1; i++) {
        current = current->next;
    }
    node->next = current->next;
    current->next = node;
    list->size++;
    return true;
}

Node* ll_search(LinkedList *list, bool (*compare_func)(void*, void*), void *target) {
    if (!list || !compare_func) return NULL;
    Node *current = list->head;
    while (current != NULL) {
        if (compare_func(current->data, target)) {
            return current;
        }
        current = current->next;
    }
    return NULL;
}

bool ll_update(LinkedList *list, bool (*compare_func)(void*, void*), void *target, void *new_data) {
    Node *found = ll_search(list, compare_func, target);
    if (found) {
        // Assume caller frees old data if necessary before calling update,
        // or caller only updates fields within found->data. 
        // Here we just replace the pointer.
        found->data = new_data;
        return true;
    }
    return false;
}

bool ll_delete_at(LinkedList *list, int index, void (*free_data)(void*)) {
    if (!list || list->size == 0 || index < 0 || index >= list->size) return false;
    
    Node *temp = list->head;
    if (index == 0) {
        list->head = temp->next;
        if (list->size == 1) list->tail = NULL;
    } else {
        Node *prev = NULL;
        for (int i = 0; i < index; i++) {
            prev = temp;
            temp = temp->next;
        }
        prev->next = temp->next;
        if (temp == list->tail) {
            list->tail = prev;
        }
    }
    
    if (free_data && temp->data) {
        free_data(temp->data);
    }
    free(temp);
    list->size--;
    return true;
}

bool ll_delete(LinkedList *list, bool (*compare_func)(void*, void*), void *target, void (*free_data)(void*)) {
    if (!list || !compare_func || list->size == 0) return false;
    
    Node *current = list->head;
    Node *prev = NULL;
    
    while (current != NULL) {
        if (compare_func(current->data, target)) {
            if (prev == NULL) {
                list->head = current->next;
                if (list->size == 1) list->tail = NULL;
            } else {
                prev->next = current->next;
                if (current == list->tail) list->tail = prev;
            }
            if (free_data && current->data) free_data(current->data);
            free(current);
            list->size--;
            return true;
        }
        prev = current;
        current = current->next;
    }
    return false;
}

void ll_traverse(LinkedList *list, void (*action)(void*)) {
    if (!list || !action) return;
    Node *current = list->head;
    while (current != NULL) {
        action(current->data);
        current = current->next;
    }
}

void ll_clear(LinkedList *list, void (*free_data)(void*)) {
    if (!list) return;
    Node *current = list->head;
    while (current != NULL) {
        Node *next = current->next;
        if (free_data && current->data) {
            free_data(current->data);
        }
        free(current);
        current = next;
    }
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
}

int ll_size(LinkedList *list) {
    return list ? list->size : 0;
}
