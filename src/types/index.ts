export type RiskLevel = 1 | 2 | 3;

export interface AuthUser {
  id: string
  email: string
  name?: string
  isAdmin: boolean
  role: string
}
export type AuthOption = 'none' | 'pin' | 'password' | '2fa';
export type NavView = 'home' | 'tasks' | 'workspace' | 'foundry' | 'vault';
export type SidebarTab = 'trace' | 'tools' | 'smiths' | 'growth' | 'settings';
export type TraceTag = 'OBSERVE' | 'DECIDE' | 'ACTION' | 'ESCALATE' | 'COMPLETE';
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type StepDotState = 'done' | 'active' | 'pending';

export type FreedomLevel = 0 | 1 | 2 | 3;

export interface OnboardingData {
  username: string;
  agentName: string;
  agentPhone: string;
  password: string;
  twoFaPhone: string;
  cryptoWallet: string;
  mainApiKey: string;
  mainApiKeyBackup: string;
  tutorApiKey: string;
  tutorApiKeyBackup: string;
  gloveConnected: boolean;
  riskAuth: Record<RiskLevel, AuthOption[]>;
  freedomLevel: FreedomLevel;
  freedomLevelChangeAuth: AuthOption[];
  adminPhrase: string;
  pin: string;
}

export interface TraceEntry {
  id: string;
  tag: TraceTag;
  message: string;
  reason?: string;
  timestamp: string;
  confidence?: number;
  risk?: number;
  prior?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  trace?: TraceEntry[];
  taskId?: string;
}

export interface TaskStep {
  label: string;
  state: StepDotState;
}

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  steps: TaskStep[];
  startedAt: string;
  context: string;
  risk: RiskLevel;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  risk: RiskLevel;
  enabled: boolean;
}

export interface Smith {
  id: string;
  name: string;
  description: string;
  icon: string;
  risk: RiskLevel;
  active: boolean;
}

export interface GrowthStats {
  decisionsToday: number;
  successRate: number;
  activePriors: number;
  toolsAvailable: number;
  learnedThisWeek: { title: string; body: string }[];
}

export interface FoundryEntry {
  title: string;
  meta: string;
}

export interface VaultFile {
  id: string;
  name: string;
  category: string;
  modifiedAt: string;
  size: string;
  icon: string;
}
