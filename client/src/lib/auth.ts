import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { apiRequest } from "./queryClient";

type User = {
  id: number;
  username: string;
  role: "admin" | "semi_admin" | "user";
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSemiAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isSemiAdmin = user?.role === "semi_admin";

  useEffect(() => {
    // Check if the user is already logged in
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to login");
    }
  }

  async function logout() {
    try {
      await apiRequest("POST", "/api/auth/logout", undefined);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAdmin,
    isSemiAdmin,
  };

  return AuthContext.Provider({ value, children });
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
