
import React, { useState, useEffect } from 'react';
import { User, Language, UserRole, SavedDecision } from '../types';
import { translations } from '../translations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Clock, Shield, Award, Users, TrendingUp, Loader2 } from 'lucide-react';
import { getSystemStats } from '../services/managementService';
import { getHistory } from '../services/storageService';

interface DashboardProps {
  user: User;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ user, lang }) => {
  const t = translations[lang];
  const isManagement = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.COMPANY_ADMIN;
  
  const [stats, setStats] = useState({ totalUsers: 0, totalDecisions: 0, avgScore: 0 });
  const [userDecisions, setUserDecisions] = useState<SavedDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [sysStats, history] = await Promise.all([
          getSystemStats(user.companyId, user.id),
          getHistory(user.id)
        ]);
        
        setStats(sysStats);
        setUserDecisions(history.slice(0, 5)); // Show last 5
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user.id, user.companyId]);

  // Dynamic trend data based on real history
  const trendData = userDecisions.length > 0 
    ? [...userDecisions].reverse().map(d => ({
        name: new Date(d.createdAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }),
        quality: d.finalReport?.overallScore || 0
      }))
    : [{ name: 'N/A', quality: 0 }];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Sincronizando con Decision Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[2rem] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Activity className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-4xl font-black mb-4 tracking-tight">{t.welcome}, {user.name}!</h3>
          <p className="text-lg opacity-60 leading-relaxed font-medium">
            {isManagement 
              ? (user.role === UserRole.SUPER_ADMIN ? t.globalStats : t.companyStats)
              : t.improvementMsg}
          </p>
          {!isManagement && (
            <div className="mt-8 flex gap-4">
              <div className="bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  {lang === 'es' ? 'Score Promedio' : 'Average Score'}
                </span>
                <p className="text-2xl font-black">{stats.avgScore}/100</p>
              </div>
              <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {lang === 'es' ? 'Efectividad' : 'Effectiveness'}
                </span>
                <p className="text-2xl font-black">+{stats.avgScore > 70 ? '12%' : '5%'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: isManagement ? t.activeAnalyses : t.analysesRun, 
            val: isManagement ? stats.totalDecisions.toString() : userDecisions.length.toString(), 
            icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' 
          },
          { 
            label: t.avgMaturity, 
            val: `${stats.avgScore}%`, 
            icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' 
          },
          { 
            label: isManagement ? t.totalLeaders : t.riskExposure, 
            val: isManagement ? stats.totalUsers.toString() : (stats.avgScore > 75 ? 'Low' : 'Medium'), 
            icon: isManagement ? Users : Shield, color: 'text-amber-600', bg: 'bg-amber-50' 
          },
          { 
            label: t.decisionSpeed, 
            val: '24h', 
            icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-blue-600" />
               {t.qualityTrend}
            </h4>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="quality" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorQuality)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-xl font-black text-slate-800 mb-8 tracking-tight">{t.efficiencyVsQuality}</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="quality" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {!isManagement && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h4 className="text-xl font-black text-slate-800 tracking-tight">{t.recentDecisions}</h4>
          </div>
          <div className="divide-y divide-slate-50">
            {userDecisions.length > 0 ? userDecisions.map((item, i) => (
              <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg bg-emerald-100 text-emerald-700`}>
                    {item.finalReport?.overallScore || '-'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg mb-1">{item.title}</p>
                    <div className="flex items-center gap-3">
                       <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                         {new Date(item.createdAt).toLocaleDateString()}
                       </span>
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-emerald-500 bg-emerald-50`}>
                         COMPLETED
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                {lang === 'es' ? 'No se encontraron decisiones recientes en la base de datos.' : 'No recent decisions found in the database.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
