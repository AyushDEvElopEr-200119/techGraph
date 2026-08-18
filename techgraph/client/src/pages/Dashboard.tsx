import React from "react";
import type { Developer, Project, Technology, Job } from "../types";
import { StatCard } from "../components/StatCard";
import { GraphExplorer } from "../components/GraphExplorer";
import { DeveloperCard } from "../components/DeveloperCard";
import type { NavTab } from "../components/Sidebar";

interface DashboardProps {
  developers: Developer[];
  projects: Project[];
  technologies: Technology[];
  jobs: Job[];
  developerSkillsMap: Record<string, string[]>;
  developerMatchesMap: Record<string, number>;
  onSelectDeveloper: (id: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  developers,
  projects,
  technologies,
  jobs,
  developerSkillsMap,
  developerMatchesMap,
  onSelectDeveloper,
  onNavigateTab,
}) => {
  return (
    <div>
      {/* Four small statistic blocks */}
      <section className="stats-row">
        <StatCard
          label="Developers"
          value={developers.length}
          secondaryText="Indexed profiles"
          onClick={() => onNavigateTab("developers")}
        />

        <StatCard
          label="Projects"
          value={projects.length}
          secondaryText="Active repositories"
          onClick={() => onNavigateTab("projects")}
        />

        <StatCard
          label="Technologies"
          value={technologies.length}
          secondaryText="Tracked tech stacks"
          onClick={() => onNavigateTab("technologies")}
        />

        <StatCard
          label="Jobs"
          value={jobs.length}
          secondaryText="Open positions"
          onClick={() => onNavigateTab("jobs")}
        />
      </section>

      {/* Graph Visualization Section */}
      <section style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              Graph Explorer
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "1px" }}>
              Developer → Skill → Technology → Project → Company → Job
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("graph")}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--accent)",
            }}
          >
            View full graph →
          </button>
        </div>

        <GraphExplorer
          developers={developers}
          projects={projects}
          technologies={technologies}
          jobs={jobs}
          onSelectDeveloper={onSelectDeveloper}
          height={420}
        />
      </section>

      {/* Developers Spotlight Grid */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
              Developers
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "1px" }}>
              Recent engineer profiles
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("developers")}
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--accent)",
            }}
          >
            All developers →
          </button>
        </div>

        <div className="dev-grid-clean">
          {developers.slice(0, 4).map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              skills={developerSkillsMap[dev.id] || []}
              projectCount={1}
              matchingJobsCount={developerMatchesMap[dev.id] || 0}
              onClick={() => onSelectDeveloper(dev.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
