import React from "react";
import { X, MapPin, Mail, Award, FolderGit2, Building2, Briefcase, CheckCircle2, Calendar } from "lucide-react";
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
            <div
              style={{
                width: "28px",
                height: "28px",
                border: "2px solid var(--border-medium)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>Loading developer intelligence...</span>
          </div>
        )}

        {!loading && developer && (
          <>
            {/* Header / Profile Summary */}
            <div className="drawer-title-block">
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                <div
                  className="avatar-initial"
                  style={{ width: "52px", height: "52px", fontSize: "20px" }}
                >
                  {developer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{developer.name}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px", color: "var(--text-secondary)", fontSize: "12.5px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={12} color="#7D8884" />
                      {developer.location}
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>
                      {developer.experience} Years Experience
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  background: "var(--bg-subtle)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Mail size={12} color="#7D8884" />
                <span>{developer.email}</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="drawer-section-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Award size={13} color="var(--accent)" />
                <span>Verified Skills ({developer.skills?.length || 0})</span>
              </div>
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
                        fontWeight: 500,
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
              <div className="drawer-section-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FolderGit2 size={13} color="var(--tag-project-text)" />
                <span>Projects ({developer.projects?.length || 0})</span>
              </div>
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
                        <span className="year-pill" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={11} />
                          {proj.year}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.45" }}>
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
              <div className="drawer-section-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={13} color="var(--tag-company-text)" />
                <span>Company History ({developer.companies?.length || 0})</span>
              </div>
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
              <div className="drawer-section-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Briefcase size={13} color="var(--tag-job-text)" />
                <span>Recommended Jobs ({recommendedJobs.length})</span>
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
                          <CheckCircle2 size={11} style={{ display: "inline", marginRight: "3px" }} />
                          {job.matchingSkills} matching {job.matchingSkills === 1 ? "skill" : "skills"}
                        </span>
                      </div>

                      {job.matchedSkills && job.matchedSkills.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "5px",
                            marginTop: "8px",
                          }}
                        >
                          {job.matchedSkills.map((s) => (
                            <span
                              key={s}
                              className="skill-tag-clean"
                              style={{
                                background: "var(--accent-light)",
                                color: "var(--accent)",
                                borderColor: "var(--accent-border)",
                                fontSize: "11px",
                                fontWeight: 500,
                              }}
                            >
                              {s}
                            </span>
                          ))}
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
