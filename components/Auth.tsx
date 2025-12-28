
import React, { useState, useMemo } from 'react';
import { Language, UserRole, SubscriptionPlan, User } from '../types';
import { translations } from '../translations';
import { getPlans } from '../constants';
import { Target, ArrowRight, Loader2, Check, Sparkles } from 'lucide-react';
import { upsertUser, getUsers } from '../services/managementService';

interface AuthProps {
  lang: Language;
  initialMode: 'login' | 'register';
  selectedPlan?: SubscriptionPlan;
  onAuthSuccess: (user: User) => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ lang, initialMode, selectedPlan, onAuthSuccess, onSwitchMode, onBack }) => {
  const t = translations[lang];
  const PLANS = useMemo(() => getPlans(lang), [lang]);
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(selectedPlan || SubscriptionPlan.BASIC);
  const [step, setStep] = useState<number>(mode === 'register' ? 1 : 2);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Verificar si el usuario existe para login o registro
      const users = await getUsers();
      const lowerEmail = email.toLowerCase().trim();

      if (mode === 'login') {
        const found = users.find(u => u.email.toLowerCase() === lowerEmail);
        if (found) {
          onAuthSuccess(found);
        } else {
          setError(lang === 'es' ? 'Credenciales incorrectas o usuario no registrado.' : 'Incorrect credentials or user not found.');
        }
      } else {
        // 2. Proceso de Registro
        const newUser: Partial<User> = {
          id: crypto.randomUUID(),
          email: lowerEmail,
          name: name.trim(),
          surname: surname.trim(),
          role: UserRole.INDEPENDENT_LEADER,
          plan: currentPlan
        };
        
        // Guardar en Supabase directamente
        const result = await upsertUser(newUser);
        const savedUser = Array.isArray(result) ? result[0] : result;
        
        if (!savedUser) throw new Error('Error al confirmar la creación del perfil.');

        const userToLogin: User = {
          id: savedUser.id,
          email: savedUser.email,
          role: (savedUser.role as UserRole) || UserRole.INDEPENDENT_LEADER,
          plan: (savedUser.plan as SubscriptionPlan) || currentPlan,
          name: savedUser.name,
          surname: savedUser.surname,
          companyId: savedUser.company_id
        };

        onAuthSuccess(userToLogin);
      }
    } catch (err: any) {
      console.error("Error en autenticación:", err);
      setError(err.message || 'Error en el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setStep(newMode === 'register' ? 1 : 2);
    setError(null);
    onSwitchMode(newMode);
  };

  return (
    <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse delay-1000" />

      <div className={`w-full transition-all duration-700 ease-in-out ${step === 1 ? 'max-w-6xl' : 'max-w-lg'}`}>
        <div className="bg-[#121429]/90 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-10 md:p-14 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
          
          <div className="text-center mb-12">
            <div className="group bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(37,99,235,0.4)] transform hover:rotate-12 transition-all cursor-pointer" onClick={onBack}>
              <Target className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {mode === 'login' ? t.login : (step === 1 ? t.choosePath : t.registerNow)}
            </h2>
          </div>

          {error && (
            <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-sm font-bold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {mode === 'register' && step === 1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setCurrentPlan(plan.id)}
                    className={`relative p-8 rounded-[2.5rem] border-2 transition-all text-left flex flex-col h-full group ${
                      currentPlan === plan.id 
                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.2)] scale-[1.02]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <h4 className="text-xl font-bold tracking-tight mb-4">{plan.name}</h4>
                    <div className="mb-8">
                      <span className="text-3xl font-black">{plan.price}</span>
                    </div>
                    <ul className="space-y-4 flex-1 mb-8">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-3">
                          <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed opacity-80">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="group bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95"
                >
                  <span>{lang === 'es' ? 'Continuar' : 'Continue'}</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-6">
                  <input
                    required
                    placeholder={t.name}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 px-6 outline-none focus:border-blue-500 transition-all"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input
                    required
                    placeholder={t.surname}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 px-6 outline-none focus:border-blue-500 transition-all"
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                  />
                </div>
              )}

              <input
                required
                type="email"
                placeholder={t.email}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 px-6 outline-none focus:border-blue-500 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                required
                type="password"
                placeholder={t.password}
                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 px-6 outline-none focus:border-blue-500 transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'login' ? t.login : t.registerNow)}
              </button>
            </form>
          )}

          <div className="mt-14 text-center">
            <button 
              onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-500 font-black hover:text-blue-400 transition-colors"
            >
              {mode === 'login' ? t.registerNow : t.login}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
