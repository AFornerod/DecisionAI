
import React, { useMemo } from 'react';
import { getPlans } from '../constants';
import { Language, SubscriptionPlan } from '../types';
import { translations } from '../translations';
import { Check, Sparkles } from 'lucide-react';

interface SubscriptionPlansProps {
  lang: Language;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ lang, onSelectPlan }) => {
  const t = translations[lang];
  const PLANS = useMemo(() => getPlans(lang), [lang]);

  return (
    <div className="max-w-7xl mx-auto py-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 mb-4">{t.choosePath}</h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          {t.growthSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-2xl border p-8 flex flex-col transition-transform hover:-translate-y-1 ${plan.color}`}
          >
            {plan.id === SubscriptionPlan.PRO && (
              <div className="flex justify-center mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t.mostPopular}
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.id !== SubscriptionPlan.PREMIUM && plan.id !== SubscriptionPlan.FREE && (
                <span className="text-slate-500 font-medium text-sm">/{t.month}</span>
              )}
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-tight">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onSelectPlan?.(plan.id)}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                plan.id === SubscriptionPlan.PRO 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl' 
                  : plan.id === SubscriptionPlan.PREMIUM
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {plan.id === SubscriptionPlan.PREMIUM ? t.contactSales : t.upgradeNow}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;