
import { SavedDecision } from '../types';

const SUPABASE_URL = 'https://kfbiszhrxpfpmxgglnhs.supabase.co';
const K = 'sb_secret__gMWT1PSmSO5oCuXAbI5aA_NcrPh4ir';
const L_DECISIONS = 'db_decisions';

const localDB = {
  get: () => JSON.parse(localStorage.getItem(L_DECISIONS) || '[]'),
  save: (data: any[]) => localStorage.setItem(L_DECISIONS, JSON.stringify(data)),
  add: (item: any) => {
    const data = localDB.get();
    data.unshift(item); // Más reciente primero
    localDB.save(data);
    return item;
  }
};

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${SUPABASE_URL}/rest/v1/${path}${separator}apikey=${K}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    }
  });

  if (!response.ok) throw new Error('Cloud error');
  return response.json();
}

export const saveDecision = async (decision: Omit<SavedDecision, 'id' | 'createdAt'>): Promise<SavedDecision> => {
  const localItem: SavedDecision = {
    ...decision,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  try {
    const payload = {
      user_id: decision.userId,
      title: decision.title,
      steps: decision.steps,
      final_report: decision.finalReport
    };

    const data = await supabaseFetch('decisions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const result = data[0];
    const saved = {
      id: result.id,
      userId: result.user_id,
      title: result.title,
      steps: result.steps,
      finalReport: result.final_report,
      createdAt: result.created_at
    };
    
    // Espejo local siempre para velocidad
    localDB.add(saved);
    return saved;
  } catch (err) {
    console.warn("Decision guardada localmente (Modo Offline)");
    return localDB.add(localItem);
  }
};

export const getHistory = async (userId?: string): Promise<SavedDecision[]> => {
  try {
    let query = 'decisions?select=*&order=created_at.desc';
    if (userId) query += `&user_id=eq.${userId}`;
    const data = await supabaseFetch(query);
    return data.map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      steps: d.steps,
      finalReport: d.final_report,
      createdAt: d.created_at
    }));
  } catch (err) {
    let data = localDB.get();
    if (userId) data = data.filter((d: any) => d.userId === userId);
    return data;
  }
};

export const deleteDecision = async (id: string): Promise<void> => {
  try {
    await supabaseFetch(`decisions?id=eq.${id}`, { method: 'DELETE' });
  } catch (err) {
    // No op
  } finally {
    const data = localDB.get().filter((d: any) => d.id !== id);
    localDB.save(data);
  }
};
