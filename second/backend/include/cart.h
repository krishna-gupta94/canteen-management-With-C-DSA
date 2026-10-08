#ifndef CART_H
#define CART_H

#include "dsa/linked_list.h"

typedef struct {
    int food_id;
    int quantity;
    double unit_price;
    double subtotal;
} CartItem;

// Initializes the cart subsystem
void cart_init(void);

// Cleans up the cart subsystem
void cart_cleanup(void);

// Adds or updates a food item in a student's cart. Returns true on success.
// If quantity is updated, returns true. If food not found or stock insufficient, returns false.
bool cart_add_item(int student_id, int food_id, int quantity);

// Updates exact quantity of an existing cart item
bool cart_update_item(int student_id, int food_id, int new_quantity);

// Removes a food item from the cart
bool cart_remove_item(int student_id, int food_id);

// Clears all items in a student's cart
void cart_clear(int student_id);

// Fetches the cart for a student (returns the internal LinkedList of CartItem*). 
// The caller MUST NOT free the list or its items. Returns NULL if empty/none.
LinkedList* cart_get(int student_id);

// Calculates total safely
double cart_calculate_total(int student_id);

#endif // CART_H
