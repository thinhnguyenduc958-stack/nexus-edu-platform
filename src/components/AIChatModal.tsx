import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  X,
  Bot,
  User,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  structuredData?: any;
  recommendation?: string;
  timestamp: string;
}

export const AIChatModal: React.FC = () => {
  const {
    aiDrawerOpen,
    setAiDrawerOpen,
    aiPromptSeed,
    setAiPromptSeed,
    t,
    language,
    setCurrentView,
    setActiveQuizId,
    addToast
  } = useApp();

  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const assistantName = user?.aiAssistantName || t.aiCoachDefaultName;

  // Initialize speech recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Initial welcome message
  useEffect(() => {
    if (aiDrawerOpen && messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'ai',
          text: `${t.greetingDefault}\n${t.aiHelpPrompt}`,
          recommendation: 'Hãy chọn một hành động nhanh bên dưới hoặc gõ trực tiếp câu hỏi.',
          timestamp: 'Vừa xong'
        }
      ]);
    }
  }, [aiDrawerOpen]);

  // Seed prompt trigger
  useEffect(() => {
    if (aiPromptSeed && aiDrawerOpen) {
      handleSendMessage(aiPromptSeed);
      setAiPromptSeed('');
    }
  }, [aiPromptSeed, aiDrawerOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!aiDrawerOpen) return null;

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addToast('Trình duyệt chưa hỗ trợ Web Speech API hoặc chưa cấp quyền micro.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        addToast('Đang lắng nghe giọng nói...', 'info');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Vừa xong'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await api.askAI(query, language);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.text,
        structuredData: response.structuredData,
        recommendation: response.recommendation,
        timestamp: 'Vừa xong'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: 'AI đang gặp sự cố kết nối tạm thời. Vui lòng thử lại.',
          timestamp: 'Vừa xong'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Role-specific suggested action pills
  const getSuggestions = () => {
    if (user?.role === 'TEACHER') {
      return [
        'Tạo đề kiểm tra Toán lớp 8 45 phút',
        'Tạo 20 câu trắc nghiệm về phương trình bậc nhất',
        'Học sinh nào đang yếu phần này?',
        'Tạo bài tập về nhà cho lớp 8A'
      ];
    }
    if (user?.role === 'PARENT') {
      return [
        'Con tôi đang yếu môn nào?',
        'Tuần này con tôi học như thế nào?',
        'Hãy lập kế hoạch học Toán cho con tôi trong 7 ngày',
        'Con tôi đang gặp khó khăn ở chương nào?'
      ];
    }
    // Student
    if (user?.educationLevel === 'PRESCHOOL') {
      return ['Đọc cho bé nghe chuyện về chữ cái', 'Dạy bé đếm từ 1 đến 10', 'Bé thích các loài động vật'];
    }
    if (user?.educationLevel === 'PRIMARY') {
      return ['Tạo đề Toán lớp 5', 'Giải thích phân số', 'Kể một câu chuyện lịch sử ngắn', 'Học từ vựng tiếng Anh'];
    }
    return [
      'Giải thích bài học',
      'Tạo quiz trắc nghiệm',
      'Tạo flashcard ôn thi',
      'Lập kế hoạch học 7 ngày',
      'Phân tích điểm số',
      'Hỏi bài tập khó'
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl h-[85vh] sm:h-[700px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 text-base">{assistantName}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-xs text-neutral-500">
                Trợ lý AI sư phạm Nexus • {user?.role === 'STUDENT' ? 'Học tập cá nhân hóa' : user?.role === 'PARENT' ? 'Đồng hành cùng phụ huynh' : 'Trợ giảng thông minh'}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-ai-drawer-btn"
            onClick={() => setAiDrawerOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Structured Interactive Component if AI generated a Quiz / Task */}
                {msg.structuredData && (
                  <div className="mt-3 pt-3 border-t border-neutral-200/80 bg-white rounded-xl p-3 shadow-2xs border">
                    <p className="text-xs font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      {msg.structuredData.title || 'Nội dung kiến thức AI tạo'}
                    </p>

                    {msg.structuredData.questions && (
                      <div className="space-y-2 mt-2">
                        <p className="text-xs text-neutral-600">
                          Gồm {msg.structuredData.questions.length} câu hỏi trắc nghiệm đã sẵn sàng.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAiDrawerOpen(false);
                            setActiveQuizId('quiz-math-8');
                            setCurrentView('quiz');
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          <span>Làm bài quiz ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {msg.structuredData.weakTopics && (
                      <div className="mt-2 text-xs space-y-1 text-neutral-600">
                        <p className="font-semibold text-neutral-800">Chủ đề cần lưu ý:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {msg.structuredData.weakTopics.map((wt: string, idx: number) => (
                            <li key={idx} className="text-amber-700">{wt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Pedagogical Recommendation Badge */}
                {msg.recommendation && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-200/60 text-xs text-neutral-600 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{msg.recommendation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1">{assistantName} đang phân tích sư phạm...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Action Chips */}
        <div className="px-4 py-2 bg-neutral-50/60 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {getSuggestions().map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(sug)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-neutral-200 hover:border-blue-300 text-neutral-700 hover:text-blue-700 shrink-0 transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              id="ai-voice-mic-btn"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200'
              }`}
              title="Voice AI - Nói bằng giọng nói"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              id="ai-chat-input"
              type="text"
              placeholder={t.aiPlaceholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />

            {/* Send Button */}
            <button
              type="submit"
              id="ai-chat-send-btn"
              disabled={!input.trim() || isThinking}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
