
import React from "react";
import { useMood } from "@/context/MoodContext";
import { getMoodEmoji, getMoodLabel } from "@/utils/moodUtils";
import { cardHoverAnimation } from "@/utils/animations";

// Use the type correctly from the context
interface JournalEntryProps {
  entry: {
    id: string;
    date: string;
    mood: "happy" | "excited" | "neutral" | "sad" | "angry";
    note: string;
  };
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry }) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className={`w-full rounded-xl p-4 ${cardHoverAnimation} glass pixel-border`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">{formatDate(entry.date)}</div>
        <div className="flex items-center gap-1">
          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
          <span className="text-sm">{getMoodLabel(entry.mood)}</span>
        </div>
      </div>
      
      {entry.note ? (
        <p className="text-sm">{entry.note}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No journal entry for this day</p>
      )}
    </div>
  );
};

export default JournalEntry;
