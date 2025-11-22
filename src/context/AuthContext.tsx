import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, type LoginPayload, type RegisterPayload, type AuthResponse } from "../services/authService";
import { apiClient } from "../utils/api";

interface AuthState {
  email: string | null;
  token: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextType {
  user: AuthState;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string } & Partial<AuthResponse>>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string } & Partial<AuthResponse>>;
  updateProfile: (payload: { first_name: string; last_name: string }) => Promise<{ success: boolean; error?: string } & Partial<AuthResponse>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: "auth_token",
  EMAIL: "auth_email",
  FIRST_NAME: "auth_first_name",
  LAST_NAME: "auth_last_name",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthState>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
      const first_name = localStorage.getItem(STORAGE_KEYS.FIRST_NAME);
      const last_name = localStorage.getItem(STORAGE_KEYS.LAST_NAME);
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }
      return { token, email, first_name, last_name };
    } catch {
      void 0;
      return { token: null, email: null, first_name: null, last_name: null };
    }
  });

  useEffect(() => {
    authService.initTokenFromStorage();
  }, []);

  useEffect(() => {
    const handleTokenChange = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
        const first_name = localStorage.getItem(STORAGE_KEYS.FIRST_NAME);
        const last_name = localStorage.getItem(STORAGE_KEYS.LAST_NAME);
        if (token) {
          apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
          delete apiClient.defaults.headers.Authorization;
        }
        setUser({ token, email, first_name, last_name });
      } catch {
        void 0;
      }
    };
    window.addEventListener('auth:tokenChange', handleTokenChange);
    return () => window.removeEventListener('auth:tokenChange', handleTokenChange);
  }, []);

  const login: AuthContextType["login"] = async (payload) => {
    const res = await authService.login(payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      const email = anyData?.email ?? anyData?.data?.email;
      const first_name = anyData?.first_name ?? anyData?.data?.first_name ?? null;
      const last_name = anyData?.last_name ?? anyData?.data?.last_name ?? null;
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
        if (first_name) localStorage.setItem(STORAGE_KEYS.FIRST_NAME, first_name);
        if (last_name) localStorage.setItem(STORAGE_KEYS.LAST_NAME, last_name);
      } catch {
        void 0;
      }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      setUser({ token, email, first_name, last_name });
      return { success: true, token, email, first_name, last_name };
    }
    return { success: false, error: res.error };
  };

  const register: AuthContextType["register"] = async (payload) => {
    const res = await authService.register(payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      const email = anyData?.email ?? anyData?.data?.email;
      const first_name = anyData?.first_name ?? anyData?.data?.first_name ?? null;
      const last_name = anyData?.last_name ?? anyData?.data?.last_name ?? null;
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
        if (first_name) localStorage.setItem(STORAGE_KEYS.FIRST_NAME, first_name);
        if (last_name) localStorage.setItem(STORAGE_KEYS.LAST_NAME, last_name);
      } catch {
        void 0;
      }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      setUser({ token, email, first_name, last_name });
      return { success: true, token, email, first_name, last_name };
    }
    return { success: false, error: res.error };
  };

  const updateProfile: AuthContextType["updateProfile"] = async (payload) => {
    const res = await authService.updateProfile(payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const first_name = anyData?.first_name ?? anyData?.data?.first_name ?? payload.first_name;
      const last_name = anyData?.last_name ?? anyData?.data?.last_name ?? payload.last_name;
      try {
        if (first_name) localStorage.setItem(STORAGE_KEYS.FIRST_NAME, first_name);
        if (last_name) localStorage.setItem(STORAGE_KEYS.LAST_NAME, last_name);
      } catch { void 0; }
      setUser((prev) => ({ token: prev.token, email: prev.email, first_name, last_name }));
      return { success: true, first_name, last_name };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      void 0;
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.EMAIL);
      localStorage.removeItem(STORAGE_KEYS.FIRST_NAME);
      localStorage.removeItem(STORAGE_KEYS.LAST_NAME);
    } catch {
      void 0;
    }
    delete apiClient.defaults.headers.Authorization;
    setUser({ token: null, email: null, first_name: null, last_name: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
