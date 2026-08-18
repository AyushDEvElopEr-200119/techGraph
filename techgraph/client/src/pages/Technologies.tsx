import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Technology } from "../types";
import { TechnologyCard } from "../components/TechnologyCard";

interface TechnologiesPageProps {
  technologies: Technology[];
}

export const TechnologiesPage: React.FC<TechnologiesPageProps> = ({
  technologies,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set<string>();
    technologies.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [technologies]);

  const filteredTech = useMemo(() => {
    return technologies.filter((t) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "ALL" ||
        t.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchQuery && matchCategory;
    });
  }, [technologies, search, categoryFilter]);

  return (
    <div>
      {/* Controls */}
      <div className="clean-filter-bar">
        <div className="clean-search-input" style={{ width: "260px" }}>
          <Search size={14} color="#6B706C" />
          <input
            type="text"
            className="search-field-native"
            placeholder="Search technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="clean-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories ({technologies.length})</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table / Card Hybrid Container */}
      <div className="tech-table-container">
        <table className="tech-table">
          <thead>
            <tr>
              <th>Technology</th>
              <th>Category</th>
              <th>Used in Projects</th>
              <th>Required by Jobs</th>
            </tr>
          </thead>
          <tbody>
            {filteredTech.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px" }}>
                  No technologies match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredTech.map((tech) => (
                <TechnologyCard key={tech.id} technology={tech} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
