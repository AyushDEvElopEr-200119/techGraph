import { useEffect, useState } from "react";
import { getProjects } from "../services/api";
import type { Project } from "../types";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return <div className="message">Loading projects...</div>;
  }

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <h2>Projects</h2>
        <span>{projects.length} projects</span>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <article className="dashboard-card" key={project.id}>
            <div className="card-top">
              <h3>{project.name}</h3>
              <span>{project.year}</span>
            </div>

            <p>{project.description}</p>

            <h4>Developers</h4>

            <div className="tag-list">
              {project.developers?.map((developer) => (
                <span className="tag" key={developer}>
                  {developer}
                </span>
              ))}
            </div>

            <h4>Technologies</h4>

            <div className="tag-list">
              {project.technologies?.map((technology) => (
                <span className="tag" key={technology}>
                  {technology}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProjectList;