import React, { useState } from 'react';
import { Project } from '../types';
import { 
  ExternalLink, Github, Calendar, Edit2, Trash2, ArrowUpRight, 
  Cpu, Database, Globe, Palette, Zap, Sparkles, Layout, 
  Layers, Code, Box, ChevronDown, ChevronUp 
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase();
  if (t.includes('react')) return <Cpu size={12} />;
  if (t.includes('typescript')) return <Code size={12} />;
  if (t.includes('tailwind')) return <Palette size={12} />;
  if (t.includes('next')) return <Globe size={12} />;
  if (t.includes('node')) return <Box size={12} />;
  if (t.includes('supabase') || t.includes('sql') || t.includes('firebase')) return <Database size={12} />;
  if (t.includes('ai') || t.includes('gemini')) return <Sparkles size={12} />;
  if (t.includes('vite')) return <Zap size={12} />;
  if (t.includes('d3') || t.includes('three')) return <Layers size={12} />;
  if (t.includes('zustand') || t.includes('redux')) return <Zap size={12} />;
  return <Layout size={12} />;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isAdmin, onEdit, onDelete }) => {
  const [showFullStack, setShowFullStack] = useState(false);
  const displayTags = showFullStack ? project.tags : project.tags.slice(0, 3);
  const hasMoreTags = project.tags.length > 3;

  return (
    <div className="group relative bg-surface border border-slate-800/40 rounded-[3rem] overflow-hidden hover:border-primary/50 transition-all duration-700 hover:shadow-[0_60px_100px_-30px_rgba(99,102,241,0.25)] flex flex-col h-full active:scale-[0.98]">
      
      {isAdmin && (
        <div className="absolute top-8 left-8 z-30 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-110"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(project.id); }}
            className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl shadow-xl backdrop-blur-md transition-all hover:scale-110"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <div className="relative aspect-[9/16] overflow-hidden bg-slate-950">
        <img 
          src={project.imageUrl} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-125"
        />
        
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="relative w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-95" />
        
        <div className="absolute bottom-10 left-10 z-10">
            <span className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.25em] rounded-xl bg-primary/20 text-primary backdrop-blur-2xl border border-primary/30 shadow-2xl">
                {project.category}
            </span>
        </div>
        
        {project.demoUrl && (
          <a 
            href={project.demoUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-8 right-8 z-20 w-14 h-14 bg-white text-slate-950 rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-[20px] group-hover:translate-x-0 transition-all duration-500 shadow-2xl hover:bg-primary hover:text-white group/btn"
          >
            <ArrowUpRight size={28} className="group-hover/btn:rotate-45 transition-transform duration-300" />
          </a>
        )}
      </div>

      <div className="p-10 flex flex-col flex-grow">
        <div className="mb-6">
          <h3 className="text-3xl font-black text-white mb-3 group-hover:text-primary transition-colors leading-tight tracking-tighter">
            {project.title}
          </h3>
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <Calendar size={14} className="text-slate-700" />
            {new Date(project.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        
        <p className="text-slate-400 text-[15px] mb-10 leading-relaxed line-clamp-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          {project.description}
        </p>

        <div className="relative mt-auto">
          <div className={`flex flex-wrap gap-2.5 transition-all duration-500 ${showFullStack ? 'mb-6' : 'mb-0'}`}>
            {displayTags.map((tag) => (
              <span 
                key={tag} 
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 transition-all hover:border-primary/40 group/tag cursor-default"
              >
                <span className="text-primary/60 group-hover/tag:text-primary transition-colors">
                  {getTechIcon(tag)}
                </span>
                {tag}
              </span>
            ))}
            
            {hasMoreTags && !showFullStack && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowFullStack(true); }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 hover:border-primary/40 hover:text-white transition-all group/more"
              >
                +{project.tags.length - 3} Stack
                <ChevronDown size={14} className="group-hover/more:translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>

          {showFullStack && (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowFullStack(false); }}
              className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            >
              <ChevronUp size={14} />
              Recolher Stack
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-10 border-t border-slate-800/60 mt-10">
          <div className="flex gap-6">
             {project.repoUrl && (
                <a 
                  href={project.repoUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/icon flex flex-col items-center gap-1.5"
                >
                  <div className="p-3 bg-slate-900 text-slate-500 group-hover/icon:text-white group-hover/icon:bg-slate-800 rounded-xl transition-all border border-slate-800 group-hover/icon:border-slate-600">
                    <Github size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600 group-hover/icon:text-slate-400 opacity-0 group-hover/icon:opacity-100 transition-all">Source</span>
                </a>
             )}
             {project.demoUrl && (
                <a 
                  href={project.demoUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/icon flex flex-col items-center gap-1.5"
                >
                  <div className="p-3 bg-slate-900 text-slate-500 group-hover/icon:text-primary group-hover/icon:bg-primary/10 rounded-xl transition-all border border-slate-800 group-hover/icon:border-primary/30">
                    <ExternalLink size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-600 group-hover/icon:text-primary opacity-0 group-hover/icon:opacity-100 transition-all">Launch</span>
                </a>
             )}
          </div>
          
          <div className="hidden group-hover:block animate-fade-up">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.25em]">Módulo Verificado</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};