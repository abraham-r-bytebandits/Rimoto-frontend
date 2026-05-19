import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that haven't already been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/admin/login') &&
      !originalRequest.url?.includes('/auth/me')
    ) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in-flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — only redirect to login if already in the admin area
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAdmin: (password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginAdmin: async () => { },
  loginUser: async () => { },
  registerUser: async () => { },
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const loginAdmin = async (password: string) => {
    const res = await api.post('/auth/admin/login', {
      email: 'admin@rimoto.in',
      password,
    });
    if (res.data.ok) {
      await fetchMe();
    }
  };

  const loginUser = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.ok) {
      await fetchMe();
    }
  };

  const registerUser = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.ok) {
      await fetchMe();
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginUser, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
