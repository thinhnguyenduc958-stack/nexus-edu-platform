import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { ChildInfo } from '../../types';
import {
  Users,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Flame,
  Calendar,
  BookOpen,
  Award,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { greeting } = useAuth();
  const { t, openAIWithPrompt, addToast } = useApp();

  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('Lớp 6');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const data = await api.getChildren();
      setChildren(data);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    try {
      const newChild = await api.linkChild({ childName, grade: childGrade });
      setChildren(prev => [...prev, newChild]);
      setShowAddChildModal(false);
      setChildName('');
      addToast(`Đã liên kết hồ sơ của ${childName}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Lỗi liên kết tài khoản con', 'error');
    }
  };

  const currentChild = children[activeChildIndex] || children[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Header */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{greeting}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Bảng điều khiển đồng hành học tập cùng con. Dữ liệu tiến độ được cập nhật liên tục.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddChildModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm / Liên kết con</span>
        </button>
      </div>

      {/* Children Tabs (if multiple children) */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => setActiveChildIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeChildIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              👦 {child.displayName} ({child.grade})
            </button>
          ))}
        </div>
      )}

      {currentChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2 Cols: Child Profile & Progress Analytics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Card */}
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl">
                    👦
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">{currentChild.displayName}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                      {currentChild.grade} • Hoạt động lần cuối: {currentChild.lastActive}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Chuỗi {currentChild.streakDays} ngày học</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs font-medium text-neutral-500">Tiến độ chương trình</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{currentChild.progressPercent}%</p>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${currentChild.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs font-medium text-neutral-500">Điểm kiểm tra trung bình</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {(currentChild.recentQuizScores.reduce((a, b) => a + b, 0) / currentChild.recentQuizScores.length).toFixed(1)}/10
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-2">Dựa trên 4 bài kiểm tra gần nhất</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <p className="text-xs font-medium text-neutral-500">Trạng thái rèn luyện</p>
                  <p className="text-sm font-bold text-neutral-900 mt-2 flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Học đều đặn mỗi ngày</span>
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Hoàn thành bài tập đúng hạn</p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Weak Subjects Card */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-amber-950 text-sm">Chủ đề cần phụ huynh động viên thêm</h3>
                </div>
                <div className="space-y-2">
                  {currentChild.weakSubjects.map((subject, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-neutral-800">{subject}</span>
                      <button
                        type="button"
                        onClick={() => openAIWithPrompt(`Phụ huynh cần làm gì để giúp con học tốt phần "${subject}"? Hãy đưa ra 3 lời khuyên ngắn gọn, tâm lý và tích cực.`)}
                        className="text-amber-800 hover:underline font-medium flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI tư vấn cách dạy</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strong Subjects Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-emerald-950 text-sm">Điểm sáng nổi trội của con</h3>
                </div>
                <div className="space-y-2">
                  {currentChild.strongSubjects.map((subject, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/90 border border-emerald-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-neutral-800">{subject}</span>
                      <span className="text-emerald-700 font-bold text-[11px]">Nắm rất vững ★</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right 1 Col: AI Supportive Queries for Parents */}
          <div className="space-y-6">
            
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Hỏi nhanh AI về tình hình của con</h3>
              </div>
              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                NEXUS AI đồng hành cùng bố mẹ giải đáp băn khoăn về tâm lý, phương pháp dạy học tại nhà.
              </p>

              <div className="space-y-2">
                {[
                  'Con tôi đang yếu môn nào?',
                  'Tuần này con tôi học như thế nào?',
                  'Hãy lập kế hoạch học Toán cho con tôi trong 7 ngày',
                  'Làm sao để giúp con tập trung làm bài tập?'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openAIWithPrompt(prompt)}
                    className="w-full text-left p-3 rounded-xl border border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-neutral-700 hover:text-blue-700 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Healthy Advice Note */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <p className="font-semibold text-neutral-800">💡 Lời khuyên giáo dục tích cực:</p>
              <p>
                Hãy dành 10 phút sau bữa tối để lắng nghe con kể về bài học con thấy thích nhất thay vì chỉ hỏi về điểm số. Sự khích lệ là động lực lớn nhất giúp con tiến bộ.
              </p>
            </div>

          </div>

        </div>
      ) : null}

      {/* Add / Link Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-md animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Thêm / Liên kết tài khoản con</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Nhập tên và lớp học của con để hệ thống đồng bộ dữ liệu bài tập và điểm số.
            </p>

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tên của con</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: An, Minh, Linh..."
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Khối lớp</label>
                <select
                  value={childGrade}
                  onChange={e => setChildGrade(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden"
                >
                  <option value="Mầm non">Mầm non (3-5 tuổi)</option>
                  <option value="Lớp 1">Lớp 1</option>
                  <option value="Lớp 2">Lớp 2</option>
                  <option value="Lớp 3">Lớp 3</option>
                  <option value="Lớp 4">Lớp 4</option>
                  <option value="Lớp 5">Lớp 5</option>
                  <option value="Lớp 6">Lớp 6</option>
                  <option value="Lớp 7">Lớp 7</option>
                  <option value="Lớp 8">Lớp 8</option>
                  <option value="Lớp 9">Lớp 9</option>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 12">Lớp 12</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
