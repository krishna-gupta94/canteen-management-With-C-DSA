#include "dsa/sort.h"

// Helper to swap pointers
static void swap(void **a, void **b) {
    void *temp = *a;
    *a = *b;
    *b = temp;
}

void bubble_sort(void **array, int size, SortCompareFunc cmp) {
    if (!array || !cmp || size <= 1) return;
    
    for (int i = 0; i < size - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < size - i - 1; j++) {
            if (cmp(array[j], array[j+1]) > 0) {
                swap(&array[j], &array[j+1]);
                swapped = 1;
            }
        }
        // Optimization: If no elements were swapped, array is sorted
        if (!swapped) break;
    }
}

void selection_sort(void **array, int size, SortCompareFunc cmp) {
    if (!array || !cmp || size <= 1) return;
    
    for (int i = 0; i < size - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < size; j++) {
            if (cmp(array[j], array[min_idx]) < 0) {
                min_idx = j;
            }
        }
        if (min_idx != i) {
            swap(&array[i], &array[min_idx]);
        }
    }
}

void insertion_sort(void **array, int size, SortCompareFunc cmp) {
    if (!array || !cmp || size <= 1) return;
    
    for (int i = 1; i < size; i++) {
        void *key = array[i];
        int j = i - 1;
        
        while (j >= 0 && cmp(array[j], key) > 0) {
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = key;
    }
}
