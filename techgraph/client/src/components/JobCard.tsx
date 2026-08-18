import React from "react";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
  matchedCount?: number;
  selectedDeveloperName?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  matchedCount,
}) => {
  return (
    <article className="job-card-board">
      <div className="job-board-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          {job.company && <div className="job-company">{job.company}</div>}
        </div>

        {matchedCount !== undefined && (
          <span className="match-counter-pill">
            Matching skills: {matchedCount}
          </span>
        )}
      </div>

      <div className="job-meta-details">
        <span>{job.location}</span>
        <span>·</span>
        <span>{job.experienceRequired}+ years experience</span>
      </div>

      <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.45" }}>
        {job.description}
      </p>

      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div>
          <div className="mini-section-label">Required skills</div>
          <div style={{ fontSize: "12.5px", color: "var(--text-primary)" }}>
            {job.requiredSkills.join(" · ")}
          </div>
        </div>
      )}
    </article>
  );
};
