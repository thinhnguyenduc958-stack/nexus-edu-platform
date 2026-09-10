import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db';
import { processUnifiedAI } from './server/gemini';
import { UserProfile, AuthProviderType } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get authenticated user (or fallback to active demo user)
function getAuthUser(req: express.Request): UserProfile {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const user = db.users.get(token);
    if (user) return user;
  }
  // Default to student-demo-1 or first available user
  return db.users.get('student-demo-1') || Array.from(db.users.values())[0];
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'NEXUS EDU',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Auth: Current User
app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  res.json({ success: true, user });
});

// Auth: Switch / Demo user login
app.post('/api/auth/demo-switch', (req, res) => {
  const { role } = req.body;
  let targetUser: UserProfile | undefined;
  for (const u of db.users.values()) {
    if (u.role === role) {
      targetUser = u;
      break;
    }
  }
  if (!targetUser) {
    targetUser = Array.from(db.users.values())[0];
  }
  res.json({ success: true, user: targetUser, token: targetUser.id });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, phone, role = 'STUDENT', educationLevel = 'MIDDLE', displayName = '' } = req.body;
  const newId = 'user-' + Math.random().toString(36).substring(2, 9);
  
  const connectedAccounts: { provider: AuthProviderType; identifier: string; connectedAt: string }[] = [];
  if (email) connectedAccounts.push({ provider: 'email', identifier: email, connectedAt: new Date().toISOString() });
  if (phone) connectedAccounts.push({ provider: 'phone', identifier: phone, connectedAt: new Date().toISOString() });

  const newUser: UserProfile = {
    id: newId,
    email: email || undefined,
    phone: phone || undefined,
    displayName: displayName.trim() || undefined,
    role,
    educationLevel,
    aiAssistantName: 'AI Coach',
    uiComplexity: educationLevel === 'PRESCHOOL' || educationLevel === 'PRIMARY' ? 'SIMPLE' : 'STANDARD',
    connectedAccounts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.set(newId, newUser);
  res.json({ success: true, user: newUser, token: newId });
});

// Auth: Login with Email or Phone
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  // Search users
  for (const user of db.users.values()) {
    if (user.email === identifier || user.phone === identifier) {
      return res.json({ success: true, user, token: user.id });
    }
  }
  // If not found in demo, create or fallback to student
  const defaultUser = Array.from(db.users.values())[0];
  res.json({ success: true, user: defaultUser, token: defaultUser.id });
});

// Auth: Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });
  }

  // Generate 6-digit OTP
  const otpCode = '123456'; // Standard development OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  db.otpStore.set(phone, { code: otpCode, expiresAt, retries: 0 });

  res.json({
    success: true,
    message: 'Mã OTP đã được gửi đến số điện thoại ' + phone,
    devHint: 'Mã OTP dùng thử: 123456 (hết hạn sau 5 phút)'
  });
});

// Auth: Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, isLinking } = req.body;
  const stored = db.otpStore.get(phone);

  if (!stored || Date.now() > stored.expiresAt) {
    return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
  }

  if (otp !== stored.code && otp !== '123456') {
    stored.retries += 1;
    return res.status(400).json({ error: 'Mã OTP không chính xác. Vui lòng thử lại.' });
  }

  // OTP is verified
  db.otpStore.delete(phone);

  // If linking to current user
  if (isLinking) {
    const user = getAuthUser(req);
    user.phone = phone;
    if (!user.connectedAccounts.some(acc => acc.provider === 'phone')) {
      user.connectedAccounts.push({ provider: 'phone', identifier: phone, connectedAt: new Date().toISOString() });
    }
    user.updatedAt = new Date().toISOString();
    return res.json({ success: true, message: 'Đã liên kết số điện thoại thành công.', user });
  }

  // Else login/create
  for (const u of db.users.values()) {
    if (u.phone === phone) {
      return res.json({ success: true, user: u, token: u.id });
    }
  }

  // Create new user with phone
  const newId = 'user-phone-' + Math.random().toString(36).substring(2, 8);
  const newUser: UserProfile = {
    id: newId,
    phone,
    displayName: undefined, // "Chào bạn 👋"
    role: 'STUDENT',
    educationLevel: 'MIDDLE',
    aiAssistantName: 'AI Coach',
    uiComplexity: 'STANDARD',
    connectedAccounts: [{ provider: 'phone', identifier: phone, connectedAt: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.users.set(newId, newUser);
  res.json({ success: true, user: newUser, token: newId });
});

// Auth: OAuth connect / login (Google / Facebook)
app.post('/api/auth/oauth-connect', (req, res) => {
  const { provider, email, name, isLinking } = req.body;
  const currentUser = getAuthUser(req);

  if (isLinking && currentUser) {
    // Add account to current user if not already linked
    if (!currentUser.connectedAccounts.some(acc => acc.provider === provider)) {
      currentUser.connectedAccounts.push({
        provider,
        identifier: email || `${provider}-account@nexus.edu.vn`,
        connectedAt: new Date().toISOString()
      });
      currentUser.updatedAt = new Date().toISOString();
    }
    return res.json({ success: true, user: currentUser, message: `Đã liên kết tài khoản ${provider} thành công.` });
  }

  // Find existing by email
  for (const u of db.users.values()) {
    if (u.email === email || u.connectedAccounts.some(acc => acc.provider === provider && acc.identifier === email)) {
      return res.json({ success: true, user: u, token: u.id });
    }
  }

  // Create new account
  const newId = `user-${provider}-${Math.random().toString(36).substring(2, 8)}`;
  const newUser: UserProfile = {
    id: newId,
    email: email || `${provider}-user@nexus.edu.vn`,
    displayName: name || undefined,
    role: 'STUDENT',
    educationLevel: 'PRIMARY',
    aiAssistantName: 'AI Coach',
    uiComplexity: 'SIMPLE',
    connectedAccounts: [
      { provider, identifier: email || `${provider}-user@nexus.edu.vn`, connectedAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.users.set(newId, newUser);
  res.json({ success: true, user: newUser, token: newId });
});

// Update Profile
app.post('/api/users/profile', (req, res) => {
  const user = getAuthUser(req);
  const { displayName, aiAssistantName, role, educationLevel, uiComplexity } = req.body;

  if (displayName !== undefined) user.displayName = displayName.trim() || undefined;
  if (aiAssistantName !== undefined) user.aiAssistantName = aiAssistantName.trim() || 'AI Coach';
  if (role) user.role = role;
  if (educationLevel) user.educationLevel = educationLevel;
  if (uiComplexity) user.uiComplexity = uiComplexity;
  user.updatedAt = new Date().toISOString();

  res.json({ success: true, user });
});

// Delete Account
app.post('/api/auth/delete-account', (req, res) => {
  const user = getAuthUser(req);
  db.users.delete(user.id);
  db.childrenMap.delete(user.id);
  db.flashcardDecks.delete(user.id);
  db.studyPlans.delete(user.id);
  db.knowledgeMap.delete(user.id);
  res.json({ success: true, message: 'Tài khoản và toàn bộ dữ liệu đã được xóa an toàn.' });
});

// Classes: Get teacher classes or student enrolled
app.get('/api/classes', (req, res) => {
  const user = getAuthUser(req);
  const classes = Array.from(db.classes.values());
  if (user.role === 'TEACHER') {
    res.json({ success: true, classes: classes.filter(c => c.teacherId === user.id) });
  } else {
    // Return all enrolled or available classes
    res.json({ success: true, classes });
  }
});

// Classes: Create Class (Teacher)
app.post('/api/classes', (req, res) => {
  const user = getAuthUser(req);
  const { name, grade, subject } = req.body;
  const newClassCode = (subject.substring(0, 4) + grade.replace(/\D/g, '') + Math.floor(Math.random() * 90 + 10)).toUpperCase();
  const newClass: any = {
    id: 'class-' + Math.random().toString(36).substring(2, 8),
    code: newClassCode,
    name: name || `Lớp học ${subject} ${grade}`,
    grade: grade || 'Lớp 8',
    subject: subject || 'Toán học',
    teacherId: user.id,
    teacherName: user.displayName || 'Giáo viên',
    studentCount: 1,
    students: [{ id: 'st-default', name: 'Nguyễn Đức Thịnh', progress: 85 }],
    assignmentsCount: 2,
    averageScore: 8.0
  };
  db.classes.set(newClass.id, newClass);
  res.json({ success: true, classInfo: newClass });
});

// Classes: Join Class (Student)
app.post('/api/classes/join', (req, res) => {
  const user = getAuthUser(req);
  const { code } = req.body;
  let targetClass: any = null;
  for (const c of db.classes.values()) {
    if (c.code.toUpperCase() === (code || '').trim().toUpperCase()) {
      targetClass = c;
      break;
    }
  }
  if (!targetClass) {
    return res.status(404).json({ error: 'Không tìm thấy lớp học với mã này.' });
  }
  if (!targetClass.students.some((s: any) => s.id === user.id)) {
    targetClass.students.push({
      id: user.id,
      name: user.displayName || 'Học sinh',
      progress: 75
    });
    targetClass.studentCount = targetClass.students.length;
  }
  res.json({ success: true, classInfo: targetClass, message: `Bạn đã tham gia lớp ${targetClass.name} thành công!` });
});

// Parent: Get Children
app.get('/api/parent/children', (req, res) => {
  const user = getAuthUser(req);
  const children = db.childrenMap.get(user.id) || [
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
    }
  ];
  res.json({ success: true, children });
});

// Parent: Link Child
app.post('/api/parent/children/link', (req, res) => {
  const user = getAuthUser(req);
  const { inviteCode, childName, grade } = req.body;
  const currentChildren = db.childrenMap.get(user.id) || [];
  const newChild = {
    id: 'child-' + Math.random().toString(36).substring(2, 7),
    displayName: childName || 'Con yêu',
    grade: grade || 'Lớp 6',
    educationLevel: 'MIDDLE' as const,
    progressPercent: 72,
    streakDays: 2,
    weakSubjects: ['Đại số'],
    strongSubjects: ['Ngữ văn'],
    recentQuizScores: [8, 8.5],
    lastActive: 'Vừa xong'
  };
  currentChildren.push(newChild);
  db.childrenMap.set(user.id, currentChildren);
  res.json({ success: true, child: newChild, message: 'Đã liên kết tài khoản con thành công!' });
});

// Quizzes: Get All
app.get('/api/quizzes', (req, res) => {
  const quizzes = Array.from(db.quizzes.values());
  res.json({ success: true, quizzes });
});

// Quizzes: Get by ID
app.get('/api/quizzes/:id', (req, res) => {
  const quiz = db.quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz không tồn tại.' });
  res.json({ success: true, quiz });
});

// Quizzes: Submit Attempt
app.post('/api/quizzes/:id/submit', (req, res) => {
  const user = getAuthUser(req);
  const quiz = db.quizzes.get(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz không tồn tại.' });

  const { answers, durationSeconds = 120 } = req.body;
  let correctCount = 0;
  const weakTopics: string[] = [];
  const strongTopics: string[] = [];

  quiz.questions.forEach((q, index) => {
    const userAns = answers[index];
    if (userAns === q.correctAnswer) {
      correctCount++;
      if (!strongTopics.includes(q.topic)) strongTopics.push(q.topic);
    } else {
      if (!weakTopics.includes(q.topic)) weakTopics.push(q.topic);
    }
  });

  const scoreOutOfTen = Math.round((correctCount / quiz.questions.length) * 10 * 10) / 10;
  const readinessPercent = Math.min(100, Math.round((correctCount / quiz.questions.length) * 100));

  let aiRec = 'Bạn đã nắm rất vững kiến thức!';
  if (weakTopics.length > 0) {
    aiRec = `Bạn nên ôn thêm chủ đề "${weakTopics[0]}" trong khoảng 15-20 phút trước khi thử sức lại để nâng cao kết quả nhé.`;
  }

  const result = {
    quizId: quiz.id,
    score: scoreOutOfTen,
    totalQuestions: quiz.questions.length,
    durationSeconds,
    strongTopics: strongTopics.length > 0 ? strongTopics : ['Kiến thức tổng hợp'],
    weakTopics,
    aiRecommendation: aiRec,
    examReadinessScore: readinessPercent,
    completedAt: new Date().toISOString()
  };

  const userAttempts = db.quizAttempts.get(user.id) || [];
  userAttempts.push(result);
  db.quizAttempts.set(user.id, userAttempts);

  res.json({ success: true, result });
});

// Flashcards: Get Decks
app.get('/api/flashcards', (req, res) => {
  const user = getAuthUser(req);
  const decks = db.flashcardDecks.get(user.id) || [];
  res.json({ success: true, decks });
});

// Flashcards: Update Review State
app.post('/api/flashcards/:deckId/card/:cardId/review', (req, res) => {
  const user = getAuthUser(req);
  const { deckId, cardId } = req.params;
  const { rating } = req.body; // 'easy' | 'good' | 'hard'

  const decks = db.flashcardDecks.get(user.id) || [];
  const deck = decks.find(d => d.id === deckId);
  if (deck) {
    const card = deck.cards.find(c => c.id === cardId);
    if (card) {
      if (rating === 'easy') card.reviewState = 'mastered';
      else if (rating === 'good') card.reviewState = 'learning';
      else card.reviewState = 'new';
    }
  }
  res.json({ success: true, message: 'Đã lưu trạng thái ôn tập.' });
});

// Study Plans: Get
app.get('/api/study-plans', (req, res) => {
  const user = getAuthUser(req);
  const plan = db.studyPlans.get(user.id);
  res.json({ success: true, plan });
});

// Study Plans: Toggle Session
app.post('/api/study-plans/session/:sessionId/toggle', (req, res) => {
  const user = getAuthUser(req);
  const plan = db.studyPlans.get(user.id);
  if (plan) {
    const session = plan.sessions.find(s => s.id === req.params.sessionId);
    if (session) {
      session.completed = !session.completed;
      const completedCount = plan.sessions.filter(s => s.completed).length;
      plan.progressPercent = Math.round((completedCount / plan.sessions.length) * 100);
    }
  }
  res.json({ success: true, plan });
});

// Knowledge Map: Get
app.get('/api/knowledge-map', (req, res) => {
  const user = getAuthUser(req);
  const topics = db.knowledgeMap.get(user.id) || [];
  res.json({ success: true, topics });
});

// Assignments: Get
app.get('/api/assignments', (req, res) => {
  const user = getAuthUser(req);
  const assignments = db.assignments.get(user.id) || [];
  res.json({ success: true, assignments });
});

// Assignments: Toggle
app.post('/api/assignments/:id/toggle', (req, res) => {
  const user = getAuthUser(req);
  const assignments = db.assignments.get(user.id) || [];
  const as = assignments.find(a => a.id === req.params.id);
  if (as) {
    as.completed = !as.completed;
    if (as.completed && !as.score) as.score = 9.5;
  }
  res.json({ success: true, assignments });
});

// Document Intelligence: Extract & Generate Knowledge
app.post('/api/documents/process', async (req, res) => {
  const user = getAuthUser(req);
  const { title = 'Tài liệu học tập', content = '' } = req.body;

  const docResult = {
    id: 'doc-' + Math.random().toString(36).substring(2, 7),
    title,
    summary: `Tài liệu "${title}" tóm tắt các khái niệm cốt lõi, công thức áp dụng thực tế và sơ đồ tư duy liên kết bài học.`,
    detectedChapters: ['Chương 1: Tổng quan lý thuyết', 'Chương 2: Phương pháp giải bài tập'],
    detectedTopics: ['Khái niệm cơ bản', 'Công thức quan trọng', 'Các bẫy sai lầm thường gặp'],
    generatedQuiz: {
      id: 'quiz-from-doc',
      title: `Trắc nghiệm ôn tập: ${title}`,
      subject: 'Tổng hợp',
      grade: user.educationLevel,
      difficulty: 'medium' as const,
      timeLimitMinutes: 10,
      questions: [
        {
          id: 'dq1',
          type: 'multiple_choice' as const,
          question: `Trọng tâm chính của tài liệu "${title}" là gì?`,
          options: ['Nắm vững định nghĩa & công thức', 'Học vẹt không cần hiểu', 'Bỏ qua các ví dụ', 'Chỉ làm bài nâng cao'],
          correctAnswer: 0,
          explanation: 'Tài liệu hướng dẫn nắm vững bản chất cốt lõi của bài học.',
          topic: 'Kiến thức cốt lõi',
          difficulty: 'easy' as const
        }
      ]
    },
    generatedCards: [
      {
        id: 'fc-doc-1',
        deckId: 'deck-doc',
        front: `Điểm mấu chốt trong: ${title}`,
        back: 'Hiểu bản chất vấn đề, tự suy luận lại công thức và luyện tập từ dễ đến khó.',
        topic: 'Ghi nhớ trọng tâm',
        difficulty: 'easy' as const,
        reviewState: 'new' as const,
        nextReviewDate: new Date().toISOString()
      }
    ]
  };

  const userDocs = db.documents.get(user.id) || [];
  userDocs.unshift(docResult);
  db.documents.set(user.id, userDocs);

  res.json({ success: true, document: docResult });
});

// Unified NEXUS AI Router
app.post('/api/ai/router', async (req, res) => {
  try {
    const user = getAuthUser(req);
    const { prompt, language = 'vi' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    const effectiveRole: 'STUDENT' | 'PARENT' | 'TEACHER' =
      user.role === 'PARENT' ? 'PARENT' : user.role === 'TEACHER' ? 'TEACHER' : 'STUDENT';

    const aiResult = await processUnifiedAI({
      role: effectiveRole,
      educationLevel: user.educationLevel,
      prompt,
      language
    });

    res.json({ success: true, result: aiResult });
  } catch (error: any) {
    res.status(500).json({ error: 'AI đang gặp sự cố tạm thời. Vui lòng thử lại sau.' });
  }
});

// ---------------- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS EDU Server running on port ${PORT}`);
  });
}

startServer();
