
import React from "react";
import { useMood, MoodType } from "@/context/MoodContext";
import { getMoodEmoji, getMoodLabel } from "@/utils/moodUtils";
import { getProgressAnimation, cardHoverAnimation } from "@/utils/animations";

const MoodCard: React.FC = () => {
  const { getTodayMood, getMoodStats } = useMood();
  const todayMood = getTodayMood();
  const moodStats = getMoodStats();
  
  // Calculate most frequent mood
  const mostFrequentMood = Object.entries(moodStats).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["neutral", 0]
  )[0] as MoodType;
  
  // Calculate total entries for percentage
  const totalEntries = Object.values(moodStats).reduce((a, b) => a + b, 0);
  
  return (
    <div className={`w-full rounded-xl p-4 ${cardHoverAnimation} glass`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium">Mood Insights</h3>
        <div className="text-2xl">{getMoodEmoji(mostFrequentMood)}</div>
      </div>
      
      {todayMood ? (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Today's mood:</div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{getMoodEmoji(todayMood.mood)}</span>
            <span className="font-medium">{getMoodLabel(todayMood.mood)}</span>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">No mood logged today</div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Most frequent mood:</div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{getMoodEmoji(mostFrequentMood)}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{getMoodLabel(mostFrequentMood)}</span>
              <span className="text-xs text-muted-foreground">
                {totalEntries > 0 
                  ? `${Math.round((moodStats[mostFrequentMood] / totalEntries) * 100)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full bg-primary rounded-full ${
                  totalEntries > 0 
                    ? getProgressAnimation((moodStats[mostFrequentMood] / totalEntries) * 100)
                    : ''
                }`} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCard;
