import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Sparkles, BookOpen, Clock, HelpCircle, CheckSquare, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentView, openAIWithPrompt, setActiveQuizId } = useApp();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const quickActions = [
    {
      id: 'quiz-math-8',
      title: 'Kiểm tra 15 phút: Phương trình bậc nhất một ẩn',
      category: 'Bài kiểm tra',
      icon: CheckSquare,
      action: () => {
        setActiveQuizId('quiz-math-8');
        setCurrentView('quiz');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'flashcards',
      title: 'Ôn tập thẻ ghi nhớ: Công thức Toán 8 Đại số',
      category: 'Flashcards',
      icon: BookOpen,
      action: () => {
        setCurrentView('flashcards');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'focus-mode',
      title: 'Bắt đầu phiên học tập trung (25 phút Pomodoro)',
      category: 'Công cụ',
      icon: Clock,
      action: () => {
        setCurrentView('focus');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'ai-prompt-1',
      title: 'Hỏi AI: Giải thích lại phương trình bậc nhất một ẩn',
      category: 'AI Coach',
      icon: Sparkles,
      action: () => {
        setCommandPaletteOpen(false);
        openAIWithPrompt('Giải thích lại phương trình bậc nhất một ẩn với các ví dụ thực tế');
      }
    },
    {
      id: 'ai-prompt-2',
      title: 'Hỏi AI: Tạo 10 câu trắc nghiệm Toán lớp 5',
      category: 'AI Coach',
      icon: Sparkles,
      action: () => {
        setCommandPaletteOpen(false);
        openAIWithPrompt('Tạo 10 câu Toán lớp 5 về phân số và số thập phân');
      }
    }
  ];

  const filteredActions = quickActions.filter(
    a => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setCommandPaletteOpen(false);
    openAIWithPrompt(query.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <form onSubmit={handleCustomSubmit} className="flex items-center px-4 py-3 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            id="command-palette-input"
            autoFocus
            type="text"
            placeholder="Tìm bài học, trắc nghiệm hoặc ra lệnh cho AI..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-hidden text-base"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length > 0 ? (
            filteredActions.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-blue-100 text-neutral-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.title}</p>
                    <p className="text-xs text-neutral-500">{item.category}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div
              onClick={handleCustomSubmit}
              className="p-4 text-center cursor-pointer hover:bg-neutral-50 rounded-xl"
            >
              <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-900">Nhấn Enter để gửi lệnh cho AI:</p>
              <p className="text-xs text-neutral-500 italic mt-1">"{query}"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 flex justify-between">
          <span>Gợi ý: Nhập câu hỏi để AI giải thích ngay</span>
          <span>Phím ESC để đóng</span>
        </div>
      </div>
    </div>
  );
};
