import {
  UserProfile,
  ClassInfo,
  ChildInfo,
  Quiz,
  QuizAttemptResult,
  FlashcardDeck,
  StudyPlan,
  KnowledgeTopic,
  Assignment,
  DocumentAnalysisResult
} from '../src/types';

// In-Memory Cloud Database Mock Adapter with multi-device sync simulation
class DatabaseStore {
  public users: Map<string, UserProfile> = new Map();
  public classes: Map<string, ClassInfo> = new Map();
  public childrenMap: Map<string, ChildInfo[]> = new Map(); // parentId -> children
  public quizzes: Map<string, Quiz> = new Map();
  public quizAttempts: Map<string, QuizAttemptResult[]> = new Map(); // userId -> attempts
  public flashcardDecks: Map<string, FlashcardDeck[]> = new Map(); // userId -> decks
  public studyPlans: Map<string, StudyPlan> = new Map(); // userId -> plan
  public knowledgeMap: Map<string, KnowledgeTopic[]> = new Map(); // userId -> topics
  public assignments: Map<string, Assignment[]> = new Map(); // userId -> assignments
  public documents: Map<string, DocumentAnalysisResult[]> = new Map(); // userId -> docs
  public otpStore: Map<string, { code: string; expiresAt: number; retries: number }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Student User
    const studentUser: UserProfile = {
      id: 'student-demo-1',
      displayName: 'Thịnh',
      email: 'student@nexus.edu.vn',
      phone: '0901234567',
      role: 'STUDENT',
      educationLevel: 'MIDDLE',
      aiAssistantName: 'AI Coach',
      uiComplexity: 'STANDARD',
      connectedAccounts: [
        { provider: 'google', identifier: 'thinh.student@gmail.com', connectedAt: '2026-09-01T08:00:00Z' },
        { provider: 'phone', identifier: '0901234567', connectedAt: '2026-09-02T10:00:00Z' },
        { provider: 'email', identifier: 'student@nexus.edu.vn', connectedAt: '2026-09-01T08:00:00Z' }
      ],
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-08T12:00:00Z'
    };
    this.users.set(studentUser.id, studentUser);

    // 2. Seed Parent User
    const parentUser: UserProfile = {
      id: 'parent-demo-1',
      displayName: '', // User hasn't set display name yet -> "Chào bạn 👋"
      email: 'parent@nexus.edu.vn',
      role: 'PARENT',
      educationLevel: 'PRIMARY',
      aiAssistantName: 'Cô Mai',
      uiComplexity: 'SIMPLE',
      connectedAccounts: [
        { provider: 'google', identifier: 'parent@gmail.com', connectedAt: '2026-09-03T09:00:00Z' }
      ],
      createdAt: '2026-09-03T09:00:00Z',
      updatedAt: '2026-09-03T09:00:00Z'
    };
    this.users.set(parentUser.id, parentUser);

    // Seed Children for Parent (Minh & An)
    this.childrenMap.set(parentUser.id, [
      {
        id: 'child-1',
        displayName: 'Minh',
        grade: 'Lớp 5',
        educationLevel: 'PRIMARY',
        progressPercent: 78,
        streakDays: 4,
        weakSubjects: ['Hình học', 'Toán có lời văn'],
        strongSubjects: ['Phân số', 'Khoa học'],
        recentQuizScores: [8, 7.5, 9, 8.5],
        lastActive: 'Hôm nay, 14:30'
      },
      {
        id: 'child-2',
        displayName: 'An',
        grade: 'Lớp 8',
        educationLevel: 'MIDDLE',
        progressPercent: 84,
        streakDays: 12,
        weakSubjects: ['Phương trình bậc nhất', 'Hóa vô cơ'],
        strongSubjects: ['Ngữ văn', 'Tiếng Anh'],
        recentQuizScores: [9, 8.5, 9.5, 8],
        lastActive: 'Hôm qua, 20:15'
      }
    ]);

    // 3. Seed Teacher User
    const teacherUser: UserProfile = {
      id: 'teacher-demo-1',
      displayName: 'Thầy Quang',
      email: 'teacher@nexus.edu.vn',
      role: 'TEACHER',
      educationLevel: 'MIDDLE',
      aiAssistantName: 'Trợ lý Giảng dạy',
      uiComplexity: 'STANDARD',
      connectedAccounts: [
        { provider: 'email', identifier: 'teacher@nexus.edu.vn', connectedAt: '2026-08-20T07:00:00Z' }
      ],
      createdAt: '2026-08-20T07:00:00Z',
      updatedAt: '2026-08-20T07:00:00Z'
    };
    this.users.set(teacherUser.id, teacherUser);

    // Seed Class for Teacher
    const class8A: ClassInfo = {
      id: 'class-8a',
      code: 'TOAN8A',
      name: 'Toán học 8A — Năm học 2026-2027',
      grade: 'Lớp 8',
      subject: 'Toán học',
      teacherId: teacherUser.id,
      teacherName: 'Thầy Quang',
      studentCount: 38,
      students: [
        { id: 'st-1', name: 'Nguyễn Đức Thịnh', progress: 88 },
        { id: 'st-2', name: 'Trần Thảo An', progress: 84 },
        { id: 'st-3', name: 'Lê Hoàng Nam', progress: 62 },
        { id: 'st-4', name: 'Phạm Minh Anh', progress: 95 }
      ],
      assignmentsCount: 6,
      averageScore: 8.2
    };
    this.classes.set(class8A.id, class8A);

    // Seed Sample Quizzes
    const mathQuiz: Quiz = {
      id: 'quiz-math-8',
      title: 'Kiểm tra 15 phút: Phương trình bậc nhất một ẩn',
      subject: 'Toán học',
      grade: 'Lớp 8',
      difficulty: 'medium',
      timeLimitMinutes: 15,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'Phương trình nào sau đây là phương trình bậc nhất một ẩn?',
          options: ['2x + 5 = 0', 'x² - 4 = 0', '2x + y = 3', '0x + 7 = 0'],
          correctAnswer: 0,
          explanation: 'Phương trình bậc nhất một ẩn có dạng ax + b = 0 (với a ≠ 0). Chỉ có 2x + 5 = 0 thỏa mãn.',
          topic: 'Định nghĩa phương trình',
          difficulty: 'easy'
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Nghiệm của phương trình 3x - 9 = 0 là:',
          options: ['x = -3', 'x = 3', 'x = 9', 'x = 0'],
          correctAnswer: 1,
          explanation: '3x - 9 = 0 <=> 3x = 9 <=> x = 3.',
          topic: 'Giải phương trình cơ bản',
          difficulty: 'easy'
        },
        {
          id: 'q3',
          type: 'multiple_choice',
          question: 'Phương trình 2(x - 3) = 2x - 6 có bao nhiêu nghiệm?',
          options: ['Vô nghiệm', 'Một nghiệm duy nhất', 'Vô số nghiệm', 'Hai nghiệm'],
          correctAnswer: 2,
          explanation: '2x - 6 = 2x - 6 <=> 0x = 0, luôn đúng với mọi x. Do đó có vô số nghiệm.',
          topic: 'Số lượng nghiệm',
          difficulty: 'medium'
        },
        {
          id: 'q4',
          type: 'true_false',
          question: 'Hai phương trình tương đương là hai phương trình có cùng tập nghiệm.',
          options: ['Đúng', 'Sai'],
          correctAnswer: 0,
          explanation: 'Định nghĩa: Hai phương trình tương đương là hai phương trình có cùng một tập nghiệm.',
          topic: 'Khái niệm phương trình tương đương',
          difficulty: 'easy'
        },
        {
          id: 'q5',
          type: 'multiple_choice',
          question: 'Điều kiện xác định của phương trình: 1 / (x - 2) = 4 là:',
          options: ['x ≠ 0', 'x ≠ 2', 'x > 2', 'x < 2'],
          correctAnswer: 1,
          explanation: 'Mẫu thức x - 2 phải khác 0, suy ra x ≠ 2.',
          topic: 'Điều kiện xác định',
          difficulty: 'medium'
        }
      ]
    };
    this.quizzes.set(mathQuiz.id, mathQuiz);

    // Primary Quiz Sample
    const primaryQuiz: Quiz = {
      id: 'quiz-math-5',
      title: 'Ôn tập Phân số và Số thập phân',
      subject: 'Toán học',
      grade: 'Lớp 5',
      difficulty: 'easy',
      timeLimitMinutes: 10,
      questions: [
        {
          id: 'pq1',
          type: 'multiple_choice',
          question: 'Phân số nào sau đây bằng phân số 3/4?',
          options: ['6/8', '3/8', '4/3', '9/15'],
          correctAnswer: 0,
          explanation: 'Nhân cả tử và mẫu với 2: 3/4 = (3x2)/(4x2) = 6/8.',
          topic: 'Rút gọn & quy đồng',
          difficulty: 'easy'
        },
        {
          id: 'pq2',
          type: 'multiple_choice',
          question: 'Chuyển phân số 7/10 thành số thập phân ta được:',
          options: ['0.07', '0.7', '7.0', '7.10'],
          correctAnswer: 1,
          explanation: '7 chia cho 10 bằng 0.7.',
          topic: 'Số thập phân',
          difficulty: 'easy'
        }
      ]
    };
    this.quizzes.set(primaryQuiz.id, primaryQuiz);

    // Seed Flashcards for Student
    this.flashcardDecks.set(studentUser.id, [
      {
        id: 'deck-math-1',
        title: 'Công thức Toán 8 — Đại số',
        subject: 'Toán học',
        grade: 'Lớp 8',
        cardsCount: 4,
        cards: [
          {
            id: 'c1',
            deckId: 'deck-math-1',
            front: 'Hằng đẳng thức: (A + B)²',
            back: 'A² + 2AB + B² (Bình phương của một tổng)',
            topic: 'Hằng đẳng thức đáng nhớ',
            difficulty: 'easy',
            reviewState: 'mastered',
            nextReviewDate: '2026-09-15'
          },
          {
            id: 'c2',
            deckId: 'deck-math-1',
            front: 'Hằng đẳng thức: A² - B²',
            back: '(A - B)(A + B) (Hiệu hai bình phương)',
            topic: 'Hằng đẳng thức đáng nhớ',
            difficulty: 'easy',
            reviewState: 'learning',
            nextReviewDate: '2026-09-11'
          },
          {
            id: 'c3',
            deckId: 'deck-math-1',
            front: 'Quy tắc chuyển vế trong phương trình',
            back: 'Khi chuyển một hạng tử từ vế này sang vế kia của phương trình, ta phải đổi dấu hạng tử đó.',
            topic: 'Phương trình bậc nhất',
            difficulty: 'medium',
            reviewState: 'new',
            nextReviewDate: '2026-09-10'
          },
          {
            id: 'c4',
            deckId: 'deck-math-1',
            front: 'Định nghĩa hai phương trình tương đương',
            back: 'Hai phương trình có cùng tập nghiệm được gọi là hai phương trình tương đương.',
            topic: 'Phương trình bậc nhất',
            difficulty: 'medium',
            reviewState: 'learning',
            nextReviewDate: '2026-09-10'
          }
        ]
      }
    ]);

    // Seed Study Plan for Student
    this.studyPlans.set(studentUser.id, {
      id: 'plan-1',
      userId: studentUser.id,
      goal: 'Thi giữa kỳ I đạt điểm 9+ môn Toán và Tiếng Anh',
      examDate: '2026-10-15',
      progressPercent: 45,
      sessions: [
        { id: 's1', day: 1, dateLabel: 'Thứ 2', topic: 'Ôn tập 7 Hằng đẳng thức', subject: 'Toán học', durationMinutes: 30, completed: true },
        { id: 's2', day: 2, dateLabel: 'Thứ 3', topic: 'Luyện đề trắc nghiệm Phương trình', subject: 'Toán học', durationMinutes: 45, completed: true },
        { id: 's3', day: 3, dateLabel: 'Thứ 4', topic: 'Từ vựng Unit 2 — Life in the countryside', subject: 'Tiếng Anh', durationMinutes: 30, completed: false },
        { id: 's4', day: 4, dateLabel: 'Thứ 5', topic: 'Hình học: Định lý Talet trong tam giác', subject: 'Toán học', durationMinutes: 40, completed: false },
        { id: 's5', day: 5, dateLabel: 'Thứ 6', topic: 'Ngữ pháp Thì quá khứ tiếp diễn', subject: 'Tiếng Anh', durationMinutes: 35, completed: false }
      ]
    });

    // Seed Knowledge Map for Student
    this.knowledgeMap.set(studentUser.id, [
      { id: 'k1', subject: 'Toán học', chapter: 'Chương 1: Phép nhân chia đa thức', title: 'Hằng đẳng thức đáng nhớ', masteryPercent: 92, confidence: 'high', lastStudied: 'Hôm qua', recommendation: 'Thành thạo tốt, tiếp tục duy trì' },
      { id: 'k2', subject: 'Toán học', chapter: 'Chương 2: Phân thức đại số', title: 'Rút gọn phân thức', masteryPercent: 78, confidence: 'medium', lastStudied: '3 ngày trước', recommendation: 'Làm thêm 5 bài tập về mẫu thức chung' },
      { id: 'k3', subject: 'Toán học', chapter: 'Chương 3: Phương trình bậc nhất', title: 'Phương trình chứa ẩn ở mẫu', masteryPercent: 54, confidence: 'low', lastStudied: '5 ngày trước', recommendation: 'Cần ôn thêm điều kiện xác định và quy đồng khử mẫu' },
      { id: 'k4', subject: 'Tiếng Anh', chapter: 'Grammar', title: 'Passive Voice (Câu bị động)', masteryPercent: 86, confidence: 'high', lastStudied: 'Hôm nay', recommendation: 'Vững vàng kiến thức cơ bản' },
      { id: 'k5', subject: 'Vật lý', chapter: 'Cơ học', title: 'Vận tốc và Chuyển động đều', masteryPercent: 68, confidence: 'medium', lastStudied: '2 ngày trước', recommendation: 'Ôn lại công thức v = s / t' }
    ]);

    // Seed Assignments
    this.assignments.set(studentUser.id, [
      { id: 'as1', title: 'Phiếu bài tập số 3: Phương trình bậc nhất', subject: 'Toán học', dueDate: 'Ngày mai, 23:59', completed: false, difficulty: 'medium', description: 'Hoàn thành 10 bài toán chuyển vế đổi dấu trong SGK trang 12.' },
      { id: 'as2', title: 'Viết đoạn văn ngắn về sở thích bằng tiếng Anh', subject: 'Tiếng Anh', dueDate: 'Thứ 6 tuần này', completed: false, difficulty: 'easy', description: 'Khoảng 80-100 từ sử dụng từ vựng Unit 1.' },
      { id: 'as3', title: 'Giải bài tập trắc nghiệm Định luật Ôm', subject: 'Vật lý', dueDate: 'Hôm qua', completed: true, score: 9.0, difficulty: 'medium', description: 'Đã hoàn thành và nộp đúng hạn.' }
    ]);
  }
}

export const db = new DatabaseStore();
