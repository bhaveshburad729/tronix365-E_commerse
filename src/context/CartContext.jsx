import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load from local storage on initial render
        const savedCart = localStorage.getItem('tronix365_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Save to local storage whenever cartItems changes
        localStorage.setItem('tronix365_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const maxAllowed = product.stock || 0;

        if (currentQty + quantity > maxAllowed) {
            toast.error(`Only ${maxAllowed} items available in stock`);
            return false;
        }

        setCartItems(prevItems => {
            const itemInCart = prevItems.find(item => item.id === product.id);
            if (itemInCart) {
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // New items are selected by default
                return [...prevItems, { ...product, quantity, selected: true }];
            }
        });
        return true;
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems => {
            const item = prevItems.find(i => i.id === productId);
            if (!item) return prevItems;
            
            const maxAllowed = item.stock || 0;
            if (newQuantity > maxAllowed) {
                toast.error(`Only ${maxAllowed} items available in stock`);
                return prevItems; // Do not update if exceeds stock
            }

            return prevItems.map(i =>
                i.id === productId ? { ...i, quantity: newQuantity } : i
            );
        });
    };

    const toggleSelection = (productId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, selected: !item.selected } : item
            )
        );
    };

    const selectAll = (isSelected) => {
        setCartItems(prevItems =>
            prevItems.map(item => ({ ...item, selected: isSelected }))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Calculate total ONLY for selected items
    const cartTotal = cartItems
        .filter(item => item.selected !== false) // Default to true if undefined
        .reduce((total, item) => total + (item.price * item.quantity), 0);

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    const selectedCount = cartItems.filter(item => item.selected !== false).length;
    const selectedItems = cartItems.filter(item => item.selected !== false);

    return (
        <CartContext.Provider value={{
            cartItems,
            selectedItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            toggleSelection,
            selectAll,
            clearCart,
            cartTotal,
            cartCount,
            selectedCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
