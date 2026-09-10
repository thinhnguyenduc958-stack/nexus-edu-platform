import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import {
  User,
  Shield,
  Smartphone,
  Mail,
  Sparkles,
  Download,
  Trash2,
  LogOut,
  CheckCircle2,
  Sliders,
  Globe,
  ArrowRight
} from 'lucide-react';
import { AuthModal } from './AuthModal';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, logout, deleteAccount, greeting } = useAuth();
  const { t, language, setLanguage, uiComplexity, setUIComplexity, addToast } = useApp();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [aiAssistantName, setAiAssistantName] = useState(user?.aiAssistantName || 'AI Coach');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'MIDDLE');
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        aiAssistantName: aiAssistantName.trim() || 'AI Coach',
        educationLevel: educationLevel as any
      });
      addToast('Đã lưu thông tin hồ sơ thành công!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Lỗi lưu thông tin', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isProviderConnected = (provider: string) => {
    return user?.connectedAccounts?.some(acc => acc.provider === provider);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-edu-data-${user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Đã xuất toàn bộ dữ liệu thành công!', 'success');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      addToast('Đã xóa tài khoản vĩnh viễn.', 'info');
    } catch (err: any) {
      addToast('Lỗi khi xóa tài khoản', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Cài đặt & Hồ sơ</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Quản lý tên hiển thị, tên trợ lý AI, liên kết tài khoản và bảo mật.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* Greeting Preview Callout */}
      <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Lời chào hiện tại</p>
          <p className="text-lg font-black text-blue-950 mt-0.5">{greeting}</p>
          <p className="text-xs text-neutral-600 mt-1">
            {user?.displayName
              ? 'Đang chào theo tên bạn đã đặt.'
              : 'Mặc định hiển thị "Chào bạn 👋" (không gán tên ngẫu nhiên).'}
          </p>
        </div>
      </div>

      {/* Section 1: User Profile & AI Assistant Name */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-neutral-900 text-base">Thông tin cá nhân & Trợ lý AI</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tên hiển thị (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Để trống nếu muốn chào 'Chào bạn 👋'"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Ví dụ: Nhập "Thịnh" thì ứng dụng sẽ chào "Chào Thịnh 👋".
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tên trợ lý AI (Mặc định: AI Coach)
            </label>
            <input
              type="text"
              placeholder="AI Coach, Nova, Cô Mai, Milo, JARVIS..."
              value={aiAssistantName}
              onChange={e => setAiAssistantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium text-neutral-900"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Tên trợ lý ảo sư phạm đồng hành cùng bạn.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Cấp độ học tập</label>
            <select
              value={educationLevel}
              onChange={e => setEducationLevel(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden"
            >
              <option value="PRESCHOOL">Mầm non (3 - 5 tuổi)</option>
              <option value="PRIMARY">Tiểu học (Lớp 1 - 5)</option>
              <option value="MIDDLE">THCS (Lớp 6 - 9)</option>
              <option value="HIGH_SCHOOL">THPT (Lớp 10 - 12)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Độ phức tạp giao diện</label>
            <select
              value={uiComplexity}
              onChange={e => setUIComplexity(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden"
            >
              <option value="SIMPLE">Đơn giản (Nút to, màu sắc tươi vui)</option>
              <option value="STANDARD">Tiêu chuẩn (Đầy đủ tính năng cân bằng)</option>
              <option value="ADVANCED">Nâng cao (Chuyên sâu, thi thử nghiệm)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>

      {/* Section 2: Account Linking & Security (Mandatory Prompt Spec) */}
      <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-neutral-900 text-base">Liên kết tài khoản & Đăng nhập đa nền tảng</h2>
        </div>
        <p className="text-xs text-neutral-500">
          Liên kết nhiều phương thức giúp bạn đăng nhập liền mạch trên bất kỳ thiết bị nào mà không bị mất dữ liệu.
        </p>

        <div className="space-y-3 pt-2">
          {/* Google */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Tài khoản Google</p>
                <p className="text-xs text-neutral-500">
                  {isProviderConnected('google') ? 'Đã liên kết an toàn' : 'Chưa liên kết'}
                </p>
              </div>
            </div>

            {isProviderConnected('google') ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã kết nối</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkingModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Kết nối
              </button>
            )}
          </div>

          {/* Facebook */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Tài khoản Facebook</p>
                <p className="text-xs text-neutral-500">
                  {isProviderConnected('facebook') ? 'Đã liên kết an toàn' : 'Chưa liên kết'}
                </p>
              </div>
            </div>

            {isProviderConnected('facebook') ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã kết nối</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkingModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Kết nối
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Số điện thoại (OTP)</p>
                <p className="text-xs text-neutral-500">
                  {user?.phone ? `Đã liên kết: ${user.phone}` : 'Chưa liên kết số điện thoại'}
                </p>
              </div>
            </div>

            {user?.phone ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã xác minh</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkingModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Liên kết SĐT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Data Management & Export */}
      <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <h2 className="font-bold text-neutral-900 text-base">Quản lý dữ liệu & Quyền riêng tư</h2>
        <p className="text-xs text-neutral-500">
          Bạn hoàn toàn làm chủ dữ liệu của mình trên NEXUS EDU theo tiêu chuẩn bảo mật dữ liệu giáo dục.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-500" />
            <span>Xuất toàn bộ dữ liệu (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-700 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Xóa tài khoản vĩnh viễn</span>
          </button>
        </div>
      </div>

      {/* Account Linking Modal */}
      {showLinkingModal && (
        <AuthModal
          isOpen={showLinkingModal}
          onClose={() => setShowLinkingModal(false)}
          isLinking={true}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 w-full max-w-md animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-red-600 mb-2">Xác nhận xóa tài khoản?</h3>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Hành động này sẽ xóa vĩnh viễn tài khoản của bạn, toàn bộ lịch sử học tập, bộ flashcards và tiến độ bài tập. Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Xác nhận xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
