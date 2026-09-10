/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { AIChatModal } from './components/AIChatModal';
import { OnboardingModal } from './components/OnboardingModal';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { LearningCenterView } from './components/learning/LearningCenterView';
import { QuizView } from './components/learning/QuizView';
import { FlashcardsView } from './components/learning/FlashcardsView';
import { StudyPlanView } from './components/learning/StudyPlanView';
import { FocusModeView } from './components/learning/FocusModeView';
import { DocumentIntelligenceView } from './components/learning/DocumentIntelligenceView';
import { KnowledgeMapView } from './components/learning/KnowledgeMapView';
import { SettingsView } from './components/SettingsView';
import { Sparkles, X, PlusCircle, BookOpen, BrainCircuit } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, isOnboarding } = useAuth();
  const { currentView, setCurrentView, setAiDrawerOpen, toasts, removeToast } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-neutral-800">NEXUS EDU</h2>
          <p className="text-xs text-neutral-500">Khởi tạo không gian học tập thông minh...</p>
        </div>
      </div>
    );
  }

  // Determine active view component
  const renderView = () => {
    switch (currentView) {
      case 'learning':
        return <LearningCenterView />;
      case 'quiz':
        return <QuizView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'study_plan':
        return <StudyPlanView />;
      case 'focus':
        return <FocusModeView />;
      case 'document_intel':
        return <DocumentIntelligenceView />;
      case 'knowledge_map':
        return <KnowledgeMapView />;
      case 'profile':
        return <SettingsView />;
      case 'children':
      case 'progress':
        return <ParentDashboard />;
      case 'classes':
      case 'create':
        if (user?.role === 'TEACHER') return <TeacherDashboard />;
        return <LearningCenterView />;
      case 'home':
      default:
        if (user?.role === 'PARENT') return <ParentDashboard />;
        if (user?.role === 'TEACHER') return <TeacherDashboard />;
        return <StudentDashboard />;
    }
  };

  return (
    <div className="w-full max-w-full min-h-screen bg-neutral-50/50 flex flex-col font-sans text-neutral-900 pb-20 md:pb-8 box-border">
      {/* Top Header & Navigation */}
      <Navigation />

      {/* Main App View */}
      <main className="w-full max-w-full flex-1 box-border">
        {renderView()}
      </main>

      {/* Floating Desktop Quick AI Assistant Button */}
      <button
        type="button"
        id="floating-ai-coach-btn"
        onClick={() => setAiDrawerOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer font-semibold text-xs group"
        title="Mở Trợ lý AI NEXUS"
      >
        <Sparkles className="w-4 h-4 text-sky-200 group-hover:rotate-12 transition-transform" />
        <span>{user?.aiAssistantName || 'AI Coach'}</span>
      </button>

      {/* Global Modals & Drawers */}
      <CommandPalette />
      <AIChatModal />
      <OnboardingModal
        isOpen={isOnboarding || showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Global Toast Notifications */}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : toast.type === 'error'
                ? 'bg-red-900 text-white border-red-800'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-neutral-900 text-white border-neutral-800'
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
