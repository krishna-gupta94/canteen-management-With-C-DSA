#include "dsa/search.h"

int linear_search(void **array, int size, void *target, SearchCompareFunc cmp) {
    if (!array || !cmp || size <= 0) return -1;
    
    for (int i = 0; i < size; i++) {
        if (cmp(array[i], target)) {
            return i;
        }
    }
    return -1;
}

int binary_search(void **array, int size, void *target, BinarySearchCompareFunc cmp) {
    if (!array || !cmp || size <= 0) return -1;
    
    int low = 0;
    int high = size - 1;
    
    while (low <= high) {
        int mid = low + (high - low) / 2;
        int result = cmp(array[mid], target);
        
        if (result == 0) {
            return mid; // Found
        } else if (result < 0) {
            low = mid + 1; // Element is smaller, search right half
        } else {
            high = mid - 1; // Element is larger, search left half
        }
    }
    return -1;
}
