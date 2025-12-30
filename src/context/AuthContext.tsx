"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// --- UPDATE THE TYPE HERE ---
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "seeker" | "employer";
  is_premium?: boolean; 
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User,redirectPath?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User, redirectPath?: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    
    // 1. If a specific path was requested (like '/profile'), go there!
    if (redirectPath) {
        router.push(redirectPath);
        return;
    }
    // 2. Otherwise, use the default logic
    if (userData.role === 'employer') {
        router.push('/employer/dashboard');
    } else {
        router.push('/jobs'); 
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}