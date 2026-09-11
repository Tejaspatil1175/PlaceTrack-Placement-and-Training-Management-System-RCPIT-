// Simple, single-source-of-truth auth store backed by localStorage and memory

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
  setAuth: (token, user) => {
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
