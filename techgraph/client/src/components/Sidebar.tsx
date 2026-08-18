import React from "react";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Cpu,
  Briefcase,
  Share2,
} from "lucide-react";
import type { HealthStatus } from "../types";

export type NavTab = "dashboard" | "developers" | "projects" | "technologies" | "jobs" | "graph";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  counts: {
    developers: number;
    projects: number;
    technologies: number;
    jobs: number;
  };
  health: HealthStatus;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  counts,
  health,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: "Overview",
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      id: "developers" as NavTab,
      label: "Developers",
      icon: Users,
      count: counts.developers,
    },
    {
      id: "projects" as NavTab,
      label: "Projects",
      icon: FolderGit2,
      count: counts.projects,
    },
    {
      id: "technologies" as NavTab,
      label: "Technologies",
      icon: Cpu,
      count: counts.technologies,
    },
    {
      id: "jobs" as NavTab,
      label: "Jobs",
      icon: Briefcase,
      count: counts.jobs,
    },
    {
      id: "graph" as NavTab,
      label: "Graph Explorer",
      icon: Share2,
      count: undefined,
    },
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-icon-box">
          <Share2 size={18} strokeWidth={2.4} />
        </div>
        <div className="sidebar-brand">
          <h1>
            TECHGRAPH
            <span className="sidebar-brand-badge">V2</span>
          </h1>
          <p>Developer Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-heading">Workspace</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
            >
              <div className="nav-item-left">
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator-clean">
          <span
            className={`status-dot-natural ${
              health.status === "ok" ? "" : "error"
            }`}
          />
          <span style={{ fontWeight: 500 }}>
            {health.status === "ok" ? "API Connected" : "API Connecting..."}
          </span>
        </div>
      </div>
    </aside>
  );
};
