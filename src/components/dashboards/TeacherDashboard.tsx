import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { ClassInfo } from '../../types';
import {
  GraduationCap,
  Sparkles,
  PlusCircle,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, greeting } = useAuth();
  const { t, openAIWithPrompt, addToast, setCurrentView } = useApp();

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('Lớp 8');
  const [classSubject, setClassSubject] = useState('Toán học');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1-minute AI Generator form state
  const [aiGenTopic, setAiGenTopic] = useState('Phương trình bậc nhất một ẩn');
  const [aiGenQuestionCount, setAiGenQuestionCount] = useState('10');
  const [aiGenGenerating, setAiGenGenerating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses();
      setClasses(data);
      if (data.length > 0) setSelectedClass(data[0]);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    try {
      const created = await api.createClass({
        name: className,
        grade: classGrade,
        subject: classSubject
      });
      setClasses(prev => [...prev, created]);
      setSelectedClass(created);
      setShowCreateModal(false);
      setClassName('');
      addToast(`Đã tạo lớp ${created.name} với mã ${created.code}!`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Lỗi tạo lớp học', 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Đã sao chép mã lớp: ${code}`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handle1MinuteAIGenerate = async () => {
    setAiGenGenerating(true);
    addToast(`Đang tạo ${aiGenQuestionCount} câu hỏi môn ${classSubject} bằng AI...`, 'info');
    try {
      openAIWithPrompt(
        `Là giáo viên, hãy tạo đề kiểm tra 15 phút gồm ${aiGenQuestionCount} câu trắc nghiệm khách quan về chủ đề: "${aiGenTopic}" môn ${classSubject} ${classGrade}. Có đáp án và lời giải chi tiết cho từng câu.`
      );
    } finally {
      setAiGenGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{greeting}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Không gian quản lý lớp học và trợ giảng AI sư phạm 1 phút.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* Class Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map(c => {
          const isSelected = selectedClass?.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedClass(c)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md uppercase">
                  {c.grade} • {c.subject}
                </span>
                
                {/* Class Code Copy Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(c.code);
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded border border-neutral-300"
                  title="Sao chép mã lớp để gửi học sinh"
                >
                  <span>{c.code}</span>
                  {copiedCode === c.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                </button>
              </div>

              <h3 className="text-base font-bold text-neutral-900">{c.name}</h3>

              <div className="flex items-center justify-between mt-4 text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{c.studentCount} học sinh</span>
                </span>
                <span className="font-semibold text-neutral-700">
                  Điểm TB: <strong className="text-blue-600">{c.averageScore}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section: 1-Minute AI Generator + Student Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1-Minute AI Generator (Spec Requirement) */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-neutral-900 text-base">Soạn đề & Bài tập AI trong 1 phút</h3>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Nhập chủ đề cần kiểm tra, AI sẽ sinh trọn gói câu hỏi phân hóa, đáp án chi tiết và ma trận kiến thức.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Chủ đề bài học</label>
              <input
                type="text"
                value={aiGenTopic}
                onChange={e => setAiGenTopic(e.target.value)}
                placeholder="VD: Hằng đẳng thức đáng nhớ, Phương trình bậc nhất..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Số lượng câu</label>
                <select
                  value={aiGenQuestionCount}
                  onChange={e => setAiGenQuestionCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                >
                  <option value="5">5 câu (nhanh)</option>
                  <option value="10">10 câu (15 phút)</option>
                  <option value="20">20 câu (45 phút)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Độ khó</label>
                <select className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-hidden">
                  <option>Phân hóa (Nhận biết - Vận dụng)</option>
                  <option>Cơ bản</option>
                  <option>Nâng cao</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              id="teacher-generate-btn"
              disabled={aiGenGenerating}
              onClick={handle1MinuteAIGenerate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sinh đề kiểm tra ngay</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400">
              ⚡ Tiết kiệm 80% thời gian soạn giáo án và đề thi cho giáo viên.
            </p>
          </div>
        </div>

        {/* Student Roster & Learning Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">
                  Danh sách học sinh — {selectedClass?.name || 'Lớp học'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Theo dõi mức độ hoàn thành và phát hiện học sinh cần phụ đạo</p>
              </div>
              <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                Mã lớp: <strong>{selectedClass?.code}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Nguyễn Đức Thịnh', progress: 85, status: 'mastered', note: 'Nắm vững kiến thức, làm bài tốt' },
                { name: 'Trần Hoài An', progress: 92, status: 'mastered', note: 'Điểm trung bình 9.0' },
                { name: 'Lê Minh Quân', progress: 54, status: 'struggling', note: 'Cần hỗ trợ phần Phương trình chứa mẫu' },
                { name: 'Phạm Thu Trang', progress: 62, status: 'struggling', note: 'Chưa nộp bài tập về nhà số 2' }
              ].map((st, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50/60 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-bold text-xs">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{st.name}</p>
                      <p className="text-xs text-neutral-500">{st.note}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {st.status === 'struggling' ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Cần phụ đạo</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tiến độ tốt</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-neutral-700 w-10 text-right">{st.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-md animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">Tạo lớp học mới</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Hệ thống sẽ tự động tạo mã lớp duy nhất để Thầy/Cô gửi cho học sinh tham gia.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tên lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Toán 8A, Văn 9B..."
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Khối lớp</label>
                  <select
                    value={classGrade}
                    onChange={e => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  >
                    <option value="Lớp 6">Lớp 6</option>
                    <option value="Lớp 7">Lớp 7</option>
                    <option value="Lớp 8">Lớp 8</option>
                    <option value="Lớp 9">Lớp 9</option>
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Môn học</label>
                  <select
                    value={classSubject}
                    onChange={e => setClassSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Lịch sử & Địa lý">Lịch sử & Địa lý</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
