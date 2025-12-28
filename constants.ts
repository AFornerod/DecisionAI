
import { Language, SubscriptionPlan } from './types';

export const getDecisionSteps = (lang: Language) => [
  {
    id: 'define',
    name: lang === 'es' ? 'Análisis de la Situación' : 'Situation Analysis',
    description: lang === 'es' ? 'Define claramente el problema, el contexto y el resultado deseado.' : 'Clearly define the problem, the context, and the desired outcome.'
  },
  {
    id: 'stakeholders',
    name: lang === 'es' ? 'Mapa de Stakeholders' : 'Stakeholder Mapping',
    description: lang === 'es' ? 'Identifica quién se ve afectado y quién debe participar (Marco RAPID).' : 'Identify who is affected and who needs to be involved (RAPID Framework).'
  },
  {
    id: 'alternatives',
    name: lang === 'es' ? 'Generación de Alternativas' : 'Alternatives Generation',
    description: lang === 'es' ? 'Explora múltiples cursos de acción sin sesgos.' : 'Explore multiple courses of action without bias.'
  },
  {
    id: 'risks',
    name: lang === 'es' ? 'Evaluación de Riesgos y Compensaciones' : 'Risk & Trade-off Assessment',
    description: lang === 'es' ? 'Evalúa los pros, contras y consecuencias no deseadas de cada opción.' : 'Evaluate the pros, cons, and unintended consequences of each option.'
  },
  {
    id: 'selection',
    name: lang === 'es' ? 'Selección Final y Justificación' : 'Final Selection & Rationale',
    description: lang === 'es' ? 'Elige el mejor camino y documenta la lógica detrás de él.' : 'Choose the best path and document the logic behind it.'
  }
];

export const getPlans = (lang: Language) => [
  {
    id: SubscriptionPlan.FREE,
    name: lang === 'es' ? 'Gratis' : 'Free',
    price: '$0',
    features: lang === 'es' 
      ? ['3 Análisis de Decisión/mes', 'Marcos Básicos', 'Acceso a la Comunidad'] 
      : ['3 Decision Analyses/month', 'Basic Frameworks', 'Community Access'],
    color: 'bg-white border-slate-200'
  },
  {
    id: SubscriptionPlan.BASIC,
    name: lang === 'es' ? 'Básico' : 'Basic',
    price: '$15/mo',
    features: lang === 'es'
      ? ['10 Análisis de Decisión/mes', 'Marcos Básicos', 'Soporte Estándar']
      : ['10 Decision Analyses/month', 'Basic Frameworks', 'Standard Support'],
    color: 'bg-white border-slate-200'
  },
  {
    id: SubscriptionPlan.PRO,
    name: lang === 'es' ? 'Profesional' : 'Professional',
    price: '$29/mo',
    features: lang === 'es'
      ? ['50 Análisis de Decisión/mes', 'Marcos Avanzados (Cynefin)', 'Matriz de Riesgos Detallada', 'Soporte Prioritario']
      : ['50 Decision Analyses/month', 'Advanced Frameworks (Cynefin)', 'Detailed Risk Matrix', 'Priority Support'],
    color: 'bg-blue-50 border-blue-200 shadow-blue-100 shadow-lg'
  },
  {
    id: SubscriptionPlan.PREMIUM,
    name: lang === 'es' ? 'Premium' : 'Premium',
    price: lang === 'es' ? 'Personalizado' : 'Custom',
    features: lang === 'es'
      ? ['Decisiones Ilimitadas', 'Licenciamiento por Volumen', 'Tablero de Empresa', 'Marcos Personalizados', 'Integración SSO', 'Gerente Dedicado']
      : ['Unlimited Decisions', 'Bulk Licensing', 'Company Dashboard', 'Custom Frameworks', 'SSO Integration', 'Dedicated Manager'],
    color: 'bg-indigo-50 border-indigo-200'
  }
];
