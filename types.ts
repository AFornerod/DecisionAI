
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  LEADER = 'LEADER',
  INDEPENDENT_LEADER = 'INDEPENDENT_LEADER'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export type Language = 'en' | 'es';

export interface Company {
  id: string;
  name: string;
  country: string;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
  plan: SubscriptionPlan;
  // Perfil extendido
  name: string;
  surname: string;
  dob?: string;
  age?: number;
  identification?: string;
  position?: string;
  team?: string;
}

export interface DecisionStep {
  id: string;
  name: string;
  description: string;
  input: string;
  insights?: any;
}

export interface SavedDecision {
  id: string;
  userId: string;
  userName?: string; // Para visualización en paneles de admin
  title: string;
  steps: DecisionStep[];
  finalReport: any;
  createdAt: string;
}
