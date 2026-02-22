import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';
import { useAuth } from './auth.store';

export interface CartItem {
    id: number;
    vendor_id: number;
    menu_item_id: number;
    meal_type: string;
    delivery_date: string;
    quantity: number;
    fulfillment_mode: 'DELIVERY' | 'COLLECTION';
    vendor: {
        business_name: string;
        delivery_charge: number | null;
        collection_enabled: boolean;
    };
    menu_item: {
        name: string;
        food_type: string;
        max_orders: number | null;
        max_portions: number | null;
        current_orders: number;
        current_portions: number;
    };
}

interface CartContextType {
    items: CartItem[];
    isLoading: boolean;
    sessionId: string;
    fetchCart: () => Promise<void>;
    addToCart: (data: { vendor_id: number, menu_item_id: number, meal_type: string, delivery_date: string, quantity: number, fulfillment_mode?: string }) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateFulfillmentMode: (vendorId: number, mode: 'DELIVERY' | 'COLLECTION') => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoading: isAuthLoading } = useAuth();

    // Manage session ID for unauthenticated users
    const [sessionId] = useState(() => {
        const stored = localStorage.getItem('dabbaz_session_id');
        if (stored) return stored;
        const newSession = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('dabbaz_session_id', newSession);
        return newSession;
    });

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/cart', { params: { session_id: sessionId } });
            setItems(data.items);
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            fetchCart();
        }
    }, [user, isAuthLoading]);

    const addToCart = async (payload: any) => {
        await api.post('/cart/add', { ...payload, session_id: sessionId });
        await fetchCart();
    };

    const removeFromCart = async (itemId: number) => {
        await api.delete(`/cart/${itemId}`, { data: { session_id: sessionId } });
        await fetchCart();
    };

    const updateFulfillmentMode = async (vendorId: number, mode: 'DELIVERY' | 'COLLECTION') => {
        await api.patch('/cart/update-mode', { vendor_id: vendorId, fulfillment_mode: mode, session_id: sessionId });
        await fetchCart();
    };

    return (
        <CartContext.Provider value={{ items, isLoading, sessionId, fetchCart, addToCart, removeFromCart, updateFulfillmentMode }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
