import React, { createContext, useContext, useReducer, useCallback } from 'react';

import p1 from '../assets/p-11.png';
import p2 from '../assets/p-22.png';
import p3 from '../assets/p-33.png';
import p4 from '../assets/p-44.png';

// Default product data
export const DEFAULT_PRODUCTS = [
  { id: 'p-1', name: 'Ambrosia Flow', description: '4 Pack', price: 800, image: p1 },
  { id: 'p-2', name: 'Ambrosia Flow', description: '6 Pack', price: 1200, image: p2 },
  { id: 'p-3', name: 'Ambrosia Flow', description: '12 Pack', price: 2400, image: p3 },
  { id: 'p-4', name: 'Ambrosia Flow', description: '24 Pack', price: 4800, image: p4 },
];

export const PRODUCTS = DEFAULT_PRODUCTS; // legacy export

import { supabase } from '../supabaseClient';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'ambrosia_cart_items';

// Action types
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

function cartReducer(state, action) {
  switch (action.type) {
    case ADD_TO_CART: {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return { ...state, items: updatedItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case UPDATE_QUANTITY: {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
        ),
      };
    }
    case CLEAR_CART:
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initialState) => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return { items: JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse cart items from localStorage', e);
    }
    return initialState;
  });

  const [products, setProducts] = React.useState(DEFAULT_PRODUCTS);

  React.useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Map image_url back to image to match frontend logic
        const formattedProducts = data.map(p => ({
          ...p,
          image: p.image_url || p1
        }));
        setProducts(formattedProducts);
      }
    }
    fetchProducts();
  }, []);

  React.useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = useCallback(product => {
    dispatch({ type: ADD_TO_CART, payload: product });
  }, []);

  const removeFromCart = useCallback(productId => {
    dispatch({ type: REMOVE_FROM_CART, payload: productId });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: UPDATE_QUANTITY, payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: CLEAR_CART });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        products,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
