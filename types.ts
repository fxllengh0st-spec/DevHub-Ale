export interface Project {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  createdAt: string;
}

export enum Category {
  ALL = 'All',
  ECOMMERCE = 'E-commerce',
  DASHBOARD = 'Dashboard',
  LANDING = 'Landing Page',
  UTILITY = 'Utility',
  WEB3 = 'Web3',
  AI = 'AI/ML',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  language: string;
  topics: string[];
  created_at: string;
}