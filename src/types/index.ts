export type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';

export type EducationLevel = 'PRESCHOOL' | 'PRIMARY' | 'MIDDLE' | 'HIGH_SCHOOL';

export type UIComplexity = 'SIMPLE' | 'STANDARD' | 'ADVANCED';

export type AuthProviderType = 'google' | 'facebook' | 'phone' | 'email';

export interface ConnectedAccount {
  provider: AuthProviderType;
  identifier: string;
  connectedAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string; // Optional! Default greeting: "Chào bạn 👋"
  avatarUrl?: string;
  role: UserRole;
  educationLevel: EducationLevel;
  aiAssistantName: string; // Default: "AI Coach"
  uiComplexity: UIComplexity;
  connectedAccounts: ConnectedAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  userId: string;
  school?: string;
  grade: string;
  subjects: string[];
  goals: string[];
  streakDays: number;
  xp: number;
}

export interface ChildInfo {
  id: string;
  displayName: string;
  grade: string;
  educationLevel: EducationLevel;
  progressPercent: number;
  streakDays: number;
  weakSubjects: string[];
  strongSubjects: string[];
  recentQuizScores: number[];
  lastActive: string;
}

export interface ClassInfo {
  id: string;
  code: string;
  name: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  students: { id: string; name: string; progress: number }[];
  assignmentsCount: number;
  averageScore: number;
}

export interface Assignment {
  id: string;
  classId?: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  score?: number;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Question {
  id: string;
  quizId?: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMinutes: number;
  questions: Question[];
  createdBy?: string;
}

export interface QuizAttemptResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  strongTopics: string[];
  weakTopics: string[];
  aiRecommendation: string;
  examReadinessScore: number;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewState: 'new' | 'learning' | 'mastered';
  nextReviewDate: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  grade: string;
  cardsCount: number;
  cards: Flashcard[];
}

export interface StudyPlanSession {
  id: string;
  day: number;
  dateLabel: string;
  topic: string;
  subject: string;
  durationMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  goal: string;
  examDate?: string;
  sessions: StudyPlanSession[];
  progressPercent: number;
}

export interface KnowledgeTopic {
  id: string;
  subject: string;
  chapter: string;
  title: string;
  masteryPercent: number;
  confidence: 'low' | 'medium' | 'high';
  lastStudied: string;
  recommendation: string;
}

export interface DocumentAnalysisResult {
  id: string;
  title: string;
  summary: string;
  detectedChapters: string[];
  detectedTopics: string[];
  generatedQuiz: Quiz;
  generatedCards: Flashcard[];
}
