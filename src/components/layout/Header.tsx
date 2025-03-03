
import React, { useState } from "react";
import { useMood } from "@/context/MoodContext";
import { useAuth } from "@/context/AuthContext";
import { buttonPressAnimation } from "@/utils/animations";
import { Bell, Crown, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { streak } = useMood();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(120);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handlePremiumClick = () => {
    toast({
      title: "Premium Feature",
      description: "Unlock premium for unlimited mood tracking and exclusive themes!",
      variant: "default",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 glass sticky top-0 z-50 mario-header pixel-border">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-500 text-white pixel-icon">
          <span className="text-xl font-semibold">M</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight mario-font">MoodQuest</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 bg-yellow-400 text-black rounded-full px-3 py-1 coin-counter">
            <span className="text-xs">🪙</span>
            <span className="font-medium">{coins}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-red-400 text-white rounded-full px-3 py-1">
            <span className="text-xs">🔥</span>
            <span className="font-medium">{streak.current} day streak</span>
          </div>
        </div>
        
        <button 
          onClick={handlePremiumClick}
          className={`focus-ring rounded-full bg-yellow-400 text-black border-2 border-yellow-600 px-3 py-1.5 text-sm font-bold ${buttonPressAnimation} premium-button`}
        >
          <span className="flex items-center gap-1">
            <Crown size={14} />
            Premium
          </span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white"
          >
            <User size={16} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 pixel-border">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                Signed in as <span className="font-bold">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={14} className="mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
        
        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
