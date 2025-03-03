
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// API base URL
const API_URL = "http://localhost:5000/api"; // Backend running at port 5000

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("habitjoy-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("habitjoy-token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Save user and token to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem("habitjoy-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("habitjoy-user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("habitjoy-token", token);
    } else {
      localStorage.removeItem("habitjoy-token");
    }
  }, [token]);

  // Check if token is valid on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Token is invalid, log out
          setUser(null);
          setToken(null);
          return;
        }
        
        const data = await response.json();
        if (data.status === 'success') {
          setUser(data.data.user);
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setUser(null);
        setToken(null);
      }
    };
    
    verifyToken();
  }, [token]);

  // Login function connected to backend
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setUser(data.data.user);
      setToken(data.token);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function connected to backend
  const signup = async (name: string, email: string, password: string, passwordConfirm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First try simple-register as a fallback
      const response = await fetch(`${API_URL}/auth/simple-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, passwordConfirm })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setUser(data.data.user);
      setToken(data.token);
      
      toast({
        title: "Welcome to HabitJoy!",
        description: "Your account has been created successfully.",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }
      
      toast({
        title: "Reset email sent",
        description: "Please check your email for a link to reset your password",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Failed to send reset email",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, passwordConfirm })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      // Login the user automatically
      setUser(data.data.user);
      setToken(data.token);
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset and you are now logged in",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Failed to reset password",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/update-me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }
      
      setUser(responseData.data.user);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "default",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Failed to update profile",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        // Call logout endpoint to invalidate token on server
        await fetch(`${API_URL}/auth/logout`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      // Clear user data from state and localStorage regardless of API success
      setUser(null);
      setToken(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    }
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user && !!token,
    isPremium: user?.role === 'premium' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
