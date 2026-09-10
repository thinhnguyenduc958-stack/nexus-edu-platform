import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  BrainCircuit,
  Calendar,
  Clock,
  FileText,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LearningCenterView: React.FC = () => {
  const { setCurrentView, openAIWithPrompt, setActiveQuizId } = useApp();
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('all');

  const learningModules = [
    {
      id: 'quiz',
      title: 'Trắc nghiệm & Đề kiểm tra',
      desc: 'Luyện tập câu hỏi phân hóa có giải thích chi tiết và chấm điểm tức thì',
      icon: BrainCircuit,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => {
        setActiveQuizId('quiz-math-8');
        setCurrentView('quiz');
      }
    },
    {
      id: 'flashcards',
      title: 'Thẻ ghi nhớ (Flashcards)',
      desc: 'Phương pháp lặp lại ngắt quãng (Spaced Repetition) ghi nhớ kiến thức dài hạn',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => setCurrentView('flashcards')
    },
    {
      id: 'study_plan',
      title: 'Kế hoạch học tập 7 ngày',
      desc: 'Lịch học tự động phân bổ theo thời gian rảnh và mục tiêu thi cử',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => setCurrentView('study_plan')
    },
    {
      id: 'focus',
      title: 'Không gian tập trung (Pomodoro)',
      desc: '25 phút tập trung cao độ, không xao nhãng kèm âm thanh thư giãn',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      action: () => setCurrentView('focus')
    },
    {
      id: 'document_intel',
      title: 'Trí tuệ Tài liệu (Document Intel)',
      desc: 'Dán tài liệu hoặc đề cương để AI tự động trích xuất kiến thức và tạo quiz',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => setCurrentView('document_intel')
    },
    {
      id: 'knowledge_map',
      title: 'Bản đồ tri thức (Knowledge Map)',
      desc: 'Trực quan hóa mức độ hiểu bài, các lỗ hổng kiến thức và lộ trình học',
      icon: Compass,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      action: () => setCurrentView('knowledge_map')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Trung tâm Học tập</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Bộ công cụ học tập thông minh toàn diện được thiết kế riêng cho học sinh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAIWithPrompt('Hãy kiểm tra kiến thức tổng hợp của mình hôm nay bằng 5 câu hỏi nhanh.')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Hỏi nhanh AI Coach</span>
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {learningModules.map(mod => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={mod.action}
              className="p-6 rounded-3xl bg-white border border-neutral-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${mod.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-6 pt-4 border-t border-neutral-100 group-hover:translate-x-1 transition-transform">
                <span>Khám phá ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
