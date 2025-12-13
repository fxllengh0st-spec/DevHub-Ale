import React, { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { GeminiChat } from './components/GeminiChat';
import { ProjectForm } from './components/ProjectForm';
import { fetchProjects, createProject, updateProject, deleteProject } from './services/projectService';
import { Category, Project } from './types';
import { Search, Layers, Github, Linkedin, Mail, Plus, Lock, Unlock, RefreshCw, Terminal, Cpu } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedItemsCount, setDisplayedItemsCount] = useState(ITEMS_PER_PAGE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  const handleSaveProject = async (project: Project) => {
    try {
      if (editingProject) {
        const updated = await updateProject(project);
        if (updated) setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createProject(project);
        if (created) setProjects(prev => [created, ...prev]);
      }
    } catch (e) {
      alert("System error saving project components.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200">
      
      {/* Dynamic Glass Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-primary/20 rotate-3">
              DH
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-white tracking-tight uppercase">DevHub</h1>
              <div className="flex items-center gap-1.5 -mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">System Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`p-2.5 rounded-xl border transition-all ${isAdmin ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
               {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
            <div className="flex gap-2">
              <a href="#" className="p-2.5 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800"><Github size={20} /></a>
              <a href="#" className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Mail size={20} /></a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-20">
        
        {/* Cinematic Hero */}
        <section className="mb-32 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="relative animate-fade-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-bold text-primary mb-8 uppercase tracking-[0.3em]">
              Senior Frontend Architect
            </span>
            <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white">
              Engineering <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-emerald-400">Precision UI.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
              Consolidating 40+ modular projects, high-performance dashboards, and AI-integrated systems built with the modern stack.
            </p>
            
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { label: 'Total Modules', value: '40+', icon: <Layers className="text-primary" /> },
                { label: 'Core Stack', value: 'React 19', icon: <Cpu className="text-emerald-500" /> },
                { label: 'Uptime', value: '99.9%', icon: <RefreshCw className="text-rose-500" /> }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-slate-900 rounded-2xl mb-2 group-hover:scale-110 transition-transform border border-slate-800">
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-black text-white leading-none">{stat.value}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="sticky top-24 z-40 mb-16">
          <div className="glass p-3 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center shadow-2xl border border-white/5">
            <div className="flex overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-1.5 no-scrollbar">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              {isAdmin && (
                <button
                  onClick={() => {setEditingProject(null); setIsFormOpen(true)}}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Plus size={16} /> NEW MODULE
                </button>
              )}
              <div className="relative flex-1 lg:w-64">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Query system stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Grid */}
        <div className="min-h-[600px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[450px] bg-slate-900/50 rounded-[2.5rem] animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {visibleProjects.map((project, idx) => (
                <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <ProjectCard 
                    project={project} 
                    isAdmin={isAdmin}
                    onEdit={(p) => {setEditingProject(p); setIsFormOpen(true)}}
                    onDelete={async (id) => {
                      if(confirm('Purge module?')) {
                        await deleteProject(id);
                        loadData();
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && visibleProjects.length === 0 && (
            <div className="text-center py-40">
              <Terminal size={48} className="mx-auto text-slate-800 mb-6" />
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Query Result Empty</h3>
              <p className="text-slate-600 text-sm mt-2">Try adjusting your filter parameters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {hasMore && !isLoading && (
          <div className="mt-24 text-center">
            <button
              onClick={handleLoadMore}
              className="px-12 py-5 glass border-white/10 rounded-2xl text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-2xl hover:-translate-y-1"
            >
              Expose More Projects
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-20 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-10 mb-12">
            <a href="#" className="text-slate-500 hover:text-primary transition-all"><Linkedin size={24} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-all"><Github size={24} /></a>
            <a href="#" className="text-slate-500 hover:text-accent transition-all"><Mail size={24} /></a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
            Engineered by Senior Frontend <span className="text-primary">Architect</span>
          </p>
        </div>
      </footer>

      <GeminiChat />

      <ProjectForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
}

export default App;