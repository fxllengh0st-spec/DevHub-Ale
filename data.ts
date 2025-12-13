import { Project, Category } from './types';

const TECHNOLOGIES = [
  'React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Node.js', 
  'GraphQL', 'PostgreSQL', 'Three.js', 'D3.js', 'Firebase', 
  'Supabase', 'Redux Toolkit', 'Zustand', 'Gemini AI', 'Vite',
  'WebSockets', 'Radix UI', 'Framer Motion'
];

const getImageUrl = (id: number) => `https://images.unsplash.com/photo-${1500000000000 + (id * 123456)}?auto=format&fit=crop&w=800&q=80`;

const highlightProjects: Project[] = [
  {
    id: '1',
    title: 'Neon Nexus E-commerce',
    description: 'A cutting-edge headless commerce engine featuring dynamic filtering, persistent cart state, and an ultra-low latency checkout flow.',
    category: Category.ECOMMERCE,
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2024-01-15',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '2',
    title: 'Quantum Analytics Grid',
    description: 'Advanced financial data visualization suite capable of rendering 100k+ nodes using hardware-accelerated Canvas components.',
    category: Category.DASHBOARD,
    tags: ['React', 'D3.js', 'WebWorkers', 'Zustand'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bbda0231f676?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2023-12-10',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '3',
    title: 'Aura AI Assistant',
    description: 'Intelligent content orchestration platform that uses Gemini 2.5 to automate multi-channel marketing campaigns.',
    category: Category.AI,
    tags: ['Gemini API', 'React 19', 'Node.js', 'Server Sent Events'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2024-02-01',
    demoUrl: '#',
    repoUrl: '#'
  }
];

const generateRemainingProjects = (): Project[] => {
  const projects: Project[] = [];
  const categories = Object.values(Category).filter(c => c !== Category.ALL);
  
  // Ajustado para chegar a 40 projetos total (3 highlights + 37 gerados)
  for (let i = 4; i <= 40; i++) {
    const randomCategory = categories[i % categories.length];
    const techCount = 3 + (i % 2);
    const randomTags = Array.from({ length: techCount }, (_, idx) => 
      TECHNOLOGIES[(i + idx * 7) % TECHNOLOGIES.length]
    );
    
    projects.push({
      id: i.toString(),
      title: `${randomCategory} Platform v${i}`,
      description: `Architected a high-performance ${randomCategory.toLowerCase()} module focused on accessibility (a11y) and SEO optimization. Part of a collection of 40 scalable frontend solutions.`,
      category: randomCategory,
      tags: [...new Set(randomTags)],
      imageUrl: getImageUrl(i),
      featured: false,
      createdAt: new Date(2023, 5 + (i % 6), 1 + (i % 28)).toISOString().split('T')[0],
      demoUrl: '#',
      repoUrl: '#'
    });
  }
  return projects;
};

export const projects: Project[] = [...highlightProjects, ...generateRemainingProjects()];