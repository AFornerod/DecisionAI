
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Target, Zap, Shield, Brain, LayoutTemplate, ArrowRight, Languages } from 'lucide-react';

interface LandingProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onEnter: () => void;
  onViewPlans: () => void;
}

const Landing: React.FC<LandingProps> = ({ lang, setLang, onEnter, onViewPlans }) => {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#0a0c1b] text-white selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-50 bg-[#0a0c1b]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DecisionAI</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <Languages className="w-4 h-4" />
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <button onClick={onEnter} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t.login}
          </button>
          <button 
            onClick={onViewPlans}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            {t.subscribe}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Zap className="w-3 h-3" /> {lang === 'es' ? 'COACHING DE ÉLITE PARA LÍDERES' : 'ELITE COACHING FOR LEADERS'}
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            {t.heroTitle} <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
              {t.heroSubtitle}
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={onViewPlans}
              className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              {t.viewPlans}
            </button>
            <button 
              onClick={onEnter}
              className="w-full md:w-auto px-8 py-4 bg-slate-800/50 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-slate-800 transition-all active:scale-95"
            >
              {t.leaderAccess}
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { title: t.feature1Title, desc: t.feature1Desc, icon: LayoutTemplate, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { title: t.feature2Title, desc: t.feature2Desc, icon: Target, color: 'text-teal-400', bg: 'bg-teal-500/10' },
            { title: t.feature3Title, desc: t.feature3Desc, icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { title: t.feature4Title, desc: t.feature4Desc, icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { title: t.feature5Title, desc: t.feature5Desc, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-[#121429] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-1"
            >
              <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Final CTA */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <p className="text-slate-500 mb-2">© 2024 DecisionAI. {lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
      </section>
    </div>
  );
};

export default Landing;
