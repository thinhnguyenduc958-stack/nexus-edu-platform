import { UserProfile, Quiz, FlashcardDeck, StudyPlan, KnowledgeTopic, Assignment, ClassInfo, ChildInfo } from '../types';

class ApiClient {
  private token: string | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncListeners: ((status: 'online' | 'offline' | 'syncing') => void)[] = [];

  constructor() {
    this.token = localStorage.getItem('nexus_auth_token');
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nexus_auth_token', token);
    } else {
      localStorage.removeItem('nexus_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public onSyncChange(listener: (status: 'online' | 'offline' | 'syncing') => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(status: 'online' | 'offline' | 'syncing') {
    this.syncListeners.forEach(l => l(status));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      this.notifyListeners('syncing');
      const res = await fetch(endpoint, { ...options, headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Yêu cầu thất bại (mã lỗi ${res.status})`);
      }
      const data = await res.json();
      this.notifyListeners('online');
      return data;
    } catch (err: any) {
      if (!navigator.onLine) {
        this.notifyListeners('offline');
      }
      throw err;
    }
  }

  // Auth methods
  async getCurrentUser(): Promise<UserProfile> {
    const res = await this.request<{ success: boolean; user: UserProfile }>('/api/auth/me');
    return res.user;
  }

  async login(identifier: string, password?: string): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: { email?: string; phone?: string; role?: string; educationLevel?: string; displayName?: string }): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setToken(res.token);
    return res;
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; devHint?: string }> {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyOtp(phone: string, otp: string, isLinking?: boolean): Promise<{ success: boolean; user: UserProfile; token: string }> {
    const res = await this.request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, isLinking })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async oauthConnect(provider: 'google' | 'facebook', email?: string, name?: string, isLinking?: boolean): Promise<{ success: boolean; user: UserProfile; token?: string }> {
    const res = await this.request<{ success: boolean; user: UserProfile; token?: string }>('/api/auth/oauth-connect', {
      method: 'POST',
      body: JSON.stringify({ provider, email, name, isLinking })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async demoSwitchRole(role: string): Promise<{ user: UserProfile; token: string }> {
    const res = await this.request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    this.setToken(res.token);
    return res;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await this.request<{ success: boolean; user: UserProfile }>('/api/users/profile', {
      method: 'POST',
      body: JSON.stringify(updates)
    });
    return res.user;
  }

  async deleteAccount(): Promise<void> {
    await this.request('/api/auth/delete-account', { method: 'POST' });
    this.setToken(null);
  }

  // Classes & Teaching
  async getClasses(): Promise<ClassInfo[]> {
    const res = await this.request<{ success: boolean; classes: ClassInfo[] }>('/api/classes');
    return res.classes;
  }

  async createClass(data: { name: string; grade: string; subject: string }): Promise<ClassInfo> {
    const res = await this.request<{ success: boolean; classInfo: ClassInfo }>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.classInfo;
  }

  async joinClass(code: string): Promise<ClassInfo> {
    const res = await this.request<{ success: boolean; classInfo: ClassInfo }>('/api/classes/join', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    return res.classInfo;
  }

  // Parent & Children
  async getChildren(): Promise<ChildInfo[]> {
    const res = await this.request<{ success: boolean; children: ChildInfo[] }>('/api/parent/children');
    return res.children;
  }

  async linkChild(data: { inviteCode?: string; childName: string; grade: string }): Promise<ChildInfo> {
    const res = await this.request<{ success: boolean; child: ChildInfo }>('/api/parent/children/link', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.child;
  }

  // Learning & Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const res = await this.request<{ success: boolean; quizzes: Quiz[] }>('/api/quizzes');
    return res.quizzes;
  }

  async getQuiz(id: string): Promise<Quiz> {
    const res = await this.request<{ success: boolean; quiz: Quiz }>(`/api/quizzes/${id}`);
    return res.quiz;
  }

  async submitQuiz(id: string, answers: Record<number, any>, durationSeconds: number) {
    const res = await this.request<{ success: boolean; result: any }>(`/api/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, durationSeconds })
    });
    return res.result;
  }

  // Flashcards
  async getFlashcardDecks(): Promise<FlashcardDeck[]> {
    const res = await this.request<{ success: boolean; decks: FlashcardDeck[] }>('/api/flashcards');
    return res.decks;
  }

  async reviewFlashcard(deckId: string, cardId: string, rating: 'easy' | 'good' | 'hard') {
    return this.request(`/api/flashcards/${deckId}/card/${cardId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  }

  // Study Plan
  async getStudyPlan(): Promise<StudyPlan> {
    const res = await this.request<{ success: boolean; plan: StudyPlan }>('/api/study-plans');
    return res.plan;
  }

  async toggleStudySession(sessionId: string): Promise<StudyPlan> {
    const res = await this.request<{ success: boolean; plan: StudyPlan }>(`/api/study-plans/session/${sessionId}/toggle`, {
      method: 'POST'
    });
    return res.plan;
  }

  // Knowledge Map
  async getKnowledgeMap(): Promise<KnowledgeTopic[]> {
    const res = await this.request<{ success: boolean; topics: KnowledgeTopic[] }>('/api/knowledge-map');
    return res.topics;
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    const res = await this.request<{ success: boolean; assignments: Assignment[] }>('/api/assignments');
    return res.assignments;
  }

  async toggleAssignment(id: string): Promise<Assignment[]> {
    const res = await this.request<{ success: boolean; assignments: Assignment[] }>(`/api/assignments/${id}/toggle`, {
      method: 'POST'
    });
    return res.assignments;
  }

  // Document Intelligence
  async processDocument(title: string, content: string) {
    const res = await this.request<{ success: boolean; document: any }>('/api/documents/process', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    return res.document;
  }

  // Unified NEXUS AI
  async askAI(prompt: string, language: 'vi' | 'en' = 'vi') {
    const res = await this.request<{ success: boolean; result: any }>('/api/ai/router', {
      method: 'POST',
      body: JSON.stringify({ prompt, language })
    });
    return res.result;
  }
}

export const api = new ApiClient();
