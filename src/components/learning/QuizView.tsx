import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Quiz, Question } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const { activeQuizId, setCurrentView, openAIWithPrompt, addToast } = useApp();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [activeQuizId]);

  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSubmitted, timeLeft]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const targetId = activeQuizId || 'quiz-math-8';
      const q = await api.getQuiz(targetId);
      setQuiz(q);
      setTimeLeft(q.timeLimitMinutes * 60);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setQuizResult(null);
      setCurrentIndex(0);
    } catch (err) {
      addToast('Không thể tải bài kiểm tra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const durationSeconds = quiz.timeLimitMinutes * 60 - timeLeft;
      const res = await api.submitQuiz(quiz.id, selectedAnswers, durationSeconds);
      setQuizResult(res);
      setIsSubmitted(true);
      addToast('Đã nộp bài kiểm tra thành công!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Lỗi nộp bài', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-600">Đang chuẩn bị đề kiểm tra...</p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Bar: Back, Quiz Title & Timer */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setCurrentView('learning')}
          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <div className="text-center">
          <h2 className="font-bold text-neutral-900 text-sm sm:text-base">{quiz.title}</h2>
          <span className="text-xs text-neutral-500">{quiz.subject} • {quiz.grade}</span>
        </div>

        {!isSubmitted ? (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            timeLeft < 180 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-neutral-100 text-neutral-700 border-neutral-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
        ) : (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Đã hoàn thành
          </span>
        )}
      </div>

      {/* RESULT VIEW (if submitted) */}
      {isSubmitted && quizResult ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          
          {/* Result Card */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900">Kết quả bài làm của bạn</h3>
            <p className="text-4xl font-black text-blue-600 mt-2 tracking-tight">
              {quizResult.score} <span className="text-lg font-bold text-neutral-400">/ 10</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-neutral-500">
              <span>Độ sẵn sàng kỳ thi: <strong className="text-neutral-900">{quizResult.examReadinessScore}%</strong></span>
              <span>•</span>
              <span>Thời gian: <strong className="text-neutral-900">{Math.round(quizResult.durationSeconds)}s</strong></span>
            </div>

            {/* AI Pedagogical Recommendation */}
            <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-left">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Lời khuyên từ Trợ lý AI:</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {quizResult.aiRecommendation}
              </p>
            </div>

            {/* Strengths & Weaknesses Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm bạn làm rất tốt:</span>
                </p>
                <p className="text-emerald-800">{quizResult.strongTopics?.join(', ')}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <p className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chủ đề cần ôn luyện thêm:</span>
                </p>
                <p className="text-amber-800">
                  {quizResult.weakTopics?.length > 0 ? quizResult.weakTopics.join(', ') : 'Không có, bạn nắm rất vững!'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={loadQuiz}
                className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài này</span>
              </button>

              <button
                type="button"
                onClick={() => openAIWithPrompt(`Hãy phân tích chi tiết các câu sai trong bài kiểm tra ${quiz.title} và hướng dẫn mình giải lại từng câu.`)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI giải thích chi tiết đáp án</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ACTIVE QUESTION VIEW */
        <div className="space-y-6">
          
          {/* Question Navigation Bubbles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quiz.questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isAnswered
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold text-blue-600">Câu hỏi {currentIndex + 1} / {quiz.questions.length}</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-medium">{currentQ.topic}</span>
            </div>

            <p className="text-base sm:text-lg font-bold text-neutral-900 leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                const letter = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {letter}
                    </div>
                    <span className="text-sm font-medium text-neutral-800 flex-1">{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Action Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Câu trước</span>
            </button>

            {currentIndex < quiz.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                id="submit-quiz-btn"
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Nộp bài kiểm tra ({answeredCount}/{quiz.questions.length})</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
