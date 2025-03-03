
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePremium = false 
}) => {
  const { isAuthenticated, isPremium, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Loading...</h3>
          <p className="mt-1 text-sm text-gray-500">Please wait while we prepare your experience.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requirePremium && !isPremium) {
    return <Navigate to="/shop" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
