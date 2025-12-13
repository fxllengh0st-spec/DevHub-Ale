import { Project, Category } from './types';

const TECHNOLOGIES = [
  'React', 'TypeScript', 'Tailwind', 'Next.js', 'Node.js', 
  'GraphQL', 'PostgreSQL', 'Three.js', 'D3.js', 'Firebase', 
  'Supabase', 'Redux', 'Zustand', 'Gemini API'
];

// Helper to generate a consistent random-ish image
const getImageUrl = (id: number) => `https://picsum.photos/seed/${id}/800/600`;

// Manual definition of top projects (High Quality)
const highlightProjects: Project[] = [
  {
    id: '1',
    title: 'Neon E-commerce Platform',
    description: 'A high-performance headless e-commerce solution with real-time inventory tracking and AI-driven recommendations.',
    category: Category.ECOMMERCE,
    tags: ['React', 'Next.js', 'Stripe', 'Tailwind'],
    imageUrl: getImageUrl(101),
    featured: true,
    createdAt: '2023-11-15',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '2',
    title: 'FinTech Analytics Dashboard',
    description: 'Real-time financial data visualization dashboard handling millions of data points with smooth D3.js transitions.',
    category: Category.DASHBOARD,
    tags: ['TypeScript', 'D3.js', 'WebSockets', 'Grid Layout'],
    imageUrl: getImageUrl(102),
    featured: true,
    createdAt: '2023-10-20',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '3',
    title: 'AI Content Generator',
    description: 'SaaS application leveraging LLMs to help marketers generate blog posts and social media captions instantly.',
    category: Category.AI,
    tags: ['Gemini API', 'React', 'Node.js', 'Streaming'],
    imageUrl: getImageUrl(103),
    featured: true,
    createdAt: '2024-01-10',
    demoUrl: '#',
    repoUrl: '#'
  },
  {
    id: '4',
    title: 'Crypto Defi Swap',
    description: 'Decentralized exchange interface interacting with smart contracts for token swapping.',
    category: Category.WEB3,
    tags: ['Ethers.js', 'React', 'Solidity', 'Wagmi'],
    imageUrl: getImageUrl(104),
    featured: false,
    createdAt: '2023-08-05',
    demoUrl: '#',
    repoUrl: '#'
  }
];

// Algorithmically generate the remaining 36 projects to reach 40
const generateRemainingProjects = (): Project[] => {
  const projects: Project[] = [];
  const categories = Object.values(Category).filter(c => c !== Category.ALL);
  
  for (let i = 5; i <= 40; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomTags = [
      TECHNOLOGIES[Math.floor(Math.random() * TECHNOLOGIES.length)],
      TECHNOLOGIES[Math.floor(Math.random() * TECHNOLOGIES.length)],
      TECHNOLOGIES[Math.floor(Math.random() * TECHNOLOGIES.length)]
    ];
    
    projects.push({
      id: i.toString(),
      title: `${randomCategory} Project Alpha ${i}`,
      description: `A scalable ${randomCategory.toLowerCase()} solution demonstrating best practices in component architecture and state management. Project #${i} in the collection.`,
      category: randomCategory,
      tags: [...new Set(randomTags)], // Remove duplicates
      imageUrl: getImageUrl(i + 200),
      featured: false,
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
      demoUrl: '#',
      repoUrl: '#'
    });
  }
  return projects;
};

export const projects: Project[] = [...highlightProjects, ...generateRemainingProjects()];