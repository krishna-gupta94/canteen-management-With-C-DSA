#ifndef SORT_H
#define SORT_H

// Function pointer for sorting: returns > 0 if a > b, < 0 if a < b, 0 if equal
typedef int (*SortCompareFunc)(void *a, void *b);

// Bubble Sort: O(N^2)
void bubble_sort(void **array, int size, SortCompareFunc cmp);

// Selection Sort: O(N^2)
void selection_sort(void **array, int size, SortCompareFunc cmp);

// Insertion Sort: O(N^2)
void insertion_sort(void **array, int size, SortCompareFunc cmp);

#endif // SORT_H
