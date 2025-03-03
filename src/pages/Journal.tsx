
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import JournalEntry from "@/components/journal/JournalEntry";
import ReflectionPrompts from "@/components/journal/ReflectionPrompts";
import { MoodProvider, useMood } from "@/context/MoodContext";
import { useStaggeredChildren } from "@/utils/animations";

const JournalPage = () => {
  const { moods } = useMood();
  const [showReflection, setShowReflection] = useState(true);
  
  // Sort entries by date (newest first)
  const sortedEntries = [...moods].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get staggered animation classes
  const staggeredClasses = useStaggeredChildren(sortedEntries.length);
  
  return (
    <div className="pb-24">
      <Header />
      
      <main className="container px-4 pt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mario-font">Journal</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowReflection(true)}
              className={`px-3 py-1 rounded-md text-sm ${
                showReflection 
                  ? "bg-primary text-white" 
                  : "bg-secondary/50 hover:bg-secondary/70"
              }`}
            >
              New Entry
            </button>
            <button
              onClick={() => setShowReflection(false)}
              className={`px-3 py-1 rounded-md text-sm ${
                !showReflection 
                  ? "bg-primary text-white" 
                  : "bg-secondary/50 hover:bg-secondary/70"
              }`}
            >
              History
            </button>
          </div>
        </div>
        
        {showReflection ? (
          <div className="mb-6">
            <ReflectionPrompts />
          </div>
        ) : (
          <>
            {sortedEntries.length > 0 ? (
              <div className="space-y-4">
                {sortedEntries.map((entry, index) => (
                  <div key={entry.id} className={staggeredClasses[index]}>
                    <JournalEntry entry={entry} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No journal entries yet.</p>
                <p className="text-sm mt-2">
                  Start tracking your mood to see your entries here.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      <NavBar />
    </div>
  );
};

// Wrap with MoodProvider
const Journal = () => (
  <MoodProvider>
    <JournalPage />
  </MoodProvider>
);

export default Journal;
