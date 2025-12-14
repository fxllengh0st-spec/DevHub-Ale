
import React, { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { GeminiChat } from './components/GeminiChat';
import { ProjectForm } from './components/ProjectForm';
import { GitHubImporter } from './components/GitHubImporter';
import { fetchProjects, createProject, updateProject, deleteProject, uploadImage } from './services/projectService';
import { Category, Project } from './types';
import { Search, Layers, Github, Linkedin, Mail, Plus, Lock, Unlock, RefreshCw, Terminal, Cpu, Zap, Key, ExternalLink } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

// FIX: Standardizing window.aistudio declaration to avoid modifier conflicts.
// Using an optional property to ensure compatibility with various environment declarations.
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
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
      console.error("Data fetch error:", error);
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
      console.error("Save error:", e);
      alert("Error saving: " + e.message);
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
      console.error("Import error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200">
      {!hasKey && (
        <div className="fixed top-0 left-0 w-full z-[200] bg-primary/20 backdrop-blur-xl border-b border-primary/30 py-3 px-4 animate-fade-down">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Key size={18} className="text-primary animate-pulse" />
              <p className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">
                AI Engine Offline: API Key required for repository analysis.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] font-black text-slate-400 hover:text-white flex items-center gap-1 uppercase tracking-tighter">
                Billing <ExternalLink size={10} />
              </a>
              <button onClick={handleSelectKey} className="px-6 py-2 bg-primary hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                Configure Key
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={`fixed top-0 z-[100] w-full glass transition-all ${!hasKey ? 'mt-16 sm:mt-12' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-xl rotate-3">
              DH
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm sm:text-xl font-black text-white tracking-tight uppercase">DevHub</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-widest">Live System</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button onClick={() => setIsAdmin(!isAdmin)} className={`p-2 rounded-xl border transition-all ${isAdmin ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
               {isAdmin ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
            <div className="flex gap-2">
              <a href="#" className="p-2.5 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl border border-slate-800">
                <Github size={18} />
              </a>
              <a href="#" className="p-2.5 bg-primary text-white rounded-xl shadow-lg">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 pt-28 sm:pt-40 pb-20 transition-all ${!hasKey ? 'mt-12' : ''}`}>
        <section className="mb-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative animate-fade-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-bold text-primary mb-8 uppercase tracking-[0.3em]">
              Senior Frontend Architect
            </span>
            <h2 className="text-4xl sm:text-7xl font-black mb-8 tracking-tighter text-white leading-tight">
              Consolidating <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-emerald-400">40+ Premium Modules.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg font-medium leading-relaxed mb-12">
              High-performance frontend ecosystem. Every project is a verified architectural module.
            </p>
            
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { label: 'Verified', value: projects.length.toString(), icon: <Layers className="text-primary" /> },
                { label: 'Stack', value: 'React 19', icon: <Cpu className="text-emerald-500" /> },
                { label: 'Health', value: '99.9%', icon: <RefreshCw className="text-rose-500" /> }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="p-3 bg-slate-900 rounded-2xl mb-2 border border-slate-800">
                    {/* FIX: Cast icon to React.ReactElement<any> to resolve size property overload mismatch */}
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 18 })}
                  </div>
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky top-20 sm:top-24 z-40 mb-16">
          <div className="glass p-3 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center border border-white/5">
            <div className="flex overflow-x-auto w-full lg:w-auto gap-2 no-scrollbar">
              {Object.values(Category).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              {isAdmin && (
                <>
                  <button onClick={() => setIsGithubOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white border border-slate-800 rounded-xl text-[10px] font-black tracking-widest">
                    <Zap size={14} className="text-primary" /> SYNC GITHUB
                  </button>
                  <button onClick={() => {setEditingProject(null); setIsFormOpen(true)}} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-emerald-600/20">
                    <Plus size={14} /> NEW MODULE
                  </button>
                </>
              )}
              <div className="relative flex-1 lg:w-64">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Filter tech..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-bold text-white outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-[450px] bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800"></div>
            ))
          ) : (
            visibleProjects.map((project, idx) => (
              <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <ProjectCard 
                  project={project} 
                  isAdmin={isAdmin}
                  onEdit={(p) => {setEditingProject(p); setIsFormOpen(true)}}
                  onDelete={async (id) => { if(confirm('Purge module?')) { await deleteProject(id); loadData(); } }}
                />
              </div>
            ))
          )}
        </div>

        {hasMore && !isLoading && (
          <div className="mt-24 text-center">
            <button onClick={handleLoadMore} className="px-12 py-5 glass border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all">
              Load More Modules
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-20 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-10 mb-12">
            <a href="#" className="text-slate-500 hover:text-primary transition-all"><Linkedin size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-all"><Github size={20} /></a>
            <a href="#" className="text-slate-500 hover:text-accent transition-all"><Mail size={20} /></a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
            Engineered by <span className="text-primary">DevHub</span> Architecture
          </p>
        </div>
      </footer>

      <GeminiChat />
      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveProject} initialData={editingProject} />
      <GitHubImporter isOpen={isGithubOpen} onClose={() => setIsGithubOpen(false)} onImport={handleImportGitHub} />
    </div>
  );
}

export default App;
