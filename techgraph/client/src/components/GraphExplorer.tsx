import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import type {
  Developer,
  Project,
  Technology,
  Job,
  NodeType,
  GraphNode,
  GraphLink,
} from "../types";

interface GraphExplorerProps {
  developers: Developer[];
  projects: Project[];
  technologies: Technology[];
  jobs: Job[];
  onSelectDeveloper?: (id: string) => void;
  height?: number | string;
  initialSelectedNodeId?: string | null;
}

// Muted, natural human-designed colors for each node type
const TYPE_CONFIG: Record<
  NodeType,
  {
    color: string;
    bg: string;
    border: string;
    radius: number;
  }
> = {
  Developer: {
    color: "#225C4D",
    bg: "#EBF3F0",
    border: "#BCD8CF",
    radius: 20,
  },
  Skill: {
    color: "#2A526E",
    bg: "#E8F1F7",
    border: "#BFD7E6",
    radius: 17,
  },
  Technology: {
    color: "#505832",
    bg: "#F0F3E8",
    border: "#D1D8C0",
    radius: 18,
  },
  Project: {
    color: "#7D4314",
    bg: "#FAF0E6",
    border: "#E8CFBA",
    radius: 19,
  },
  Company: {
    color: "#504462",
    bg: "#F2EFF7",
    border: "#D3C9E2",
    radius: 18,
  },
  Job: {
    color: "#752E2E",
    bg: "#F9EDED",
    border: "#E5C3C3",
    radius: 19,
  },
};

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  developers,
  projects,
  technologies,
  jobs,
  onSelectDeveloper,
  height = 580,
  initialSelectedNodeId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<NodeType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const transformRef = useRef({ x: 0, y: 0, scale: 0.95 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  // Construct graph nodes and links from real application data
  const { rawNodes, rawLinks } = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Developers
    developers.forEach((d) => {
      const id = `dev-${d.id}`;
      nodesMap.set(id, {
        id,
        name: d.name,
        type: "Developer",
        subtitle: `${d.experience} yrs • ${d.location}`,
        meta: d,
        radius: TYPE_CONFIG.Developer.radius,
      });

      if (d.skills) {
        d.skills.forEach((s) => {
          const skillId = `skill-${s.name.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(skillId)) {
            nodesMap.set(skillId, {
              id: skillId,
              name: s.name,
              type: "Skill",
              subtitle: "Verified Skill",
              meta: s,
              radius: TYPE_CONFIG.Skill.radius,
            });
          }
          links.push({ source: id, target: skillId, label: "HAS_SKILL" });
        });
      }

      if (d.projects) {
        d.projects.forEach((p) => {
          const projId = `proj-${p.name.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(projId)) {
            nodesMap.set(projId, {
              id: projId,
              name: p.name,
              type: "Project",
              subtitle: `${p.year}`,
              meta: p,
              radius: TYPE_CONFIG.Project.radius,
            });
          }
          links.push({ source: id, target: projId, label: "WORKED_ON" });
        });
      }

      if (d.companies) {
        d.companies.forEach((c) => {
          const compId = `comp-${c.name.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(compId)) {
            nodesMap.set(compId, {
              id: compId,
              name: c.name,
              type: "Company",
              subtitle: `${c.industry} • ${c.location}`,
              meta: c,
              radius: TYPE_CONFIG.Company.radius,
            });
          }
          links.push({ source: id, target: compId, label: "WORKED_AT" });
        });
      }
    });

    // Projects & Technologies
    projects.forEach((p) => {
      const projId = `proj-${p.name.toLowerCase().replace(/\s+/g, "-")}`;
      if (!nodesMap.has(projId)) {
        nodesMap.set(projId, {
          id: projId,
          name: p.name,
          type: "Project",
          subtitle: `${p.year}`,
          meta: p,
          radius: TYPE_CONFIG.Project.radius,
        });
      }

      if (p.technologies) {
        p.technologies.forEach((tName) => {
          const techId = `tech-${tName.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(techId)) {
            nodesMap.set(techId, {
              id: techId,
              name: tName,
              type: "Technology",
              subtitle: "Tech Stack",
              radius: TYPE_CONFIG.Technology.radius,
            });
          }
          links.push({ source: projId, target: techId, label: "USES" });
        });
      }

      if (p.developers) {
        p.developers.forEach((devName) => {
          const matchDev = developers.find(
            (d) => d.name.toLowerCase() === devName.toLowerCase()
          );
          if (matchDev) {
            const devId = `dev-${matchDev.id}`;
            const exists = links.some(
              (l) => l.source === devId && l.target === projId
            );
            if (!exists) {
              links.push({ source: devId, target: projId, label: "WORKED_ON" });
            }
          }
        });
      }
    });

    // Technologies
    technologies.forEach((t) => {
      const techId = `tech-${t.name.toLowerCase().replace(/\s+/g, "-")}`;
      if (!nodesMap.has(techId)) {
        nodesMap.set(techId, {
          id: techId,
          name: t.name,
          type: "Technology",
          subtitle: t.category,
          meta: t,
          radius: TYPE_CONFIG.Technology.radius,
        });
      } else {
        const n = nodesMap.get(techId)!;
        n.subtitle = t.category;
        n.meta = t;
      }
    });

    // Jobs
    jobs.forEach((j) => {
      const jobId = `job-${j.id}`;
      nodesMap.set(jobId, {
        id: jobId,
        name: j.title,
        type: "Job",
        subtitle: `${j.company || ""} • ${j.location}`,
        meta: j,
        radius: TYPE_CONFIG.Job.radius,
      });

      if (j.company) {
        const compId = `comp-${j.company.toLowerCase().replace(/\s+/g, "-")}`;
        if (!nodesMap.has(compId)) {
          nodesMap.set(compId, {
            id: compId,
            name: j.company,
            type: "Company",
            subtitle: j.location,
            radius: TYPE_CONFIG.Company.radius,
          });
        }
        links.push({ source: compId, target: jobId, label: "OFFERS" });
      }

      if (j.requiredSkills) {
        j.requiredSkills.forEach((sName) => {
          const skillId = `skill-${sName.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(skillId)) {
            nodesMap.set(skillId, {
              id: skillId,
              name: sName,
              type: "Skill",
              subtitle: "Required Skill",
              radius: TYPE_CONFIG.Skill.radius,
            });
          }
          links.push({ source: jobId, target: skillId, label: "REQUIRES" });
        });
      }
    });

    return {
      rawNodes: Array.from(nodesMap.values()),
      rawLinks: links,
    };
  }, [developers, projects, technologies, jobs]);

  const simNodesRef = useRef<GraphNode[]>([]);
  const simLinksRef = useRef<GraphLink[]>([]);

  // Initialize node layout positions
  useEffect(() => {
    const layerOffsets: Record<NodeType, { radius: number; angleOffset: number }> = {
      Developer: { radius: 100, angleOffset: 0 },
      Skill: { radius: 210, angleOffset: 0.3 },
      Technology: { radius: 310, angleOffset: 0.6 },
      Project: { radius: 280, angleOffset: -0.8 },
      Company: { radius: 230, angleOffset: -0.4 },
      Job: { radius: 370, angleOffset: -0.2 },
    };

    const typeBuckets: Record<NodeType, GraphNode[]> = {
      Developer: [],
      Skill: [],
      Technology: [],
      Project: [],
      Company: [],
      Job: [],
    };

    rawNodes.forEach((node) => {
      typeBuckets[node.type]?.push(node);
    });

    const initializedNodes: GraphNode[] = [];

    (Object.keys(typeBuckets) as NodeType[]).forEach((type) => {
      const group = typeBuckets[type];
      const cfg = layerOffsets[type];
      const step = (Math.PI * 2) / Math.max(group.length, 1);

      group.forEach((node, idx) => {
        const angle = cfg.angleOffset + idx * step;
        initializedNodes.push({
          ...node,
          x: Math.cos(angle) * cfg.radius + (Math.random() * 20 - 10),
          y: Math.sin(angle) * cfg.radius + (Math.random() * 20 - 10),
          vx: 0,
          vy: 0,
        });
      });
    });

    simNodesRef.current = initializedNodes;
    simLinksRef.current = rawLinks;
  }, [rawNodes, rawLinks]);

  useEffect(() => {
    if (initialSelectedNodeId) {
      const match = simNodesRef.current.find(
        (n) => n.id === initialSelectedNodeId || n.name.toLowerCase() === initialSelectedNodeId.toLowerCase()
      );
      if (match) {
        setSelectedNode(match);
      }
    }
  }, [initialSelectedNodeId]);

  // Clean Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Clean canvas background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      const nodes = simNodesRef.current;
      const links = simLinksRef.current;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = (n1.x || 0) - (n2.x || 0);
          const dy = (n1.y || 0) - (n2.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = (n1.radius || 18) + (n2.radius || 18) + 42;

          if (dist < 320) {
            const force = (minDist * minDist) / (dist * dist * 14);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1 !== draggedNodeRef.current) {
              n1.vx = (n1.vx || 0) + fx;
              n1.vy = (n1.vy || 0) + fy;
            }
            if (n2 !== draggedNodeRef.current) {
              n2.vx = (n2.vx || 0) - fx;
              n2.vy = (n2.vy || 0) - fy;
            }
          }
        }
      }

      // Attraction
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);

        if (sourceNode && targetNode) {
          const dx = (targetNode.x || 0) - (sourceNode.x || 0);
          const dy = (targetNode.y || 0) - (sourceNode.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 125;
          const force = (dist - idealDist) * 0.007;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (sourceNode !== draggedNodeRef.current) {
            sourceNode.vx = (sourceNode.vx || 0) + fx;
            sourceNode.vy = (sourceNode.vy || 0) + fy;
          }
          if (targetNode !== draggedNodeRef.current) {
            targetNode.vx = (targetNode.vx || 0) - fx;
            targetNode.vy = (targetNode.vy || 0) - fy;
          }
        }
      });

      // Damping
      nodes.forEach((node) => {
        if (node === draggedNodeRef.current) return;
        const distToCenter = Math.sqrt((node.x || 0) ** 2 + (node.y || 0) ** 2);
        const centerForce = distToCenter * 0.0008;
        node.vx = ((node.vx || 0) - (node.x || 0) * centerForce) * 0.88;
        node.vy = ((node.vy || 0) - (node.y || 0) * centerForce) * 0.88;

        node.x = (node.x || 0) + (node.vx || 0);
        node.y = (node.y || 0) + (node.vy || 0);
      });

      ctx.save();
      ctx.translate(cx + transformRef.current.x, cy + transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Draw subtle dot grid pattern on canvas
      ctx.fillStyle = "#E4E7E2";
      const dotStep = 36;
      for (let x = -800; x <= 800; x += dotStep) {
        for (let y = -800; y <= 800; y += dotStep) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const activeHighlightNode = hoveredNode || selectedNode;
      const connectedNodeIds = new Set<string>();
      if (activeHighlightNode) {
        connectedNodeIds.add(activeHighlightNode.id);
        links.forEach((l) => {
          if (l.source === activeHighlightNode.id) connectedNodeIds.add(l.target);
          if (l.target === activeHighlightNode.id) connectedNodeIds.add(l.source);
        });
      }

      // Draw Thin Neutral Connection Lines
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        if (
          activeFilter !== "ALL" &&
          sourceNode.type !== activeFilter &&
          targetNode.type !== activeFilter
        ) {
          return;
        }

        const isLinkActive =
          activeHighlightNode &&
          (link.source === activeHighlightNode.id || link.target === activeHighlightNode.id);

        const isLinkDimmed = activeHighlightNode && !isLinkActive;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0);
        ctx.lineTo(targetNode.x || 0, targetNode.y || 0);

        if (isLinkActive) {
          ctx.strokeStyle = "#225C4D";
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = isLinkDimmed ? "#F0F2EE" : "#DCE0D9";
          ctx.lineWidth = 1.1;
        }
        ctx.stroke();

        if (isLinkActive) {
          const midX = ((sourceNode.x || 0) + (targetNode.x || 0)) / 2;
          const midY = ((sourceNode.y || 0) + (targetNode.y || 0)) / 2;

          ctx.font = "600 9.5px 'JetBrains Mono', monospace";
          const textWidth = ctx.measureText(link.label).width;

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);
          ctx.strokeStyle = "#BCD8CF";
          ctx.lineWidth = 1;
          ctx.strokeRect(midX - textWidth / 2 - 4, midY - 7, textWidth + 8, 14);

          ctx.fillStyle = "#225C4D";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(link.label, midX, midY);
        }
      });

      // Draw Nodes (Simple circles/pills, readable dark text)
      nodes.forEach((node) => {
        const isFiltered = activeFilter !== "ALL" && node.type !== activeFilter;
        const isFocused = activeHighlightNode && connectedNodeIds.has(node.id);
        const isDimmed = activeHighlightNode && !isFocused;
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.Developer;
        const radius = (node.radius || 18) * (isHovered || isSelected ? 1.12 : 1);

        const nx = node.x || 0;
        const ny = node.y || 0;

        ctx.save();
        if (isFiltered || isDimmed) {
          ctx.globalAlpha = 0.22;
        } else {
          ctx.globalAlpha = 1;
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = cfg.bg;
        ctx.fill();

        // Border
        ctx.lineWidth = isSelected || isHovered ? 2 : 1.2;
        ctx.strokeStyle = isSelected || isHovered ? cfg.color : cfg.border;
        ctx.stroke();

        // Node Label (Dark charcoal text)
        ctx.font = `600 ${isHovered || isSelected ? "11.5px" : "11px"} 'Inter', sans-serif`;
        ctx.fillStyle = "#121816";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let label = node.name;
        if (label.length > 14 && !isHovered && !isSelected) {
          label = label.substring(0, 12) + "…";
        }
        ctx.fillText(label, nx, ny);

        // Subtitle Type Tag below
        ctx.font = "600 9px 'Inter', sans-serif";
        ctx.fillStyle = cfg.color;
        ctx.fillText(node.type, nx, ny + radius + 12);

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeFilter, hoveredNode, selectedNode]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height =
          typeof height === "number" ? height : containerRef.current.clientHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const worldX =
        (screenX - cx - transformRef.current.x) / transformRef.current.scale;
      const worldY =
        (screenY - cy - transformRef.current.y) / transformRef.current.scale;

      return { x: worldX, y: worldY };
    },
    []
  );

  const findNodeAtCoords = useCallback(
    (worldX: number, worldY: number): GraphNode | null => {
      for (let i = simNodesRef.current.length - 1; i >= 0; i--) {
        const n = simNodesRef.current[i];
        const dx = worldX - (n.x || 0);
        const dy = worldY - (n.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= (n.radius || 18) + 4) {
          return n;
        }
      }
      return null;
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const clickedNode = findNodeAtCoords(coords.x, coords.y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = coords.x;
      draggedNodeRef.current.y = coords.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingCanvasRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
    } else {
      const node = findNodeAtCoords(coords.x, coords.y);
      setHoveredNode(node);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current = null;
    }
    if (isDraggingCanvasRef.current) {
      isDraggingCanvasRef.current = false;
    }

    const coords = getCanvasCoords(e);
    const clickedNode = findNodeAtCoords(coords.x, coords.y);
    if (clickedNode) {
      setSelectedNode(clickedNode);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.06 : 0.94;
    transformRef.current.scale = Math.min(
      Math.max(transformRef.current.scale * zoomFactor, 0.4),
      2.5
    );
  };

  const handleZoom = (delta: number) => {
    transformRef.current.scale = Math.min(
      Math.max(transformRef.current.scale + delta, 0.4),
      2.5
    );
  };

  const handleResetView = () => {
    transformRef.current = { x: 0, y: 0, scale: 0.95 };
    setSelectedNode(null);
  };

  const handleSearchSelect = (nodeName: string) => {
    const target = simNodesRef.current.find(
      (n) => n.name.toLowerCase().includes(nodeName.toLowerCase())
    );
    if (target) {
      setSelectedNode(target);
      transformRef.current = {
        x: -(target.x || 0) * transformRef.current.scale,
        y: -(target.y || 0) * transformRef.current.scale,
        scale: 1.2,
      };
      setSearchQuery("");
    }
  };

  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    const results: { label: string; node: GraphNode; direction: "out" | "in" }[] = [];

    simLinksRef.current.forEach((l) => {
      if (l.source === selectedNode.id) {
        const target = simNodesRef.current.find((n) => n.id === l.target);
        if (target) results.push({ label: l.label, node: target, direction: "out" });
      } else if (l.target === selectedNode.id) {
        const source = simNodesRef.current.find((n) => n.id === l.source);
        if (source) results.push({ label: l.label, node: source, direction: "in" });
      }
    });

    return results;
  }, [selectedNode]);

  const filterOptions: (NodeType | "ALL")[] = [
    "ALL",
    "Developer",
    "Skill",
    "Technology",
    "Project",
    "Company",
    "Job",
  ];

  return (
    <div className="graph-wrapper-clean" ref={containerRef}>
      {/* Top Filter & Action Bar */}
      <div className="graph-top-controls">
        <div className="graph-filter-tabs">
          {filterOptions.map((type) => (
            <button
              key={type}
              className={`graph-tab-btn ${activeFilter === type ? "active" : ""}`}
              onClick={() => setActiveFilter(type)}
            >
              {type === "ALL" ? "All" : type}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="clean-search-input" style={{ width: "180px", padding: "4px 8px" }}>
            <Search size={13} color="#7D8884" />
            <input
              type="text"
              className="search-field-native"
              placeholder="Find node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearchSelect(searchQuery);
                }
              }}
            />
          </div>

          <button
            className="icon-btn-clean"
            onClick={() => handleZoom(0.12)}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="icon-btn-clean"
            onClick={() => handleZoom(-0.12)}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            className="icon-btn-clean"
            onClick={handleResetView}
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="graph-canvas-box" style={{ height }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Selected Node Details Side Panel */}
        {selectedNode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "310px",
              background: "var(--bg-surface)",
              borderLeft: "1px solid var(--border-medium)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
              zIndex: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: TYPE_CONFIG[selectedNode.type].bg,
                  color: TYPE_CONFIG[selectedNode.type].color,
                  border: `1px solid ${TYPE_CONFIG[selectedNode.type].border}`,
                }}
              >
                {selectedNode.type}
              </span>

              <button
                className="icon-btn-clean"
                style={{ width: "26px", height: "26px" }}
                onClick={() => setSelectedNode(null)}
              >
                <X size={13} />
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
                {selectedNode.name}
              </h3>
              {selectedNode.subtitle && (
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {selectedNode.subtitle}
                </p>
              )}
            </div>

            {selectedNode.type === "Developer" && onSelectDeveloper && (
              <button
                onClick={() => {
                  const devId = selectedNode.id.replace("dev-", "");
                  onSelectDeveloper(devId);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(34, 92, 77, 0.25)",
                }}
              >
                <ExternalLink size={13} />
                <span>Open Developer Profile</span>
              </button>
            )}

            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  letterSpacing: "0.4px",
                  marginBottom: "8px",
                }}
              >
                Connected Nodes ({selectedNodeConnections.length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedNodeConnections.length === 0 ? (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    No connections
                  </span>
                ) : (
                  selectedNodeConnections.map(({ label, node, direction }, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedNode(node)}
                      style={{
                        padding: "9px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-medium)",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-xs)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "10.5px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>{direction === "out" ? `→ ${label}` : `← ${label}`}</span>
                        <span style={{ color: TYPE_CONFIG[node.type].color, fontWeight: 600 }}>{node.type}</span>
                      </div>
                      <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {node.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Strip */}
      <div className="graph-legend-strip">
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Legend:</span>
        {(Object.keys(TYPE_CONFIG) as NodeType[]).map((t) => (
          <div key={t} className="legend-chip">
            <span
              className="legend-dot"
              style={{ background: TYPE_CONFIG[t].color }}
            />
            <span>{t}</span>
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          {rawNodes.length} nodes · {rawLinks.length} connections
        </span>
      </div>
    </div>
  );
};
