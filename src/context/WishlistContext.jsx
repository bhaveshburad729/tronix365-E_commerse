import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('tronix365_wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('tronix365_wishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            if (prevItems.some(item => item.id === product.id)) {
                return prevItems; // Already in wishlist
            }
            return [...prevItems, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === parseInt(productId));
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
