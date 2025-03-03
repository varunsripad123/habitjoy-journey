import React, { useState } from "react";
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import { MoodProvider, useMood, MoodType } from "@/context/MoodContext";
import { getMoodEmoji, getMoodLabel } from "@/utils/moodUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, Calendar, LineChart as LineChartIcon, PieChart as PieChartIcon, Trophy, Target, TrendingUp } from "lucide-react";
import { format, subDays, eachDayOfInterval, isToday, isYesterday, isThisWeek } from "date-fns";

// Premium UI Stats Dashboard
const StatsPage = () => {
  const { moods, habits, streak, getMoodStats, getHabitStats } = useMood();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("week");
  
  // Get stats safely
  const moodStats = getMoodStats ? getMoodStats() : {
    happy: 0, excited: 0, neutral: 0, sad: 0, angry: 0
  };
  const habitStats = getHabitStats ? getHabitStats() : {
    exercise: 0, sleep: 0, nutrition: 0, social: 0
  };
  
  const totalMoodEntries = Object.values(moodStats).reduce((a, b) => a + b, 0);
  const moodTypes: MoodType[] = ["happy", "excited", "neutral", "sad", "angry"];
  
  // Colors for mood types
  const moodColors: Record<MoodType, string> = {
    happy: "#10B981", // green
    excited: "#3B82F6", // blue
    neutral: "#F59E0B", // amber
    sad: "#6366F1", // indigo
    angry: "#EF4444" // red
  };
  
  // Get a date range based on selected time frame
  const getDateRange = () => {
    const today = new Date();
    const startDate = 
      timeRange === "week" ? subDays(today, 6) :
      timeRange === "month" ? subDays(today, 29) : 
      subDays(today, 89); // 3 months
    return eachDayOfInterval({ start: startDate, end: today });
  };
  
  const dateRange = getDateRange();
  
  // Get mood data for the calendar heatmap
  const getMoodForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return moods.find(m => m.date === dateStr)?.mood || null;
  };
  
  // Calculate primary emotion based on stats
  const getPrimaryEmotion = () => {
    if (totalMoodEntries === 0) return null;
    
    const sortedMoods = [...moodTypes].sort((a, b) => 
      (moodStats[b] || 0) - (moodStats[a] || 0)
    );
    
    return sortedMoods[0];
  };
  
  const primaryEmotion = getPrimaryEmotion();
  
  // Calculate recent trends (last 7 days vs previous 7 days)
  const calculateRecentTrend = () => {
    if (moods.length < 7) return { trend: "neutral", percentage: 0 };
    
    const last7Days = moods.filter(m => {
      const date = new Date(m.date);
      return isToday(date) || isYesterday(date) || isThisWeek(date);
    }).slice(0, 7);
    
    const previous7Days = moods.filter(m => {
      const date = new Date(m.date);
      return !isToday(date) && !isYesterday(date) && !isThisWeek(date);
    }).slice(0, 7);
    
    // Count positive emotions (happy, excited)
    const recentPositive = last7Days.filter(m => m.mood === "happy" || m.mood === "excited").length;
    const previousPositive = previous7Days.filter(m => m.mood === "happy" || m.mood === "excited").length;
    
    const recentPositivePercentage = last7Days.length > 0 ? (recentPositive / last7Days.length) * 100 : 0;
    const previousPositivePercentage = previous7Days.length > 0 ? (previousPositive / previous7Days.length) * 100 : 0;
    
    const difference = recentPositivePercentage - previousPositivePercentage;
    
    return {
      trend: difference > 5 ? "up" : difference < -5 ? "down" : "neutral",
      percentage: Math.abs(Math.round(difference))
    };
  };
  
  const recentTrend = calculateRecentTrend();
  
  // Calculate consistency score (0-100)
  const calculateConsistencyScore = () => {
    if (moods.length === 0) return 0;
    
    // How many days in the last 30 have an entry
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const thirtyDaysCutoff = format(thirtyDaysAgo, "yyyy-MM-dd");
    
    const recentEntries = moods.filter(m => m.date >= thirtyDaysCutoff).length;
    return Math.round((recentEntries / 30) * 100);
  };
  
  const consistencyScore = calculateConsistencyScore();
  
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="container px-4 pt-6">
        <h1 className="text-2xl font-bold mb-2">Progress Dashboard</h1>
        <p className="text-muted-foreground mb-6">Track your growth and visualize your journey</p>

        {/* Time Range Selector */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
          <Button 
            variant={timeRange === "week" ? "default" : "ghost"}
            size="sm" 
            onClick={() => setTimeRange("week")}
            className="rounded-md"
          >
            Last Week
          </Button>
          <Button 
            variant={timeRange === "month" ? "default" : "ghost"}
            size="sm" 
            onClick={() => setTimeRange("month")}
            className="rounded-md"
          >
            Last Month
          </Button>
          <Button 
            variant={timeRange === "quarter" ? "default" : "ghost"}
            size="sm" 
            onClick={() => setTimeRange("quarter")}
            className="rounded-md"
          >
            Last 3 Months
          </Button>
        </div>

        {/* Top Stats Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Streak Card */}
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <h2 className="text-3xl font-bold mt-1">{streak.current} days</h2>
                  <p className="text-xs text-muted-foreground mt-1">Longest: {streak.longest} days</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${streak.longest > 0 ? (streak.current / streak.longest) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mood Entries Card */}
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <h2 className="text-3xl font-bold mt-1">{totalMoodEntries}</h2>
                  <p className="text-xs text-muted-foreground mt-1">Days tracked</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {dateRange.slice(-7).map((date, i) => {
                  const mood = getMoodForDate(date);
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 h-6 rounded-md ${mood ? 'bg-' + moodColors[mood] + '/70' : 'bg-gray-200'}`}
                      title={format(date, "MMM d")}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Primary Emotion Card */}
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Primary Emotion</p>
                  <div className="flex items-center gap-2 mt-1">
                    {primaryEmotion ? (
                      <>
                        <span className="text-2xl">{getMoodEmoji(primaryEmotion)}</span>
                        <h2 className="text-2xl font-bold">{getMoodLabel(primaryEmotion)}</h2>
                      </>
                    ) : (
                      <h2 className="text-xl font-bold text-muted-foreground">No data yet</h2>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {primaryEmotion ? `${Math.round((moodStats[primaryEmotion] / totalMoodEntries) * 100)}% of the time` : "Track moods to see patterns"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {primaryEmotion && (
                <div className="mt-4 flex gap-1">
                  {moodTypes.map((mood) => (
                    <div 
                      key={mood} 
                      className="flex-1 h-6 rounded-md relative overflow-hidden bg-gray-200"
                    >
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          width: `${totalMoodEntries ? (moodStats[mood] / totalMoodEntries) * 100 : 0}%`,
                          backgroundColor: moodColors[mood]
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Trend Card */}
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Trend</p>
                  <div className="flex items-center gap-2 mt-1">
                    {recentTrend.trend === "up" ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h2 className="text-2xl font-bold text-green-600">Improving</h2>
                      </>
                    ) : recentTrend.trend === "down" ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
                        <h2 className="text-2xl font-bold text-red-600">Declining</h2>
                      </>
                    ) : (
                      <>
                        <div className="h-5 w-5 border-t-2 border-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-600">Steady</h2>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recentTrend.percentage > 0 
                      ? `${recentTrend.percentage}% change from previous period`
                      : "No significant change"}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  recentTrend.trend === "up" 
                    ? "bg-green-100" 
                    : recentTrend.trend === "down" 
                      ? "bg-red-100" 
                      : "bg-gray-100"
                }`}>
                  <TrendingUp className={`h-6 w-6 ${
                    recentTrend.trend === "up" 
                      ? "text-green-600" 
                      : recentTrend.trend === "down" 
                        ? "text-red-600 transform rotate-180" 
                        : "text-gray-600"
                  }`} />
                </div>
              </div>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    recentTrend.trend === "up" 
                      ? "bg-green-600" 
                      : recentTrend.trend === "down" 
                        ? "bg-red-600" 
                        : "bg-gray-600"
                  }`}
                  style={{ width: `${consistencyScore}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">Consistency: {consistencyScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Detailed Stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="py-2">
              <Activity className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="moods" className="py-2">
              <PieChartIcon className="mr-2 h-4 w-4" /> Emotions
            </TabsTrigger>
            <TabsTrigger value="habits" className="py-2">
              <BarChart3 className="mr-2 h-4 w-4" /> Habits
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                    Calendar View
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {dateRange.map((date, i) => {
                      const mood = getMoodForDate(date);
                      return (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-md flex items-center justify-center text-xs relative ${
                            mood 
                              ? `bg-${moodColors[mood]}/20 hover:bg-${moodColors[mood]}/40` 
                              : 'bg-gray-100'
                          }`}
                          title={format(date, "MMM d")}
                        >
                          <span className="z-10">{format(date, "d")}</span>
                          {mood && (
                            <span className="absolute bottom-1 right-1 text-[8px]">
                              {getMoodEmoji(mood)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Achievement Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Streak Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Streak Progress</span>
                        <span className="text-sm font-medium">{streak.current}/{streak.longest} days</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600" 
                          style={{ width: `${streak.longest ? (streak.current / streak.longest) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Consistency */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Tracking Consistency</span>
                        <span className="text-sm font-medium">{consistencyScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600" 
                          style={{ width: `${consistencyScore}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Mood Variety */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Emotion Variety</span>
                        <span className="text-sm font-medium">
                          {Object.values(moodStats).filter(v => v > 0).length}/{moodTypes.length}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600" 
                          style={{ 
                            width: `${(Object.values(moodStats).filter(v => v > 0).length / moodTypes.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Positive Ratio */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Positive Emotion Ratio</span>
                        <span className="text-sm font-medium">
                          {totalMoodEntries 
                            ? Math.round(((moodStats.happy || 0) + (moodStats.excited || 0)) / totalMoodEntries * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500" 
                          style={{ 
                            width: `${totalMoodEntries 
                              ? ((moodStats.happy || 0) + (moodStats.excited || 0)) / totalMoodEntries * 100
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moods Tab */}
          <TabsContent value="moods" className="mt-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-indigo-600" />
                  Emotion Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {totalMoodEntries > 0 ? (
                  <div className="space-y-5">
                    {moodTypes.map((mood) => {
                      const percent = totalMoodEntries 
                        ? Math.round((moodStats[mood] || 0) / totalMoodEntries * 100) 
                        : 0;
                      
                      return (
                        <div key={mood} className="flex items-center gap-3">
                          <div className="text-xl w-6 text-center">{getMoodEmoji(mood)}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{getMoodLabel(mood)}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{moodStats[mood] || 0} days</span>
                                <span className="text-xs font-semibold" style={{ color: moodColors[mood] }}>
                                  {percent}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full" 
                                style={{ 
                                  width: `${percent}%`,
                                  backgroundColor: moodColors[mood]
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Pie Chart */}
                    <div className="mt-8 flex justify-center">
                      <div className="relative h-48 w-48">
                        {moodTypes.map((mood, index) => {
                          const percent = totalMoodEntries 
                            ? (moodStats[mood] || 0) / totalMoodEntries * 100
                            : 0;
                          
                          if (percent === 0) return null;
                          
                          // Calculate angles for the pie segments
                          let prevPercent = 0;
                          for (let i = 0; i < index; i++) {
                            prevPercent += totalMoodEntries 
                              ? (moodStats[moodTypes[i]] || 0) / totalMoodEntries * 100
                              : 0;
                          }
                          
                          return (
                            <div 
                              key={mood}
                              className="absolute inset-0 rounded-full"
                              style={{
                                backgroundColor: moodColors[mood],
                                clipPath: `conic-gradient(from ${prevPercent * 3.6}deg, ${moodColors[mood]} 0deg, ${moodColors[mood]} ${percent * 3.6}deg, transparent ${percent * 3.6}deg, transparent 360deg)`
                              }}
                            />
                          );
                        })}
                        <div className="absolute inset-[15%] bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold">{totalMoodEntries}</div>
                            <div className="text-xs text-muted-foreground">Total Entries</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
                      {moodTypes.map(mood => (
                        <div key={mood} className="flex items-center gap-1">
                          <div 
                            className="h-3 w-3 rounded-sm" 
                            style={{ backgroundColor: moodColors[mood] }}
                          />
                          <span className="text-xs">{getMoodLabel(mood)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <PieChartIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-center text-muted-foreground mb-2">No mood data recorded yet</p>
                    <p className="text-center text-sm text-muted-foreground">
                      Start logging your moods daily to see your emotion patterns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="mt-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
                  Habit Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Exercise */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💪</span>
                        <span className="text-md font-medium">Exercise</span>
                      </div>
                      <span className="text-sm font-medium">{habitStats.exercise} days</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600" 
                        style={{ width: `${timeRange === "week" ? habitStats.exercise / 7 * 100 : timeRange === "month" ? habitStats.exercise / 30 * 100 : habitStats.exercise / 90 * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeRange === "week" 
                        ? `${Math.round(habitStats.exercise / 7 * 100)}% of days this week`
                        : timeRange === "month"
                          ? `${Math.round(habitStats.exercise / 30 * 100)}% of days this month`
                          : `${Math.round(habitStats.exercise / 90 * 100)}% of days this quarter`
                      }
                    </p>
                  </div>
                  
                  {/* Sleep */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">😴</span>
                        <span className="text-md font-medium">Sleep</span>
                      </div>
                      <span className="text-sm font-medium">{habitStats.sleep} days</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ width: `${timeRange === "week" ? habitStats.sleep / 7 * 100 : timeRange === "month" ? habitStats.sleep / 30 * 100 : habitStats.sleep / 90 * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeRange === "week" 
                        ? `${Math.round(habitStats.sleep / 7 * 100)}% of days this week`
                        : timeRange === "month"
                          ? `${Math.round(habitStats.sleep / 30 * 100)}% of days this month`
                          : `${Math.round(habitStats.sleep / 90 * 100)}% of days this quarter`
                      }
                    </p>
                  </div>
                  
                  {/* Nutrition */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🥗</span>
                        <span className="text-md font-medium">Nutrition</span>
                      </div>
                      <span className="text-sm font-medium">{habitStats.nutrition} days</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500" 
                        style={{ width: `${timeRange === "week" ? habitStats.nutrition / 7 * 100 : timeRange === "month" ? habitStats.nutrition / 30 * 100 : habitStats.nutrition / 90 * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeRange === "week" 
                        ? `${Math.round(habitStats.nutrition / 7 * 100)}% of days this week`
                        : timeRange === "month"
                          ? `${Math.round(habitStats.nutrition / 30 * 100)}% of days this month`
                          : `${Math.round(habitStats.nutrition / 90 * 100)}% of days this quarter`
                      }
                    </p>
                  </div>
                  
                  {/* Social */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        <span className="text-md font-medium">Social</span>
                      </div>
                      <span className="text-sm font-medium">{habitStats.social} days</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600" 
                        style={{ width: `${timeRange === "week" ? habitStats.social / 7 * 100 : timeRange === "month" ? habitStats.social / 30 * 100 : habitStats.social / 90 * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeRange === "week" 
                        ? `${Math.round(habitStats.social / 7 * 100)}% of days this week`
                        : timeRange === "month"
                          ? `${Math.round(habitStats.social / 30 * 100)}% of days this month`
                          : `${Math.round(habitStats.social / 90 * 100)}% of days this quarter`
                      }
                    </p>
                  </div>
                  
                  {/* Overall Score */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-md font-medium">Overall Habit Score</span>
                      <span className="text-md font-bold text-indigo-600">
                        {Math.round(
                          (habitStats.exercise + habitStats.sleep + habitStats.nutrition + habitStats.social) / 
                          (timeRange === "week" ? 28 : timeRange === "month" ? 120 : 360) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                        style={{ 
                          width: `${
                            Math.round(
                              (habitStats.exercise + habitStats.sleep + habitStats.nutrition + habitStats.social) / 
                              (timeRange === "week" ? 28 : timeRange === "month" ? 120 : 360) * 100
                            )
                          }%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground mt-4">
                      {Math.round(
                        (habitStats.exercise + habitStats.sleep + habitStats.nutrition + habitStats.social) / 
                        (timeRange === "week" ? 28 : timeRange === "month" ? 120 : 360) * 100
                      ) > 75 
                        ? "Excellent! You're doing a great job maintaining your habits." 
                        : Math.round(
                            (habitStats.exercise + habitStats.sleep + habitStats.nutrition + habitStats.social) / 
                            (timeRange === "week" ? 28 : timeRange === "month" ? 120 : 360) * 100
                          ) > 50
                          ? "Good progress! Keep up the consistent work."
                          : Math.round(
                              (habitStats.exercise + habitStats.sleep + habitStats.nutrition + habitStats.social) / 
                              (timeRange === "week" ? 28 : timeRange === "month" ? 120 : 360) * 100
                            ) > 25
                            ? "Steady start! Try to increase consistency."
                            : "Just starting out! Every small improvement counts."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <NavBar />
    </div>
  );
};

// Error handling boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
          <Header />
          <div className="my-12 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">There was an error loading the stats page.</p>
            <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
              Return to Home
            </a>
          </div>
          <NavBar />
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap the whole component with ErrorBoundary and MoodProvider
const Stats = () => (
  <ErrorBoundary>
    <MoodProvider>
      <StatsPage />
    </MoodProvider>
  </ErrorBoundary>
);

export default Stats;