
import { HabitType } from "../context/MoodContext";

// Get emoji based on habit type
export const getHabitEmoji = (habit: HabitType): string => {
  switch (habit) {
    case "exercise":
      return "🏋️";
    case "sleep":
      return "😴";
    case "nutrition":
      return "🍎";
    case "social":
      return "👥";
    default:
      return "📝";
  }
};

// Get color based on habit type
export const getHabitColor = (habit: HabitType): string => {
  switch (habit) {
    case "exercise":
      return "bg-emerald-500";
    case "sleep":
      return "bg-indigo-500";
    case "nutrition":
      return "bg-amber-500";
    case "social":
      return "bg-violet-500";
    default:
      return "bg-slate-500";
  }
};

// Get label for habit
export const getHabitLabel = (habit: HabitType): string => {
  switch (habit) {
    case "exercise":
      return "Exercise";
    case "sleep":
      return "Sleep";
    case "nutrition":
      return "Nutrition";
    case "social":
      return "Social";
    default:
      return "Other";
  }
};

// Get Habit description
export const getHabitDescription = (habit: HabitType): string => {
  switch (habit) {
    case "exercise":
      return "Physical activity helps improve mood and energy levels";
    case "sleep":
      return "Quality sleep is essential for mental and physical health";
    case "nutrition":
      return "A balanced diet impacts your energy and mood";
    case "social":
      return "Social connections are vital for emotional well-being";
    default:
      return "";
  }
};

// Generate tips based on habit
export const getHabitTip = (habit: HabitType): string => {
  const tips: Record<HabitType, string[]> = {
    exercise: [
      "Even a 10-minute walk can boost your mood",
      "Try to move for at least 30 minutes today",
      "Stretching can help reduce stress and improve focus",
      "Remember that consistency matters more than intensity",
      "Find an activity you enjoy - it makes exercise sustainable",
    ],
    sleep: [
      "Try to maintain a consistent sleep schedule",
      "Limit screen time before bed for better sleep quality",
      "Create a relaxing bedtime routine",
      "Aim for 7-9 hours of sleep each night",
      "Keep your bedroom cool, dark, and quiet",
    ],
    nutrition: [
      "Stay hydrated throughout the day",
      "Try to include protein in each meal",
      "Colorful fruits and vegetables provide essential nutrients",
      "Balanced meals help maintain steady energy levels",
      "Mindful eating can improve digestion and satisfaction",
    ],
    social: [
      "Quality connections matter more than quantity",
      "Reach out to someone you haven't spoken to in a while",
      "Small interactions can still boost your mood",
      "Practice active listening in your conversations today",
      "Setting boundaries in relationships is healthy",
    ],
  };

  const habitTips = tips[habit];
  return habitTips[Math.floor(Math.random() * habitTips.length)];
};
