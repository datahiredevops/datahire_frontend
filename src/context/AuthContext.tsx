"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "employer" | "seeker";
  is_premium: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  // UPDATE: login now accepts either (email, password) OR (token, user, path)
  login: (arg1: string, arg2: string | User, redirectPath?: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- HELPER: SAVE & REDIRECT ---
  const handleAuthSuccess = (newToken: string, newUser: User, redirectPath?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    if (redirectPath) {
      router.push(redirectPath);
    } else if (newUser.role === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push("/jobs");
    }
  };

  // --- LOGIN FUNCTION FIXED ---
  const login = async (arg1: string, arg2: string | User, redirectPath?: string) => {
    try {
      // Scenario A: Manual/Signup call -> login("token", userData, "/path")
      if (typeof arg2 !== "string") {
        handleAuthSuccess(arg1, arg2, redirectPath);
        return;
      }

      // Scenario B: Traditional call -> login("email", "password")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: arg1, password: arg2 }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      handleAuthSuccess(data.access_token, data.user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error("Google login failed");
      const data = await res.json();
      handleAuthSuccess(data.access_token, data.user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};