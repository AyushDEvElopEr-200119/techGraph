import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Project } from "../types";
import { ProjectCard } from "../components/ProjectCard";

interface ProjectsPageProps {
  projects: Project[];
  onExploreInGraph?: (projectName: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onExploreInGraph,
}) => {
  const [search, setSearch] = useState("");
  const [selectedTech, setSelectedTech] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");

  const allTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      p.technologies?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [projects]);

  const allYears = useMemo(() => {
    const set = new Set<number>();
    projects.forEach((p) => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchTech =
        selectedTech === "ALL" || p.technologies?.includes(selectedTech);

      const matchYear =
        selectedYear === "ALL" || p.year === Number(selectedYear);

      return matchQuery && matchTech && matchYear;
    });
  }, [projects, search, selectedTech, selectedYear]);

  return (
    <div>
      {/* Controls */}
      <div className="clean-filter-bar">
        <div className="clean-search-input" style={{ width: "240px" }}>
          <Search size={14} color="#6B706C" />
          <input
            type="text"
            className="search-field-native"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="clean-select"
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
        >
          <option value="ALL">All Technologies</option>
          {allTechs.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className="clean-select"
          value={selectedYear}
          onChange={(e) =>
            setSelectedYear(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">All Years</option>
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
          No projects match the specified criteria.
        </div>
      ) : (
        <div className="projects-grid-clean">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onExploreInGraph={onExploreInGraph}
            />
          ))}
        </div>
      )}
    </div>
  );
};
