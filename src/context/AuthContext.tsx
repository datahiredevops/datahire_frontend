"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "seeker" | "employer";
  is_premium?: boolean; 
}

// 1. UPDATE INTERFACE
interface AuthContextType {
  user: User | null;
  token: string | null; // <--- NEW: Expose token
  login: (token: string, userData: User, redirectPath?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // <--- NEW: State
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token"); // <--- Load Token
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken); // <--- Set Token
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: User, redirectPath?: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    setToken(newToken); // <--- Update State
    setUser(userData);
    
    if (redirectPath) {
        router.push(redirectPath);
        return;
    }
    if (userData.role === 'employer') {
        router.push('/employer/dashboard');
    } else {
        router.push('/jobs'); 
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null); // <--- Clear Token
    setUser(null);
    router.push("/login");
  };

  return (
    // 2. PASS TOKEN IN VALUE
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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