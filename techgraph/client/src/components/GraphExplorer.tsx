import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  Search,
  X,
  ExternalLink,
  Layers,
  Network,
  Orbit,
  Sliders,
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

type LayoutMode = "force" | "columns" | "radial";

// Refined semantic palettes with high contrast and crisp borders
const TYPE_CONFIG: Record<
  NodeType,
  {
    color: string;
    bg: string;
    border: string;
    badge: string;
    icon: string;
  }
> = {
  Developer: {
    color: "#1E5E4E",
    bg: "#EDF6F3",
    border: "#9BC5B7",
    badge: "DEV",
    icon: "👤",
  },
  Skill: {
    color: "#245373",
    bg: "#EDF4F9",
    border: "#A5C5DB",
    badge: "SKILL",
    icon: "⚡",
  },
  Technology: {
    color: "#545D33",
    bg: "#F2F5E8",
    border: "#C2CDA5",
    badge: "TECH",
    icon: "⚙️",
  },
  Project: {
    color: "#844715",
    bg: "#FDF2E9",
    border: "#E0B794",
    badge: "PROJ",
    icon: "📦",
  },
  Company: {
    color: "#544669",
    bg: "#F3EFF8",
    border: "#C2B2D6",
    badge: "CORP",
    icon: "🏢",
  },
  Job: {
    color: "#7E2E2E",
    bg: "#FDF0F0",
    border: "#DE9F9F",
    badge: "JOB",
    icon: "💼",
  },
};

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  developers,
  projects,
  technologies,
  jobs,
  onSelectDeveloper,
  height = 620,
  initialSelectedNodeId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<NodeType | "ALL">("ALL");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("force");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);
  const [spacingMultiplier, setSpacingMultiplier] = useState(1.4);

  const transformRef = useRef({ x: 0, y: 0, scale: 0.85 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const simNodesRef = useRef<GraphNode[]>([]);
  const simLinksRef = useRef<GraphLink[]>([]);

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
        radius: 28,
      });

      if (d.skills) {
        d.skills.forEach((s) => {
          const skillId = `skill-${s.name.toLowerCase().replace(/\s+/g, "-")}`;
          if (!nodesMap.has(skillId)) {
            nodesMap.set(skillId, {
              id: skillId,
              name: s.name,
              type: "Skill",
              subtitle: "Skill",
              meta: s,
              radius: 24,
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
              radius: 26,
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
              radius: 26,
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
          radius: 26,
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
              radius: 24,
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
          radius: 24,
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
        radius: 26,
      });

      if (j.company) {
        const compId = `comp-${j.company.toLowerCase().replace(/\s+/g, "-")}`;
        if (!nodesMap.has(compId)) {
          nodesMap.set(compId, {
            id: compId,
            name: j.company,
            type: "Company",
            subtitle: j.location,
            radius: 26,
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
              radius: 24,
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

  // Apply layout positions (Force, Columns, Radial)
  const applyLayout = useCallback(
    (mode: LayoutMode, mult: number) => {
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

      const updatedNodes: GraphNode[] = [];

      if (mode === "columns") {
        // Structured Pipeline Columns (Left to Right)
        const order: NodeType[] = [
          "Developer",
          "Skill",
          "Technology",
          "Project",
          "Company",
          "Job",
        ];
        const colWidth = 220 * mult;
        const startX = -((order.length - 1) * colWidth) / 2;

        order.forEach((type, colIdx) => {
          const group = typeBuckets[type] || [];
          const totalInCol = group.length;
          const colX = startX + colIdx * colWidth;
          const rowSpacing = Math.min(100 * mult, 700 / Math.max(totalInCol, 1));
          const startY = -((totalInCol - 1) * rowSpacing) / 2;

          group.forEach((node, rowIdx) => {
            updatedNodes.push({
              ...node,
              x: colX,
              y: startY + rowIdx * rowSpacing,
              vx: 0,
              vy: 0,
            });
          });
        });
      } else if (mode === "radial") {
        // Concentric Orbits
        const orbits: Record<NodeType, number> = {
          Developer: 120 * mult,
          Skill: 260 * mult,
          Technology: 390 * mult,
          Project: 330 * mult,
          Company: 460 * mult,
          Job: 520 * mult,
        };

        (Object.keys(typeBuckets) as NodeType[]).forEach((type) => {
          const group = typeBuckets[type] || [];
          const orbitRadius = orbits[type] || 250;
          const step = (Math.PI * 2) / Math.max(group.length, 1);

          group.forEach((node, idx) => {
            const angle = idx * step + (type === "Project" ? 0.3 : 0);
            updatedNodes.push({
              ...node,
              x: Math.cos(angle) * orbitRadius,
              y: Math.sin(angle) * orbitRadius,
              vx: 0,
              vy: 0,
            });
          });
        });
      } else {
        // Organic Force Network: Wide, spacious initial circle distribution
        const orbits: Record<NodeType, number> = {
          Developer: 160 * mult,
          Skill: 320 * mult,
          Technology: 450 * mult,
          Project: 380 * mult,
          Company: 420 * mult,
          Job: 510 * mult,
        };

        (Object.keys(typeBuckets) as NodeType[]).forEach((type) => {
          const group = typeBuckets[type] || [];
          const orbitRadius = orbits[type] || 300;
          const step = (Math.PI * 2) / Math.max(group.length, 1);

          group.forEach((node, idx) => {
            const angle = idx * step + (Math.random() * 0.2 - 0.1);
            updatedNodes.push({
              ...node,
              x: Math.cos(angle) * orbitRadius + (Math.random() * 30 - 15),
              y: Math.sin(angle) * orbitRadius + (Math.random() * 30 - 15),
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
            });
          });
        });
      }

      simNodesRef.current = updatedNodes;
      simLinksRef.current = rawLinks;
    },
    [rawNodes, rawLinks]
  );

  useEffect(() => {
    applyLayout(layoutMode, spacingMultiplier);
  }, [applyLayout, layoutMode, spacingMultiplier]);

  useEffect(() => {
    if (initialSelectedNodeId) {
      const match = simNodesRef.current.find(
        (n) =>
          n.id === initialSelectedNodeId ||
          n.name.toLowerCase() === initialSelectedNodeId.toLowerCase()
      );
      if (match) {
        setSelectedNode(match);
      }
    }
  }, [initialSelectedNodeId]);

  // Fit View to Canvas bounds
  const handleFitView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || simNodesRef.current.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    simNodesRef.current.forEach((n) => {
      const nx = n.x || 0;
      const ny = n.y || 0;
      if (nx < minX) minX = nx;
      if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny;
      if (ny > maxY) maxY = ny;
    });

    const graphWidth = maxX - minX + 240;
    const graphHeight = maxY - minY + 240;
    const canvasWidth = canvas.width || 900;
    const canvasHeight = canvas.height || 600;

    const scaleX = canvasWidth / graphWidth;
    const scaleY = canvasHeight / graphHeight;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY) * 0.9, 0.45), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    transformRef.current = {
      x: -centerX * fitScale,
      y: -centerY * fitScale,
      scale: fitScale,
    };
  }, []);

  // Main Canvas Render & Physics Loop
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

      // Pure crisp white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      const nodes = simNodesRef.current;
      const links = simLinksRef.current;

      // Physics Simulation (only when running & in force mode)
      if (isPhysicsRunning && layoutMode === "force") {
        // Strong Repulsion (Coulomb Anti-collision)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = (n1.x || 0) - (n2.x || 0);
            const dy = (n1.y || 0) - (n2.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 110 * spacingMultiplier;

            if (dist < 600) {
              const force = (minDist * minDist * 4.5) / (dist * dist * 1.8);
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

        // Link Attraction (Spring Force)
        links.forEach((link) => {
          const sourceNode = nodes.find((n) => n.id === link.source);
          const targetNode = nodes.find((n) => n.id === link.target);

          if (sourceNode && targetNode) {
            const dx = (targetNode.x || 0) - (sourceNode.x || 0);
            const dy = (targetNode.y || 0) - (sourceNode.y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const idealDist = 210 * spacingMultiplier;
            const force = (dist - idealDist) * 0.005;

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

        // Gentle Center Gravity & Damping
        nodes.forEach((node) => {
          if (node === draggedNodeRef.current) return;
          const distToCenter = Math.sqrt((node.x || 0) ** 2 + (node.y || 0) ** 2);
          const centerForce = distToCenter * 0.00015;
          node.vx = ((node.vx || 0) - (node.x || 0) * centerForce) * 0.86;
          node.vy = ((node.vy || 0) - (node.y || 0) * centerForce) * 0.86;

          node.x = (node.x || 0) + (node.vx || 0);
          node.y = (node.y || 0) + (node.vy || 0);
        });
      }

      ctx.save();
      ctx.translate(cx + transformRef.current.x, cy + transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Subtle background dot grid
      ctx.fillStyle = "#E4E7E2";
      const dotStep = 40;
      for (let x = -1400; x <= 1400; x += dotStep) {
        for (let y = -1400; y <= 1400; y += dotStep) {
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

      // Draw Smooth Curved Connection Lines & Relationship Pills
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
          (link.source === activeHighlightNode.id ||
            link.target === activeHighlightNode.id);

        const isLinkDimmed = activeHighlightNode && !isLinkActive;

        const sx = sourceNode.x || 0;
        const sy = sourceNode.y || 0;
        const tx = targetNode.x || 0;
        const ty = targetNode.y || 0;

        ctx.save();
        if (isLinkDimmed) {
          ctx.globalAlpha = 0.15;
        } else {
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);

        if (isLinkActive) {
          ctx.strokeStyle = "#1E5E4E";
          ctx.lineWidth = 2.2;
        } else {
          ctx.strokeStyle = "#DCE0D9";
          ctx.lineWidth = 1.3;
        }
        ctx.stroke();

        // Draw Relationship Tag on hover or active link
        if (isLinkActive || transformRef.current.scale > 0.95) {
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;

          ctx.font = "600 9.5px 'JetBrains Mono', monospace";
          const textWidth = ctx.measureText(link.label).width;
          const pillW = textWidth + 10;
          const pillH = 16;

          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(midX - pillW / 2, midY - pillH / 2, pillW, pillH, 4);
          ctx.fill();

          ctx.strokeStyle = isLinkActive ? "#9BC5B7" : "#DCE0D9";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = isLinkActive ? "#1E5E4E" : "#5F6864";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(link.label, midX, midY);
        }

        ctx.restore();
      });

      // Draw Modern Pill/Capsule Nodes with Icons & Badges
      nodes.forEach((node) => {
        const isFiltered = activeFilter !== "ALL" && node.type !== activeFilter;
        const isFocused = activeHighlightNode && connectedNodeIds.has(node.id);
        const isDimmed = activeHighlightNode && !isFocused;
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

        const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.Developer;
        const nx = node.x || 0;
        const ny = node.y || 0;

        ctx.save();
        if (isFiltered || isDimmed) {
          ctx.globalAlpha = 0.2;
        } else {
          ctx.globalAlpha = 1;
        }

        // Measure Label
        const displayName = node.name;
        ctx.font = "600 12.5px 'Inter', sans-serif";
        const labelWidth = ctx.measureText(displayName).width;

        // Card Pill Dimensions
        const pillWidth = Math.max(labelWidth + 48, 100);
        const pillHeight = 36;
        const pillRadius = 8;

        const left = nx - pillWidth / 2;
        const top = ny - pillHeight / 2;

        // Node Drop Shadow (Subtle modern lift)
        if (isSelected || isHovered) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetY = 4;
        } else {
          ctx.shadowColor = "rgba(0, 0, 0, 0.05)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;
        }

        // Card Background Fill
        ctx.fillStyle = cfg.bg;
        ctx.beginPath();
        ctx.roundRect(left, top, pillWidth, pillHeight, pillRadius);
        ctx.fill();

        // Reset shadow for border & text
        ctx.shadowColor = "transparent";

        // Card Border
        ctx.lineWidth = isSelected || isHovered ? 2 : 1.2;
        ctx.strokeStyle = isSelected || isHovered ? cfg.color : cfg.border;
        ctx.stroke();

        // Left Icon Badge Box
        const iconBoxSize = 24;
        const iconBoxX = left + 6;
        const iconBoxY = top + 6;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize, 4);
        ctx.fill();
        ctx.strokeStyle = cfg.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Icon Emoji / Symbol
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cfg.icon, iconBoxX + iconBoxSize / 2, iconBoxY + iconBoxSize / 2 + 1);

        // Node Label Text (Charcoal)
        ctx.font = `600 ${isSelected || isHovered ? "12.5px" : "12px"} 'Inter', sans-serif`;
        ctx.fillStyle = "#121816";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(displayName, left + 36, top + pillHeight / 2 - 1);

        // Micro Type Badge on Top Edge
        const badgeText = cfg.badge;
        ctx.font = "700 8.5px 'JetBrains Mono', monospace";
        const badgeW = ctx.measureText(badgeText).width + 8;
        const badgeH = 13;
        const badgeX = left + pillWidth - badgeW - 6;
        const badgeY = top - 6;

        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    activeFilter,
    hoveredNode,
    selectedNode,
    isPhysicsRunning,
    layoutMode,
    spacingMultiplier,
  ]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height =
          typeof height === "number" ? height : containerRef.current.clientHeight;
        handleFitView();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height, handleFitView]);

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
        const nx = n.x || 0;
        const ny = n.y || 0;
        const pillWidth = 140;
        const pillHeight = 40;

        if (
          worldX >= nx - pillWidth / 2 &&
          worldX <= nx + pillWidth / 2 &&
          worldY >= ny - pillHeight / 2 &&
          worldY <= ny + pillHeight / 2
        ) {
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
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    transformRef.current.scale = Math.min(
      Math.max(transformRef.current.scale * zoomFactor, 0.35),
      2.8
    );
  };

  const handleZoom = (delta: number) => {
    transformRef.current.scale = Math.min(
      Math.max(transformRef.current.scale + delta, 0.35),
      2.8
    );
  };

  const handleSearchSelect = (nodeName: string) => {
    const target = simNodesRef.current.find(
      (n) => n.name.toLowerCase().includes(nodeName.toLowerCase())
    );
    if (target) {
      setSelectedNode(target);
      transformRef.current = {
        x: -(target.x || 0) * 1.1,
        y: -(target.y || 0) * 1.1,
        scale: 1.1,
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
      {/* Top Controls Toolbar */}
      <div className="graph-top-controls">
        {/* Category Filters */}
        <div className="graph-filter-tabs">
          {filterOptions.map((type) => (
            <button
              key={type}
              className={`graph-tab-btn ${activeFilter === type ? "active" : ""}`}
              onClick={() => setActiveFilter(type)}
            >
              {type === "ALL" ? "All Nodes" : type}
            </button>
          ))}
        </div>

        {/* Layout Modes & View Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Layout Mode Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-subtle)",
              padding: "2px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-medium)",
              gap: "2px",
            }}
          >
            <button
              onClick={() => setLayoutMode("force")}
              title="Force Network Layout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "11.5px",
                fontWeight: layoutMode === "force" ? 600 : 500,
                background: layoutMode === "force" ? "var(--bg-surface)" : "transparent",
                color: layoutMode === "force" ? "var(--accent)" : "var(--text-secondary)",
                boxShadow: layoutMode === "force" ? "var(--shadow-xs)" : "none",
              }}
            >
              <Network size={13} />
              <span>Network</span>
            </button>

            <button
              onClick={() => setLayoutMode("columns")}
              title="Structured Columns Layout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "11.5px",
                fontWeight: layoutMode === "columns" ? 600 : 500,
                background: layoutMode === "columns" ? "var(--bg-surface)" : "transparent",
                color: layoutMode === "columns" ? "var(--accent)" : "var(--text-secondary)",
                boxShadow: layoutMode === "columns" ? "var(--shadow-xs)" : "none",
              }}
            >
              <Layers size={13} />
              <span>Pipeline</span>
            </button>

            <button
              onClick={() => setLayoutMode("radial")}
              title="Radial Orbit Layout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "11.5px",
                fontWeight: layoutMode === "radial" ? 600 : 500,
                background: layoutMode === "radial" ? "var(--bg-surface)" : "transparent",
                color: layoutMode === "radial" ? "var(--accent)" : "var(--text-secondary)",
                boxShadow: layoutMode === "radial" ? "var(--shadow-xs)" : "none",
              }}
            >
              <Orbit size={13} />
              <span>Radial</span>
            </button>
          </div>

          {/* Quick Node Search */}
          <div className="clean-search-input" style={{ width: "170px", padding: "4px 8px" }}>
            <Search size={13} color="#7D8884" />
            <input
              type="text"
              className="search-field-native"
              placeholder="Find in graph..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  handleSearchSelect(searchQuery);
                }
              }}
            />
          </div>

          {/* Spacing / Spread Toggle */}
          <button
            className="icon-btn-clean"
            onClick={() =>
              setSpacingMultiplier((prev) => (prev >= 1.8 ? 1.0 : prev + 0.4))
            }
            title={`Adjust Graph Spacing (Currently ${spacingMultiplier.toFixed(1)}x)`}
          >
            <Sliders size={13} />
          </button>

          {/* Physics Play/Pause */}
          <button
            className="icon-btn-clean"
            onClick={() => setIsPhysicsRunning((r) => !r)}
            title={isPhysicsRunning ? "Pause Physics Simulation" : "Resume Physics"}
          >
            {isPhysicsRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Zoom Buttons */}
          <button
            className="icon-btn-clean"
            onClick={() => handleZoom(0.14)}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            className="icon-btn-clean"
            onClick={() => handleZoom(-0.14)}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            className="icon-btn-clean"
            onClick={handleFitView}
            title="Fit Graph to View"
          >
            <Maximize2 size={13} />
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
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(12px)",
              borderLeft: "1px solid var(--border-medium)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
              zIndex: 20,
              animation: "slide-in 0.2s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "var(--radius-full)",
                  background: TYPE_CONFIG[selectedNode.type].bg,
                  color: TYPE_CONFIG[selectedNode.type].color,
                  border: `1px solid ${TYPE_CONFIG[selectedNode.type].border}`,
                  letterSpacing: "0.4px",
                }}
              >
                {TYPE_CONFIG[selectedNode.type].icon} {selectedNode.type}
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
                  boxShadow: "0 1px 3px rgba(30, 94, 78, 0.3)",
                }}
              >
                <ExternalLink size={13} />
                <span>Open Full Profile</span>
              </button>
            )}

            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                Connected Nodes ({selectedNodeConnections.length})
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedNodeConnections.length === 0 ? (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    No direct connections
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
                        <span style={{ color: TYPE_CONFIG[node.type].color, fontWeight: 700 }}>
                          {node.type}
                        </span>
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

      {/* Modern Legend Bar */}
      <div className="graph-legend-strip">
        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Entity Types:</span>
        {(Object.keys(TYPE_CONFIG) as NodeType[]).map((t) => (
          <div key={t} className="legend-chip">
            <span
              className="legend-dot"
              style={{ background: TYPE_CONFIG[t].color }}
            />
            <span style={{ fontWeight: 500 }}>{t}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", fontSize: "11px" }}>
          <span>💡 Click & drag nodes to reorganize</span>
          <span>•</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            {rawNodes.length} Nodes · {rawLinks.length} Links
          </span>
        </div>
      </div>
    </div>
  );
};
