
import React from "react";
import { HabitType, useMood } from "@/context/MoodContext";
import { getHabitEmoji, getHabitLabel } from "@/utils/habitUtils";
import { cardHoverAnimation, buttonPressAnimation } from "@/utils/animations";
import { useToast } from "@/hooks/use-toast";

const HabitTracker: React.FC = () => {
  const { getTodayHabits, toggleHabit } = useMood();
  const { toast } = useToast();
  const todayHabits = getTodayHabits();
  
  const habits: HabitType[] = ["exercise", "sleep", "nutrition", "social"];
  
  const handleHabitToggle = (habit: HabitType) => {
    toggleHabit(habit);
    
    if (!todayHabits[habit]) {
      toast({
        title: "Habit Completed!",
        description: `You earned 10 coins for completing ${getHabitLabel(habit)}!`,
        variant: "default",
      });
    }
  };
  
  // Map habits to Mario-themed icons and labels
  const habitTheme = {
    exercise: { icon: "🏃", label: "Adventure", color: "bg-red-500" },
    sleep: { icon: "😴", label: "Rest", color: "bg-blue-500" },
    nutrition: { icon: "🍄", label: "Power-Up", color: "bg-yellow-400" },
    social: { icon: "👥", label: "Team Up", color: "bg-green-500" }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-md font-medium mb-3 mario-font">Daily Power-Ups</h2>
      <div className="grid grid-cols-4 gap-2">
        {habits.map((habit) => (
          <button
            key={habit}
            onClick={() => handleHabitToggle(habit)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${cardHoverAnimation} ${buttonPressAnimation} ${
              todayHabits[habit]
                ? `${habitTheme[habit].color} text-white ring-2 ring-yellow-400 pixel-button-active`
                : "bg-card hover:bg-secondary/60 pixel-button"
            }`}
          >
            <span className="text-2xl mb-1">{habitTheme[habit].icon}</span>
            <span className="text-xs font-medium">{habitTheme[habit].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HabitTracker;
