#include "cart.h"
#include "storage.h"
#include <stdlib.h>
#include <stdio.h>

typedef struct {
    int student_id;
    LinkedList items;
} StudentCart;

static LinkedList all_carts;

void cart_init(void) {
    ll_init(&all_carts);
}

static void free_cart_item(void *data) {
    free(data);
}

static void free_student_cart(void *data) {
    StudentCart *sc = (StudentCart*)data;
    ll_clear(&sc->items, free_cart_item);
    free(sc);
}

void cart_cleanup(void) {
    ll_clear(&all_carts, free_student_cart);
}

static bool cmp_student_cart(void *element, void *target) {
    StudentCart *sc = (StudentCart*)element;
    int target_id = *(int*)target;
    return sc->student_id == target_id;
}

static bool cmp_cart_item(void *element, void *target) {
    CartItem *ci = (CartItem*)element;
    int target_food_id = *(int*)target;
    return ci->food_id == target_food_id;
}

// Retrieves or creates a student's cart
static StudentCart* get_or_create_cart(int student_id) {
    Node *node = ll_search(&all_carts, cmp_student_cart, &student_id);
    if (node) return (StudentCart*)node->data;
    
    StudentCart *sc = (StudentCart*)malloc(sizeof(StudentCart));
    if (!sc) return NULL;
    
    sc->student_id = student_id;
    ll_init(&sc->items);
    ll_insert_last(&all_carts, sc);
    return sc;
}

bool cart_add_item(int student_id, int food_id, int quantity) {
    if (quantity <= 0) return false;
    
    Food f;
    if (!load_food_by_id(food_id, &f) || f.active == STATUS_INACTIVE || f.availability == 0 || f.stock <= 0) {
        return false;
    }
    
    StudentCart *sc = get_or_create_cart(student_id);
    if (!sc) return false;
    
    Node *item_node = ll_search(&sc->items, cmp_cart_item, &food_id);
    if (item_node) {
        CartItem *ci = (CartItem*)item_node->data;
        if (ci->quantity + quantity > f.stock) return false; // Stock check
        ci->quantity += quantity;
        ci->unit_price = f.price; // Refresh price snapshot
        ci->subtotal = ci->quantity * ci->unit_price;
    } else {
        if (quantity > f.stock) return false;
        CartItem *ci = (CartItem*)malloc(sizeof(CartItem));
        if (!ci) return false;
        ci->food_id = food_id;
        ci->quantity = quantity;
        ci->unit_price = f.price;
        ci->subtotal = ci->quantity * ci->unit_price;
        ll_insert_last(&sc->items, ci);
    }
    return true;
}

bool cart_update_item(int student_id, int food_id, int new_quantity) {
    if (new_quantity <= 0) return cart_remove_item(student_id, food_id);
    
    Food f;
    if (!load_food_by_id(food_id, &f) || f.active == STATUS_INACTIVE || f.availability == 0) return false;
    if (new_quantity > f.stock) return false;
    
    Node *cart_node = ll_search(&all_carts, cmp_student_cart, &student_id);
    if (!cart_node) return false;
    
    StudentCart *sc = (StudentCart*)cart_node->data;
    Node *item_node = ll_search(&sc->items, cmp_cart_item, &food_id);
    if (!item_node) return false;
    
    CartItem *ci = (CartItem*)item_node->data;
    ci->quantity = new_quantity;
    ci->unit_price = f.price;
    ci->subtotal = ci->quantity * ci->unit_price;
    return true;
}

bool cart_remove_item(int student_id, int food_id) {
    Node *cart_node = ll_search(&all_carts, cmp_student_cart, &student_id);
    if (!cart_node) return false;
    
    StudentCart *sc = (StudentCart*)cart_node->data;
    return ll_delete(&sc->items, cmp_cart_item, &food_id, free_cart_item);
}

void cart_clear(int student_id) {
    Node *cart_node = ll_search(&all_carts, cmp_student_cart, &student_id);
    if (cart_node) {
        StudentCart *sc = (StudentCart*)cart_node->data;
        ll_clear(&sc->items, free_cart_item);
    }
}

LinkedList* cart_get(int student_id) {
    Node *cart_node = ll_search(&all_carts, cmp_student_cart, &student_id);
    if (cart_node) {
        return &((StudentCart*)cart_node->data)->items;
    }
    return NULL;
}

double cart_calculate_total(int student_id) {
    LinkedList *items = cart_get(student_id);
    if (!items) return 0.0;
    
    double total = 0;
    Node *curr = items->head;
    while (curr) {
        CartItem *ci = (CartItem*)curr->data;
        total += ci->subtotal;
        curr = curr->next;
    }
    return total;
}
