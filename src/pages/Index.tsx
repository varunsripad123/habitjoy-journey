
import React from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import MoodSelector from "@/components/dashboard/MoodSelector";
import HabitTracker from "@/components/dashboard/HabitTracker";
import MoodCard from "@/components/dashboard/MoodCard";
import JournalPrompt from "@/components/dashboard/JournalPrompt";
import StreakCounter from "@/components/dashboard/StreakCounter";
import { MoodProvider, useMood } from "@/context/MoodContext";

const Dashboard = () => {
  const { getTodayMood, addMoodEntry } = useMood();
  const todayMood = getTodayMood();
  
  return (
    <div className="pb-24">
      <Header />
      
      <main className="container px-4 pt-6 animate-fade-in">
        <section className="mb-6">
          <MoodSelector 
            selectedMood={todayMood?.mood} 
            onSelect={(mood) => addMoodEntry(mood, todayMood?.note || "")}
          />
        </section>
        
        <section className="mb-6">
          <HabitTracker />
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <MoodCard />
          <StreakCounter />
        </section>
        
        <section>
          <JournalPrompt />
        </section>
      </main>
      
      <NavBar />
    </div>
  );
};

// Wrap with MoodProvider
const Index = () => (
  <MoodProvider>
    <Dashboard />
  </MoodProvider>
);

export default Index;
