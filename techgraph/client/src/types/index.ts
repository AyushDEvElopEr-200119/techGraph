export interface Developer {
  id: string;
  name: string;
  email: string;
  experience: number;
  location: string;
  skills?: Skill[];
  projects?: Project[];
  companies?: Company[];
}

export interface Skill {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  year: number;
  developers: string[];
  technologies: string[];
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  projects: string[];
  jobs: string[];
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  experienceRequired: number;
  company?: string;
  requiredSkills?: string[];
}

export interface DeveloperDetails extends Developer {
  skills: Skill[];
  projects: Project[];
  companies: Company[];
}

export interface RecommendedJob {
  jobId: string;
  jobTitle: string;
  description: string;
  location: string;
  experienceRequired: number;
  company: string;
  matchingSkills: number;
  matchedSkills: string[];
}

export interface HealthStatus {
  status: "ok" | "error" | "connecting";
  database: "connected" | "unavailable" | "checking";
}

export type NodeType = "Developer" | "Skill" | "Technology" | "Project" | "Company" | "Job";

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  subtitle?: string;
  meta?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}
