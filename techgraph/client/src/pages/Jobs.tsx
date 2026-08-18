import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Job, Developer } from "../types";
import { JobCard } from "../components/JobCard";

interface JobsPageProps {
  jobs: Job[];
  developers: Developer[];
  developerSkillsMap: Record<string, string[]>;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  jobs,
  developers,
  developerSkillsMap,
}) => {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [minExpFilter, setMinExpFilter] = useState<number | "ALL">("ALL");
  const [simulatedDevId, setSimulatedDevId] = useState<string>("ALL");

  const locations = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(j.location));
    return Array.from(set);
  }, [jobs]);

  const simulatedDeveloper = useMemo(() => {
    return developers.find((d) => d.id === simulatedDevId) || null;
  }, [developers, simulatedDevId]);

  const simulatedDevSkills = useMemo(() => {
    if (!simulatedDeveloper) return [];
    return developerSkillsMap[simulatedDeveloper.id] || [];
  }, [simulatedDeveloper, developerSkillsMap]);

  // Filtered jobs & calculated matches
  const processedJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        const q = search.toLowerCase();
        const matchQuery =
          !search ||
          j.title.toLowerCase().includes(q) ||
          (j.company && j.company.toLowerCase().includes(q)) ||
          j.description.toLowerCase().includes(q);

        const matchLocation =
          locationFilter === "ALL" || j.location === locationFilter;

        const matchExp =
          minExpFilter === "ALL" || j.experienceRequired <= Number(minExpFilter);

        return matchQuery && matchLocation && matchExp;
      })
      .map((job) => {
        let matchedCount: number | undefined = undefined;
        if (simulatedDeveloper && job.requiredSkills) {
          matchedCount = job.requiredSkills.filter((s) =>
            simulatedDevSkills.includes(s)
          ).length;
        }
        return {
          ...job,
          matchedCount,
        };
      });
  }, [
    jobs,
    search,
    locationFilter,
    minExpFilter,
    simulatedDeveloper,
    simulatedDevSkills,
  ]);

  return (
    <div>
      {/* Controls & Match Selector */}
      <div className="clean-filter-bar">
        <div className="clean-search-input" style={{ width: "240px" }}>
          <Search size={14} color="#6B706C" />
          <input
            type="text"
            className="search-field-native"
            placeholder="Search jobs..."
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
          <option value="2">Up to 2 Years</option>
          <option value="3">Up to 3 Years</option>
          <option value="5">Up to 5 Years</option>
        </select>

        <select
          className="clean-select"
          style={{ marginLeft: "auto" }}
          value={simulatedDevId}
          onChange={(e) => setSimulatedDevId(e.target.value)}
        >
          <option value="ALL">Match against developer...</option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.location})
            </option>
          ))}
        </select>
      </div>

      {/* Jobs List */}
      <div className="jobs-list-clean">
        {processedJobs.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
            No jobs match the specified criteria.
          </div>
        ) : (
          processedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              matchedCount={job.matchedCount}
              selectedDeveloperName={simulatedDeveloper?.name}
            />
          ))
        )}
      </div>
    </div>
  );
};
