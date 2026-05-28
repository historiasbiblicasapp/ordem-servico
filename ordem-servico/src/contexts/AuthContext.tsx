import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, login as authLogin, logout as authLogout } from "@/lib/auth";
import { seedInitialData, migrateNumeros, syncAllFromSupabase } from "@/lib/db";

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => string | null;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      await syncAllFromSupabase();
      seedInitialData();
      migrateNumeros();
      setUser(getCurrentUser());
    })();
  }, []);

  const login = (email: string, senha: string): string | null => {
    const result = authLogin(email, senha);
    if (!result) return "E-mail ou senha inválidos";
    setUser(result);
    return null;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
