export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // Brand & Greeting
    appName: 'NEXUS EDU',
    tagline: 'Học tập thông minh cho mọi người.',
    greetingDefault: 'Chào bạn 👋',
    greetingNamed: (name: string) => `Chào ${name} 👋`,
    
    // Roles
    roleStudent: 'Học sinh',
    roleParent: 'Phụ huynh',
    roleTeacher: 'Giáo viên',
    roleAdmin: 'Quản trị viên',

    // Education Levels
    levelPreschool: 'Mầm non',
    levelPrimary: 'Tiểu học',
    levelMiddle: 'THCS',
    levelHighSchool: 'THPT',

    // Nav Items
    navHome: 'Trang chủ',
    navLearning: 'Học tập',
    navCreate: 'Tạo',
    navAI: 'AI',
    navProfile: 'Hồ sơ',
    navChildren: 'Con của tôi',
    navProgress: 'Tiến độ',
    navClasses: 'Lớp học',

    // Actions
    actionStudy: 'Học bài',
    actionHomework: 'Làm bài tập',
    actionAskAI: 'Hỏi AI',
    actionReview: 'Ôn lại',
    actionCreateAssignment: 'Tạo bài tập',
    actionCreateQuiz: 'Tạo quiz',
    actionCreateDeck: 'Tạo flashcard',
    actionStartFocus: 'Tập trung học',
    actionExamSimulator: 'Thi thử nghiệm',
    actionKnowledgeMap: 'Bản đồ tri thức',
    actionLinkAccount: 'Liên kết tài khoản',
    actionDeleteAccount: 'Xóa tài khoản',
    actionSignOut: 'Đăng xuất',
    actionSave: 'Lưu thay đổi',
    actionCancel: 'Hủy',
    actionSkip: 'Bỏ qua',
    actionContinue: 'Tiếp tục',
    actionRetry: 'Thử lại',
    actionSync: 'Đồng bộ',

    // Status
    statusOffline: 'Đang ngoại tuyến',
    statusSynced: 'Đã đồng bộ',
    statusSyncing: 'Đang lưu vào đám mây...',
    statusDemoMode: 'Chế độ Trải nghiệm (Demo)',
    
    // AI
    aiCoachDefaultName: 'AI Coach',
    aiPlaceholder: 'Hỏi AI điều gì đó...',
    aiHelpPrompt: 'Bạn muốn tôi giúp gì hôm nay?',
    aiExplainLesson: 'Giải thích bài học',
    aiGenerateHomework: 'Tạo bài tập',
    aiGenerateQuiz: 'Tạo trắc nghiệm',
    aiGenerateFlashcards: 'Tạo flashcard',
    aiCreateStudyPlan: 'Lập kế hoạch học',
    aiAnalyzeScore: 'Phân tích điểm',
    aiExamPrep: 'Ôn thi trọng tâm',
    aiAskQuestion: 'Hỏi bài trực tiếp',

    // Auth
    loginGoogle: 'Tiếp tục với Google',
    loginFacebook: 'Tiếp tục với Facebook',
    loginOr: 'hoặc',
    phoneNumber: 'Số điện thoại',
    email: 'Email',
    password: 'Mật khẩu',
    loginBtn: 'Đăng nhập',
    registerBtn: 'Đăng ký',
    noAccount: 'Chưa có tài khoản? Đăng ký',
    hasAccount: 'Đã có tài khoản? Đăng nhập',
    sendOtp: 'Gửi mã OTP',
    enterOtp: 'Nhập mã xác thực OTP',
    verifyOtp: 'Xác thực OTP',

    // Settings
    settingsTitle: 'Cài đặt',
    tabAccount: 'Tài khoản',
    tabLoginSecurity: 'Đăng nhập & Bảo mật',
    tabNotifications: 'Thông báo',
    tabLanguage: 'Ngôn ngữ',
    tabAppearance: 'Giao diện',
    tabAccessibility: 'Trợ năng',
    tabAI: 'Trợ lý AI',
    tabData: 'Dữ liệu',
    
    // Focus Mode
    focusTitle: 'Tập trung học',
    focusCompleted: 'Bạn đã hoàn thành 25 phút tập trung!',
  },
  en: {
    // Brand & Greeting
    appName: 'NEXUS EDU',
    tagline: 'Smart learning for everyone.',
    greetingDefault: 'Hello there 👋',
    greetingNamed: (name: string) => `Hello ${name} 👋`,

    // Roles
    roleStudent: 'Student',
    roleParent: 'Parent',
    roleTeacher: 'Teacher',
    roleAdmin: 'Administrator',

    // Education Levels
    levelPreschool: 'Preschool',
    levelPrimary: 'Primary School',
    levelMiddle: 'Middle School',
    levelHighSchool: 'High School',

    // Nav Items
    navHome: 'Home',
    navLearning: 'Learning',
    navCreate: 'Create',
    navAI: 'AI',
    navProfile: 'Profile',
    navChildren: 'My Children',
    navProgress: 'Progress',
    navClasses: 'Classes',

    // Actions
    actionStudy: 'Study Lesson',
    actionHomework: 'Assignments',
    actionAskAI: 'Ask AI',
    actionReview: 'Review',
    actionCreateAssignment: 'Create Assignment',
    actionCreateQuiz: 'Create Quiz',
    actionCreateDeck: 'Create Flashcards',
    actionStartFocus: 'Focus Mode',
    actionExamSimulator: 'Exam Simulator',
    actionKnowledgeMap: 'Knowledge Map',
    actionLinkAccount: 'Link Account',
    actionDeleteAccount: 'Delete Account',
    actionSignOut: 'Sign Out',
    actionSave: 'Save Changes',
    actionCancel: 'Cancel',
    actionSkip: 'Skip',
    actionContinue: 'Continue',
    actionRetry: 'Retry',
    actionSync: 'Sync',

    // Status
    statusOffline: 'Offline',
    statusSynced: 'Synced',
    statusSyncing: 'Saving to cloud...',
    statusDemoMode: 'Demo / Sandbox Mode',

    // AI
    aiCoachDefaultName: 'AI Coach',
    aiPlaceholder: 'Ask AI anything...',
    aiHelpPrompt: 'How can I assist your learning today?',
    aiExplainLesson: 'Explain Lesson',
    aiGenerateHomework: 'Generate Assignment',
    aiGenerateQuiz: 'Generate Quiz',
    aiGenerateFlashcards: 'Generate Flashcards',
    aiCreateStudyPlan: 'Create Study Plan',
    aiAnalyzeScore: 'Analyze Progress',
    aiExamPrep: 'Exam Preparation',
    aiAskQuestion: 'Ask a Question',

    // Auth
    loginGoogle: 'Continue with Google',
    loginFacebook: 'Continue with Facebook',
    loginOr: 'or',
    phoneNumber: 'Phone number',
    email: 'Email address',
    password: 'Password',
    loginBtn: 'Sign In',
    registerBtn: 'Sign Up',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',
    sendOtp: 'Send OTP Code',
    enterOtp: 'Enter OTP Code',
    verifyOtp: 'Verify OTP',

    // Settings
    settingsTitle: 'Settings',
    tabAccount: 'Account',
    tabLoginSecurity: 'Login & Security',
    tabNotifications: 'Notifications',
    tabLanguage: 'Language',
    tabAppearance: 'Appearance',
    tabAccessibility: 'Accessibility',
    tabAI: 'AI Assistant',
    tabData: 'Data',

    // Focus Mode
    focusTitle: 'Focus Session',
    focusCompleted: 'You completed a 25-minute focus session!',
  }
};
