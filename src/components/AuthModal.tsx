import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { X, Smartphone, Mail, Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void; isLinking?: boolean }> = ({
  isOpen,
  onClose,
  isLinking = false
}) => {
  const { login, register, oauthLogin, sendOtp, verifyOtp } = useAuth();
  const { t, addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'options' | 'phone_otp'>('options');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await oauthLogin('google', isLinking);
      addToast(isLinking ? 'Đã liên kết tài khoản Google thành công!' : 'Đăng nhập Google thành công!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Không thể xác thực Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      await oauthLogin('facebook', isLinking);
      addToast(isLinking ? 'Đã liên kết tài khoản Facebook thành công!' : 'Đăng nhập Facebook thành công!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Không thể xác thực Facebook', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      addToast('Vui lòng nhập số điện thoại hợp lệ.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setOtpSent(true);
      setOtpCountdown(60);
      addToast(res.devHint || 'Đã gửi mã OTP đến số điện thoại!', 'info');
      // Countdown timer
      const timer = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      addToast(err.message || 'Lỗi gửi mã OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      addToast('Vui lòng nhập mã OTP.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone, otp, isLinking);
      addToast(isLinking ? 'Đã liên kết số điện thoại thành công!' : 'Xác thực OTP thành công!', 'success');
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Mã OTP không chính xác hoặc đã hết hạn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Vui lòng điền đầy đủ email và mật khẩu.', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        addToast('Đăng nhập thành công!', 'success');
      } else {
        await register({ email, password, role: 'STUDENT' });
        addToast('Đăng ký tài khoản thành công!', 'success');
      }
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Không thể đăng nhập. Hãy kiểm tra kết nối mạng hoặc thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 text-center relative border-b border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">NEXUS EDU</h2>
          <p className="text-xs text-neutral-500 mt-1 font-medium">{t.tagline}</p>
        </div>

        <div className="p-6 space-y-4">
          {authMethod === 'options' ? (
            <>
              {/* Continue with Google */}
              <button
                type="button"
                id="auth-btn-google"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{t.loginGoogle}</span>
              </button>

              {/* Continue with Facebook */}
              <button
                type="button"
                id="auth-btn-facebook"
                disabled={loading}
                onClick={handleFacebookAuth}
                className="w-full py-3 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{t.loginFacebook}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-neutral-200"></div>
                <span className="px-3 text-xs text-neutral-400 uppercase tracking-wider">{t.loginOr}</span>
                <div className="flex-1 border-t border-neutral-200"></div>
              </div>

              {/* Phone OTP Option */}
              <button
                type="button"
                onClick={() => setAuthMethod('phone_otp')}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-neutral-500" />
                <span>Đăng nhập qua Số điện thoại & OTP</span>
              </button>

              {/* Email + Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">{t.email}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      id="auth-input-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">{t.password}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      id="auth-input-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="auth-btn-submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-colors mt-2 cursor-pointer"
                >
                  {mode === 'login' ? t.loginBtn : t.registerBtn}
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {mode === 'login' ? t.noAccount : t.hasAccount}
                </button>
              </div>
            </>
          ) : (
            /* Phone OTP Screen */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('options');
                  setOtpSent(false);
                }}
                className="text-xs text-blue-600 hover:underline mb-2 block cursor-pointer"
              >
                ← Quay lại các phương thức khác
              </button>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">{t.phoneNumber}</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    id="auth-input-phone"
                    placeholder="0901234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={otpSent}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      id="auth-btn-send-otp"
                      disabled={loading}
                      onClick={handleSendOtp}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      {t.sendOtp}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">{t.enterOtp}</label>
                  <input
                    type="text"
                    id="auth-input-otp"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-center font-mono tracking-widest text-lg font-bold"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-neutral-500">
                    <span>Mã dùng thử: <strong>123456</strong></span>
                    {otpCountdown > 0 ? (
                      <span>Gửi lại sau {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-blue-600 hover:underline"
                      >
                        Gửi lại mã
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    id="auth-btn-verify-otp"
                    disabled={loading}
                    onClick={handleVerifyOtp}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-colors mt-4 cursor-pointer"
                  >
                    {t.verifyOtp}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
