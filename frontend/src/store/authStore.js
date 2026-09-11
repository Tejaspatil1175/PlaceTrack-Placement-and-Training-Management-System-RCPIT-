import { useState, useEffect } from 'react';

// Single-source-of-truth auth store
// NOTE ON AUTH STORAGE:
// Raw JWT token is persisted in localStorage here for client SPA authorization headers.
// If the backend API contract is upgraded to issue httpOnly cookies, raw storage in localStorage
// should be replaced with cookie handling and auth store will maintain in-memory user state only.

const TOKEN_KEY = 'placetrack_jwt_token';
const USER_KEY = 'placetrack_user';

let memoryToken = localStorage.getItem(TOKEN_KEY) || null;
let memoryUser = null;

try {
  const storedUser = localStorage.getItem(USER_KEY);
  if (storedUser) {
    memoryUser = JSON.parse(storedUser);
  }
} catch (e) {
  memoryUser = null;
}

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener({ token: memoryToken, user: memoryUser }));
};

export const authStore = {
  getToken: () => memoryToken,
  getUser: () => memoryUser,
  getRole: () => {
    const r = memoryUser?.role?.toLowerCase();
    if (r === 'officer') return 'tpo';
    return r || null;
  },
  isAuthenticated: () => Boolean(memoryToken && memoryUser),
  setAuth: (token, user) => {
    // Normalize role string ('officer' -> 'tpo')
    if (user && user.role) {
      if (user.role.toLowerCase() === 'officer') {
        user.role = 'tpo';
      }
    }
    memoryToken = token;
    memoryUser = user;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    notify();
  },
  clearAuth: () => {
    memoryToken = null;
    memoryUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notify();
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export function useAuth() {
  const [auth, setAuth] = useState({
    token: authStore.getToken(),
    user: authStore.getUser(),
    role: authStore.getRole(),
    isAuthenticated: authStore.isAuthenticated()
  });

  useEffect(() => {
    const unsubscribe = authStore.subscribe(({ token, user }) => {
      setAuth({
        token,
        user,
        role: authStore.getRole(),
        isAuthenticated: Boolean(token && user)
      });
    });
    return unsubscribe;
  }, []);

  return auth;
}
