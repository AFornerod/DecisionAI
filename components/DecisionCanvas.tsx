
import React, { useState, useMemo } from 'react';
import { getDecisionSteps } from '../constants';
import { Language } from '../types';
import { translations } from '../translations';
import { getDecisionFeedback, generateFinalReport } from '../services/geminiService';
import { saveDecision } from '../services/storageService';
import { Loader2, BrainCircuit, AlertCircle, TrendingUp, ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

interface DecisionCanvasProps {
  lang: Language;
  userId: string;
}

const DecisionCanvas: React.FC<DecisionCanvasProps> = ({ lang, userId }) => {
  const t = translations[lang];
  const DECISION_STEPS = useMemo(() => getDecisionSteps(lang), [lang]);
  
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<any[]>(DECISION_STEPS.map(s => ({ ...s, input: '', insights: null })));
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[currentStepIdx];

  const handleInputChange = (val: string) => {
    const newSteps = [...steps];
    newSteps[currentStepIdx].input = val;
    setSteps(newSteps);
  };

  const handleReset = () => {
    setTitle('');
    setCurrentStepIdx(0);
    setSteps(DECISION_STEPS.map(s => ({ ...s, input: '', insights: null })));
    setCompleted(false);
    setFinalReport(null);
    setLoading(false);
    setSavedStatus(false);
    setError(null);
  };

  const handleNext = async () => {
    setError(null);
    if (currentStepIdx < steps.length - 1) {
      setLoading(true);
      try {
        const result = await getDecisionFeedback(
          currentStep.name,
          title || 'A strategic leadership decision',
          currentStep.input,
          steps.slice(0, currentStepIdx),
          lang
        );
        const newSteps = [...steps];
        newSteps[currentStepIdx].insights = result;
        setSteps(newSteps);
        setCurrentStepIdx(currentStepIdx + 1);
      } catch (err) {
        setError(lang === 'es' ? 'Error al obtener feedback de IA' : 'Error getting AI feedback');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const report = await generateFinalReport({ title, steps }, lang);
        setFinalReport(report);
        
        // Guardar en la base de datos y esperar confirmación
        await saveDecision({
          userId,
          title,
          steps,
          finalReport: report
        });
        
        setSavedStatus(true);
        setCompleted(true);
      } catch (err) {
        setError(lang === 'es' ? 'Análisis completado pero hubo un problema al guardar en la nube.' : 'Analysis complete but there was an issue saving to the cloud.');
        console.error(err);
        setCompleted(true); // Permitimos ver el reporte aunque el guardado falle (estará en local)
      } finally {
        setLoading(false);
      }
    }
  };

  if (completed && finalReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {savedStatus ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-800 font-medium">
            <CheckCircle className="w-5 h-5" />
            {t.saveSuccess}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 font-medium">
            <AlertCircle className="w-5 h-5" />
            {lang === 'es' ? 'Guardado en modo local (sin conexión a la nube)' : 'Saved in local mode (no cloud connection)'}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold mb-2">{t.maturityAudit}</h3>
                <p className="opacity-90">{title}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black mb-1">{finalReport.overallScore}</div>
                <div className="text-xs font-bold uppercase tracking-widest">Score</div>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600" />
                  {t.leadershipStyle}
                </div>
                <p className="text-slate-600 leading-relaxed">{finalReport.style}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  {t.strategicAlignment}
                </div>
                <p className="text-slate-600 leading-relaxed">{finalReport.alignment}</p>
              </div>
            </div>

            <div className="p-4 border-l-4 border-amber-400 bg-amber-50">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                <AlertCircle className="w-5 h-5" />
                {t.riskTip}
              </div>
              <p className="text-amber-700">{finalReport.riskSummary}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 mx-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                {t.analyzeAnother}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {currentStepIdx === 0 && !title && (
        <div className="mb-12 space-y-4">
          <h3 className="text-2xl font-bold text-slate-800">{t.whatDecision}</h3>
          <input
            type="text"
            placeholder={lang === 'es' ? "ej. Contratación de nuevo CTO para expansión" : "e.g. Hiring a New CTO for the Expansion Phase"}
            className="w-full px-6 py-4 text-xl rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      )}

      {title && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 px-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  idx <= currentStepIdx ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                {t.stepOf.replace('{0}', (currentStepIdx + 1).toString()).replace('{1}', steps.length.toString())}
              </span>
              <h4 className="text-xl font-bold text-slate-800">{currentStep.name}</h4>
            </div>

            <p className="text-slate-600 mb-6">{currentStep.description}</p>

            <textarea
              className="w-full h-64 p-6 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg resize-none"
              placeholder={t.describeThinking}
              value={currentStep.input}
              onChange={(e) => handleInputChange(e.target.value)}
            />

            {currentStep.insights && (
              <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
                  <BrainCircuit className="w-5 h-5" />
                  {t.aiCoachInsight} ({t.stepScore}: {currentStep.insights.score})
                </div>
                <p className="text-blue-700 mb-4">{currentStep.insights.insights}</p>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-900 uppercase">{t.considerThese}</span>
                  {currentStep.insights.criticalQuestions.map((q: string, i: number) => (
                    <div key={i} className="flex gap-2 text-sm text-blue-800">
                      <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                disabled={currentStepIdx === 0 || loading}
                onClick={() => setCurrentStepIdx(currentStepIdx - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-slate-500 font-medium hover:bg-slate-50 disabled:opacity-30"
              >
                <ArrowLeft className="w-5 h-5" /> {t.back}
              </button>

              <button
                disabled={!currentStep.input || loading}
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> {t.thinking}
                  </>
                ) : (
                  <>
                    {currentStepIdx === steps.length - 1 ? t.finishAnalysis : t.nextStep} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionCanvas;
