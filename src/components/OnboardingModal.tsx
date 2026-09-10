import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { UserRole, EducationLevel } from '../types';
import { GraduationCap, Users, BookOpen, Sparkles, ArrowRight, Check } from 'lucide-react';

export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { completeOnboarding } = useAuth();
  const { t } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('MIDDLE');
  const [displayName, setDisplayName] = useState('');
  const [aiAssistantName, setAiAssistantName] = useState('AI Coach');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        role: selectedRole,
        educationLevel,
        displayName: displayName.trim() || undefined,
        aiAssistantName: aiAssistantName.trim() || 'AI Coach'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-100 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Bạn là ai? */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Bạn là ai?</h2>
                <p className="text-sm text-neutral-500 mt-1">Chọn vai trò để NEXUS EDU thiết lập trải nghiệm tối ưu nhất.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  id="onboard-role-student"
                  onClick={() => setSelectedRole('STUDENT')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === 'STUDENT'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shrink-0">
                    👨‍🎓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 text-base">{t.roleStudent}</p>
                    <p className="text-xs text-neutral-500">Học tập cá nhân hóa, làm bài tập, thi thử và hỏi AI Coach</p>
                  </div>
                  {selectedRole === 'STUDENT' && <Check className="w-5 h-5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  id="onboard-role-parent"
                  onClick={() => setSelectedRole('PARENT')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === 'PARENT'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shrink-0">
                    👨‍👩‍👧
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 text-base">{t.roleParent}</p>
                    <p className="text-xs text-neutral-500">Theo dõi tiến độ, phân tích môn yếu và nhận lời khuyên giáo dục</p>
                  </div>
                  {selectedRole === 'PARENT' && <Check className="w-5 h-5 text-blue-600" />}
                </button>

                <button
                  type="button"
                  id="onboard-role-teacher"
                  onClick={() => setSelectedRole('TEACHER')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === 'TEACHER'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl shrink-0">
                    👩‍🏫
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 text-base">{t.roleTeacher}</p>
                    <p className="text-xs text-neutral-500">Quản lý lớp học, soạn đề và tạo bài tập siêu tốc trong 1 phút</p>
                  </div>
                  {selectedRole === 'TEACHER' && <Check className="w-5 h-5 text-blue-600" />}
                </button>
              </div>

              <button
                type="button"
                id="onboard-next-step-1"
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.actionContinue}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Tùy biến theo Role */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {selectedRole === 'STUDENT'
                    ? 'Bạn đang học cấp nào?'
                    : selectedRole === 'PARENT'
                    ? 'Quản lý học tập cho con'
                    : 'Thiết lập lớp học giảng dạy'}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  {selectedRole === 'STUDENT'
                    ? 'Giao diện sẽ tự động thích ứng với độ tuổi và nội dung học tập.'
                    : selectedRole === 'PARENT'
                    ? 'Bạn có thể liên kết tài khoản con dễ dàng.'
                    : 'Tạo lớp học đầu tiên của Thầy/Cô trên NEXUS EDU.'}
                </p>
              </div>

              {selectedRole === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { level: 'PRESCHOOL' as EducationLevel, label: 'Mầm non', icon: '🎨', desc: 'Hình ảnh, màu sắc & phát âm' },
                    { level: 'PRIMARY' as EducationLevel, label: 'Tiểu học', icon: '🔢', desc: 'Toán, Tiếng Việt, Nhiệm vụ vui' },
                    { level: 'MIDDLE' as EducationLevel, label: 'THCS', icon: '📐', desc: 'Đầy đủ môn học, Flashcards, Quiz' },
                    { level: 'HIGH_SCHOOL' as EducationLevel, label: 'THPT', icon: '🔬', desc: 'Thi thử nghiệm, Bản đồ tri thức' }
                  ].map(item => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setEducationLevel(item.level)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        educationLevel === item.level
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{item.icon}</span>
                      <p className="font-bold text-neutral-900 text-sm">{item.label}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedRole === 'PARENT' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
                    <p className="text-sm font-semibold text-neutral-800">Con thứ nhất (mặc định sẵn sàng):</p>
                    <p className="text-xs text-neutral-500 mt-0.5">👦 Minh (Lớp 5 - Tiểu học)</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Bạn có thể liên kết thêm nhiều con bất kỳ lúc nào từ màn hình "Con của tôi".
                  </p>
                </div>
              )}

              {selectedRole === 'TEACHER' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
                    <p className="text-sm font-semibold text-neutral-800">Lớp học mẫu đầu tiên:</p>
                    <p className="text-xs text-neutral-500 mt-0.5">🏫 Toán học 8A (Mã lớp: TOAN8A)</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Thầy/Cô có thể tạo thêm nhiều lớp và chia sẻ mã lớp cho học sinh tham gia.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  id="onboard-next-step-2"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.actionContinue}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tên hiển thị (Tùy chọn, skippable) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Bạn muốn NEXUS EDU gọi bạn là gì?
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Không bắt buộc. Nếu bỏ qua, hệ thống sẽ chào bạn là <span className="font-semibold text-neutral-800">"Chào bạn 👋"</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Tên hiển thị (tùy chọn)
                </label>
                <input
                  id="onboard-display-name-input"
                  type="text"
                  placeholder="Ví dụ: Thịnh, Mai, Thầy Nam..."
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="onboard-skip-step-3"
                  onClick={() => {
                    setDisplayName('');
                    setStep(4);
                  }}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 cursor-pointer"
                >
                  {t.actionSkip}
                </button>
                <button
                  type="button"
                  id="onboard-next-step-3"
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.actionContinue}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Tên trợ lý AI (Tùy chọn, skippable) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Bạn muốn đặt tên cho trợ lý AI không?
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Mặc định là <span className="font-semibold text-neutral-800">AI Coach</span>. Bạn có thể đổi bất kỳ lúc nào.
                </p>
              </div>

              <div>
                <input
                  id="onboard-ai-name-input"
                  type="text"
                  placeholder="AI Coach, Nova, Cô Mai, Milo, JARVIS..."
                  value={aiAssistantName}
                  onChange={e => setAiAssistantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base font-medium text-neutral-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="onboard-skip-step-4"
                  onClick={() => {
                    setAiAssistantName('AI Coach');
                    handleFinish();
                  }}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 cursor-pointer"
                >
                  {t.actionSkip}
                </button>
                <button
                  type="button"
                  id="onboard-finish-btn"
                  disabled={loading}
                  onClick={handleFinish}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Bắt đầu học tập</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
