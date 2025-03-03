# Habit Tracking Component Examples

This document provides example UI components for the expanded habit tracking system, showing how the detailed questions can be implemented in a user-friendly way.

## 1. Daily Check-In Card

### Exercise Check-In
```jsx
<HabitCard title="Physical Activity" icon={ActivityIcon} category="exercise">
  <TabGroup>
    <Tab name="Quick">
      <QuickTracker 
        question="How active were you today?"
        options={[
          { label: "Very Active", icon: "🏃", value: "very_active" },
          { label: "Moderately Active", icon: "🚶", value: "moderate" },
          { label: "Lightly Active", icon: "🧘", value: "light" },
          { label: "Mostly Sedentary", icon: "🪑", value: "sedentary" }
        ]}
        previousValue="moderate"
        onSelect={(value) => handleSelection(value)}
      />
      
      <Counter
        question="Step Count"
        value={8243}
        target={10000}
        icon="👣"
        showProgress={true}
        onUpdate={(value) => updateSteps(value)}
      />
      
      <BooleanToggle
        question="Did you complete a planned workout today?"
        value={true}
        icon="🏋️"
        onToggle={(value) => toggleWorkout(value)}
      />
    </Tab>
    
    <Tab name="Detailed">
      <LabeledSlider
        question="How would you rate your physical energy today?"
        min={1}
        max={10}
        value={7}
        labels={[
          { value: 1, label: "Exhausted" },
          { value: 5, label: "Average" },
          { value: 10, label: "Energetic" }
        ]}
        onChange={(value) => updateEnergyLevel(value)}
      />
      
      <MultiSelect
        question="What types of exercise did you do today?"
        options={[
          { label: "Cardio", icon: "🫀" },
          { label: "Strength", icon: "💪" },
          { label: "Flexibility", icon: "🤸" },
          { label: "Sports", icon: "⚽" },
          { label: "Walking", icon: "🚶" }
        ]}
        selected={["Cardio", "Walking"]}
        onChange={(selected) => updateExerciseTypes(selected)}
      />
      
      <DurationInput
        question="How many minutes of intentional exercise?"
        hours={0}
        minutes={45}
        icon="⏱️"
        onChange={(h, m) => updateDuration(h, m)}
      />
      
      <BodyMapSelector
        question="Any muscle soreness or discomfort?"
        selectedAreas={["leftShoulder", "lowerBack"]}
        intensityScale={true}
        onChange={(areas) => updateSorenessAreas(areas)}
      />
    </Tab>
    
    <Tab name="Context">
      <RadioGroup
        question="Was today's activity level planned?"
        options={[
          { label: "Yes, followed my plan", value: "planned" },
          { label: "Somewhat, with modifications", value: "modified" },
          { label: "No, deviated from plan", value: "unplanned" }
        ]}
        selected="modified"
        onChange={(value) => updatePlanAdherence(value)}
      />
      
      <TextInput
        question="Any notes about today's physical activity?"
        placeholder="How did you feel? Any circumstances affecting your activity?"
        value=""
        multiline={true}
        onChange={(text) => updateExerciseNotes(text)}
      />
      
      <LocationCheckIn
        question="Where were you active today?"
        options={[
          { label: "Home", icon: "🏠" },
          { label: "Gym", icon: "🏢" },
          { label: "Outdoors", icon: "🌳" },
          { label: "Work", icon: "💼" },
          { label: "Other", icon: "📍" }
        ]}
        selected={["Outdoors"]}
        allowMultiple={true}
        onChange={(locations) => updateActivityLocations(locations)}
      />
    </Tab>
  </TabGroup>
  
  <TrendIndicator
    current={75}
    previous={70}
    label="Activity Score"
    improvedLabel="More active than usual"
    declinedLabel="Less active than usual"
    neutralThreshold={5}
  />
  
  <SaveButton onSave={() => saveExerciseData()} />
</HabitCard>
```

### Sleep Check-In
```jsx
<HabitCard title="Sleep & Rest" icon={MoonIcon} category="sleep">
  <TabGroup>
    <Tab name="Quick">
      <SleepDurationPicker
        bedtime="23:30"
        wakeTime="07:15"
        calculatedHours={7.75}
        target={8}
        onBedtimeChange={(time) => updateBedtime(time)}
        onWakeTimeChange={(time) => updateWakeTime(time)}
      />
      
      <QualityRating
        question="How would you rate your sleep quality?"
        value={4}
        maxValue={5}
        icon="✨"
        labels={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
        onChange={(value) => updateSleepQuality(value)}
      />
      
      <EmojiSelector
        question="How did you feel upon waking?"
        selected="😌"
        options={["😴", "😔", "😐", "😌", "😃"]}
        labels={["Exhausted", "Tired", "Neutral", "Refreshed", "Energized"]}
        onChange={(emoji) => updateWakingFeeling(emoji)}
      />
    </Tab>
    
    <Tab name="Detailed">
      <ToggleGroup
        question="Did you experience any sleep issues?"
        options={[
          { label: "Trouble Falling Asleep", value: "falling" },
          { label: "Waking During Night", value: "waking" },
          { label: "Early Awakening", value: "early" },
          { label: "Restless Sleep", value: "restless" },
          { label: "None", value: "none", exclusive: true }
        ]}
        selected={["waking"]}
        onChange={(issues) => updateSleepIssues(issues)}
      />
      
      <Counter
        question="How many times did you wake during the night?"
        value={2}
        min={0}
        max={10}
        onChange={(value) => updateAwakenings(value)}
      />
      
      <CircleSlider
        question="What percentage of your sleep felt deep and restful?"
        percentage={60}
        color="#6366F1"
        onChange={(percent) => updateDeepSleepPercent(percent)}
      />
      
      <DreamRecall
        question="Did you have or remember any dreams?"
        options={[
          { label: "No Dreams/Recall", value: "none" },
          { label: "Vague Fragments", value: "vague" },
          { label: "Clear Dreams", value: "clear" },
          { label: "Vivid Dreams", value: "vivid" }
        ]}
        selected="vague"
        onChange={(value) => updateDreamRecall(value)}
      />
    </Tab>
    
    <Tab name="Environment">
      <RatingMatrix
        question="Rate your sleep environment"
        factors={[
          { id: "darkness", label: "Darkness", icon: "🌙" },
          { id: "quiet", label: "Quietness", icon: "🔇" },
          { id: "temp", label: "Temperature", icon: "🌡️" },
          { id: "comfort", label: "Comfort", icon: "🛏️" }
        ]}
        ratings={{
          darkness: 4,
          quiet: 3,
          temp: 5,
          comfort: 4
        }}
        max={5}
        onChange={(factor, rating) => updateEnvironmentRating(factor, rating)}
      />
      
      <TimeSelector
        question="Last exposure to screens before sleep"
        time="22:45"
        bedtime="23:30"
        recommendedBuffer={60} // minutes
        onChange={(time) => updateLastScreenTime(time)}
      />
      
      <BooleanGroup
        questions={[
          { id: "caffeine", text: "Avoided caffeine 8h before bed?", value: true },
          { id: "alcohol", text: "Avoided alcohol 3h before bed?", value: true },
          { id: "meal", text: "Last meal at least 2h before bed?", value: false }
        ]}
        onChange={(id, value) => updateSleepBehavior(id, value)}
      />
    </Tab>
  </TabGroup>
  
  <TrendGraph
    data={sleepData}
    metric="duration"
    target={8}
    period="week"
    unit="hours"
  />
  
  <SaveButton onSave={() => saveSleepData()} />
</HabitCard>
```

### Nutrition Check-In
```jsx
<HabitCard title="Nutrition & Hydration" icon={AppleIcon} category="nutrition">
  <TabGroup>
    <Tab name="Quick">
      <MealTracker
        meals={[
          { type: "breakfast", completed: true, quality: 4 },
          { type: "lunch", completed: true, quality: 3 },
          { type: "dinner", completed: true, quality: 4 },
          { type: "snacks", completed: true, quality: 2 }
        ]}
        onToggle={(meal) => toggleMeal(meal)}
        onQualityChange={(meal, quality) => updateMealQuality(meal, quality)}
      />
      
      <WaterTracker
        current={5}
        target={8}
        unit="cups"
        showVisual={true}
        onChange={(value) => updateWaterIntake(value)}
      />
      
      <PercentageBar
        question="Today's nutrition quality estimate"
        percentage={70}
        colorScale={[
          { threshold: 30, color: "#EF4444" },
          { threshold: 60, color: "#F59E0B" },
          { threshold: 85, color: "#10B981" }
        ]}
        onChange={(percent) => updateNutritionQuality(percent)}
      />
    </Tab>
    
    <Tab name="Detailed">
      <ServingCounter
        question="Vegetable & fruit servings"
        value={4}
        target={5}
        showProgress={true}
        icon="🥦"
        onChange={(value) => updateProduceServings(value)}
      />
      
      <ToggleGroup
        question="Which meals included protein?"
        options={[
          { label: "Breakfast", value: "breakfast" },
          { label: "Lunch", value: "lunch" },
          { label: "Dinner", value: "dinner" },
          { label: "Snacks", value: "snacks" },
          { label: "None", value: "none", exclusive: true }
        ]}
        selected={["lunch", "dinner"]}
        onChange={(meals) => updateProteinMeals(meals)}
      />
      
      <MacroDistribution
        carbs={50}
        protein={30}
        fat={20}
        editable={true}
        showBalance={true}
        onChange={(macros) => updateMacroEstimate(macros)}
      />
      
      <FoodGroupChecklist
        groups={[
          { id: "vegetables", label: "Vegetables", checked: true, icon: "🥗" },
          { id: "fruits", label: "Fruits", checked: true, icon: "🍎" },
          { id: "wholegrains", label: "Whole Grains", checked: false, icon: "🌾" },
          { id: "protein", label: "Protein", checked: true, icon: "🥩" },
          { id: "dairy", label: "Dairy/Alternative", checked: true, icon: "🥛" },
          { id: "fats", label: "Healthy Fats", checked: false, icon: "🥑" }
        ]}
        onChange={(id, checked) => updateFoodGroupConsumption(id, checked)}
      />
    </Tab>
    
    <Tab name="Context">
      <RadioGroup
        question="How were your meals prepared today?"
        options={[
          { label: "Mostly home-cooked", value: "home" },
          { label: "Mix of home/prepared", value: "mixed" },
          { label: "Mostly prepared/takeout", value: "prepared" },
          { label: "Mostly restaurant", value: "restaurant" }
        ]}
        selected="mixed"
        onChange={(value) => updateMealPreparation(value)}
      />
      
      <HungerAwarenessScale
        beforeValues={{
          breakfast: 2,
          lunch: 3,
          dinner: 4
        }}
        afterValues={{
          breakfast: 4,
          lunch: 5,
          dinner: 6
        }}
        scale={[
          { value: 1, label: "Starving" },
          { value: 3, label: "Hungry" },
          { value: 5, label: "Satisfied" },
          { value: 7, label: "Full" },
          { value: 10, label: "Stuffed" }
        ]}
        onChange={(meal, type, value) => updateHungerRating(meal, type, value)}
      />
      
      <BooleanGroup
        questions={[
          { id: "mindful", text: "Did you eat mindfully without distractions?", value: false },
          { id: "planned", text: "Were your meals planned in advance?", value: true },
          { id: "emotional", text: "Did you notice emotional eating?", value: true, negative: true }
        ]}
        onChange={(id, value) => updateEatingBehavior(id, value)}
      />
    </Tab>
  </TabGroup>
  
  <NutritionInsight
    insight="Your protein intake tends to be higher on days when you report better energy levels."
    confidence={85}
    relatedMetrics={["protein", "energy"]}
    onDismiss={() => dismissInsight('protein-energy')}
  />
  
  <SaveButton onSave={() => saveNutritionData()} />
</HabitCard>
```

### Social Connection Check-In
```jsx
<HabitCard title="Social Connection" icon={PeopleIcon} category="social">
  <TabGroup>
    <Tab name="Quick">
      <SocialInteractionCounter
        inPerson={2}
        digital={3}
        meaningful={1}
        onInPersonChange={(value) => updateInPersonCount(value)}
        onDigitalChange={(value) => updateDigitalCount(value)}
        onMeaningfulChange={(value) => updateMeaningfulCount(value)}
      />
      
      <ConnectionQuality
        question="Overall connection quality today"
        value={4}
        maxValue={5}
        icons={["😔", "😐", "🙂", "😊", "🥰"]}
        labels={["Very Poor", "Poor", "Adequate", "Good", "Excellent"]}
        onChange={(value) => updateConnectionQuality(value)}
      />
      
      <BooleanToggle
        question="Did you engage in group/community activities?"
        value={false}
        icon="👥"
        onToggle={(value) => toggleGroupActivity(value)}
      />
    </Tab>
    
    <Tab name="Detailed">
      <InteractionTypeBreakdown
        types={{
          "Deep conversation": true,
          "Light socializing": true,
          "Support giving": false,
          "Support receiving": false,
          "Shared activity": true,
          "Digital chat": true
        }}
        onChange={(type, value) => updateInteractionType(type, value)}
      />
      
      <RelationshipCircles
        question="Who did you connect with today?"
        circles={[
          { id: "family", label: "Family", checked: true, icon: "👨‍👩‍👧‍👦" },
          { id: "close", label: "Close Friends", checked: true, icon: "🫂" },
          { id: "friends", label: "Friends", checked: false, icon: "👯" },
          { id: "colleagues", label: "Colleagues", checked: true, icon: "💼" },
          { id: "acquaintances", label: "Acquaintances", checked: false, icon: "🤝" },
          { id: "strangers", label: "New People", checked: false, icon: "🧑‍🤝‍🧑" }
        ]}
        onChange={(id, checked) => updateSocialCircle(id, checked)}
      />
      
      <EmotionalDisclosure
        question="Did you share your authentic feelings with someone?"
        value="partial"
        options={[
          { label: "Yes, deeply", value: "deep" },
          { label: "Yes, partially", value: "partial" },
          { label: "No", value: "none" }
        ]}
        onChange={(value) => updateEmotionalSharing(value)}
      />
      
      <LonelinessScale
        question="Did you experience loneliness today?"
        value={2}
        scale={[
          { value: 1, label: "Not at all" },
          { value: 2, label: "Slightly" },
          { value: 3, label: "Moderately" },
          { value: 4, label: "Considerably" },
          { value: 5, label: "Intensely" }
        ]}
        showTrend={true}
        onChange={(value) => updateLonelinessLevel(value)}
      />
    </Tab>
    
    <Tab name="Context">
      <TimeDistributionSlider
        question="Time spent in different social contexts"
        categories={[
          { id: "alone", label: "Alone", color: "#94A3B8" },
          { id: "oneOnOne", label: "One-on-one", color: "#60A5FA" },
          { id: "smallGroup", label: "Small group", color: "#818CF8" },
          { id: "largeGroup", label: "Large group", color: "#A78BFA" }
        ]}
        values={{
          alone: 60,
          oneOnOne: 20,
          smallGroup: 20,
          largeGroup: 0
        }}
        onChange={(category, percent) => updateTimeDistribution(category, percent)}
      />
      
      <SocialEnergyImpact
        question="How did social interactions affect your energy?"
        value="energizing"
        options={[
          { label: "Mostly energizing", value: "energizing", icon: "⚡" },
          { label: "Mixed effect", value: "mixed", icon: "⚖️" },
          { label: "Mostly draining", value: "draining", icon: "🔋" }
        ]}
        onChange={(value) => updateSocialEnergyImpact(value)}
      />
      
      <SocialTechnologyUse
        platforms={[
          { id: "calls", label: "Calls/Video", minutes: 30, quality: 4 },
          { id: "messaging", label: "Messaging", minutes: 45, quality: 3 },
          { id: "social", label: "Social Media", minutes: 60, quality: 2 },
          { id: "gaming", label: "Social Gaming", minutes: 0, quality: 0 }
        ]}
        qualityScale={5}
        onChange={(platform, field, value) => updateTechUsage(platform, field, value)}
      />
    </Tab>
  </TabGroup>
  
  <SocialConnectionInsight
    weeklyAverage={3.5}
    currentValue={4}
    trend="improving"
    moodCorrelation={0.72}
  />
  
  <SaveButton onSave={() => saveSocialData()} />
</HabitCard>
```

## 2. Weekly Review Components

### Sleep Patterns Review
```jsx
<WeeklyReviewCard title="Sleep Patterns" icon={MoonIcon}>
  <SleepHeatmap
    data={[
      { date: "2023-10-01", duration: 7.5, quality: 4, bedtime: "23:15", waketime: "06:45" },
      { date: "2023-10-02", duration: 6.2, quality: 2, bedtime: "00:30", waketime: "06:42" },
      { date: "2023-10-03", duration: 7.8, quality: 4, bedtime: "22:45", waketime: "06:35" },
      { date: "2023-10-04", duration: 8.1, quality: 5, bedtime: "22:30", waketime: "06:40" },
      { date: "2023-10-05", duration: 7.0, quality: 3, bedtime: "23:20", waketime: "06:20" },
      { date: "2023-10-06", duration: 7.4, quality: 4, bedtime: "23:10", waketime: "06:35" },
      { date: "2023-10-07", duration: 8.5, quality: 5, bedtime: "22:15", waketime: "06:45" }
    ]}
    durationTarget={8}
    durationRange={[5, 10]}
    qualityRange={[1, 5]}
    showTimes={true}
  />
  
  <MetricSummary
    metrics={[
      { 
        label: "Average Duration", 
        value: "7.5 hrs", 
        change: "+0.3", 
        target: "8 hrs",
        icon: "⏱️"
      },
      { 
        label: "Average Quality", 
        value: "3.9/5", 
        change: "+0.4", 
        icon: "✨"
      },
      { 
        label: "Bedtime Consistency", 
        value: "85%", 
        change: "+5%", 
        icon: "🌙"
      },
      { 
        label: "Wake Time Consistency", 
        value: "92%", 
        change: "+2%", 
        icon: "🌅"
      }
    ]}
  />
  
  <FactorAnalysis
    question="Factors affecting your sleep quality"
    factors={[
      { factor: "Screen time before bed", impact: -0.7, confidence: 85 },
      { factor: "Exercise during day", impact: 0.6, confidence: 80 },
      { factor: "Consistent bedtime", impact: 0.8, confidence: 90 },
      { factor: "Caffeine consumption", impact: -0.5, confidence: 75 }
    ]}
    impactRange={[-1, 1]}
    onFactorClick={(factor) => showFactorDetails(factor)}
  />
  
  <ReflectionPrompt
    question="What patterns do you notice in your sleep this week?"
    previousAnswer=""
    placeholder="Consider factors that helped or hindered your sleep quality..."
    onChange={(text) => updateSleepReflection(text)}
  />
  
  <SleepRecommendation
    recommendation="Based on your patterns, going to bed before 11 PM correlates with better sleep quality."
    confidence={85}
    onAccept={() => acceptRecommendation('bedtime')}
    onDismiss={() => dismissRecommendation('bedtime')}
  />
</WeeklyReviewCard>
```

### Nutrition Patterns Review
```jsx
<WeeklyReviewCard title="Nutrition Patterns" icon={AppleIcon}>
  <NutritionBalanceChart
    data={[
      { date: "2023-10-01", produce: 5, protein: 3, wholegrains: 2, water: 6 },
      { date: "2023-10-02", produce: 3, protein: 3, wholegrains: 2, water: 5 },
      { date: "2023-10-03", produce: 4, protein: 4, wholegrains: 3, water: 7 },
      { date: "2023-10-04", produce: 6, protein: 3, wholegrains: 2, water: 8 },
      { date: "2023-10-05", produce: 4, protein: 2, wholegrains: 1, water: 5 },
      { date: "2023-10-06", produce: 5, protein: 3, wholegrains: 2, water: 6 },
      { date: "2023-10-07", produce: 7, protein: 4, wholegrains: 3, water: 8 }
    ]}
    targets={{
      produce: 5,
      protein: 3,
      wholegrains: 3,
      water: 8
    }}
  />
  
  <MealConsistencyGraph
    meals={["breakfast", "lunch", "dinner", "snacks"]}
    data={[
      { date: "2023-10-01", breakfast: true, lunch: true, dinner: true, snacks: true },
      { date: "2023-10-02", breakfast: false, lunch: true, dinner: true, snacks: true },
      { date: "2023-10-03", breakfast: true, lunch: true, dinner: true, snacks: false },
      { date: "2023-10-04", breakfast: true, lunch: true, dinner: true, snacks: false },
      { date: "2023-10-05", breakfast: false, lunch: true, dinner: true, snacks: true },
      { date: "2023-10-06", breakfast: true, lunch: false, dinner: true, snacks: true },
      { date: "2023-10-07", breakfast: true, lunch: true, dinner: true, snacks: false }
    ]}
  />
  
  <EatingContextSummary
    contexts={{
      "Home-cooked": 65,
      "Restaurant": 10,
      "Takeout": 20,
      "On-the-go": 5
    }}
    previous={{
      "Home-cooked": 55,
      "Restaurant": 15,
      "Takeout": 25,
      "On-the-go": 5
    }}
    onChange={(context, value) => updateEatingContext(context, value)}
  />
  
  <NutritionHabitCorrelation
    correlations={[
      { habit: "Eating protein with breakfast", outcome: "Sustained energy", strength: 0.78 },
      { habit: "Consuming 5+ veggie servings", outcome: "Better mood", strength: 0.65 },
      { habit: "Drinking 8+ cups of water", outcome: "Reduced afternoon fatigue", strength: 0.72 },
      { habit: "Eating mindfully", outcome: "Better digestion", strength: 0.68 }
    ]}
    onHabitClick={(habit) => showHabitDetails(habit)}
  />
  
  <ReflectionPrompt
    question="What nutrition patterns helped you feel your best this week?"
    previousAnswer=""
    placeholder="Consider energy levels, mood, and physical comfort..."
    onChange={(text) => updateNutritionReflection(text)}
  />
  
  <NutritionRecommendation
    recommendation="Adding protein to your breakfast may help maintain your energy until lunch."
    confidence={78}
    onAccept={() => acceptRecommendation('breakfast-protein')}
    onDismiss={() => dismissRecommendation('breakfast-protein')}
  />
</WeeklyReviewCard>
```

## 3. Habit Question Flow

### Progressive Question Display
```jsx
<HabitQuestionFlow category="exercise" onComplete={(data) => saveExerciseData(data)}>
  {/* Step 1: Basic activity tracking */}
  <QuestionStep id="activity-level">
    <LabeledScale
      question="How physically active were you today?"
      options={[
        { value: 1, label: "Mostly sedentary" },
        { value: 2, label: "Lightly active" },
        { value: 3, label: "Moderately active" },
        { value: 4, label: "Very active" },
        { value: 5, label: "Extremely active" }
      ]}
      defaultValue={3}
      onChange={(value) => updateResponse("activityLevel", value)}
    />
  </QuestionStep>
  
  {/* Step 2: Workout completion */}
  <QuestionStep id="workout-completion">
    <BooleanChoice
      question="Did you complete an intentional workout today?"
      yesLabel="Yes, I exercised"
      noLabel="No workout today"
      defaultValue={null}
      required={true}
      onChange={(value) => updateResponse("workoutCompleted", value)}
    />
  </QuestionStep>
  
  {/* Step 3A: Conditional on workout = yes */}
  <ConditionalStep showIf={(data) => data.workoutCompleted === true}>
    <QuestionStep id="workout-details">
      <MultiSelect
        question="What type of exercise did you do?"
        options={[
          { value: "cardio", label: "Cardio/Aerobic", icon: "🫀" },
          { value: "strength", label: "Strength Training", icon: "💪" },
          { value: "flexibility", label: "Flexibility/Mobility", icon: "🤸" },
          { value: "sports", label: "Sports/Recreation", icon: "⚽" },
          { value: "walking", label: "Walking", icon: "🚶" }
        ]}
        defaultValue={[]}
        onChange={(values) => updateResponse("exerciseTypes", values)}
      />
      
      <DurationPicker
        question="How long did you exercise?"
        defaultHours={0}
        defaultMinutes={30}
        onChange={(h, m) => updateResponse("duration", h * 60 + m)}
      />
      
      <IntensityRating
        question="What was your exercise intensity?"
        options={[
          { value: 1, label: "Very light" },
          { value: 2, label: "Light" },
          { value: 3, label: "Moderate" },
          { value: 4, label: "Vigorous" },
          { value: 5, label: "Maximum effort" }
        ]}
        defaultValue={3}
        onChange={(value) => updateResponse("intensity", value)}
      />
    </QuestionStep>
  </ConditionalStep>
  
  {/* Step 3B: Conditional on workout = no */}
  <ConditionalStep showIf={(data) => data.workoutCompleted === false}>
    <QuestionStep id="no-workout-reason">
      <SingleSelect
        question="What was the main reason for not exercising today?"
        options={[
          { value: "planned", label: "Planned rest day" },
          { value: "time", label: "Time constraints" },
          { value: "energy", label: "Low energy/fatigue" },
          { value: "motivation", label: "Lack of motivation" },
          { value: "recovery", label: "Physical recovery needed" },
          { value: "illness", label: "Illness/injury" },
          { value: "access", label: "No access to facilities" },
          { value: "other", label: "Other reason" }
        ]}
        defaultValue=""
        onChange={(value) => updateResponse("noWorkoutReason", value)}
      />
      
      <TextInput
        question="Any notes about today's activity level?"
        placeholder="Optional additional context..."
        multiline={true}
        conditional={(data) => data.noWorkoutReason === "other"}
        onChange={(text) => updateResponse("noWorkoutNotes", text)}
      />
    </QuestionStep>
  </ConditionalStep>
  
  {/* Step 4: Energy level for everyone */}
  <QuestionStep id="energy-level">
    <EnergyMeter
      question="How was your physical energy today?"
      defaultValue={5}
      min={1}
      max={10}
      lowLabel="Very low energy"
      highLabel="Very high energy"
      showAverage={true}
      average={6.2}
      onChange={(value) => updateResponse("energyLevel", value)}
    />
  </QuestionStep>
  
  {/* Step 5: Optional detailed metrics */}
  <ExpandableStep
    id="detailed-metrics"
    title="Track Additional Metrics"
    subtitle="Optional but provides better insights"
    expanded={false}
  >
    <QuestionStep id="step-count">
      <NumberInput
        question="Approximate step count today"
        defaultValue=""
        placeholder="e.g. 8000"
        min={0}
        max={100000}
        onChange={(value) => updateResponse("stepCount", value)}
      />
    </QuestionStep>
    
    <QuestionStep id="mood-after">
      <MoodSelector
        question="How did you feel after physical activity?"
        options={[
          { value: "much_worse", label: "Much worse", icon: "😖" },
          { value: "worse", label: "Somewhat worse", icon: "😔" },
          { value: "same", label: "About the same", icon: "😐" },
          { value: "better", label: "Somewhat better", icon: "🙂" },
          { value: "much_better", label: "Much better", icon: "😁" }
        ]}
        conditional={(data) => data.workoutCompleted === true}
        onChange={(value) => updateResponse("moodAfter", value)}
      />
    </QuestionStep>
    
    <QuestionStep id="physical-limitations">
      <BodyMap
        question="Did you experience any physical limitations?"
        regions={[
          "head", "neck", "shoulders", "arms", "elbows", "wrists", 
          "hands", "chest", "back", "abdomen", "hips", "knees",
          "ankles", "feet"
        ]}
        multiSelect={true}
        severity={true}
        onChange={(regions) => updateResponse("limitations", regions)}
      />
    </QuestionStep>
  </ExpandableStep>
  
  {/* Final step */}
  <CompletionStep
    title="Physical Activity Tracked"
    summary={(data) => generateSummary(data)}
    insights={(data) => generateInsights(data)}
    nextSteps={(data) => suggestNextSteps(data)}
  />
</HabitQuestionFlow>
```

## 4. Mobile Optimized Components

### Mobile Check-In View
```jsx
<MobileHabitCard category="sleep" collapsed={false}>
  <HabitHeader
    title="Sleep & Rest"
    icon={MoonIcon}
    streak={5}
    completion={70}
    onToggleCollapse={() => toggleCollapseState()}
  />
  
  <MobileTabMenu
    tabs={["Quick", "Details", "Context"]}
    activeTab={selectedTab}
    onChange={(tab) => setSelectedTab(tab)}
  />
  
  <SwipeContainer activeTab={selectedTab}>
    {/* Quick View */}
    <SwipePanel key="quick">
      <QuickSleepEntry
        bedtime="23:00"
        wakeTime="07:15"
        duration={8.25}
        quality={4}
        onBedtimeChange={(time) => updateBedtime(time)}
        onWakeTimeChange={(time) => updateWakeTime(time)}
        onQualityChange={(val) => updateQuality(val)}
      />
    </SwipePanel>
    
    {/* Details View */}
    <SwipePanel key="details">
      <CompactToggleGroup
        question="Sleep issues?"
        options={[
          { label: "Falling Asleep", value: "falling" },
          { label: "Staying Asleep", value: "staying" },
          { label: "Early Waking", value: "early" },
          { label: "None", value: "none", exclusive: true }
        ]}
        selected={["none"]}
        onChange={(issues) => updateSleepIssues(issues)}
      />
      
      <CompactRatingScale
        question="How refreshed on waking?"
        value={3}
        max={5}
        icons={true}
        onChange={(val) => updateRefreshed(val)}
      />
    </SwipePanel>
    
    {/* Context View */}
    <SwipePanel key="context">
      <CompactEnvironmentRating
        factors={[
          { id: "dark", label: "Darkness", icon: "🌙", rating: 4 },
          { id: "quiet", label: "Quiet", icon: "🔇", rating: 3 },
          { id: "temp", label: "Temperature", icon: "🌡️", rating: 5 }
        ]}
        onChange={(id, rating) => updateEnvironment(id, rating)}
      />
      
      <CompactBehaviorChecklist
        behaviors={[
          { id: "caffeine", label: "No late caffeine", checked: true },
          { id: "screens", label: "Screen-free hour before bed", checked: false },
          { id: "consistent", label: "Consistent bedtime", checked: true }
        ]}
        onChange={(id, checked) => updateBehavior(id, checked)}
      />
    </SwipePanel>
  </SwipeContainer>
  
  <MobileCardActions
    onSave={() => saveSleepData()}
    onSkip={() => skipSleepData()}
    saveLabel="Save Sleep"
    showInsightOption={true}
    onRequestInsight={() => requestSleepInsight()}
  />
</MobileHabitCard>
```

### Mobile Weekly Summary
```jsx
<MobileWeeklySummary
  title="Week of October 2-8"
  categories={["Sleep", "Exercise", "Nutrition", "Social"]}
  activeCategory="Sleep"
  onCategoryChange={(cat) => setActiveCategory(cat)}
>
  <MobileMetricTiles
    metrics={[
      { 
        label: "Avg Sleep",
        value: "7.3 hrs",
        change: "+0.4",
        positive: true,
        icon: "⏱️" 
      },
      { 
        label: "Quality",
        value: "3.8/5",
        change: "+0.3",
        positive: true,
        icon: "✨" 
      },
      { 
        label: "Consistency",
        value: "85%",
        change: "-5%",
        positive: false,
        icon: "🔄" 
      }
    ]}
  />
  
  <MobileWeeklyChart
    data={[
      { day: "Mon", value: 7.5, target: 8, quality: 4 },
      { day: "Tue", value: 6.3, target: 8, quality: 3 },
      { day: "Wed", value: 7.8, target: 8, quality: 4 },
      { day: "Thu", value: 7.0, target: 8, quality: 3 },
      { day: "Fri", value: 8.2, target: 8, quality: 5 },
      { day: "Sat", value: 7.6, target: 8, quality: 4 },
      { day: "Sun", value: 6.8, target: 8, quality: 4 }
    ]}
    metricType="hours"
    showTarget={true}
    showQuality={true}
  />
  
  <MobileInsightCard
    insight="You sleep better on days when you exercise in the morning."
    correlation={0.75}
    actionable={true}
    onAction={() => createSleepExerciseHabit()}
  />
  
  <MobileReflectionPrompt
    question="What helped your sleep this week?"
    previousAnswer=""
    characterLimit={280}
    onChange={(text) => updateReflection(text)}
  />
</MobileWeeklySummary>
```

## 5. Implementation Notes

### Component Organization
- Create a consistent component library organized by:
  - Input types (sliders, toggles, selectors)
  - Visualization components (charts, heat maps)
  - Layout components (cards, containers)
  - Question flow components (steps, conditional logic)

### Responsive Design Principles
- Use compositional approach where mobile components reuse core functionality
- Implement swipe gestures for mobile navigation between tabs
- Ensure touch targets are minimum 44×44 points on mobile
- Use progressive disclosure to simplify initial views

### Accessibility Considerations
- Include ARIA labels on all interactive elements
- Ensure proper keyboard navigation
- Provide text alternatives for all visualizations
- Support screen readers with semantic markup
- Maintain minimum contrast ratios for all text

### Data Management
- Implement optimistic UI updates for immediate feedback
- Cache responses locally for offline capability
- Batch submissions to reduce API calls
- Use consistent data formats across components
- Implement form validation with clear error states