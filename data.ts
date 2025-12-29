import { Project, Category } from './types';

const TECHNOLOGIES = [
  'React 19', 'TypeScript', 'Tailwind CSS', 'Next.js 15', 'Node.js', 
  'GraphQL', 'PostgreSQL', 'Three.js', 'D3.js', 'Firebase', 
  'Supabase', 'Redux Toolkit', 'Zustand', 'Gemini AI', 'Vite',
  'WebSockets', 'Radix UI', 'Framer Motion', 'Prisma', 'TRPC'
];

const getImageUrl = (id: number) => `https://images.unsplash.com/photo-${1550000000000 + (id * 987654)}?auto=format&fit=crop&w=1200&q=80`;

const highlightProjects: Project[] = [
  {
    id: '1',
    title: 'Neon Nexus E-commerce',
    description: 'Um motor de comércio headless de última geração com filtragem dinâmica, estado de carrinho persistente e um fluxo de checkout de ultra-baixa latência.',
    category: Category.ECOMMERCE,
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    createdAt: '2024-11-15',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '2',
    title: 'Quantum Analytics Grid',
    description: 'Suíte avançada de visualização de dados financeiros capaz de renderizar mais de 100 mil nós usando componentes Canvas acelerados por hardware.',
    category: Category.DASHBOARD,
    tags: ['React', 'D3.js', 'WebWorkers', 'Zustand'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bbda0231f676?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    createdAt: '2024-12-10',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '3',
    title: 'Aura AI Assistant',
    description: 'Plataforma inteligente de orquestração de conteúdo que utiliza Gemini 2.5 para automatizar campanhas de marketing multicanal.',
    category: Category.AI,
    tags: ['Gemini API', 'React 19', 'Node.js', 'Server Sent Events'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    createdAt: '2025-01-01',
    demoUrl: '#',
    repoUrl: '#'
  }
];

const projectNames = [
  "Flux", "Nexus", "Vertex", "Pulse", "Zenith", "Core", "Orbit", "Synergy", "Prism", "Echo",
  "Titan", "Nova", "Stellar", "Quantum", "Atom", "Bio", "Grid", "Frame", "Logic", "Vibe",
  "Shift", "Flow", "Wave", "Spark", "Edge", "Cloud", "Void", "Drift", "Aura", "Sphere",
  "Apex", "Base", "Vista", "Rise", "Link", "Snap", "Zoom", "Bolt", "Iron", "Solid"
];

const generateRemainingProjects = (): Project[] => {
  const projects: Project[] = [];
  const categories = Object.values(Category).filter(c => c !== Category.ALL);
  
  for (let i = 4; i <= 40; i++) {
    const randomCategory = categories[i % categories.length];
    const techCount = 3 + (i % 3);
    const randomTags = Array.from({ length: techCount }, (_, idx) => 
      TECHNOLOGIES[(i + idx * 7) % TECHNOLOGIES.length]
    );
    
    const name = projectNames[i-1] || `Module X-${i}`;

    projects.push({
      id: i.toString(),
      title: `${name} ${randomCategory}`,
      description: `Arquitetei este módulo de alta performance focado em acessibilidade (a11y) e otimização SEO. Parte de uma coleção consolidada de soluções frontend escaláveis.`,
      category: randomCategory,
      tags: [...new Set(randomTags)],
      imageUrl: getImageUrl(i),
      featured: false,
      createdAt: new Date(2024, 0 + (i % 12), 1 + (i % 28)).toISOString().split('T')[0],
      demoUrl: '#',
      repoUrl: '#'
    });
  }
  return projects;
};

export const projects: Project[] = [...highlightProjects, ...generateRemainingProjects()];