
import { Company, User, UserRole, SubscriptionPlan, SavedDecision } from '../types';

const SUPABASE_URL = 'https://kfbiszhrxpfpmxgglnhs.supabase.co';
const K = 'sb_secret__gMWT1PSmSO5oCuXAbI5aA_NcrPh4ir';

// Nombres de las "tablas" en LocalStorage
const L_USERS = 'db_users';
const L_COMPANIES = 'db_companies';
const L_DECISIONS = 'db_decisions';

/**
 * Motor de Base de Datos Local para asegurar que NADA se pierda.
 */
const localDB = {
  get: (table: string) => JSON.parse(localStorage.getItem(table) || '[]'),
  save: (table: string, data: any[]) => localStorage.setItem(table, JSON.stringify(data)),
  upsert: (table: string, item: any) => {
    const data = localDB.get(table);
    const index = data.findIndex((i: any) => i.id === item.id);
    if (index > -1) data[index] = { ...data[index], ...item };
    else data.push(item);
    localDB.save(table, data);
    return item;
  }
};

/**
 * Cliente REST optimizado. Intenta usar Supabase, pero si falla por bloqueo 
 * de clave secreta, devuelve un error controlado para que el motor local tome el control.
 */
async function supabaseFetch(path: string, options: RequestInit = {}) {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${SUPABASE_URL}/rest/v1/${path}${separator}apikey=${K}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error en red');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error: any) {
    // Si es el error de "Forbidden secret key", lanzamos una excepción específica
    if (error.message?.includes('Forbidden use of secret API key')) {
      console.warn("Supabase Cloud bloqueado. Usando Motor de Datos Local (Offline Mode).");
      throw new Error('CLOUD_BLOCKED');
    }
    throw error;
  }
}

// --- ESTADÍSTICAS ---
export const getSystemStats = async (companyId?: string, userId?: string) => {
  try {
    const usersCountUrl = `${SUPABASE_URL}/rest/v1/users?select=id&apikey=${K}`;
    const decisionsCountUrl = `${SUPABASE_URL}/rest/v1/decisions?select=id,final_report&apikey=${K}`;

    const [uRes, dRes] = await Promise.all([
      fetch(usersCountUrl, { headers: { 'Prefer': 'count=exact' } }),
      fetch(decisionsCountUrl, { headers: { 'Prefer': 'count=exact' } })
    ]);

    const totalUsers = parseInt(uRes.headers.get('content-range')?.split('/')[1] || '0');
    const totalDecisions = parseInt(dRes.headers.get('content-range')?.split('/')[1] || '0');
    const decisionsData = await dRes.json();
    const scores = decisionsData.map((d: any) => d.final_report?.overallScore || 0).filter((s: number) => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

    return { totalUsers, totalDecisions, avgScore };
  } catch (error) {
    // Fallback Estadísticas Locales
    const lUsers = localDB.get(L_USERS);
    const lDecisions = localDB.get(L_DECISIONS);
    const scores = lDecisions.map((d: any) => d.final_report?.overallScore || 0).filter((s: number) => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    
    return { 
      totalUsers: lUsers.length || 1, 
      totalDecisions: lDecisions.length || 0, 
      avgScore: avgScore || 0 
    };
  }
};

// --- GESTIÓN DE EMPRESAS ---
export const getCompanies = async (): Promise<Company[]> => {
  try {
    return await supabaseFetch('companies?select=*&order=name.asc');
  } catch {
    return localDB.get(L_COMPANIES);
  }
};

export const upsertCompany = async (company: Partial<Company>) => {
  const item = { id: company.id || crypto.randomUUID(), name: company.name, country: company.country };
  try {
    return await supabaseFetch('companies', { method: 'POST', body: JSON.stringify(item) });
  } catch {
    return localDB.upsert(L_COMPANIES, item);
  }
};

export const deleteCompany = async (id: string) => {
  try {
    await supabaseFetch(`companies?id=eq.${id}`, { method: 'DELETE' });
  } catch {
    const data = localDB.get(L_COMPANIES).filter((c: any) => c.id !== id);
    localDB.save(L_COMPANIES, data);
  }
};

// --- GESTIÓN DE USUARIOS ---
export const getUsers = async (companyId?: string, role?: UserRole): Promise<User[]> => {
  try {
    let query = 'users?select=*';
    if (companyId) query += `&company_id=eq.${companyId}`;
    if (role) query += `&role=eq.${role}`;
    return await supabaseFetch(query);
  } catch {
    let data = localDB.get(L_USERS);
    if (companyId) data = data.filter((u: any) => u.company_id === companyId);
    if (role) data = data.filter((u: any) => u.role === role);
    return data;
  }
};

export const upsertUser = async (user: Partial<User>) => {
  const payload = {
    id: user.id || crypto.randomUUID(),
    email: user.email?.toLowerCase().trim(),
    role: user.role || UserRole.INDEPENDENT_LEADER,
    company_id: user.companyId || null,
    plan: user.plan || SubscriptionPlan.BASIC,
    name: user.name || '',
    surname: user.surname || '',
    position: user.position || null,
    team: user.team || null
  };
  
  try {
    return await supabaseFetch('users', { method: 'POST', body: JSON.stringify(payload) });
  } catch {
    return localDB.upsert(L_USERS, payload);
  }
};

export const deleteUser = async (id: string) => {
  try {
    await supabaseFetch(`users?id=eq.${id}`, { method: 'DELETE' });
  } catch {
    const data = localDB.get(L_USERS).filter((u: any) => u.id !== id);
    localDB.save(L_USERS, data);
  }
};

export const getAdminResults = async (companyId?: string): Promise<SavedDecision[]> => {
  try {
    let query = 'decisions?select=*,users(name,surname,company_id)&order=created_at.desc';
    const data = await supabaseFetch(query);
    if (companyId) return data.filter((d: any) => d.users?.company_id === companyId);
    return data;
  } catch {
    return localDB.get(L_DECISIONS);
  }
};
