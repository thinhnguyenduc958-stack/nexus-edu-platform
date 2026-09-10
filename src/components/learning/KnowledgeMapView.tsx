import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { KnowledgeTopic } from '../../types';
import { Compass, Sparkles, ArrowLeft, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export const KnowledgeMapView: React.FC = () => {
  const { setCurrentView, openAIWithPrompt, setActiveQuizId } = useApp();

  const [topics, setTopics] = useState<KnowledgeTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMap();
  }, []);

  const loadMap = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeMap();
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0]);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('learning')}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <h2 className="font-bold text-neutral-900 text-base">Bản đồ tri thức (Knowledge Map)</h2>
        </div>

        <button
          type="button"
          onClick={() => openAIWithPrompt('Hãy phân tích toàn bộ cây kiến thức môn Toán 8 và chỉ ra lộ trình học tối ưu nhất cho mình.')}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI phân tích lộ trình</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Topics List */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Các chủ đề cốt lõi</p>
          {topics.map(t => {
            const isSelected = selectedTopic?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-2xs font-bold text-blue-900'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800'
                }`}
              >
                <div>
                  <p className="text-sm">{t.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{t.subject} • {t.grade}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-600">{t.masteryPercent}%</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Topic Details & Prerequisite Tree */}
        <div className="md:col-span-2">
          {selectedTopic ? (
            <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {selectedTopic.subject} • {selectedTopic.grade}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 mt-1">{selectedTopic.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600">{selectedTopic.masteryPercent}%</span>
                  <p className="text-xs text-neutral-500">Mức độ thông hiểu</p>
                </div>
              </div>

              <div className="w-full bg-neutral-100 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${selectedTopic.masteryPercent}%` }}
                />
              </div>

              {/* Prerequisites */}
              {selectedTopic.prerequisites.length > 0 && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <p className="text-xs font-bold text-neutral-700">Kiến thức nền tảng (Tiên quyết):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.prerequisites.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-700 font-medium"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps Drill */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <p className="text-xs text-neutral-600">
                  {selectedTopic.masteryPercent >= 80
                    ? 'Bạn đã làm chủ chủ đề này rất tốt! Hãy thử thách với các bài toán vận dụng cao.'
                    : 'Hãy ôn tập thêm các ví dụ thực tế và làm bài kiểm tra ngắn để nâng mức độ thông hiểu lên trên 85%.'}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuizId('quiz-math-8');
                      setCurrentView('quiz');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Làm bài tập luyện tập chủ đề này
                  </button>
                  <button
                    type="button"
                    onClick={() => openAIWithPrompt(`Hãy giảng giải chi tiết và đưa ra 3 ví dụ tiêu biểu về chủ đề "${selectedTopic.name}"`)}
                    className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Hỏi AI hướng dẫn
                  </button>
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
};
