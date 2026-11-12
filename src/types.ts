export type TabType = 
  | 'dashboard' 
  | 'study' 
  | 'playground' 
  | 'physique' 
  | 'token' 
  | 'leaderboard' 
  | 'settings'
  | 'goals'
  | 'coach'
  | 'sunday_reset'
  | 'focus_mode'
  | 'templates'
  | 'monthly_wrapped'
  | 'suggestor'
  | 'analysis'
  | 'training'
  | 'group_leaderboard';

export type GameMode = 'rapid' | 'memory_recall' | 'deathmatch' | 'flashcards';

export type ThemeKey = 'amber_gold' | 'acid_lime' | 'electric_blue' | 'cyber_cyan' | 'crimson_fury' | 'monochrome';

export interface TaskItem {
  id: string;
  title: string;
  category: 'Study' | 'Fitness' | 'Mindset' | 'Skill';
  priority: 'High' | 'Medium' | 'Low';
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
  calendarSynced?: boolean;
  proofImageUri?: string;
  proofAiAnalysis?: string;
  proofConfidenceScore?: number;
  proofVerified?: boolean;
  proofSubmittedAt?: string;
}

export interface LearningStep {
  stepNumber: number;
  title: string;
  focus: string;
  estimatedDays: number;
  deliverable: string;
}

export interface LearningSource {
  title: string;
  type: 'Book' | 'Course' | 'Docs' | 'Video' | 'Practice';
  urlOrAuthor: string;
  description: string;
}

export interface LearningRoadmap {
  topic: string;
  level: string;
  overview: string;
  phases: LearningStep[];
  curatedSources: LearningSource[];
  suggestedDailyTasks: string[];
}

export interface CoachDiagnosis {
  status: 'CRITICAL LOCKOUT RISK' | 'ON TRACK' | 'BEHIND SCHEDULE';
  analysis: string;
  solutions: string[];
  immediateAction: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetDate: string;
  subTasks: { id: string; title: string; completed: boolean }[];
  progressPct: number;
  aiBreakdownAdvice?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  icon: string;
  points: number;
  type: 'yesno' | 'hours' | 'minutes';
}

export interface UserProfile {
  name: string;
  groupCode: string;
  groupName: string;
  role: 'Monitor' | 'Enforcer' | 'Recruit';
  xp: number;
  weeklyXp?: number;
  weeklyResetDate?: string;
  streak: number;
  rank: string;
  emergencyTokens: number;
  penaltyMultiplier: number;
  lastMissedDays: number;
  theme: ThemeKey;
  offlineMode: boolean;
  smartRemindersEnabled: boolean;
}

export interface StudySessionLog {
  id: string;
  topic: string;
  durationSeconds: number;
  timestamp: string;
  verified: boolean;
  notesSummary?: string;
  quizScore?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface RevisionSheet {
  title: string;
  keyConcepts: { concept: string; definition: string }[];
  formulasOrRules: string[];
  commonPitfalls: string[];
}

export interface MonthlyWrappedData {
  month: string;
  totalStudyHours: number;
  quizzesCompleted: number;
  averageRecallScore: number;
  longestStreak: number;
  physiqueCheckins: number;
  xpEarned: number;
  cohortRankTitle: string;
}

// ─── Multi-Account & Onboarding Types ───────────────────────────────────────

export interface AccountProfile {
  id: string;
  name: string;
  groupCode: string;
  groupName: string;
  isGroupCreator: boolean;
  role: 'Monitor' | 'Enforcer' | 'Recruit';
  xp: number;
  weeklyXp?: number;
  weeklyResetDate?: string;
  streak: number;
  rank: string;
  emergencyTokens: number;
  penaltyMultiplier: number;
  lastMissedDays: number;
  theme: ThemeKey;
  offlineMode: boolean;
  smartRemindersEnabled: boolean;
  // Personalization plan from onboarding
  selectedCategories: string[];
  customGoals: string[];
  dailyTimeCommitments: { category: string; minutesPerDay: number }[];
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  weeklyRestDay: string;
  aiPersonalizedPlan?: string;
  // Privacy settings for group leaderboard
  privacySettings: {
    showXP: boolean;
    showStreak: boolean;
    showTaskList: boolean;
    showPhysiquePhotos: boolean;
  };
  createdAt: string;
}

export interface GroupMember {
  accountId: string;
  name: string;
  xp: number;
  weeklyXp?: number;
  streak: number;
  rank: string;
  tasksCompletedToday: number;
  tasksTotalToday: number;
  lastActive: string;
  privacySettings: AccountProfile['privacySettings'];
}

export interface GroupData {
  code: string;
  name: string;
  creatorId: string;
  members: GroupMember[];
  createdAt: string;
}

export interface PersonalizedPlanResult {
  planSummary: string;
  dailyTasks: TaskItem[];
  weeklyGoals: string[];
}
