import { supabase } from '../lib/supabaseClient';
import { Project, Category } from '../types';
import { projects as mockProjects } from '../data';

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { data, error } = await supabase.storage
    .from('projects')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    throw new Error(`Erro no Storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('projects')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    // Timeout de segurança para evitar espera infinita em caso de erro de rede silencioso
    const fetchWithTimeout = Promise.race([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);

    const { data, error } = await fetchWithTimeout;

    if (error) {
      console.warn('Supabase fetch failed (using mock data):', error.message);
      return mockProjects;
    }

    if (!data || data.length === 0) {
      return mockProjects;
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category as Category,
      tags: item.tags || [],
      imageUrl: item.image_url,
      demoUrl: item.demo_url,
      repoUrl: item.repo_url,
      featured: item.featured,
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
  } catch (err) {
    // Captura erros de rede como ERR_NAME_NOT_RESOLVED (DNS) que lançam TypeError no browser
    console.warn('Network or Supabase error, using mock data:', err instanceof Error ? err.message : 'Unknown error');
    return mockProjects;
  }
};

export const createProject = async (project: Project): Promise<Project | null> => {
  const payload = {
    title: project.title,
    description: project.description,
    category: project.category,
    tags: project.tags,
    image_url: project.imageUrl,
    demo_url: project.demoUrl,
    repo_url: project.repoUrl,
    featured: project.featured || false
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...project,
    id: data.id,
    createdAt: new Date(data.created_at).toISOString().split('T')[0]
  };
};

export const updateProject = async (project: Project): Promise<Project | null> => {
  // Ajuste das propriedades do payload: chaves em snake_case para o Supabase, valores em camelCase do tipo Project
  const payload = {
    title: project.title,
    description: project.description,
    category: project.category,
    tags: project.tags,
    image_url: project.imageUrl,
    demo_url: project.demoUrl,
    repo_url: project.repoUrl,
    featured: project.featured
  };

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', project.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...project,
    id: data.id
  };
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    return false;
  }
  return true;
};