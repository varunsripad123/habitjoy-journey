
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, PieChart, Trophy, BookOpen, ShoppingCart } from "lucide-react";
import { buttonPressAnimation } from "@/utils/animations";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? "text-white bg-red-500 pixel-button-active" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 pixel-button"
      } ${buttonPressAnimation}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

const NavBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="glass-dark fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-around px-3 py-1 rounded-full pixel-border">
      <NavItem
        to="/"
        icon={<Home size={20} />}
        label="World 1"
        isActive={currentPath === "/"}
      />
      <NavItem
        to="/journal"
        icon={<BookOpen size={20} />}
        label="Notes"
        isActive={currentPath === "/journal"}
      />
      <NavItem
        to="/stats"
        icon={<PieChart size={20} />}
        label="Stats"
        isActive={currentPath === "/stats"}
      />
      <NavItem
        to="/challenges"
        icon={<Trophy size={20} />}
        label="Quests"
        isActive={currentPath === "/challenges"}
      />
      <NavItem
        to="/shop"
        icon={<ShoppingCart size={20} />}
        label="Shop"
        isActive={currentPath === "/shop"}
      />
    </nav>
  );
};

export default NavBar;
