import React, { useState, useEffect, useRef } from "react";
import { Search, X, Users, FolderGit2, Cpu, Briefcase, ChevronRight } from "lucide-react";
import type { Developer, Project, Technology, Job } from "../types";
import type { NavTab } from "./Sidebar";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  developers: Developer[];
  projects: Project[];
  technologies: Technology[];
  jobs: Job[];
  onSelectDeveloper: (id: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  onClose,
  developers,
  projects,
  technologies,
  jobs,
  onSelectDeveloper,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        // Trigger search open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredDevs = cleanQuery
    ? developers.filter(
        (d) =>
          d.name.toLowerCase().includes(cleanQuery) ||
          d.location.toLowerCase().includes(cleanQuery) ||
          d.email.toLowerCase().includes(cleanQuery)
      )
    : developers.slice(0, 3);

  const filteredProjects = cleanQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery)
      )
    : projects.slice(0, 3);

  const filteredTech = cleanQuery
    ? technologies.filter(
        (t) =>
          t.name.toLowerCase().includes(cleanQuery) ||
          t.category.toLowerCase().includes(cleanQuery)
      )
    : technologies.slice(0, 4);

  const filteredJobs = cleanQuery
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(cleanQuery) ||
          (j.company && j.company.toLowerCase().includes(cleanQuery)) ||
          j.location.toLowerCase().includes(cleanQuery)
      )
    : jobs.slice(0, 3);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(32, 35, 33, 0.35)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        zIndex: 120,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-medium)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-modal)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border-medium)",
          }}
        >
          <Search size={16} color="#6B706C" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search developers, projects, technologies, jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          {query && (
            <button className="icon-btn-clean" style={{ width: "24px", height: "24px" }} onClick={() => setQuery("")}>
              <X size={12} />
            </button>
          )}
        </div>

        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
          {filteredDevs.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", padding: "4px 8px", textTransform: "uppercase" }}>
                Developers
              </div>
              {filteredDevs.map((d) => (
                <button
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                  className="nav-item"
                  onClick={() => {
                    onSelectDeveloper(d.id);
                    onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={14} color="#2F6F5E" />
                    <span><strong>{d.name}</strong> · {d.location}</span>
                  </div>
                  <ChevronRight size={13} color="var(--text-dim)" />
                </button>
              ))}
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", padding: "4px 8px", textTransform: "uppercase" }}>
                Projects
              </div>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                  className="nav-item"
                  onClick={() => {
                    onNavigateTab("projects");
                    onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FolderGit2 size={14} color="#824B20" />
                    <span><strong>{p.name}</strong> ({p.year})</span>
                  </div>
                  <ChevronRight size={13} color="var(--text-dim)" />
                </button>
              ))}
            </div>
          )}

          {filteredTech.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", padding: "4px 8px", textTransform: "uppercase" }}>
                Technologies
              </div>
              {filteredTech.map((t) => (
                <button
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                  className="nav-item"
                  onClick={() => {
                    onNavigateTab("technologies");
                    onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Cpu size={14} color="#53583C" />
                    <span><strong>{t.name}</strong> · {t.category}</span>
                  </div>
                  <ChevronRight size={13} color="var(--text-dim)" />
                </button>
              ))}
            </div>
          )}

          {filteredJobs.length > 0 && (
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", padding: "4px 8px", textTransform: "uppercase" }}>
                Jobs
              </div>
              {filteredJobs.map((j) => (
                <button
                  key={j.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "left",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                  className="nav-item"
                  onClick={() => {
                    onNavigateTab("jobs");
                    onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Briefcase size={14} color="#783838" />
                    <span><strong>{j.title}</strong> · {j.company}</span>
                  </div>
                  <ChevronRight size={13} color="var(--text-dim)" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
