import type { Developer, DeveloperDetails, RecommendedJob, Project, Technology, Job, HealthStatus } from "../types";

const API_BASE_URL = "https://techgraph-1.onrender.com/api";

export async function getDevelopers(): Promise<Developer[]> {
  const response = await fetch(`${API_BASE_URL}/developers`);

  if (!response.ok) {
    throw new Error("Failed to fetch developers");
  }

  const result = await response.json();

  return result.data;
}

export async function getDeveloper(id: string): Promise<DeveloperDetails> {
  const response = await fetch(`${API_BASE_URL}/developers/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch developer");
  }

  const result = await response.json();

  return result.data;
}

export async function getRecommendedJobs(id: string): Promise<RecommendedJob[]> {
  const response = await fetch(
    `${API_BASE_URL}/developers/${id}/jobs`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommended jobs");
  }

  const result = await response.json();

  return result.data;
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const result = await response.json();

  return result.data;
}

export async function getTechnologies(): Promise<Technology[]> {
  const response = await fetch(`${API_BASE_URL}/technologies`);

  if (!response.ok) {
    throw new Error("Failed to fetch technologies");
  }

  const result = await response.json();

  return result.data;
}

export async function getJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`);

  if (!response.ok) {
    throw new Error("Failed to fetch jobs");
  }

  const result = await response.json();

  return result.data;
}

export async function getHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return { status: "error", database: "unavailable" };
    }
    const result = await response.json();
    return {
      status: result.status === "ok" ? "ok" : "error",
      database: result.database === "connected" ? "connected" : "unavailable",
    };
  } catch {
    return { status: "error", database: "unavailable" };
  }
}