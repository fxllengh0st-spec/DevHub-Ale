import React, { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { GeminiChat } from './components/GeminiChat';
import { ProjectForm } from './components/ProjectForm';
import { GitHubImporter } from './components/GitHubImporter';
import { fetchProjects, createProject, updateProject, deleteProject, uploadImage } from './services/projectService';
import { Category, Project } from './types';
import { Search, Layers, Github, Linkedin, Mail, Plus, Lock, Unlock, RefreshCw, Terminal, Cpu, Zap, Key, ExternalLink, LayoutGrid, List } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasKey, setHasKey] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    checkApiKey();
    loadData();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      await checkApiKey();
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = activeCategory === Category.ALL || project.category === activeCategory;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

  const visibleProjects = filteredProjects.slice(0, displayedItemsCount);
  const hasMore = displayedItemsCount < filteredProjects.length;

  const handleLoadMore = () => setDisplayedItemsCount(prev => prev + ITEMS_PER_PAGE);

  const handleSaveProject = async (project: Project, imageFile?: File) => {
    try {
      let finalImageUrl = project.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }
      const projectToSave = { ...project, imageUrl: finalImageUrl };
      if (editingProject) {
        const updated = await updateProject(projectToSave);
        if (updated) setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createProject(projectToSave);
        if (created) setProjects(prev => [created, ...prev]);
      }
      setIsFormOpen(false);
    } catch (e: any) {
      console.error("Erro ao salvar:", e);
      alert("Erro ao salvar: " + e.message);
    }
  };

  const handleImportGitHub = async (newProjects: Project[]) => {
    setIsLoading(true);
    try {
      for (const p of newProjects) {
        await createProject(p);
      }
      await loadData();
    } catch (e) {
      console.error("Erro na importação:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 grid-pattern selection:bg-primary/30">
      {!hasKey && (
        <div className="fixed top-0 left-0 w-full z-[200] bg-primary/20 backdrop-blur-xl border-b border-primary/30 py-3 px-4 animate-fade-down">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Key size={18} className="text-primary animate-pulse" />
              <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">
                AI Offline: Chave de API necessária para análise de repositórios.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] font-black text-slate-400 hover:text-white flex items-center gap-1 uppercase tracking-tighter">
                Faturamento <ExternalLink size={10} />
              </a>
              <button onClick={handleSelectKey} className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                Configurar Chave
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={`fixed top-0 z-[100] w-full glass transition-all ${!hasKey ? 'mt-16 sm:mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="group relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all rounded-full"></div>
              <div className="relative w-full h-full bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                DH
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black text-white tracking-tighter uppercase leading-none">DevHub</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Sistema Ativo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex gap-6 mr-6">
               <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Portfólio</a>
               <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Sobre</a>
               <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Contato</a>
            </div>
            
            <button 
              onClick={() => setIsAdmin(!isAdmin)} 
              title={isAdmin ? "Sair do modo Admin" : "Entrar no modo Admin"}
              className={`p-2.5 rounded-xl border transition-all ${isAdmin ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
               {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
            
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-900/50 border border-slate-800 rounded-xl">
               <span className="text-[10px] font-black text-slate-500 uppercase">Status:</span>
               <span className="text-[10px] font-black text-emerald-500 uppercase">Premium</span>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 pt-32 sm:pt-48 pb-20 transition-all ${!hasKey ? 'mt-12' : ''}`}>
        <section className="mb-24 text-center relative">
          <div className="hero-glow"></div>
          <div className="relative animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-black text-primary mb-10 uppercase tracking-[0.3em]">
              <Zap size={12} /> Engenheiro de Software Sênior
            </div>
            
            <h2 className="text-5xl sm:text-8xl font-black mb-10 tracking-tighter text-white leading-[0.95] max-w-4xl mx-auto">
              Consolidando <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-500">40+ Projetos Premium.</span>
            </h2>
            
            <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-xl font-medium leading-relaxed mb-16 px-4">
              Um ecossistema de alta performance. Cada projeto é um módulo arquitetural verificado, desenhado para escala e impacto visual.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 sm:gap-16">
              {[
                { label: 'Verificados', value: projects.length.toString(), icon: <Layers className="text-primary" /> },
                { label: 'Tecnologia', value: 'React 19', icon: <Cpu className="text-emerald-500" /> },
                { label: 'Uptime', value: '100%', icon: <RefreshCw className="text-rose-500" /> },
                { label: 'Experiência', value: '10+ Anos', icon: <Terminal className="text-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <div className="p-4 bg-slate-900/50 rounded-2xl mb-4 border border-slate-800 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-500 group-hover:scale-110">
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24 })}
                  </div>
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky top-20 sm:top-24 z-40 mb-16">
          <div className="glass p-3 sm:p-4 rounded-[2rem] flex flex-col lg:flex-row gap-4 justify-between items-center border border-white/5 shadow-2xl">
            <div className="flex overflow-x-auto w-full lg:w-auto gap-2 no-scrollbar px-2">
              {(Object.values(Category) as Category[]).map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)} 
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeCategory === cat 
                      ? 'bg-primary text-white border-primary shadow-[0_10px_20px_rgba(99,102,241,0.3)]' 
                      : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {cat === Category.ALL ? 'Todos os Módulos' : cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full lg:w-auto px-2">
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setIsGithubOpen(true)} 
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white border border-slate-800 rounded-xl text-[10px] font-black tracking-widest hover:bg-slate-800 transition-all"
                  >
                    <Github size={14} className="text-primary" /> SINCRONIZAR
                  </button>
                  <button 
                    onClick={() => {setEditingProject(null); setIsFormOpen(true)}} 
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                  >
                    <Plus size={14} /> NOVO MÓDULO
                  </button>
                </>
              )}
              <div className="relative flex-1 lg:w-80">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Buscar por tecnologia ou nome..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-12 pr-6 py-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-bold text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700" 
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-slate-900/30 rounded-[3rem] animate-pulse border border-slate-800/50"></div>
            ))
          ) : (
            visibleProjects.map((project, idx) => (
              <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                <ProjectCard 
                  project={project} 
                  isAdmin={isAdmin}
                  onEdit={(p) => {setEditingProject(p); setIsFormOpen(true)}}
                  onDelete={async (id) => { if(confirm('Excluir este módulo permanentemente?')) { await deleteProject(id); loadData(); } }}
                />
              </div>
            ))
          )}
        </div>

        {hasMore && !isLoading && (
          <div className="mt-32 text-center">
            <button 
              onClick={handleLoadMore} 
              className="group relative px-16 py-6 bg-slate-900 border border-slate-800 rounded-[2rem] text-white text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:border-primary/50 hover:bg-primary/5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative flex items-center gap-3">
                 Ver Mais Módulos <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
              </span>
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-32 bg-slate-950/80 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-12 mb-16">
            <a href="#" className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-primary transition-all border border-slate-800 hover:border-primary/30"><Linkedin size={24} /></a>
            <a href="#" className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-all border border-slate-800 hover:border-slate-700"><Github size={24} /></a>
            <a href="#" className="p-4 bg-slate-900 rounded-2xl text-slate-500 hover:text-accent transition-all border border-slate-800 hover:border-accent/30"><Mail size={24} /></a>
          </div>
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600">
              Arquitetado por <span className="text-primary">DevHub</span> Architecture © 2025
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-800">
              Construído com React 19, Tailwind CSS & Google Gemini AI
            </p>
          </div>
        </div>
      </footer>

      <GeminiChat />
      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveProject} initialData={editingProject} />
      <GitHubImporter isOpen={isGithubOpen} onClose={() => setIsGithubOpen(false)} onImport={handleImportGitHub} />
    </div>
  );
}

export default App;