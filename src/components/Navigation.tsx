import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp, AppView } from '../contexts/AppContext';
import {
  Home,
  BookOpen,
  PlusCircle,
  Sparkles,
  User,
  Users,
  BarChart3,
  GraduationCap,
  Search,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  ChevronDown,
  LogOut,
  Check,
  Settings
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user, switchRole, logout, greeting } = useAuth();
  const {
    currentView,
    setCurrentView,
    t,
    language,
    setLanguage,
    syncStatus,
    setCommandPaletteOpen,
    setAiDrawerOpen,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'STUDENT';

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Role-specific primary navigation items for mobile bottom bar
  const getNavItems = () => {
    switch (role) {
      case 'PARENT':
        return [
          { id: 'home' as AppView, label: t.navHome, icon: Home },
          { id: 'children' as AppView, label: t.navChildren, icon: Users },
          { id: 'progress' as AppView, label: t.navProgress, icon: BarChart3 },
          { id: 'ai' as AppView, label: t.navAI, icon: Sparkles, isAction: true },
          { id: 'profile' as AppView, label: t.navProfile, icon: User }
        ];
      case 'TEACHER':
        return [
          { id: 'home' as AppView, label: t.navHome, icon: Home },
          { id: 'classes' as AppView, label: t.navClasses, icon: GraduationCap },
          { id: 'create' as AppView, label: t.navCreate, icon: PlusCircle },
          { id: 'ai' as AppView, label: t.navAI, icon: Sparkles, isAction: true },
          { id: 'profile' as AppView, label: t.navProfile, icon: User }
        ];
      case 'STUDENT':
      default:
        return [
          { id: 'home' as AppView, label: t.navHome, icon: Home },
          { id: 'learning' as AppView, label: t.navLearning, icon: BookOpen },
          { id: 'create' as AppView, label: t.navCreate, icon: PlusCircle },
          { id: 'ai' as AppView, label: t.navAI, icon: Sparkles, isAction: true },
          { id: 'profile' as AppView, label: t.navProfile, icon: User }
        ];
    }
  };

  const navItems = getNavItems();
  const userInitial = user?.displayName ? user.displayName.trim().charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Top Navigation Bar: Fully fluid, zero-overflow, highly responsive */}
      <header className="w-full max-w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs box-border">
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 box-border">
          
          {/* Left: Brand Logo & Identity */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0 cursor-pointer select-none"
            onClick={() => setCurrentView('home')}
            title="NEXUS EDU Trang chủ"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-4.5 h-4.5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight text-neutral-900 whitespace-nowrap">
                NEXUS EDU
              </span>
              <span className="hidden md:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                {role === 'STUDENT' ? t.roleStudent : role === 'PARENT' ? t.roleParent : t.roleTeacher}
              </span>
            </div>
          </div>

          {/* Center: Search / Command Palette (Fluid on desktop, never fixed-overflow) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4 min-w-0">
            <button
              type="button"
              id="nav-search-button"
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 text-xs sm:text-sm transition-colors cursor-pointer min-w-0"
              title="Tìm kiếm & Khám phá (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="flex-1 text-left truncate">{t.aiPlaceholder}</span>
              <kbd className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border border-neutral-300 bg-white text-neutral-500 shrink-0 shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Header Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              id="mobile-search-btn"
              onClick={() => setCommandPaletteOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Sync Status Badge (Compact on tablet, expanded on large desktop) */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-neutral-50 border-neutral-200 text-neutral-600 shrink-0"
              title={syncStatus === 'offline' ? t.statusOffline : syncStatus === 'syncing' ? t.statusSyncing : t.statusSynced}
            >
              {syncStatus === 'offline' ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{t.statusOffline}</span>
                </>
              ) : syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{t.statusSyncing}</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{t.statusSynced}</span>
                </>
              )}
            </div>

            {/* Language Switch */}
            <button
              type="button"
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors border border-neutral-200/80 shrink-0 cursor-pointer"
              title="Đổi ngôn ngữ / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
              <span className="font-mono">{language.toUpperCase()}</span>
            </button>

            {/* Quick AI Coach Button */}
            <button
              type="button"
              id="header-ai-button"
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
              title="Mở Trợ lý AI NEXUS"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {user?.aiAssistantName || t.aiCoachDefaultName}
              </span>
            </button>

            {/* Desktop Role Switcher (Visible on md and above) */}
            <div className="hidden md:block relative shrink-0">
              <select
                id="role-switcher-select"
                aria-label="Chuyển đổi vai trò"
                value={role}
                onChange={(e) => switchRole(e.target.value as any)}
                className="text-xs font-semibold py-1.5 pl-2.5 pr-6 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 text-neutral-700 cursor-pointer focus:outline-hidden whitespace-nowrap"
              >
                <option value="STUDENT">🎓 {t.roleStudent}</option>
                <option value="PARENT">👨‍👩‍👧 {t.roleParent}</option>
                <option value="TEACHER">👩‍🏫 {t.roleTeacher}</option>
              </select>
            </div>

            {/* Avatar / Profile Menu Dropdown (All viewports) */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                id="header-profile-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer shrink-0"
                title="Hồ sơ và Tuỳ chọn"
                aria-expanded={menuOpen}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  {userInitial}
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:block" />
              </button>

              {/* Profile & Options Dropdown Menu */}
              {menuOpen && (
                <div
                  id="header-profile-dropdown"
                  className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-neutral-200 shadow-xl p-2.5 text-neutral-800 z-50 animate-in fade-in zoom-in-95"
                >
                  {/* User Summary */}
                  <div className="p-2.5 border-b border-neutral-100 mb-1.5">
                    <p className="text-xs font-bold text-neutral-900 truncate">
                      {user?.displayName || greeting}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span>
                        {role === 'STUDENT' ? t.roleStudent : role === 'PARENT' ? t.roleParent : t.roleTeacher}
                      </span>
                      <span>•</span>
                      <span>{user?.educationLevel || 'THCS'}</span>
                    </p>
                  </div>

                  {/* Mobile Role Switcher (Directly inside menu for small screens) */}
                  <div className="md:hidden p-2 border-b border-neutral-100 mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Đổi vai trò trải nghiệm
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['STUDENT', 'PARENT', 'TEACHER'] as const).map((r) => {
                        const isCurrent = role === r;
                        const label = r === 'STUDENT' ? t.roleStudent : r === 'PARENT' ? t.roleParent : t.roleTeacher;
                        const emoji = r === 'STUDENT' ? '🎓' : r === 'PARENT' ? '👨‍👩‍👧' : '👩‍🏫';
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              switchRole(r);
                              setMenuOpen(false);
                            }}
                            className={`px-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <span className="block text-xs">{emoji}</span>
                            <span className="block truncate">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('profile');
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span>Hồ sơ & Cài đặt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAiDrawerOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-left cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Trợ lý {user?.aiAssistantName || 'AI Coach'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCommandPaletteOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors text-left cursor-pointer"
                    >
                      <Search className="w-4 h-4 text-neutral-500" />
                      <span>Tìm kiếm nhanh (Ctrl+K)</span>
                    </button>

                    <div className="border-t border-neutral-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Strict 5-item layout for primary navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 safe-area-pb box-border w-full max-w-full">
        <div className="grid grid-cols-5 h-16 w-full max-w-full box-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  if (item.isAction) {
                    setAiDrawerOpen(true);
                  } else {
                    setCurrentView(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer min-w-0 ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${item.isAction ? 'bg-blue-50 text-blue-600' : ''}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[11px] tracking-tight truncate max-w-[90%]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
