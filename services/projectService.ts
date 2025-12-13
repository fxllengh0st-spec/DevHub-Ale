import { supabase } from '../lib/supabaseClient';
import { Project, Category } from '../types';
import { projects as mockProjects } from '../data';

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Log the specific error message instead of the object to avoid [object Object]
      console.warn('Supabase fetch failed (using mock data):', error.message);
      if (error.details) console.warn('Error details:', error.details);
      
      return mockProjects;
    }

    if (!data || data.length === 0) {
      // If the database is empty, return mock data for the portfolio to look good
      return mockProjects;
    }

    // Map database fields to application types
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
    console.error('Error creating project:', error.message);
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
    console.error('Error updating project:', error.message);
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
