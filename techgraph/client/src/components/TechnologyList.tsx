import { useEffect, useState } from "react";
import { getTechnologies } from "../services/api";
import type { Technology } from "../types";

export function TechnologyList() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTechnologies() {
      try {
        const data = await getTechnologies();
        setTechnologies(data);
      } catch (error) {
        console.error("Failed to load technologies:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTechnologies();
  }, []);

  if (loading) {
    return <div className="message">Loading technologies...</div>;
  }

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <h2>Technologies</h2>
        <span>{technologies.length} technologies</span>
      </div>

      <div className="technology-grid">
        {technologies.map((technology) => (
          <article
            className="dashboard-card"
            key={technology.id}
          >
            <div className="card-top">
              <h3>{technology.name}</h3>
              <span>{technology.category}</span>
            </div>

            <h4>Used in Projects</h4>

            <div className="tag-list">
              {technology.projects && technology.projects.length > 0 ? (
                technology.projects.map((project) => (
                  <span className="tag" key={project}>
                    {project}
                  </span>
                ))
              ) : (
                <span className="muted">No projects</span>
              )}
            </div>

            <h4>Required by Jobs</h4>

            <div className="tag-list">
              {technology.jobs && technology.jobs.length > 0 ? (
                technology.jobs.map((job) => (
                  <span className="tag" key={job}>
                    {job}
                  </span>
                ))
              ) : (
                <span className="muted">No jobs</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TechnologyList;