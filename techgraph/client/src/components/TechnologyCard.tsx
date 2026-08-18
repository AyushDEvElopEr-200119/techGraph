import React from "react";
import type { Technology } from "../types";

interface TechnologyCardProps {
  technology: Technology;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ technology }) => {
  return (
    <tr key={technology.id}>
      <td className="tech-name-cell">{technology.name}</td>
      <td>
        <span className="tech-category-pill">{technology.category}</span>
      </td>
      <td>
        {technology.projects && technology.projects.length > 0 ? (
          <span title={technology.projects.join(", ")}>
            {technology.projects.length} ({technology.projects.join(", ")})
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>0</span>
        )}
      </td>
      <td>
        {technology.jobs && technology.jobs.length > 0 ? (
          <span title={technology.jobs.join(", ")}>
            {technology.jobs.length} ({technology.jobs.join(", ")})
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>0</span>
        )}
      </td>
    </tr>
  );
};
