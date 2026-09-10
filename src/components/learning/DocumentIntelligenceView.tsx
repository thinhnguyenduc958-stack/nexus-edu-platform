import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { FileText, Sparkles, UploadCloud, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const DocumentIntelligenceView: React.FC = () => {
  const { setCurrentView, openAIWithPrompt, setActiveQuizId, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDoc, setProcessedDoc] = useState<any>(null);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      addToast('Vui lòng nhập tiêu đề hoặc nội dung tài liệu', 'warning');
      return;
    }
    setIsProcessing(true);
    try {
      const doc = await api.processDocument(title || 'Tài liệu ôn tập', content);
      setProcessedDoc(doc);
      addToast('Đã phân tích tài liệu và tạo bộ câu hỏi tự động!', 'success');
    } catch (err: any) {
      addToast('Lỗi phân tích tài liệu', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
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
          <h2 className="font-bold text-neutral-900 text-base">Trí tuệ Tài liệu (Document Intelligence)</h2>
        </div>
      </div>

      {!processedDoc ? (
        <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Biến tài liệu học tập thành Quiz & Flashcard</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Dán nội dung bài học, đề cương hoặc tóm tắt sách giáo khoa. NEXUS AI sẽ tự động phân tích cấu trúc, trích xuất điểm cốt lõi và sinh bài trắc nghiệm ngay lập tức.
            </p>
          </div>

          <form onSubmit={handleProcess} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Tiêu đề tài liệu</label>
              <input
                type="text"
                placeholder="Ví dụ: Tóm tắt Sinh học 9 - Di truyền học Menđen"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nội dung bài học hoặc đề cương</label>
              <textarea
                rows={7}
                placeholder="Dán nội dung văn bản, các định lý, công thức hoặc ghi chú bài học vào đây..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'AI đang bóc tách kiến thức...' : 'Bóc tách & Tạo đề kiểm tra ngay'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã phân tích thành công</span>
            </div>

            <h3 className="text-xl font-bold text-neutral-900">{processedDoc.title}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              {processedDoc.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-2">Chương mục nhận diện được:</p>
                <ul className="text-xs text-neutral-700 space-y-1 list-disc pl-4">
                  {processedDoc.detectedChapters.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
                <p className="text-xs font-bold text-purple-900 mb-2">Chủ đề kiến thức trọng tâm:</p>
                <ul className="text-xs text-neutral-700 space-y-1 list-disc pl-4">
                  {processedDoc.detectedTopics.map((t: string, idx: number) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setActiveQuizId('quiz-math-8');
                  setCurrentView('quiz');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Làm bài Quiz được tạo từ tài liệu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setProcessedDoc(null)}
                className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Bóc tách tài liệu khác
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
