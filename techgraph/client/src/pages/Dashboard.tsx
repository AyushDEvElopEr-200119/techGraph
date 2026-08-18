import React from "react";
import { Users, FolderGit2, Cpu, Briefcase, ArrowRight } from "lucide-react";
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
          icon={Users}
          secondaryText="Across 4 tech hubs"
          onClick={() => onNavigateTab("developers")}
        />

        <StatCard
          label="Projects"
          value={projects.length}
          icon={FolderGit2}
          secondaryText="Active repositories"
          onClick={() => onNavigateTab("projects")}
        />

        <StatCard
          label="Technologies"
          value={technologies.length}
          icon={Cpu}
          secondaryText="Tracked tech stacks"
          onClick={() => onNavigateTab("technologies")}
        />

        <StatCard
          label="Jobs"
          value={jobs.length}
          icon={Briefcase}
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
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            <span>View full graph</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <GraphExplorer
          developers={developers}
          projects={projects}
          technologies={technologies}
          jobs={jobs}
          onSelectDeveloper={onSelectDeveloper}
          height={430}
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
              Developer Spotlight
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "1px" }}>
              Engineers with verified graph skill profiles
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("developers")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            <span>All developers</span>
            <ArrowRight size={13} />
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
