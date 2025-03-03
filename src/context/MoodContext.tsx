
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
export type MoodType = "happy" | "sad" | "angry" | "excited" | "neutral";
export type HabitType = "exercise" | "sleep" | "nutrition" | "social";

interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note: string;
}

interface HabitEntry {
  id: string;
  date: string;
  type: HabitType;
  completed: boolean;
  value?: number; // Optional value (e.g., hours of sleep)
}

interface StreakInfo {
  current: number;
  longest: number;
  lastEntryDate: string | null;
}

interface MoodContextType {
  moods: MoodEntry[];
  habits: HabitEntry[];
  streak: StreakInfo;
  addMoodEntry: (mood: MoodType, note: string) => void;
  addHabit: (type: HabitType, completed: boolean, value?: number) => void;
  toggleHabit: (type: HabitType) => void;
  getTodayMood: () => MoodEntry | undefined;
  getTodayHabits: () => Record<HabitType, boolean>;
  getMoodStats: () => { [key in MoodType]: number };
  getHabitStats: () => { [key in HabitType]: number };
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9);
const getTodayDate = () => new Date().toISOString().split('T')[0];
const isToday = (dateString: string) => dateString === getTodayDate();
const isYesterday = (dateString: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split('T')[0];
};

// Provider Component
export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem("mood-entries");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [habits, setHabits] = useState<HabitEntry[]>(() => {
    const saved = localStorage.getItem("habit-entries");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [streak, setStreak] = useState<StreakInfo>(() => {
    const saved = localStorage.getItem("mood-streak");
    return saved 
      ? JSON.parse(saved) 
      : { current: 0, longest: 0, lastEntryDate: null };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("mood-entries", JSON.stringify(moods));
    localStorage.setItem("habit-entries", JSON.stringify(habits));
    localStorage.setItem("mood-streak", JSON.stringify(streak));
  }, [moods, habits, streak]);

  // Update streak when adding a mood entry
  const updateStreak = (newEntry: boolean) => {
    if (!newEntry) return; // Don't update if not a new entry
    
    setStreak(currentStreak => {
      const { lastEntryDate, current, longest } = currentStreak;
      const today = getTodayDate();
      
      // If already logged today, no change
      if (lastEntryDate === today) return currentStreak;
      
      const isConsecutive = lastEntryDate && isYesterday(lastEntryDate);
      const newCurrent = isConsecutive ? current + 1 : 1;
      const newLongest = Math.max(newCurrent, longest);
      
      return {
        current: newCurrent,
        longest: newLongest,
        lastEntryDate: today
      };
    });
  };

  const addMoodEntry = (mood: MoodType, note: string) => {
    const today = getTodayDate();
    const existingTodayEntry = moods.find(entry => isToday(entry.date));
    
    if (existingTodayEntry) {
      // Update existing entry
      setMoods(currentMoods => 
        currentMoods.map(entry => 
          isToday(entry.date) ? { ...entry, mood, note } : entry
        )
      );
      updateStreak(false); // Not a new entry
    } else {
      // Add new entry
      const newEntry = {
        id: generateId(),
        date: today,
        mood,
        note
      };
      setMoods(currentMoods => [...currentMoods, newEntry]);
      updateStreak(true); // New entry
    }
  };

  const addHabit = (type: HabitType, completed: boolean, value?: number) => {
    const today = getTodayDate();
    const existingTodayEntry = habits.find(
      entry => isToday(entry.date) && entry.type === type
    );
    
    if (existingTodayEntry) {
      // Update existing entry
      setHabits(currentHabits => 
        currentHabits.map(entry => 
          isToday(entry.date) && entry.type === type 
            ? { ...entry, completed, value } 
            : entry
        )
      );
    } else {
      // Add new entry
      const newEntry = {
        id: generateId(),
        date: today,
        type,
        completed,
        value
      };
      setHabits(currentHabits => [...currentHabits, newEntry]);
    }
  };

  const toggleHabit = (type: HabitType) => {
    const today = getTodayDate();
    const existingEntry = habits.find(
      entry => isToday(entry.date) && entry.type === type
    );
    
    if (existingEntry) {
      // Toggle existing entry
      setHabits(currentHabits => 
        currentHabits.map(entry => 
          isToday(entry.date) && entry.type === type 
            ? { ...entry, completed: !entry.completed } 
            : entry
        )
      );
    } else {
      // Create new entry (completed)
      const newEntry = {
        id: generateId(),
        date: today,
        type,
        completed: true
      };
      setHabits(currentHabits => [...currentHabits, newEntry]);
    }
  };

  const getTodayMood = () => moods.find(entry => isToday(entry.date));

  const getTodayHabits = () => {
    const result: Record<HabitType, boolean> = {
      exercise: false,
      sleep: false,
      nutrition: false,
      social: false
    };
    
    habits
      .filter(entry => isToday(entry.date))
      .forEach(entry => {
        result[entry.type] = entry.completed;
      });
      
    return result;
  };

  const getMoodStats = () => {
    const stats: { [key in MoodType]: number } = {
      happy: 0,
      sad: 0,
      angry: 0,
      excited: 0,
      neutral: 0
    };
    
    // Only count last 30 days for stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    moods
      .filter(entry => entry.date >= cutoffDate)
      .forEach(entry => {
        stats[entry.mood]++;
      });
      
    return stats;
  };

  const getHabitStats = () => {
    const stats: { [key in HabitType]: number } = {
      exercise: 0,
      sleep: 0,
      nutrition: 0,
      social: 0
    };
    
    // Only count last 30 days for stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    habits
      .filter(entry => entry.date >= cutoffDate && entry.completed)
      .forEach(entry => {
        stats[entry.type]++;
      });
      
    return stats;
  };

  const value = {
    moods,
    habits,
    streak,
    addMoodEntry,
    addHabit,
    toggleHabit,
    getTodayMood,
    getTodayHabits,
    getMoodStats,
    getHabitStats
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

// Custom hook to use the context
export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
};
