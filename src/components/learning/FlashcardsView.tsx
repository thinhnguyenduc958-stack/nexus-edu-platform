import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { FlashcardDeck, Flashcard } from '../../types';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { setCurrentView, openAIWithPrompt, addToast } = useApp();

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const data = await api.getFlashcardDecks();
      setDecks(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const currentDeck = decks[activeDeckIndex];
  const currentCard = currentDeck?.cards[currentCardIndex];

  const handleRating = async (rating: 'easy' | 'good' | 'hard') => {
    if (!currentDeck || !currentCard) return;
    try {
      await api.reviewFlashcard(currentDeck.id, currentCard.id, rating);
      addToast(
        rating === 'easy' ? 'Thẻ đã nắm vững!' : rating === 'good' ? 'Đang ghi nhớ tốt!' : 'Sẽ ôn lại sớm nhé!',
        'info'
      );
      setIsFlipped(false);
      // Next card
      if (currentCardIndex < currentDeck.cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
        addToast('Bạn đã hoàn thành 1 lượt ôn tập bộ thẻ này!', 'success');
      }
    } catch (err: any) {
      addToast('Lỗi lưu trạng thái', 'error');
    }
  };

  if (loading || !currentDeck) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Sparkles className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-neutral-600">Đang tải bộ thẻ ghi nhớ...</p>
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
            onClick={() => setCurrentView('learning')}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <h2 className="font-bold text-neutral-900 text-base">{currentDeck.title}</h2>
        </div>

        <button
          type="button"
          onClick={() => openAIWithPrompt(`Tạo thêm 5 thẻ flashcards về môn ${currentDeck.subject} ${currentDeck.grade}`)}
          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI tạo thẻ mới</span>
        </button>
      </div>

      {/* Deck Selector Tabs */}
      {decks.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {decks.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveDeckIndex(idx);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeDeckIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {d.title} ({d.cards.length})
            </button>
          ))}
        </div>
      )}

      {/* Flashcard Component with Flip Animation */}
      {currentCard && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>Thẻ {currentCardIndex + 1} / {currentDeck.cards.length}</span>
            <span className="font-medium text-blue-600">{currentCard.topic}</span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[280px] sm:min-h-[320px] bg-white rounded-3xl border-2 border-neutral-200 hover:border-blue-300 shadow-sm p-8 flex flex-col justify-between items-center text-center cursor-pointer transition-all select-none"
          >
            <div className="w-full flex justify-between items-center text-xs text-neutral-400">
              <span className="uppercase tracking-wider font-semibold">
                {isFlipped ? 'Đáp án & Diễn giải' : 'Câu hỏi / Khái niệm'}
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Chạm để lật</span>
              </span>
            </div>

            <div className="my-auto max-w-lg">
              <p className="text-xl sm:text-2xl font-bold text-neutral-900 leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-xs text-neutral-400">
              NEXUS Spaced Repetition (Lặp lại ngắt quãng)
            </div>
          </div>

          {/* Rating Controls (Easy / Good / Hard) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              id="fc-rating-hard"
              onClick={() => handleRating('hard')}
              className="py-3 rounded-2xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Chưa nhớ (Khó)
            </button>

            <button
              type="button"
              id="fc-rating-good"
              onClick={() => handleRating('good')}
              className="py-3 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Nhớ tàm tạm (Tốt)
            </button>

            <button
              type="button"
              id="fc-rating-easy"
              onClick={() => handleRating('easy')}
              className="py-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Đã thuộc lòng (Dễ)
            </button>
          </div>

          {/* Next / Prev Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentCardIndex === 0}
              onClick={() => {
                setCurrentCardIndex(prev => prev - 1);
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Thẻ trước</span>
            </button>

            <button
              type="button"
              disabled={currentCardIndex === currentDeck.cards.length - 1}
              onClick={() => {
                setCurrentCardIndex(prev => prev + 1);
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <span>Thẻ sau</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
