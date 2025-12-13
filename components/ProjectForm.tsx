import React, { useState, useEffect } from 'react';
import { Project, Category } from '../types';
import { X, Save } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialData?: Project | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: Category.UTILITY,
    tags: [],
    imageUrl: 'https://picsum.photos/seed/999/800/600',
    repoUrl: '',
    demoUrl: '',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTagInput('');
    } else {
      // Reset for create mode
      setFormData({
        title: '',
        description: '',
        category: Category.UTILITY,
        tags: [],
        imageUrl: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/800/600`,
        repoUrl: '',
        demoUrl: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description) return;

    const newProject: Project = {
      id: initialData?.id || Date.now().toString(), // Mock ID generation
      title: formData.title || 'Untitled',
      description: formData.description || '',
      category: formData.category || Category.UTILITY,
      tags: formData.tags || [],
      imageUrl: formData.imageUrl || '',
      demoUrl: formData.demoUrl,
      repoUrl: formData.repoUrl,
      featured: formData.featured || false,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(newProject);
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Project Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Neon E-commerce"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
              placeholder="Describe the project..."
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Repository URL</label>
              <input
                type="url"
                value={formData.repoUrl || ''}
                onChange={e => setFormData({ ...formData, repoUrl: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Live Demo URL</label>
              <input
                type="url"
                value={formData.demoUrl || ''}
                onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="https://my-project.com"
              />
            </div>
          </div>

          {/* Image URL */}
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="https://..."
              />
            </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Technologies</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                placeholder="Type tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-400 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Save size={18} />
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
