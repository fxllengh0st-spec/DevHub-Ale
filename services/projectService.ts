import { supabase } from '../lib/supabaseClient';
import { Project, Category } from '../types';
import { projects as mockProjects } from '../data';

export const uploadImage = async (file: File): Promise<string> => {
  // Gera um nome único mantendo a extensão original
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  
  // Caminho simplificado na raiz do bucket para evitar erros de permissão em pastas
  const filePath = fileName;

  console.log(`Iniciando upload: ${filePath} (${file.type})`);

  const { data, error } = await supabase.storage
    .from('projects')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type // Crucial para o Supabase processar o arquivo corretamente
    });

  if (error) {
    console.error('Erro detalhado do Supabase Storage:', error);
    throw new Error(`Erro no Storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('projects')
    .getPublicUrl(filePath);

  console.log('Upload concluído com sucesso. URL:', publicUrl);
  return publicUrl;
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

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
    console.warn('Unexpected error in fetchProjects, using mock data:', err);
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
    console.error('Error creating project in DB:', error.message);
    throw error;
  }

  return {
    ...project,
    id: data.id,
    createdAt: new Date(data.created_at).toISOString().split('T')[0]
  };
};

export const updateProject = async (project: Project): Promise<Project | null> => {
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
    console.error('Error updating project in DB:', error.message);
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
    console.error('Error deleting project:', error.message);
    return false;
  }
  return true;
};