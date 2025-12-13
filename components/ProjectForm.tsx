import React, { useState, useEffect, useRef } from 'react';
import { Project, Category } from '../types';
import { X, Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project, imageFile?: File) => void;
  initialData?: Project | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: Category.UTILITY,
    tags: [],
    imageUrl: '',
    repoUrl: '',
    demoUrl: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setPreviewUrl(initialData.imageUrl);
      setSelectedFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        category: Category.UTILITY,
        tags: [],
        imageUrl: '',
        repoUrl: '',
        demoUrl: '',
      });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSubmitting(true);
    try {
      const newProject: Project = {
        id: initialData?.id || Date.now().toString(),
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

      await onSave(newProject, selectedFile || undefined);
      onClose();
    } catch (error) {
      console.error("Form submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-surface border border-slate-800 rounded-[2.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden animate-fade-up">
        
        <div className="flex justify-between items-center p-8 border-b border-slate-800 bg-slate-900/40 sticky top-0 backdrop-blur-md z-10">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {initialData ? 'REFINE MODULE' : 'INITIALIZE MODULE'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Core System Component v1.0</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Visual Asset (Storage)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-48 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group overflow-hidden flex flex-col items-center justify-center ${
                previewUrl ? 'border-primary/50' : 'border-slate-800 hover:border-primary/50 bg-slate-950/50'
              }`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                       <Upload className="text-white" size={32} />
                       <span className="text-[10px] text-white font-black uppercase tracking-widest">Change Asset</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">Click to upload image</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">JPG, PNG OR WEBP (MAX 2MB)</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Module Identifier</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="Project Name"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Classification</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer"
              >
                {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Project Schema (Description)</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none placeholder:text-slate-700"
              placeholder="Detailed system overview..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Git Repository</label>
              <input
                type="url"
                value={formData.repoUrl || ''}
                onChange={e => setFormData({ ...formData, repoUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Deployment URL</label>
              <input
                type="url"
                value={formData.demoUrl || ''}
                onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-700"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Technology Stack</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="Type tag & Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.tags?.map(tag => (
                <span key={tag} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-8 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-10 py-4 bg-primary hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Commit Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};