import React from 'react';
import { Project } from '../types';
import { ExternalLink, Github, Calendar, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-surface border border-slate-800/50 rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] flex flex-col h-full active:scale-[0.98]">
      
      {/* Admin Overlay Controls */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onEdit?.(project)}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-xl transition-all hover:scale-110"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete?.(project.id)}
            className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xl transition-all hover:scale-110"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Image Context */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-4 left-6 z-10">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white/10 text-white backdrop-blur-md border border-white/10">
                {project.category}
            </span>
        </div>
        
        {/* Quick Action Overlay */}
        {project.demoUrl && (
          <a 
            href={project.demoUrl} 
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-primary hover:text-white"
          >
            <ArrowUpRight size={20} />
          </a>
        )}
      </div>

      {/* Content Architecture */}
      <div className="p-7 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-1">
          {project.title}
        </h3>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2 font-medium">
          {project.description}
        </p>

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-primary/80 bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
             <span className="text-[10px] font-bold text-slate-600 self-center">+{project.tags.length - 3} MORE</span>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-auto">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
            <Calendar size={14} />
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div className="flex gap-4">
             {project.repoUrl && (
                <a href={project.repoUrl} className="text-slate-500 hover:text-white transition-all transform hover:scale-110" title="Source">
                  <Github size={18} />
                </a>
             )}
             {project.demoUrl && (
                <a href={project.demoUrl} className="text-slate-500 hover:text-white transition-all transform hover:scale-110" title="Live Preview">
                  <ExternalLink size={18} />
                </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};