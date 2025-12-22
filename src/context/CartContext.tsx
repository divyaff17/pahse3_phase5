import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import {
    addToCartDB,
    removeFromCartDB,
    updateCartQuantityDB,
    getCartItemsDB,
    addToOfflineQueueDB
} from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface CartContextType {
    cartItems: Record<string, number>;
    addToCart: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    getItemQuantity: (productId: string) => number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<Record<string, number>>({});
    const [announcement, setAnnouncement] = useState("");
    const isOnline = useOnlineStatus();

    // Load cart from IndexedDB on mount
    useEffect(() => {
        loadCartFromDB();
    }, []);

    const loadCartFromDB = async () => {
        try {
            const items = await getCartItemsDB();
            const cartMap: Record<string, number> = {};
            items.forEach(item => {
                cartMap[item.productId] = item.quantity;
            });
            setCartItems(cartMap);
        } catch (error) {
            console.error('Error loading cart from IndexedDB:', error);
            // Fallback to localStorage if IndexedDB fails
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        }
    };

    const addToCart = async (productId: string) => {
        try {
            await addToCartDB(productId, 1);

            // Queue for sync if offline
            if (!isOnline) {
                await addToOfflineQueueDB('add_to_cart', { productId, quantity: 1 });
            }

            // Update local state
            setCartItems((prev) => {
                const newQuantity = (prev[productId] || 0) + 1;
                setAnnouncement(`Item added to cart. Total items: ${Object.values({ ...prev, [productId]: newQuantity }).reduce((a, b) => a + b, 0)}`);
                return { ...prev, [productId]: newQuantity };
            });

            toast.success("Added to cart", {
                description: isOnline ? "Item has been added to your shopping bag" : "Saved offline - will sync when online",
                duration: 2000,
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error("Failed to add to cart");
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            await removeFromCartDB(productId);

            // Queue for sync if offline
            if (!isOnline) {
                await addToOfflineQueueDB('remove_from_cart', { productId });
            }

            setCartItems((prev) => {
                const newCart = { ...prev };
                delete newCart[productId];
                setAnnouncement("Item removed from cart.");
                return newCart;
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error("Failed to remove from cart");
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        try {
            await updateCartQuantityDB(productId, quantity);

            setCartItems((prev) => {
                setAnnouncement(`Cart updated. Quantity: ${quantity}`);
                return { ...prev, [productId]: quantity };
            });
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            toast.error("Failed to update quantity");
        }
    };

    const getItemQuantity = (productId: string) => {
        return cartItems[productId] || 0;
    };

    const totalItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                getItemQuantity,
                totalItems,
            }}
        >
            {children}
            <div className="sr-only" role="status" aria-live="polite">
                {announcement}
            </div>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
