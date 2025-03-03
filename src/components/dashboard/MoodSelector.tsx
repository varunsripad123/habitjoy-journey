
import React from "react";
import { MoodType, useMood } from "@/context/MoodContext";
import { cardHoverAnimation, buttonPressAnimation } from "@/utils/animations";
import { useToast } from "@/hooks/use-toast";

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood?: MoodType;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood }) => {
  const moods: MoodType[] = ["happy", "excited", "neutral", "sad", "angry"];
  const { toast } = useToast();
  
  // Map moods to Mario-themed labels and emojis
  const moodTheme = {
    happy: { emoji: "😄", label: "Super", color: "bg-green-500" },
    excited: { emoji: "🤩", label: "Star Power", color: "bg-yellow-400" },
    neutral: { emoji: "😐", label: "Regular", color: "bg-blue-400" },
    sad: { emoji: "😔", label: "Mini", color: "bg-blue-600" },
    angry: { emoji: "😡", label: "Fire", color: "bg-red-500" }
  };
  
  const handleMoodSelect = (mood: MoodType) => {
    onSelect(mood);
    
    if (!selectedMood) {
      toast({
        title: "Mood Logged!",
        description: "You earned 15 coins for logging your mood today!",
        variant: "default",
      });
    }
  };
  
  return (
    <div className="w-full">
      <h2 className="text-md font-medium mb-3 mario-font">What power-up are you feeling today?</h2>
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => handleMoodSelect(mood)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl ${cardHoverAnimation} ${buttonPressAnimation} ${
              selectedMood === mood
                ? `${moodTheme[mood].color} text-white ring-2 ring-yellow-400 pixel-button-active`
                : "bg-card hover:bg-secondary/60 pixel-button"
            }`}
          >
            <span className="text-2xl mb-1">{moodTheme[mood].emoji}</span>
            <span className="text-xs font-medium">{moodTheme[mood].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
