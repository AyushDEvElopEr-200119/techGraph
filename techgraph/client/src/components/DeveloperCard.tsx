import React from "react";
import type { Developer } from "../types";

interface DeveloperCardProps {
  developer: Developer;
  skills?: string[];
  projectCount?: number;
  matchingJobsCount?: number;
  onClick: () => void;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  skills = [],
  onClick,
}) => {
  const initial = developer.name.charAt(0).toUpperCase();

  return (
    <article className="dev-card-clean" onClick={onClick}>
      <div>
        <div className="dev-card-clean-top">
          <div className="avatar-initial">{initial}</div>

          <div className="dev-card-names">
            <div className="dev-card-name">{developer.name}</div>
            <div className="dev-card-location">{developer.location}</div>
            <div className="dev-card-email">{developer.email}</div>
          </div>
        </div>

        <div className="skill-tags-group" style={{ marginTop: "14px" }}>
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} className="skill-tag-clean">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="skill-tag-clean" style={{ color: "var(--text-muted)" }}>
              +{skills.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="dev-card-clean-bottom">
        <span>{developer.experience} years</span>
        <span className="view-profile-link">View profile →</span>
      </div>
    </article>
  );
};
