
import React, { useState } from "react";
import { useMood, MoodType } from "@/context/MoodContext";
import { getJournalPrompt } from "@/utils/moodUtils";
import { cardHoverAnimation, buttonPressAnimation } from "@/utils/animations";

const JournalPrompt: React.FC = () => {
  const { getTodayMood, addMoodEntry } = useMood();
  const todayMood = getTodayMood();
  const [note, setNote] = useState(todayMood?.note || "");
  
  // Generate a prompt based on the current mood or default to neutral
  const prompt = getJournalPrompt(todayMood?.mood || "neutral");
  
  const handleSave = () => {
    if (todayMood) {
      addMoodEntry(todayMood.mood, note);
    } else {
      // Default to neutral if no mood selected
      addMoodEntry("neutral", note);
    }
  };
  
  return (
    <div className={`w-full rounded-xl p-4 ${cardHoverAnimation} glass`}>
      <h3 className="text-lg font-medium mb-3">Journal</h3>
      <p className="text-sm text-muted-foreground mb-3">{prompt}</p>
      
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full min-h-[100px] p-3 rounded-lg bg-secondary/50 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder="Write your thoughts here..."
      />
      
      <div className="flex justify-end mt-3">
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default JournalPrompt;
