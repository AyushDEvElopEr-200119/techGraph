import React from "react";
import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  onExploreInGraph?: (projectName: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <article className="project-card-clean">
      <div>
        <div className="project-card-header">
          <h3 className="project-name">{project.name}</h3>
          <span className="year-pill">{project.year}</span>
        </div>

        <p className="project-description" style={{ marginTop: "6px" }}>
          {project.description}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
        {/* Developers */}
        <div>
          <div className="mini-section-label">Developers</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {project.developers && project.developers.length > 0 ? (
              project.developers.map((dev) => (
                <span
                  key={dev}
                  className="skill-tag-clean"
                  style={{
                    background: "var(--tag-dev-bg)",
                    color: "var(--tag-dev-text)",
                    borderColor: "var(--tag-dev-border)",
                  }}
                >
                  {dev}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                None listed
              </span>
            )}
          </div>
        </div>

        {/* Technologies */}
        <div>
          <div className="mini-section-label">Technologies</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {project.technologies && project.technologies.length > 0 ? (
              project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="skill-tag-clean"
                  style={{
                    background: "var(--tag-tech-bg)",
                    color: "var(--tag-tech-text)",
                    borderColor: "var(--tag-tech-border)",
                  }}
                >
                  {tech}
                </span>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                None listed
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
