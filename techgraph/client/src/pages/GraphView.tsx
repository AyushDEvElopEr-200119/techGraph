import React from "react";
import type { Developer, Project, Technology, Job } from "../types";
import { GraphExplorer } from "../components/GraphExplorer";

interface GraphViewProps {
  developers: Developer[];
  projects: Project[];
  technologies: Technology[];
  jobs: Job[];
  onSelectDeveloper?: (id: string) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  developers,
  projects,
  technologies,
  jobs,
  onSelectDeveloper,
}) => {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
          Interactive Knowledge Graph
        </h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Full interactive relationship network across developers, skills, technologies, projects, companies, and jobs
        </p>
      </div>

      <GraphExplorer
        developers={developers}
        projects={projects}
        technologies={technologies}
        jobs={jobs}
        onSelectDeveloper={onSelectDeveloper}
        height={640}
      />
    </div>
  );
};
