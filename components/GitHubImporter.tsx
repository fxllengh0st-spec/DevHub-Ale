import React, { useState } from 'react';
import { Github, Loader2, X, CheckCircle2, ChevronRight, Sparkles, UserPlus, AlertCircle } from 'lucide-react';
import { refineProjectsFromGitHub } from '../services/geminiService';
import { Project, Category } from '../types';

interface GitHubImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: Project[]) => void;
}

export const GitHubImporter: React.FC<GitHubImporterProps> = ({ isOpen, onClose, onImport }) => {
  const [usernames, setUsernames] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [foundProjects, setFoundProjects] = useState<Partial<Project>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const quickProfiles = ['fxllengh0st-spec', 'SandroBreaker'];

  const fetchRepos = async (targetUsernames?: string) => {
    const names = (targetUsernames || usernames)
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (names.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let allRepos: any[] = [];
      
      for (const name of names) {
        const response = await fetch(`https://api.github.com/users/${name}/repos?sort=updated&per_page=60`);
        
        if (response.status === 403) {
          throw new Error(`GitHub API rate limit exceeded for ${name}. Try again in a few minutes.`);
        }
        
        if (!response.ok) {
          throw new Error(`Profile "${name}" not found or unreachable.`);
        }
        
        const repos = await response.json();
        if (Array.isArray(repos)) {
          // Filtrar apenas repositórios originais (não forks)
          const originals = repos.filter(r => !r.fork);
          allRepos = [...allRepos, ...originals];
        }
      }

      if (allRepos.length === 0) {
        throw new Error("No public repositories found in these accounts.");
      }

      // IA analisa os repositórios
      const refined = await refineProjectsFromGitHub(allRepos);
      
      if (!refined || refined.length === 0) {
        throw new Error("AI analysis failed to structure the project data. Please try again.");
      }

      const finalData = refined.map((p, i) => {
        const original = allRepos.find(r => r.name.toLowerCase() === (p.title || '').toLowerCase()) || allRepos[i];
        
        return {
          ...p,
          repoUrl: original.html_url,
          demoUrl: original.homepage || '',
          createdAt: original.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80'
        };
      });

      setFoundProjects(finalData);
      setSelectedIndices(new Set(finalData.map((_, i) => i)));
      setStep('preview');
    } catch (e: any) {
      console.error("GitHub Sync Error:", e);
      setError(e.message || "An unexpected error occurred during synchronization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const toImport = foundProjects
      .filter((_, i) => selectedIndices.has(i))
      .map(p => ({
        ...p,
        id: Math.random().toString(36).substring(2, 9),
      } as Project));
    
    onImport(toImport);
    onClose();
    setStep('input');
    setUsernames('');
    setError(null);
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 backdrop-blur-2xl p-4">
      <div className="bg-surface border border-slate-800 rounded-[2.5rem] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-up">
        
        <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Github size={28} /> {step === 'input' ? 'MULTI-ACCOUNT SYNC' : 'AI BATCH ANALYSIS'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Consolidating profiles via Gemini Neural Engine
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-500">
              <AlertCircle className="shrink-0" size={18} />
              <div className="text-xs font-bold uppercase tracking-wider">{error}</div>
            </div>
          )}

          {step === 'input' ? (
            <div className="space-y-10 py-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary border border-primary/20">
                  <UserPlus size={40} />
                </div>
                <div className="space-y-2">
                   <p className="text-slate-300 font-bold">Consolidate your identities</p>
                   <p className="text-slate-500 text-sm max-w-sm mx-auto">Sync all your public projects. Gemini will structure them for your portfolio.</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                 {quickProfiles.map(profile => (
                   <button
                    key={profile}
                    onClick={() => {
                      setUsernames(profile);
                      fetchRepos(profile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-primary hover:border-primary/40 transition-all"
                   >
                     <Github size={12} /> {profile}
                   </button>
                 ))}
                 <button
                    onClick={() => {
                      const both = quickProfiles.join(', ');
                      setUsernames(both);
                      fetchRepos(both);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase text-primary hover:bg-primary/20 transition-all"
                   >
                     Sync Both Accounts
                   </button>
              </div>

              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="usernames separated by comma..."
                  value={usernames}
                  onChange={e => setUsernames(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-lg font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <button
                onClick={() => fetchRepos()}
                disabled={isLoading || !usernames}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-primary hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <ChevronRight />}
                {isLoading ? 'ANALYZING STACK...' : 'FETCH ALL DATA'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center gap-3 mb-6">
                  <Sparkles size={20} className="text-primary" />
                  <p className="text-xs text-slate-400 font-medium">Gemini refined <b>{foundProjects.length}</b> projects. Select which ones to publish.</p>
               </div>
               
               {foundProjects.map((p, i) => (
                 <div 
                  key={i} 
                  onClick={() => toggleSelect(i)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-6 ${
                    selectedIndices.has(i) ? 'bg-primary/10 border-primary/30' : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                 >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIndices.has(i) ? 'bg-primary border-primary text-white' : 'border-slate-800'
                    }`}>
                      {selectedIndices.has(i) && <CheckCircle2 size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-white">{p.title}</h4>
                        <span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded-md uppercase text-slate-400 font-bold">{p.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {step === 'preview' && (
          <div className="p-8 border-t border-slate-800 bg-slate-900/20 flex justify-between items-center">
            <button 
              onClick={() => { setStep('input'); setError(null); }}
              className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20"
            >
              SAVE TO PORTFOLIO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};