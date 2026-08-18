import React from "react";
import { Search, Menu, RefreshCw } from "lucide-react";
import type { NavTab } from "./Sidebar";
import type { HealthStatus } from "../types";

interface HeaderProps {
  activeTab: NavTab;
  health: HealthStatus;
  onOpenSearch: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

const tabDisplayNames: Record<NavTab, string> = {
  dashboard: "Overview",
  developers: "Developers",
  projects: "Projects",
  technologies: "Technologies",
  jobs: "Jobs",
  graph: "Graph Explorer",
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  health,
  onOpenSearch,
  onRefresh,
  refreshing,
  mobileOpen,
  setMobileOpen,
}) => {
  const currentTabName = tabDisplayNames[activeTab] || "Overview";

  return (
    <header className="top-header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          className="icon-btn-clean"
          style={{ display: "none" }}
          id="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={16} />
        </button>

        <div className="header-breadcrumbs">
          <span className="breadcrumb-root">TechGraph</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{currentTabName}</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="clean-search-input"
          onClick={onOpenSearch}
          title="Search developers, projects, technologies..."
        >
          <Search size={14} color="#6B706C" />
          <span style={{ color: "#6B706C" }}>Search...</span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10.5px",
              fontFamily: "var(--font-mono)",
              background: "var(--bg-secondary)",
              padding: "1px 5px",
              borderRadius: "4px",
              border: "1px solid var(--border-medium)",
            }}
          >
            /
          </span>
        </button>

        <div className="header-status-badge">
          <span
            className={`status-dot-natural ${
              health.status === "ok" ? "" : "error"
            }`}
          />
          <span>API Connected</span>
        </div>

        <button
          className="icon-btn-clean"
          onClick={onRefresh}
          title="Refresh Data"
        >
          <RefreshCw
            size={14}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn {
            display: flex !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
