import React, { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from './components/ProjectCard';
import { GeminiChat } from './components/GeminiChat';
import { ProjectForm } from './components/ProjectForm';
import { fetchProjects, createProject, updateProject, deleteProject } from './services/projectService';
import { Category, Project } from './types';
import { Search, Filter, Layers, Github, Linkedin, Mail, Plus, Lock, Unlock, RefreshCw, Terminal, Code, Cpu } from 'lucide-react';

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
      console.error("Failed to load projects", error);
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

  const handleLoadMore = () => {
    setDisplayedItemsCount(prev => prev + ITEMS_PER_PAGE);
  };

  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery]);

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const previousProjects = [...projects];
      setProjects(prev => prev.filter(p => p.id !== id));
      
      const success = await deleteProject(id);
      if (!success) {
        setProjects(previousProjects);
        alert("Failed to delete project");
      }
    }
  };

  const handleSaveProject = async (project: Project) => {
    const isEditing = !!editingProject;
    try {
      if (isEditing) {
        const updated = await updateProject(project);
        if (updated) {
          setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        }
      } else {
        const created = await createProject(project);
        if (created) {
          setProjects(prev => [created, ...prev]);
        }
      }
    } catch (e) {
      alert("Error saving project.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 selection:bg-primary/30">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary via-purple-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
              DF
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">DevFolio</span>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Open to work</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Projects', 'Services', 'Stack', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${isAdmin ? 'text-primary border-primary bg-primary/10' : 'text-slate-500 border-slate-800 hover:border-slate-600'}`}
            >
               {isAdmin ? <Unlock size={12} /> : <Lock size={12} />}
               {isAdmin ? 'Admin' : 'Lock'}
            </button>
            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                <Github size={20} />
              </a>
              <a href="mailto:hello@devfolio.com" className="bg-primary hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-primary/20">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        
        {/* Modern Hero Section */}
        <section className="mb-24 relative animate-fade-in-up">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.1]">
              Crafting <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-rose-400">Digital Experiences</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
              Senior Frontend Engineer specializing in architecting scalable React systems and high-performance user interfaces.
            </p>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { label: 'Projects Completed', value: '40+', icon: <Layers size={18} /> },
                { label: 'Years of Experience', value: '6+', icon: <Code size={18} /> },
                { label: 'Core Technologies', value: '12+', icon: <Cpu size={18} /> }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    {stat.icon}
                    <span className="text-2xl font-black text-white">{stat.value}</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-slate-400 transition-colors">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Controls: Search & Filter */}
        <section className="sticky top-24 z-30 mb-12">
          <div className="glass p-4 rounded-2xl flex flex-col lg:flex-row gap-4 justify-between items-center shadow-2xl">
            
            {/* Category Tabs */}
            <div className="flex overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-1.5 no-scrollbar">
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary hover:bg-emerald-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  <span>ADD PROJECT</span>
                </button>
              )}

              <div className="relative w-full lg:w-72">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search architecture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-600"
                />
              </div>
              
              <button
                onClick={loadData}
                className="p-2.5 bg-slate-950/50 text-slate-500 hover:text-white rounded-xl border border-slate-800 transition-all hover:bg-slate-800"
                title="Sync Repository"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[420px] bg-slate-900/40 rounded-3xl animate-pulse border border-slate-800/50 shadow-inner"></div>
              ))}
            </div>
          ) : visibleProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleProjects.map((project, idx) => (
                <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ProjectCard 
                    project={project} 
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 glass rounded-3xl">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Terminal className="text-slate-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Null Projects Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium italic">Your search criteria yielded zero results in the current stack.</p>
              <button 
                onClick={() => {setActiveCategory(Category.ALL); setSearchQuery('')}}
                className="text-primary font-bold hover:underline underline-offset-8 transition-all uppercase tracking-widest text-xs"
              >
                Reset Filter Context
              </button>
            </div>
          )}
        </div>

        {/* Premium Load More Button */}
        {hasMore && !isLoading && (
          <div className="mt-20 text-center">
            <button
              onClick={handleLoadMore}
              className="group relative inline-flex items-center gap-3 px-10 py-4 glass hover:bg-slate-800 rounded-2xl text-white font-bold transition-all duration-300 hover:translate-y-[-2px] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative uppercase tracking-widest text-xs">Load More Architectural Designs</span>
              <Plus size={16} className="relative group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        )}

      </main>

      <footer className="border-t border-slate-900/50 bg-slate-950/80 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex gap-8 mb-10">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={22} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={22} /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Mail size={22} /></a>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-center">
            Engineered with <span className="text-rose-500">Precision</span> & React 19
          </p>
          <p className="text-slate-700 text-xs font-medium">© {new Date().getFullYear()} SENIOR ARCHITECT PORTFOLIO.</p>
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