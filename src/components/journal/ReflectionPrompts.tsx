
import React, { useState } from "react";
import { buttonPressAnimation, cardHoverAnimation } from "@/utils/animations";
import { MoodType, useMood } from "@/context/MoodContext";
import { useToast } from "@/hooks/use-toast";

type PromptCategory = 
  | "reflection" 
  | "gratitude" 
  | "health" 
  | "productivity" 
  | "wellbeing" 
  | "social" 
  | "growth";

interface PromptOption {
  id: string;
  text: string;
  category: PromptCategory;
}

const PROMPTS: Record<PromptCategory, PromptOption[]> = {
  reflection: [
    { id: "ref1", text: "What was the highlight of your day?", category: "reflection" },
    { id: "ref2", text: "Did anything make you feel particularly happy or proud today?", category: "reflection" },
    { id: "ref3", text: "What challenged you today, and how did you handle it?", category: "reflection" },
    { id: "ref4", text: "If today was a book chapter in your life, what would its title be?", category: "reflection" }
  ],
  gratitude: [
    { id: "grat1", text: "What are three things you're grateful for today?", category: "gratitude" },
    { id: "grat2", text: "Who made a positive impact on your day?", category: "gratitude" },
    { id: "grat3", text: "What small moment brought you joy today?", category: "gratitude" }
  ],
  health: [
    { id: "health1", text: "How would you rate your energy levels today? (Scale 1-10)", category: "health" },
    { id: "health2", text: "Did you take any breaks to relax and recharge?", category: "health" },
    { id: "health3", text: "What did you eat today? Did you follow a healthy diet?", category: "health" }
  ],
  productivity: [
    { id: "prod1", text: "On a scale of 1-10, how productive was your day?", category: "productivity" },
    { id: "prod2", text: "Did you accomplish your top priority task today?", category: "productivity" },
    { id: "prod3", text: "What could you improve tomorrow to be more productive?", category: "productivity" }
  ],
  wellbeing: [
    { id: "well1", text: "Did you feel stressed today? If yes, what caused it?", category: "wellbeing" },
    { id: "well2", text: "How did you handle stress or negative emotions today?", category: "wellbeing" },
    { id: "well3", text: "Did you have any negative thoughts? How did you counter them?", category: "wellbeing" }
  ],
  social: [
    { id: "soc1", text: "Did you connect with family or friends today?", category: "social" },
    { id: "soc2", text: "Did you help or support someone today? How?", category: "social" },
    { id: "soc3", text: "How did your interactions with others make you feel?", category: "social" }
  ],
  growth: [
    { id: "grow1", text: "Did you learn something new today?", category: "growth" },
    { id: "grow2", text: "Did you read or listen to something inspiring?", category: "growth" },
    { id: "grow3", text: "What's one lesson you learned today?", category: "growth" }
  ]
};

// Color mapping for categories
const CATEGORY_COLORS: Record<PromptCategory, string> = {
  reflection: "bg-blue-500",
  gratitude: "bg-green-500",
  health: "bg-red-500",
  productivity: "bg-yellow-500",
  wellbeing: "bg-purple-500",
  social: "bg-pink-500",
  growth: "bg-orange-500"
};

const CATEGORY_ICONS: Record<PromptCategory, string> = {
  reflection: "🤔",
  gratitude: "🙏",
  health: "💪",
  productivity: "⏱️",
  wellbeing: "😌",
  social: "👥",
  growth: "🌱"
};

const ReflectionPrompts: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>("reflection");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptOption | null>(null);
  const [response, setResponse] = useState("");
  const { addMoodEntry, getTodayMood } = useMood();
  const { toast } = useToast();
  const todayMood = getTodayMood();

  // Get random prompt from category
  const getRandomPrompt = (category: PromptCategory) => {
    const categoryPrompts = PROMPTS[category];
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
    return categoryPrompts[randomIndex];
  };

  const handleCategorySelect = (category: PromptCategory) => {
    setSelectedCategory(category);
    setSelectedPrompt(getRandomPrompt(category));
    setResponse("");
  };

  const handleSave = () => {
    if (!response.trim()) {
      toast({
        title: "Empty Response",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    // Save with current mood or default to neutral
    const currentMood = todayMood?.mood || "neutral";
    const promptText = selectedPrompt ? selectedPrompt.text : "";
    const fullNote = `🎯 ${promptText}\n\n${response}`;
    
    addMoodEntry(currentMood as MoodType, fullNote);
    
    toast({
      title: "Reflection Saved!",
      description: "Your reflection has been saved and you earned 15 coins!",
      variant: "default",
    });
    
    setResponse("");
    setSelectedPrompt(null);
  };

  const handleNewPrompt = () => {
    setSelectedPrompt(getRandomPrompt(selectedCategory));
    setResponse("");
  };

  return (
    <div className={`w-full rounded-xl p-5 ${cardHoverAnimation} glass pixel-border`}>
      <h3 className="text-lg font-medium mb-3 mario-font">Daily Reflection</h3>
      
      {/* Category Selection */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-4 scrollbar-hide">
        {Object.keys(PROMPTS).map((category) => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category as PromptCategory)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedCategory === category
                ? `${CATEGORY_COLORS[category as PromptCategory]} text-white`
                : "bg-secondary/50 hover:bg-secondary/80"
            } ${buttonPressAnimation} whitespace-nowrap`}
          >
            <span className="flex items-center gap-1">
              {CATEGORY_ICONS[category as PromptCategory]} 
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </button>
        ))}
      </div>
      
      {/* Prompt and Response */}
      {selectedPrompt ? (
        <div className="space-y-4">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-md font-medium">{selectedPrompt.text}</p>
          </div>
          
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full min-h-[120px] p-3 rounded-lg bg-secondary/50 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Write your thoughts here..."
          />
          
          <div className="flex justify-between">
            <button
              onClick={handleNewPrompt}
              className={`px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium ${buttonPressAnimation}`}
            >
              New Prompt
            </button>
            
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
            >
              Save Reflection
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-4">
            Select a category above to get a reflection prompt
          </p>
          <button
            onClick={() => handleCategorySelect("reflection")}
            className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium ${buttonPressAnimation}`}
          >
            Start Reflecting
          </button>
        </div>
      )}
    </div>
  );
};

export default ReflectionPrompts;
