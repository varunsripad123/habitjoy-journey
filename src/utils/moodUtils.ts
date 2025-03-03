
import { MoodType } from "../context/MoodContext";

// Get emoji based on mood
export const getMoodEmoji = (mood: MoodType): string => {
  switch (mood) {
    case "happy":
      return "😊";
    case "sad":
      return "😢";
    case "angry":
      return "😠";
    case "excited":
      return "🤩";
    case "neutral":
    default:
      return "😐";
  }
};

// Get color based on mood
export const getMoodColor = (mood: MoodType): string => {
  switch (mood) {
    case "happy":
      return "bg-mood-happy";
    case "sad":
      return "bg-mood-sad";
    case "angry":
      return "bg-mood-angry";
    case "excited":
      return "bg-mood-excited";
    case "neutral":
    default:
      return "bg-mood-neutral";
  }
};

// Get label for mood
export const getMoodLabel = (mood: MoodType): string => {
  switch (mood) {
    case "happy":
      return "Happy";
    case "sad":
      return "Sad";
    case "angry":
      return "Angry";
    case "excited":
      return "Excited";
    case "neutral":
    default:
      return "Neutral";
  }
};

// Generate journal prompts based on mood
export const getJournalPrompt = (mood: MoodType): string => {
  const prompts: Record<MoodType, string[]> = {
    happy: [
      "What made you smile today?",
      "What are you grateful for right now?",
      "Describe a moment that brought you joy today.",
      "What's something good that happened recently?",
      "Who made your day better today?",
    ],
    sad: [
      "What's weighing on your mind today?",
      "What would help you feel better right now?",
      "Is there something specific making you feel down?",
      "What usually helps when you feel this way?",
      "What's one small thing you can do for yourself today?",
    ],
    angry: [
      "What triggered this feeling?",
      "What would help you release this tension?",
      "Is there a constructive way to address what's bothering you?",
      "What would you say if you could speak freely about this?",
      "How can you channel this energy positively?",
    ],
    excited: [
      "What are you looking forward to?",
      "What has you feeling energized today?",
      "What possibilities are opening up for you?",
      "How can you channel this positive energy?",
      "Share something that's inspiring you right now.",
    ],
    neutral: [
      "How would you describe your day so far?",
      "What's on your mind right now?",
      "Is there anything you'd like to focus on today?",
      "What would make today better?",
      "Reflect on one interesting thing that happened recently.",
    ],
  };

  const moodPrompts = prompts[mood];
  return moodPrompts[Math.floor(Math.random() * moodPrompts.length)];
};
