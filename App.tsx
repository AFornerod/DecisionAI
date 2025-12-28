
import React, { useState, useEffect } from 'react';
import { User, UserRole, SubscriptionPlan, Language, Company, SavedDecision } from './types';
import { translations } from './translations';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DecisionCanvas from './components/DecisionCanvas';
import SubscriptionPlans from './components/SubscriptionPlans';
import History from './components/History';
import Landing from './components/Landing';
import Auth from './components/Auth';
import { ShieldCheck, Building2, Users, Plus, Pencil, Trash2, Globe, FileText, Calendar, UserCheck } from 'lucide-react';
import { getCompanies, getUsers, upsertCompany, upsertUser, deleteUser, getAdminResults, deleteCompany } from './services/managementService';

// Vistas posibles
type AppView = 'landing' | 'auth-login' | 'auth-register' | 'app';

const ResultsAuditor: React.FC<{ lang: Language, companyId?: string }> = ({ lang, companyId }) => {
  const t = translations[lang];
  const [results, setResults] = useState<SavedDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getAdminResults(companyId);
      setResults(data);
      setLoading(false);
    };
    load();
  }, [companyId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-8">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          {lang === 'es' ? 'Auditoría de Decisiones' : 'Decision Audit'}
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {results.map((r) => (
          <div key={r.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center font-black text-indigo-600">
                {r.finalReport.overallScore}
              </div>
              <div>
                <p className="font-bold text-slate-900">{r.title}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="font-medium text-indigo-600">{r.userName}</span>
                  <span>•</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button className="text-sm font-bold text-indigo-600 hover:underline">Ver Reporte</button>
          </div>
        ))}
        {results.length === 0 && !loading && (
          <p className="p-8 text-center text-slate-400">No hay decisiones registradas aún.</p>
        )}
      </div>
    </div>
  );
};

const UserManagementTable: React.FC<{ 
  lang: Language, 
  companyId?: string, 
  targetRole: UserRole, 
  title: string 
}> = ({ lang, companyId, targetRole, title }) => {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const load = async () => setUsers(await getUsers(companyId, targetRole));
  useEffect(() => { load(); }, [companyId, targetRole]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await upsertUser({ ...editingUser, companyId, role: targetRole });
    setEditingUser(null);
    setIsModalOpen(false);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          {title}
        </h3>
        <button 
          onClick={() => { setEditingUser({ name: '', surname: '', email: '', role: targetRole }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> {t.invite}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.name}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.position}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.team}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{u.name} {u.surname}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{u.position || '-'}</td>
                <td className="px-6 py-4 text-slate-600 text-sm">{u.team || '-'}</td>
                <td className="px-6 py-4 text-slate-600 text-sm font-mono">{u.identification || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={async () => { if(confirm(lang === 'es' ? '¿Eliminar usuario?' : 'Delete user?')) { await deleteUser(u.id); load(); } }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h4 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              {editingUser?.id ? t.edit : t.invite} {title}
            </h4>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.name}</label>
                <input required className="w-full p-3 border rounded-xl" value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser!, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.surname}</label>
                <input required className="w-full p-3 border rounded-xl" value={editingUser?.surname || ''} onChange={e => setEditingUser({...editingUser!, surname: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input required type="email" className="w-full p-3 border rounded-xl" value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser!, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.identification}</label>
                <input className="w-full p-3 border rounded-xl" value={editingUser?.identification || ''} onChange={e => setEditingUser({...editingUser!, identification: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.dob}</label>
                <input type="date" className="w-full p-3 border rounded-xl" value={editingUser?.dob || ''} onChange={e => setEditingUser({...editingUser!, dob: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.position}</label>
                <input className="w-full p-3 border rounded-xl" value={editingUser?.position || ''} onChange={e => setEditingUser({...editingUser!, position: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.team}</label>
                <input className="w-full p-3 border rounded-xl" value={editingUser?.team || ''} onChange={e => setEditingUser({...editingUser!, team: e.target.value})} />
              </div>
              <div className="col-span-2 flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">{t.save}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all">{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SuperAdminPanel: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Partial<Company> | null>(null);

  const load = async () => setCompanies(await getCompanies());
  useEffect(() => { load(); }, []);

  const handleSaveComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;
    await upsertCompany(editingComp);
    setEditingComp(null);
    setIsCompModalOpen(false);
    load();
  };

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            {t.companyMgmt}
          </h3>
          <button 
            onClick={() => { setEditingComp({ name: '', country: '' }); setIsCompModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm"
          >
            <Plus className="w-4 h-4" /> {t.addCompany}
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 p-6 gap-6">
          {companies.map(c => (
            <div key={c.id} className="p-6 border border-slate-100 rounded-2xl hover:border-blue-200 transition-all bg-slate-50/30">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingComp(c); setIsCompModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={async () => { if(confirm('Eliminar empresa?')) { await deleteCompany(c.id); load(); } }} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{c.name}</h4>
              <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-widest">{c.country}</p>
              
              <div className="pt-6 border-t border-slate-100">
                 <UserManagementTable 
                    lang={lang} 
                    companyId={c.id} 
                    targetRole={UserRole.COMPANY_ADMIN} 
                    title={t.addAdmin} 
                 />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ResultsAuditor lang={lang} />

      {isCompModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-2xl font-bold mb-6">{editingComp?.id ? t.edit : t.addCompany}</h4>
            <form onSubmit={handleSaveComp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.name}</label>
                <input required className="w-full p-3 border rounded-xl" value={editingComp?.name || ''} onChange={e => setEditingComp({...editingComp!, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">{t.country}</label>
                <input required className="w-full p-3 border rounded-xl" value={editingComp?.country || ''} onChange={e => setEditingComp({...editingComp!, country: e.target.value})} />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">{t.save}</button>
                <button type="button" onClick={() => setIsCompModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [activeView, setActiveView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('es');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>();

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    setView('app');
    setActiveView('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setView('landing');
    setActiveView('dashboard');
    setSelectedPlan(undefined);
  };

  const toggleRole = () => {
    if (!user) return;
    const roles = Object.values(UserRole);
    const nextIdx = (roles.indexOf(user.role) + 1) % roles.length;
    setUser({ ...user, role: roles[nextIdx] });
    setActiveView('dashboard');
  };

  if (view === 'landing') {
    return (
      <Landing 
        lang={lang} 
        setLang={setLang} 
        onEnter={() => setView('auth-login')} 
        onViewPlans={() => {
          setSelectedPlan(undefined);
          setView('auth-register');
        }}
      />
    );
  }

  if (view === 'auth-login' || view === 'auth-register') {
    return (
      <Auth 
        lang={lang}
        initialMode={view === 'auth-login' ? 'login' : 'register'}
        selectedPlan={selectedPlan}
        onAuthSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setView(mode === 'login' ? 'auth-login' : 'auth-register')}
        onBack={() => setView('landing')}
      />
    );
  }

  // Si estamos aquí, view === 'app' y user != null
  const currentUser = user!;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard user={currentUser} lang={lang} />;
      case 'new-decision':
        return <DecisionCanvas lang={lang} userId={currentUser.id} />;
      case 'history':
        return <History lang={lang} />;
      case 'subscription':
        return (
          <SubscriptionPlans 
            lang={lang} 
            onSelectPlan={(plan) => {
              // Aquí en el app real haríamos el upgrade del plan
              setUser({...currentUser, plan});
            }}
          />
        );
      case 'company':
        return (
          <div className="space-y-8">
            <UserManagementTable 
              lang={lang} 
              companyId={currentUser.companyId} 
              targetRole={UserRole.LEADER} 
              title={lang === 'es' ? 'Líderes de mi Empresa' : 'Company Leaders'} 
            />
            <ResultsAuditor lang={lang} companyId={currentUser.companyId} />
          </div>
        );
      case 'admin':
        return <SuperAdminPanel lang={lang} />;
      default:
        return <Dashboard user={currentUser} lang={lang} />;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      lang={lang} 
      setLang={setLang}
      onSignOut={handleSignOut}
    >
      <div className="animate-in fade-in duration-700">
        <div className="fixed bottom-4 right-4 z-[99]">
          <button 
            onClick={toggleRole} 
            className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg opacity-40 hover:opacity-100 transition-opacity text-xs font-bold"
          >
             ROL: {currentUser.role}
          </button>
        </div>
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
