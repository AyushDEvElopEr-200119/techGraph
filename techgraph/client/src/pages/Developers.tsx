import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Developer } from "../types";
import { DeveloperCard } from "../components/DeveloperCard";

interface DevelopersPageProps {
  developers: Developer[];
  developerSkillsMap: Record<string, string[]>;
  developerMatchesMap: Record<string, number>;
  onSelectDeveloper: (id: string) => void;
}

export const DevelopersPage: React.FC<DevelopersPageProps> = ({
  developers,
  developerSkillsMap,
  developerMatchesMap,
  onSelectDeveloper,
}) => {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [minExpFilter, setMinExpFilter] = useState<number | "ALL">("ALL");

  const locations = useMemo(() => {
    const set = new Set<string>();
    developers.forEach((d) => set.add(d.location));
    return Array.from(set);
  }, [developers]);

  const filteredDevelopers = useMemo(() => {
    return developers.filter((d) => {
      const q = search.toLowerCase();
      const matchQuery =
        !search ||
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q);

      const matchLocation =
        locationFilter === "ALL" || d.location === locationFilter;

      const matchExp =
        minExpFilter === "ALL" || d.experience >= Number(minExpFilter);

      return matchQuery && matchLocation && matchExp;
    });
  }, [developers, search, locationFilter, minExpFilter]);

  return (
    <div>
      {/* Controls */}
      <div className="clean-filter-bar">
        <div className="clean-search-input" style={{ width: "240px" }}>
          <Search size={14} color="#6B706C" />
          <input
            type="text"
            className="search-field-native"
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="clean-select"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="ALL">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          className="clean-select"
          value={minExpFilter}
          onChange={(e) =>
            setMinExpFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">All Experience</option>
          <option value="2">2+ Years Exp</option>
          <option value="3">3+ Years Exp</option>
          <option value="5">5+ Years Exp</option>
        </select>
      </div>

      {/* Grid */}
      {filteredDevelopers.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
          No developers match the specified criteria.
        </div>
      ) : (
        <div className="dev-grid-clean">
          {filteredDevelopers.map((developer) => (
            <DeveloperCard
              key={developer.id}
              developer={developer}
              skills={developerSkillsMap[developer.id] || []}
              projectCount={1}
              matchingJobsCount={developerMatchesMap[developer.id] || 0}
              onClick={() => onSelectDeveloper(developer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
