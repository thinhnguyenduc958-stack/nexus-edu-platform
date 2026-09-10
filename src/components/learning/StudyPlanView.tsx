import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { StudyPlan } from '../../types';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowLeft,
  BookOpen,
  Check,
  Plus
} from 'lucide-react';

export const StudyPlanView: React.FC = () => {
  const { setCurrentView, openAIWithPrompt, addToast } = useApp();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const data = await api.getStudyPlan();
      setPlan(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (sessionId: string) => {
    try {
      const updated = await api.toggleStudySession(sessionId);
      setPlan(updated);
      addToast('Đã cập nhật phiên học tập!', 'success');
    } catch (err) {
      addToast('Lỗi cập nhật phiên học', 'error');
    }
  };

  if (loading || !plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-600">Đang tải kế hoạch học tập...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <h2 className="font-bold text-neutral-900 text-base">Kế hoạch học tập tuần</h2>
        </div>

        <button
          type="button"
          onClick={() => openAIWithPrompt('Hãy lập kế hoạch học tập 7 ngày giúp mình bám sát chương trình và chuẩn bị kiểm tra.')}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI tối ưu lại kế hoạch</span>
        </button>
      </div>

      {/* Goal & Progress Card */}
      <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Mục tiêu của tuần</span>
            <h3 className="text-lg font-bold text-neutral-900 mt-1">{plan.goal}</h3>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-blue-600">{plan.progressPercent}%</span>
            <p className="text-xs text-neutral-500">Hoàn thành</p>
          </div>
        </div>

        <div className="w-full bg-neutral-100 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${plan.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {plan.sessions.map(s => (
          <div
            key={s.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              s.completed
                ? 'bg-neutral-50/70 border-neutral-200 opacity-80'
                : 'bg-white border-neutral-200 hover:border-blue-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(s.id)}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  s.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-neutral-300 hover:border-blue-500 bg-white'
                }`}
              >
                {s.completed && <Check className="w-4 h-4" />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">{s.dateLabel}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                    {s.durationMinutes} phút
                  </span>
                </div>
                <p className={`text-sm mt-0.5 ${s.completed ? 'line-through text-neutral-500' : 'text-neutral-800'}`}>
                  {s.topic}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAIWithPrompt(`Hãy hướng dẫn mình học phần "${s.topic}" trong ${s.durationMinutes} phút này nhé.`)}
              className="p-2 rounded-xl text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Học phiên này cùng AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
