
import React from "react";
import { useMood } from "@/context/MoodContext";
import { cardHoverAnimation, getProgressAnimation } from "@/utils/animations";
import { Flame } from "lucide-react";

const StreakCounter: React.FC = () => {
  const { streak } = useMood();
  
  // Calculate progress toward 7 day streak (weekly milestone)
  const weeklyGoal = 7;
  const progress = Math.min((streak.current / weeklyGoal) * 100, 100);
  
  return (
    <div className={`w-full rounded-xl p-4 ${cardHoverAnimation} glass`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium">Your Streak</h3>
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500/20 text-amber-500">
          <Flame size={18} />
        </div>
      </div>
      
      <div className="flex items-end gap-2 mb-1">
        <div className="text-3xl font-bold">{streak.current}</div>
        <div className="text-sm text-muted-foreground mb-1">days</div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-3">
        {streak.current > 0 
          ? `Keep going! You're building a great habit.` 
          : `Start your streak by logging your mood today!`}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span>Weekly goal</span>
          <span>{streak.current} / {weeklyGoal} days</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full bg-amber-500 rounded-full ${getProgressAnimation(progress)}`} 
          />
        </div>
      </div>
      
      <div className="mt-3 text-xs">
        <span className="text-muted-foreground">Longest streak: </span>
        <span className="font-medium">{streak.longest} days</span>
      </div>
    </div>
  );
};

export default StreakCounter;
