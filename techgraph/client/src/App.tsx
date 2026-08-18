import { useEffect, useState, useCallback } from "react";
import {
  getDevelopers,
  getDeveloper,
  getRecommendedJobs,
  getProjects,
  getTechnologies,
  getJobs,
  getHealth,
} from "./services/api";
import type {
  Developer,
  DeveloperDetails,
  RecommendedJob,
  Project,
  Technology,
  Job,
  HealthStatus,
} from "./types";
import { Sidebar } from "./components/Sidebar";
import type { NavTab } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DeveloperDetailsModal } from "./components/DeveloperDetails";
import { SearchBar } from "./components/SearchBar";
import { Dashboard } from "./pages/Dashboard";
import { DevelopersPage } from "./pages/Developers";
import { ProjectsPage } from "./pages/Projects";
import { TechnologiesPage } from "./pages/Technologies";
import { JobsPage } from "./pages/Jobs";
import { GraphView } from "./pages/GraphView";
import "./App.css";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [health, setHealth] = useState<HealthStatus>({
    status: "connecting",
    database: "checking",
  });

  const [developerSkillsMap, setDeveloperSkillsMap] = useState<Record<string, string[]>>({});
  const [developerMatchesMap, setDeveloperMatchesMap] = useState<Record<string, number>>({});

  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperDetails | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load all primary graph data
  const loadAllData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError("");

      const [devsData, projsData, techsData, jobsData, healthData] = await Promise.all([
        getDevelopers().catch(() => []),
        getProjects().catch(() => []),
        getTechnologies().catch(() => []),
        getJobs().catch(() => []),
        getHealth().catch(() => ({ status: "error" as const, database: "unavailable" as const })),
      ]);

      setDevelopers(devsData);
      setProjects(projsData);
      setTechnologies(techsData);
      setJobs(jobsData);
      setHealth(healthData);

      // Preload developer skill graphs and matching counts in parallel
      if (devsData.length > 0) {
        const detailPromises = devsData.map(async (d) => {
          try {
            const [detail, recJobs] = await Promise.all([
              getDeveloper(d.id),
              getRecommendedJobs(d.id),
            ]);
            return {
              id: d.id,
              skills: detail.skills?.map((s) => s.name) || [],
              matchCount: recJobs.length,
            };
          } catch {
            return { id: d.id, skills: [], matchCount: 0 };
          }
        });

        const detailsResults = await Promise.all(detailPromises);
        const sMap: Record<string, string[]> = {};
        const mMap: Record<string, number> = {};
        detailsResults.forEach((res) => {
          sMap[res.id] = res.skills;
          mMap[res.id] = res.matchCount;
        });
        setDeveloperSkillsMap(sMap);
        setDeveloperMatchesMap(mMap);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch intelligence graph data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Periodic health check
  useEffect(() => {
    const timer = setInterval(async () => {
      const h = await getHealth();
      setHealth(h);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Developer click handler for detail modal
  const handleDeveloperClick = async (id: string) => {
    try {
      setDetailsLoading(true);
      setError("");

      const [developer, recJobs] = await Promise.all([
        getDeveloper(id),
        getRecommendedJobs(id),
      ]);

      setSelectedDeveloper(developer);
      setRecommendedJobs(recJobs);
    } catch (err) {
      console.error(err);
      setError("Failed to load developer details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedDeveloper(null);
    setRecommendedJobs([]);
  };

  return (
    <div className="app-container">
      {/* Fixed/Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          developers: developers.length,
          projects: projects.length,
          technologies: technologies.length,
          jobs: jobs.length,
        }}
        health={health}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Workspace Wrapper */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          health={health}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRefresh={() => loadAllData(true)}
          refreshing={refreshing}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Page Content View */}
        <main className="page-content">
          {loading && (
            <div className="message">
              <div
                style={{
                  display: "inline-block",
                  width: "32px",
                  height: "32px",
                  border: "3px solid rgba(56, 189, 248, 0.2)",
                  borderTopColor: "#38bdf8",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "12px",
                }}
              />
              <p>Connecting to CognoDB & initializing graph intelligence...</p>
            </div>
          )}

          {error && <div className="message error">{error}</div>}

          {!loading && !error && (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  developers={developers}
                  projects={projects}
                  technologies={technologies}
                  jobs={jobs}
                  developerSkillsMap={developerSkillsMap}
                  developerMatchesMap={developerMatchesMap}
                  onSelectDeveloper={handleDeveloperClick}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "developers" && (
                <DevelopersPage
                  developers={developers}
                  developerSkillsMap={developerSkillsMap}
                  developerMatchesMap={developerMatchesMap}
                  onSelectDeveloper={handleDeveloperClick}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsPage
                  projects={projects}
                  onExploreInGraph={() => setActiveTab("graph")}
                />
              )}

              {activeTab === "technologies" && (
                <TechnologiesPage technologies={technologies} />
              )}

              {activeTab === "jobs" && (
                <JobsPage
                  jobs={jobs}
                  developers={developers}
                  developerSkillsMap={developerSkillsMap}
                />
              )}

              {activeTab === "graph" && (
                <GraphView
                  developers={developers}
                  projects={projects}
                  technologies={technologies}
                  jobs={jobs}
                  onSelectDeveloper={handleDeveloperClick}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Developer Details Drawer / Modal */}
      {(selectedDeveloper || detailsLoading) && (
        <DeveloperDetailsModal
          developer={selectedDeveloper}
          recommendedJobs={recommendedJobs}
          loading={detailsLoading}
          onClose={closeDetails}
        />
      )}

      {/* Global Search Command Palette */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        developers={developers}
        projects={projects}
        technologies={technologies}
        jobs={jobs}
        onSelectDeveloper={handleDeveloperClick}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}

export default App;