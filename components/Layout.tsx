
import React, { useState, useEffect } from 'react';
import { User, UserRole, Language, SubscriptionPlan } from '../types';
import { translations } from '../translations';
import { LayoutDashboard, Target, History, LogOut, ShieldCheck, CreditCard, Languages, Users, CloudOff, CloudCheck } from 'lucide-react';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, children, activeView, setActiveView, lang, setLang, onSignOut }) => {
  const t = translations[lang];
  const [dbStatus, setDbStatus] = useState<'cloud' | 'local'>('cloud');

  useEffect(() => {
    // Test rápido para verificar conexión a Supabase
    fetch('https://kfbiszhrxpfpmxgglnhs.supabase.co/rest/v1/users?select=id&limit=1', {
      headers: { 'apikey': 'sb_secret__gMWT1PSmSO5oCuXAbI5aA_NcrPh4ir' }
    }).then(res => {
      setDbStatus(res.ok ? 'cloud' : 'local');
    }).catch(() => setDbStatus('local'));
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN, UserRole.LEADER, UserRole.INDEPENDENT_LEADER] },
    { id: 'new-decision', label: t.newDecision, icon: Target, roles: [UserRole.LEADER, UserRole.INDEPENDENT_LEADER] },
    { id: 'history', label: t.history, icon: History, roles: [UserRole.LEADER, UserRole.INDEPENDENT_LEADER] },
    { id: 'company', label: t.userMgmt, icon: Users, roles: [UserRole.COMPANY_ADMIN] },
    { id: 'admin', label: t.superAdmin, icon: ShieldCheck, roles: [UserRole.SUPER_ADMIN] },
    { id: 'subscription', label: t.subscription, icon: CreditCard, roles: [UserRole.INDEPENDENT_LEADER, UserRole.COMPANY_ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-xl shadow-slate-200/50 z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-blue-600 p-1.5 rounded-lg">
                <Target className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">
               DecisionAI
             </h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name} {user.surname}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t.signOut}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {menuItems.find(m => m.id === activeView)?.label || t.dashboard}
            </h2>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              dbStatus === 'cloud' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse'
            }`}>
              {dbStatus === 'cloud' ? <CloudCheck className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
              {dbStatus === 'cloud' ? 'Cloud Sync' : 'Local Engine'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white hover:border-blue-400 transition-all"
            >
              <Languages className="w-4 h-4 text-blue-600" />
              {lang === 'en' ? 'ESP' : 'ENG'}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
              user.plan === SubscriptionPlan.PREMIUM ? 'bg-indigo-600 text-white' :
              user.plan === SubscriptionPlan.PRO ? 'bg-blue-600 text-white' : 
              user.plan === SubscriptionPlan.BASIC ? 'bg-slate-800 text-white' :
              'bg-slate-200 text-slate-700'
            }`}>
              {user.plan} Plan
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
