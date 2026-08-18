import React from "react";
import type { Technology } from "../types";

interface TechnologyCardProps {
  technology: Technology;
}

export const TechnologyCard: React.FC<TechnologyCardProps> = ({ technology }) => {
  return (
    <tr key={technology.id}>
      <td className="tech-name-cell">
        <span className="tech-dot" />
        <span>{technology.name}</span>
      </td>
      <td>
        <span className="tech-category-pill">{technology.category}</span>
      </td>
      <td>
        {technology.projects && technology.projects.length > 0 ? (
          <span>
            <strong style={{ color: "var(--text-primary)" }}>{technology.projects.length}</strong>
            <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "12px" }}>
              ({technology.projects.join(", ")})
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>0</span>
        )}
      </td>
      <td>
        {technology.jobs && technology.jobs.length > 0 ? (
          <span>
            <strong style={{ color: "var(--text-primary)" }}>{technology.jobs.length}</strong>
            <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "12px" }}>
              ({technology.jobs.join(", ")})
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>0</span>
        )}
      </td>
    </tr>
  );
};
