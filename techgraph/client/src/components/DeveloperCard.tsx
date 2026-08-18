import React from "react";
import { MapPin, ArrowRight, FolderGit2, Briefcase, CheckCircle2 } from "lucide-react";
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
  projectCount = 1,
  matchingJobsCount = 0,
  onClick,
}) => {
  const initial = developer.name.charAt(0).toUpperCase();

  return (
    <article className="dev-card-clean" onClick={onClick}>
      <div>
        <div className="dev-card-clean-top">
          <div className="avatar-initial">
            {initial}
          </div>

          <div className="dev-card-names">
            <div className="dev-card-name-row">
              <span className="dev-card-name">{developer.name}</span>
              <span className="dev-exp-pill">{developer.experience} yrs</span>
            </div>

            <div className="dev-card-location">
              <MapPin size={12} color="#7D8884" />
              <span>{developer.location}</span>
              <span style={{ color: "var(--text-dim)", margin: "0 2px" }}>•</span>
              <span style={{ color: "var(--accent)", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                <CheckCircle2 size={11} />
                Verified
              </span>
            </div>

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
            <span className="skill-tag-clean" style={{ color: "var(--text-muted)", background: "transparent" }}>
              +{skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="dev-card-clean-bottom">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="dev-stat-badge">
            <FolderGit2 size={12} color="#7D8884" />
            <span>{projectCount} {projectCount === 1 ? "project" : "projects"}</span>
          </span>
          {matchingJobsCount > 0 && (
            <span className="dev-stat-badge" style={{ color: "var(--accent)", fontWeight: 600 }}>
              <Briefcase size={12} />
              <span>{matchingJobsCount} {matchingJobsCount === 1 ? "job match" : "jobs match"}</span>
            </span>
          )}
        </div>

        <span className="view-profile-link">
          <span>View profile</span>
          <ArrowRight size={13} />
        </span>
      </div>
    </article>
  );
};
