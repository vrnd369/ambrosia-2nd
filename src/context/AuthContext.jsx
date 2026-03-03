import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

// Action types
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const CLEAR_ERROR = 'CLEAR_ERROR';

function authReducer(state, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case SET_LOADING:
      return { ...state, isLoading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}



// Validation utilities
export const validators = {
  email(value) {
    if (!value) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return 'Please enter a valid email address';
    return '';
  },
  password(value) {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Must contain at least one special character';
    return '';
  },
  name(value) {
    if (!value) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens and apostrophes';
    return '';
  },
  confirmPassword(value, password) {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  },
};

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Very Weak', color: '#e74c3c' },
    { label: 'Weak', color: '#e67e22' },
    { label: 'Fair', color: '#f1c40f' },
    { label: 'Good', color: '#2ecc71' },
    { label: 'Strong', color: '#27ae60' },
    { label: 'Very Strong', color: '#1abc9c' },
  ];

  return { score, ...levels[Math.min(score, levels.length - 1)] };
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Helper to sync user to custom table
  const syncUserToTable = async (authUser) => {
    if (!authUser) return;
    try {
      await supabase.from('users').upsert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to sync user to table:', err);
    }
  };

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: LOGIN, payload: session.user });
        syncUserToTable(session.user);
      } else {
        dispatch({ type: SET_LOADING, payload: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: LOGIN, payload: session.user });
        syncUserToTable(session.user);
      } else {
        dispatch({ type: LOGOUT });
      }
      dispatch({ type: SET_LOADING, payload: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: SET_LOADING, payload: true });
    dispatch({ type: CLEAR_ERROR });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      dispatch({ type: SET_ERROR, payload: error.message });
      return false;
    }

    if (data?.user) {
      await syncUserToTable(data.user);
    }
    return true;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    dispatch({ type: SET_LOADING, payload: true });
    dispatch({ type: CLEAR_ERROR });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      dispatch({ type: SET_ERROR, payload: error.message });
      return false;
    }

    if (data?.user) {
      await syncUserToTable(data.user);
    }

    // Some setups require email confirmation before login
    if (data?.user?.identities?.length === 0) {
      dispatch({ type: SET_ERROR, payload: 'This email is already registered.' });
      return false;
    }

    return true;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    dispatch({ type: SET_LOADING, payload: true });
    dispatch({ type: CLEAR_ERROR });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      dispatch({ type: SET_ERROR, payload: error.message });
      return false;
    }
    return true; // The redirect will handle the rest
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: LOGOUT });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CLEAR_ERROR });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        signup,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
