
import React from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import { useToast } from "@/hooks/use-toast";
import { badgeVariants } from "@/components/ui/badge";
import { buttonPressAnimation } from "@/utils/animations";
import { cn } from "@/lib/utils";
import { MoodProvider } from "@/context/MoodContext";

const Challenges = () => {
  const { toast } = useToast();

  const handleChallengeClick = (challenge: string) => {
    toast({
      title: "Challenge Accepted!",
      description: `You've started the "${challenge}" challenge. Good luck!`,
      variant: "default",
    });
  };

  return (
    <MoodProvider>
      <div className="pb-24">
        <Header />

        <main className="container px-4 pt-6 animate-fade-in">
          <section className="mb-6">
            <h1 className="text-2xl font-bold mb-4 mario-font">Daily Challenges</h1>
            <p className="text-muted-foreground mb-4">
              Complete these challenges to earn extra coins and level up!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Example Challenges */}
              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">Mood Tracker</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Log your mood for 7 consecutive days.
                </p>
                <button
                  onClick={() => handleChallengeClick("Mood Tracker")}
                  className={`w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
                >
                  Start Challenge
                </button>
              </div>

              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">Habit Builder</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete all daily habits for 5 days in a row.
                </p>
                <button
                  onClick={() => handleChallengeClick("Habit Builder")}
                  className={`w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
                >
                  Start Challenge
                </button>
              </div>

              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">Journal Journey</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Write a journal entry for 10 days this month.
                </p>
                <button
                  onClick={() => handleChallengeClick("Journal Journey")}
                  className={`w-full px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
                >
                  Start Challenge
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 mario-font">Achievements</h2>
            <p className="text-muted-foreground mb-4">
              View your completed achievements and milestones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Example Achievements */}
              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">First Mood Log</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Logged your mood for the first time.
                </p>
                <div className="flex justify-end">
                  <div className={cn(badgeVariants())}>Completed</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">3-Day Streak</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Maintained a 3-day mood logging streak.
                </p>
                <div className="flex justify-end">
                  <div className={cn(badgeVariants())}>Completed</div>
                </div>
              </div>

              <div className="glass rounded-xl p-4 pixel-border">
                <h3 className="font-semibold mb-2 mario-font">Habit Starter</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Completed all daily habits for the first time.
                </p>
                <div className="flex justify-end">
                  <div className={cn(badgeVariants())}>Completed</div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <NavBar />
      </div>
    </MoodProvider>
  );
};

export default Challenges;
