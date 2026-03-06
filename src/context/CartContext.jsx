import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { fetchWithCoalescing, getCachedData, setCachedData, PRODUCTS_UPDATED_EVENT } from '../utils/supabaseFetch.js';
import p1 from '../assets/p-11.webp';
import p2 from '../assets/p-22.webp';
import p3 from '../assets/p-33.webp';
import p4 from '../assets/p-44.webp';

// Default product data
export const DEFAULT_PRODUCTS = [
  { id: 'p-1', name: 'Ambrosia Flow', description: '4 Pack', price: 800, image: p1 },
  { id: 'p-2', name: 'Ambrosia Flow', description: '6 Pack', price: 1200, image: p2 },
  { id: 'p-3', name: 'Ambrosia Flow', description: '12 Pack', price: 2400, image: p3 },
  { id: 'p-4', name: 'Ambrosia Flow', description: '24 Pack', price: 4800, image: p4 },
];

export const PRODUCTS = DEFAULT_PRODUCTS; // legacy export

const CartContext = createContext(null);
const PRODUCTS_CACHE_KEY = 'products_list';
const CART_STORAGE_KEY = 'ambrosia_cart_items';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

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

  const fetchProducts = useCallback(async () => {
    const cached = getCachedData(PRODUCTS_CACHE_KEY);
    if (cached) {
      setProducts(cached);
      return;
    }
    const { data, error } = await fetchWithCoalescing(PRODUCTS_CACHE_KEY, () =>
      supabase.from('products').select('id,name,description,price,image_url').order('created_at', { ascending: false })
    );
    if (!error && data && data.length > 0) {
      const defaults = { 'p-1': p1, 'p-2': p2, 'p-3': p3, 'p-4': p4 };
      const isValidUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');
      const formattedProducts = data.map(p => ({
        ...p,
        image: isValidUrl(p.image_url) ? p.image_url : (defaults[p.id] || p1)
      }));
      setCachedData(PRODUCTS_CACHE_KEY, formattedProducts);
      setProducts(formattedProducts);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  React.useEffect(() => {
    const handler = () => fetchProducts();
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, handler);
  }, [fetchProducts]);

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

  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    const packIds = [...new Set(state.items.map((i) => i.id))];
    if (packIds.length === 0) {
      setShippingCharge(0);
      return;
    }
    setShippingLoading(true);

    const computeFromSupabase = async () => {
      const sortedKey = [...packIds].map(String).sort().join(',');
      let charge = 0;
      try {
        const { data: combos } = await supabase.from('combo_shipping_rules').select('pack_ids,shipping_price');
        const match = (combos || []).find((c) => {
          const ids = [...(c.pack_ids || [])].map(String).sort();
          return ids.join(',') === sortedKey;
        });
        if (match) {
          charge = Number(match.shipping_price) || 0;
          return charge;
        }
      } catch {
        /* combo table may not exist */
      }
      try {
        const { data: packs } = await supabase.from('products').select('id,shipping_charge').in('id', packIds);
        if (packs?.length) {
          charge = Math.max(...packs.map((p) => Number(p?.shipping_charge) || 0), 0);
        }
      } catch {
        /* fallback to 0 */
      }
      return charge;
    };

    fetch(`${API_BASE}/api/calculate-shipping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedPacks: packIds }),
    })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error('API failed');
      })
      .then((json) => {
        if (json.success && typeof json.shippingCharge === 'number') {
          setShippingCharge(json.shippingCharge);
        } else {
          throw new Error('Invalid response');
        }
      })
      .catch(() => computeFromSupabase().then(setShippingCharge))
      .finally(() => setShippingLoading(false));
  }, [state.items]);

  const total = subtotal + shippingCharge;

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
        shippingCharge,
        shippingLoading,
        total,
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
