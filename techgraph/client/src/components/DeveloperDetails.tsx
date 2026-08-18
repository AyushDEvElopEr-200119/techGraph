import React from "react";
import { X } from "lucide-react";
import type { DeveloperDetails as IDeveloperDetails, RecommendedJob } from "../types";

interface DeveloperDetailsModalProps {
  developer: IDeveloperDetails | null;
  recommendedJobs: RecommendedJob[];
  loading: boolean;
  onClose: () => void;
}

export const DeveloperDetailsModal: React.FC<DeveloperDetailsModalProps> = ({
  developer,
  recommendedJobs,
  loading,
  onClose,
}) => {
  if (!developer && !loading) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer-window"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="drawer-close-btn"
          onClick={onClose}
          aria-label="Close drawer"
        >
          <X size={16} />
        </button>

        {loading && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading developer details...
          </div>
        )}

        {!loading && developer && (
          <>
            {/* Header / Profile Summary */}
            <div className="drawer-title-block">
              <h2>{developer.name}</h2>
              <p>
                {developer.location} · {developer.experience} years
              </p>
              <p style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                {developer.email}
              </p>
            </div>

            {/* Skills */}
            <div>
              <div className="drawer-section-title">Skills</div>
              <div className="skill-tags-group">
                {developer.skills && developer.skills.length > 0 ? (
                  developer.skills.map((skill) => (
                    <span
                      key={skill.id || skill.name}
                      className="skill-tag-clean"
                      style={{
                        background: "var(--tag-skill-bg)",
                        color: "var(--tag-skill-text)",
                        borderColor: "var(--tag-skill-border)",
                      }}
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>
                    No skills recorded
                  </span>
                )}
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="drawer-section-title">Projects</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {developer.projects && developer.projects.length > 0 ? (
                  developer.projects.map((proj) => (
                    <div key={proj.id || proj.name} className="clean-item-box">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
                          {proj.name}
                        </strong>
                        <span className="year-pill">{proj.year}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {proj.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>
                    No projects
                  </span>
                )}
              </div>
            </div>

            {/* Companies */}
            <div>
              <div className="drawer-section-title">Company</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {developer.companies && developer.companies.length > 0 ? (
                  developer.companies.map((comp) => (
                    <div key={comp.id || comp.name} className="clean-item-box">
                      <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>
                        {comp.name}
                      </strong>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {comp.industry} · {comp.location}
                      </p>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>
                    No company history
                  </span>
                )}
              </div>
            </div>

            {/* Recommended Jobs */}
            <div>
              <div className="drawer-section-title">
                Recommended Jobs ({recommendedJobs.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recommendedJobs.length === 0 ? (
                  <span style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>
                    No matching jobs found.
                  </span>
                ) : (
                  recommendedJobs.map((job) => (
                    <div key={job.jobId} className="clean-item-box">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                            {job.jobTitle}
                          </strong>
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "1px" }}>
                            {job.company} · {job.location}
                          </p>
                        </div>
                        <span className="match-counter-pill">
                          {job.matchingSkills} matching {job.matchingSkills === 1 ? "skill" : "skills"}
                        </span>
                      </div>

                      {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--accent)",
                            marginTop: "8px",
                            fontWeight: 500,
                          }}
                        >
                          {job.matchedSkills.join(" · ")}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
