import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { Assignment, Quiz, FlashcardDeck, StudyPlan, KnowledgeTopic } from '../../types';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ArrowRight,
  Play,
  BrainCircuit,
  Volume2,
  AlertTriangle,
  Compass,
  CheckSquare
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, greeting } = useAuth();
  const { t, setCurrentView, openAIWithPrompt, setActiveQuizId, uiComplexity, addToast } = useApp();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const level = user?.educationLevel || 'MIDDLE';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asg, qz, plan, knw] = await Promise.all([
        api.getAssignments(),
        api.getQuizzes(),
        api.getStudyPlan(),
        api.getKnowledgeMap()
      ]);
      setAssignments(asg);
      setQuizzes(qz);
      setStudyPlan(plan);
      setKnowledge(knw);
    } catch (err) {
      console.warn('Load student data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAssignment = async (id: string) => {
    try {
      const updated = await api.toggleAssignment(id);
      setAssignments(updated);
      addToast('Đã cập nhật trạng thái bài tập!', 'success');
    } catch (err: any) {
      addToast('Lỗi cập nhật', 'error');
    }
  };

  // ---------------- PRESCHOOL INTERFACE ----------------
  if (level === 'PRESCHOOL') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">
        
        {/* Playful Greeting Banner */}
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-center relative overflow-hidden">
          <span className="text-4xl mb-2 block">🌟</span>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight">{greeting}</h1>
          <p className="text-base text-amber-800 mt-1 font-medium">Bé ơi, hôm nay chúng mình cùng chơi gì nào?</p>
          
          <button
            type="button"
            onClick={() => openAIWithPrompt('Chào bé! Hãy kể cho bé nghe một câu chuyện về các con vật vui nhộn nhé.')}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-base shadow-md cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
            <span>Nghe AI Coach kể chuyện</span>
          </button>
        </div>

        {/* Large Child-Friendly Interactive Activity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { title: '🎨 Màu sắc kì diệu', color: 'bg-rose-50 border-rose-200 text-rose-800', desc: 'Nhận biết màu đỏ, vàng, xanh', icon: '🎨' },
            { title: '🔢 Số đếm vui nhộn', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', desc: 'Tập đếm ngón tay từ 1 đến 10', icon: '🔢' },
            { title: '🔤 Chữ cái xinh xắn', color: 'bg-blue-50 border-blue-200 text-blue-800', desc: 'Bảng chữ cái tiếng Việt & tiếng Anh', icon: '🔤' },
            { title: '🎵 Âm thanh thiên nhiên', color: 'bg-purple-50 border-purple-200 text-purple-800', desc: 'Tiếng kêu động vật và bài hát thiếu nhi', icon: '🎵' },
            { title: '🧩 Trò chơi ghép hình', color: 'bg-amber-50 border-amber-200 text-amber-800', desc: 'Rèn luyện sự tập trung và khéo léo', icon: '🧩' }
          ].map((act, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => openAIWithPrompt(`Dạy bé học chủ đề: ${act.title}. Dùng lời nói ngọt ngào, dễ thương và kèm câu hỏi đố vui nhé.`)}
              className={`p-6 rounded-3xl border-2 text-left shadow-2xs transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-4 ${act.color}`}
            >
              <span className="text-4xl shrink-0">{act.icon}</span>
              <div className="flex-1">
                <h3 className="text-lg font-black">{act.title}</h3>
                <p className="text-xs opacity-80 mt-1">{act.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- PRIMARY / MIDDLE / HIGH SCHOOL INTERFACE ----------------
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome & Quick AI Action Bar */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{greeting}</h1>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Chuỗi 5 ngày học</span>
            </div>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {level === 'PRIMARY'
              ? 'Hôm nay bạn muốn học bài gì cùng mình nào?'
              : 'Hãy hoàn thành mục tiêu học tập hôm nay để duy trì phong độ nhé.'}
          </p>
        </div>

        {/* 4 Quick Action Buttons required by spec */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="student-quick-study"
            onClick={() => setCurrentView('learning')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Học bài</span>
          </button>
          <button
            type="button"
            id="student-quick-homework"
            onClick={() => {
              if (quizzes.length > 0) {
                setActiveQuizId(quizzes[0].id);
                setCurrentView('quiz');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Làm bài tập</span>
          </button>
          <button
            type="button"
            id="student-quick-ask-ai"
            onClick={() => openAIWithPrompt('Hãy giải thích bài học hôm nay cho mình')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hỏi AI</span>
          </button>
          <button
            type="button"
            id="student-quick-review"
            onClick={() => setCurrentView('flashcards')}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Ôn lại</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Assignments & Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Assignments */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-neutral-900 text-base">Bài tập cần hoàn thành</h2>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {assignments.filter(a => !a.completed).length} bài chưa làm
              </span>
            </div>

            <div className="space-y-3">
              {assignments.map(as => (
                <div
                  key={as.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    as.completed
                      ? 'bg-neutral-50/60 border-neutral-200 opacity-75'
                      : 'bg-white border-neutral-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleAssignment(as.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        as.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-neutral-300 hover:border-blue-500 bg-white'
                      }`}
                    >
                      {as.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${as.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                        {as.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        <span className="px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-700 font-medium">
                          {as.subject}
                        </span>
                        <span>• Hạn nộp: {as.dueDate}</span>
                        {as.score && (
                          <span className="text-emerald-600 font-semibold">• Đạt {as.score}/10</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAIWithPrompt(`Hướng dẫn mình giải bài tập: "${as.title}" môn ${as.subject}`)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Hỏi AI gợi ý bài này"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quizzes & Practice Tests */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
                <h2 className="font-bold text-neutral-900 text-base">Bài kiểm tra & Trắc nghiệm rèn luyện</h2>
              </div>
              <button
                type="button"
                onClick={() => openAIWithPrompt('Tạo một bài kiểm tra trắc nghiệm 10 câu Toán học')}
                className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI tạo đề mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">
                      {quiz.subject} • {quiz.grade}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-900 mt-2 line-clamp-2">{quiz.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{quiz.timeLimitMinutes} phút • {quiz.questions.length} câu hỏi</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuizId(quiz.id);
                      setCurrentView('quiz');
                    }}
                    className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Làm bài ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* High School & Advanced Mode Special: Exam Simulator & Knowledge Map */}
          {(level === 'HIGH_SCHOOL' || uiComplexity === 'ADVANCED') && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-700" />
                  <h3 className="font-bold text-neutral-900 text-base">Công cụ nâng cao (Exam Simulator & Knowledge)</h3>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  Sẵn sàng kỳ thi: 82%
                </span>
              </div>
              <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                Mô phỏng phòng thi thật với thời gian đếm ngược nghiêm ngặt, thống kê điểm yếu và đo lường mức độ sẵn sàng cho kỳ thi THPT & Đại học.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuizId('quiz-math-8');
                    setCurrentView('quiz');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Vào thi thử chuẩn hóa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('knowledge_map')}
                  className="px-4 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Xem Bản đồ tri thức</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Study Plan, Weak Subjects & Focus Mode */}
        <div className="space-y-6">
          
          {/* Study Plan Session Card */}
          {studyPlan && (
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-neutral-900 text-sm">Kế hoạch học tập tuần này</h3>
                <span className="text-xs font-bold text-blue-600">{studyPlan.progressPercent}%</span>
              </div>
              
              <div className="w-full bg-neutral-100 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${studyPlan.progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-neutral-500 mb-3 italic">Mục tiêu: {studyPlan.goal}</p>

              <div className="space-y-2">
                {studyPlan.sessions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100 last:border-0">
                    <span className="font-medium text-neutral-700">{s.dateLabel}: {s.topic}</span>
                    <span className={s.completed ? 'text-emerald-600 font-bold' : 'text-neutral-400'}>
                      {s.completed ? '✓ Xong' : `${s.durationMinutes}p`}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentView('study_plan')}
                className="mt-3 w-full py-1.5 text-xs text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1"
              >
                <span>Xem toàn bộ kế hoạch</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Weakness Detection Card */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm">Chủ đề cần củng cố thêm</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">
              AI phát hiện bạn gặp bỡ ngỡ ở phần: <strong>Phương trình chứa ẩn ở mẫu</strong>.
            </p>
            <button
              type="button"
              onClick={() => openAIWithPrompt('Hãy giải thích thật dễ hiểu phương pháp tìm điều kiện xác định và giải phương trình chứa ẩn ở mẫu')}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ôn 15 phút cùng AI Coach</span>
            </button>
          </div>

          {/* Focus Mode Quick Launch */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-neutral-900">Không gian tập trung (Focus Mode)</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-3">
              Kỹ thuật Pomodoro 25 phút không xao nhãng để tối ưu hóa hiệu quả tiếp thu.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('focus')}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Bắt đầu 25:00
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
