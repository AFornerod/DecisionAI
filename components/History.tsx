
import React, { useState, useEffect } from 'react';
import { getHistory, deleteDecision } from '../services/storageService';
import { SavedDecision, Language } from '../types';
import { translations } from '../translations';
import { Calendar, Trash2, ChevronRight, Eye, BrainCircuit, Target, Loader2 } from 'lucide-react';

interface HistoryProps {
  lang: Language;
}

const History: React.FC<HistoryProps> = ({ lang }) => {
  const t = translations[lang];
  const [history, setHistory] = useState<SavedDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<SavedDecision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'es' ? '¿Estás seguro de que quieres eliminar este análisis?' : 'Are you sure you want to delete this analysis?')) {
      try {
        await deleteDecision(id);
        await fetchHistory();
      } catch (err) {
        alert(lang === 'es' ? 'Error al eliminar' : 'Error deleting');
      }
    }
  };

  if (selectedDecision) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
        <button 
          onClick={() => setSelectedDecision(null)}
          className="text-blue-600 font-bold flex items-center gap-2 mb-4 hover:underline"
        >
          <ChevronRight className="w-5 h-5 rotate-180" /> {t.back}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold mb-2">{selectedDecision.title}</h3>
                <p className="opacity-90">{new Date(selectedDecision.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black mb-1">{selectedDecision.finalReport.overallScore}</div>
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
                <p className="text-slate-600">{selectedDecision.finalReport.style}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  {t.strategicAlignment}
                </div>
                <p className="text-slate-600">{selectedDecision.finalReport.alignment}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-lg border-b pb-2">{lang === 'es' ? 'Pasos del Proceso' : 'Process Steps'}</h4>
              {selectedDecision.steps.map((step, idx) => (
                <div key={idx} className="p-4 border border-slate-100 rounded-lg bg-slate-50">
                  <p className="font-bold text-blue-700 mb-1">{step.name}</p>
                  <p className="text-sm text-slate-600">{step.input}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">{t.history}</h3>
        {loading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">{t.noHistory}</p>
        </div>
      ) : (
        <div className="grid gap-4 animate-in fade-in duration-500">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedDecision(item)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600">
                  {item.finalReport.overallScore}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title={t.viewDetails}
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title={t.delete}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
