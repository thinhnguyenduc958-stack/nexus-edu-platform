import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, EducationLevel, UIComplexity } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isOnboarding: boolean;
  greeting: string;
  login: (identifier: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  linkAccount: (provider: 'google' | 'facebook' | 'phone' | 'email', identifier?: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, otp: string, isLinking?: boolean) => Promise<any>;
  oauthLogin: (provider: 'google' | 'facebook', isLinking?: boolean) => Promise<any>;
  switchRole: (role: UserRole) => Promise<void>;
  completeOnboarding: (data: { role: UserRole; educationLevel: EducationLevel; displayName?: string; aiAssistantName?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
      // Check if user needs onboarding (e.g. fresh account without role)
      if (!currentUser) {
        setIsOnboarding(true);
      }
    } catch (err) {
      console.warn('Could not fetch user from backend, creating initial default session');
    } finally {
      setLoading(false);
    }
  };

  // Greeting logic strictly following spec:
  // Default greeting: "Chào bạn 👋"
  // If user sets display name -> "Chào [displayName] 👋"
  const greeting = user?.displayName ? `Chào ${user.displayName} 👋` : 'Chào bạn 👋';

  const login = async (identifier: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.login(identifier, password);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await api.updateProfile(updates);
    setUser(updated);
  };

  const linkAccount = async (provider: 'google' | 'facebook' | 'phone' | 'email', identifier?: string) => {
    if (provider === 'google' || provider === 'facebook') {
      const res = await api.oauthConnect(provider, identifier, undefined, true);
      setUser(res.user);
    }
  };

  const sendOtp = async (phone: string) => {
    return api.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string, isLinking = false) => {
    const res = await api.verifyOtp(phone, otp, isLinking);
    setUser(res.user);
    return res;
  };

  const oauthLogin = async (provider: 'google' | 'facebook', isLinking = false) => {
    const mockEmail = `${provider}.user@gmail.com`;
    const res = await api.oauthConnect(provider, mockEmail, undefined, isLinking);
    setUser(res.user);
    return res;
  };

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await api.demoSwitchRole(role);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (data: {
    role: UserRole;
    educationLevel: EducationLevel;
    displayName?: string;
    aiAssistantName?: string;
  }) => {
    setLoading(true);
    try {
      const complexity: UIComplexity =
        data.educationLevel === 'PRESCHOOL' || data.educationLevel === 'PRIMARY' ? 'SIMPLE' : 'STANDARD';

      if (user) {
        const updated = await api.updateProfile({
          role: data.role,
          educationLevel: data.educationLevel,
          displayName: data.displayName || undefined,
          aiAssistantName: data.aiAssistantName || 'AI Coach',
          uiComplexity: complexity
        });
        setUser(updated);
      } else {
        const res = await api.register({
          role: data.role,
          educationLevel: data.educationLevel,
          displayName: data.displayName || undefined
        });
        setUser(res.user);
      }
      setIsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    await api.deleteAccount();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOnboarding,
        greeting,
        login,
        register,
        logout,
        updateProfile,
        linkAccount,
        sendOtp,
        verifyOtp,
        oauthLogin,
        switchRole,
        completeOnboarding,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
