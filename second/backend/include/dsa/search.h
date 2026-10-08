#ifndef SEARCH_H
#define SEARCH_H

#include <stdbool.h>

// Function pointer type for comparison: returns true if element matches target
typedef bool (*SearchCompareFunc)(void *element, void *target);

// Function pointer for binary search: returns 0 if match, < 0 if element < target, > 0 if element > target
typedef int (*BinarySearchCompareFunc)(void *element, void *target);

// Linear Search: O(N)
// Returns index of found element or -1 if not found
int linear_search(void **array, int size, void *target, SearchCompareFunc cmp);

// Binary Search: O(log N)
// Requires sorted array! Returns index of found element or -1 if not found
int binary_search(void **array, int size, void *target, BinarySearchCompareFunc cmp);

#endif // SEARCH_H
