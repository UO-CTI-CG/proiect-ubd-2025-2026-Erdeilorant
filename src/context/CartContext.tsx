import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, MenuItem } from '@/types';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; restaurantId: string; restaurantName: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurantId, restaurantName } = action.payload;
      
      // If adding from a different restaurant, clear the cart first
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        return {
          items: [{ ...item, quantity: 1 }],
          restaurantId,
          restaurantName,
        };
      }
      
      const existingItem = state.items.find((i) => i.id === item.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...item, quantity: 1 }],
        restaurantId,
        restaurantName,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((i) => i.id !== action.payload);
      return {
        ...state,
        items: newItems,
        restaurantId: newItems.length === 0 ? null : state.restaurantId,
        restaurantName: newItems.length === 0 ? null : state.restaurantName,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.id !== id);
        return {
          ...state,
          items: newItems,
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
          restaurantName: newItems.length === 0 ? null : state.restaurantName,
        };
      }
      
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  const addItem = (item: MenuItem, restaurantId: string, restaurantName: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, restaurantId, restaurantName } });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
