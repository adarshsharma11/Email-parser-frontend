import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, type LoginPayload, type RegisterPayload, type AuthResponse } from "../services/authService";
import { apiClient } from "../utils/api";

interface AuthState {
  email: string | null;
  token: string | null;
}

interface AuthContextType {
  user: AuthState;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string } & Partial<AuthResponse>>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string } & Partial<AuthResponse>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TOKEN: "auth_token",
  EMAIL: "auth_email",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthState>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
      if (token) {
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      }
      return { token, email };
    } catch {
      void 0;
      return { token: null, email: null };
    }
  });

  useEffect(() => {
    authService.initTokenFromStorage();
  }, []);

  const login: AuthContextType["login"] = async (payload) => {
    const res = await authService.login(payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      const email = anyData?.email ?? anyData?.data?.email;
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
      } catch {
        void 0;
      }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      setUser({ token, email });
      return { success: true, token, email };
    }
    return { success: false, error: res.error };
  };

  const register: AuthContextType["register"] = async (payload) => {
    const res = await authService.register(payload);
    if (res.success) {
      const anyData: any = res.data as any;
      const token = anyData?.token ?? anyData?.data?.token;
      const email = anyData?.email ?? anyData?.data?.email;
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.EMAIL, email);
      } catch {
        void 0;
      }
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      setUser({ token, email });
      return { success: true, token, email };
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
    } catch {
      void 0;
    }
    delete apiClient.defaults.headers.Authorization;
    setUser({ token: null, email: null });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
