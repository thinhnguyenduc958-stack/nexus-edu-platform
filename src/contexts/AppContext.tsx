import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n';
import { UIComplexity } from '../types';
import { api } from '../services/api';

export type AppView =
  | 'home'
  | 'learning'
  | 'create'
  | 'ai'
  | 'profile'
  | 'children'
  | 'progress'
  | 'classes'
  | 'quiz'
  | 'flashcards'
  | 'study_plan'
  | 'focus'
  | 'document_intel'
  | 'knowledge_map';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['vi'];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  uiComplexity: UIComplexity;
  setUIComplexity: (complexity: UIComplexity) => void;
  syncStatus: 'online' | 'offline' | 'syncing';
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  aiPromptSeed: string;
  setAiPromptSeed: (prompt: string) => void;
  activeQuizId: string | null;
  setActiveQuizId: (id: string | null) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  openAIWithPrompt: (prompt: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [uiComplexity, setUIComplexity] = useState<UIComplexity>('STANDARD');
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiPromptSeed, setAiPromptSeed] = useState('');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsub = api.onSyncChange(status => {
      setSyncStatus(status);
    });
    return () => unsub();
  }, []);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openAIWithPrompt = (prompt: string) => {
    setAiPromptSeed(prompt);
    setAiDrawerOpen(true);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentView,
        setCurrentView,
        uiComplexity,
        setUIComplexity,
        syncStatus,
        commandPaletteOpen,
        setCommandPaletteOpen,
        aiDrawerOpen,
        setAiDrawerOpen,
        aiPromptSeed,
        setAiPromptSeed,
        activeQuizId,
        setActiveQuizId,
        toasts,
        addToast,
        removeToast,
        openAIWithPrompt
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
