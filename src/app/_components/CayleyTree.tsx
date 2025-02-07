"use client";
import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import Vertex from "./Vertex";
import Edge from "./Edge";
import styles from "./components.module.css";

interface TreeNode {
  id: string;
  children: TreeNode[];
}

// Recursive function to generate tree data.
const generateTree = (depth: number, parentId = "root"): TreeNode => {
  if (depth === 0) return { id: parentId, children: [] };

  return {
    id: parentId,
    children: Array.from({ length: 4 }, (_, i) =>
      generateTree(depth - 1, `${parentId}-${i}`)
    ),
  };
};

const treeData: TreeNode = generateTree(3);

// Interfaces for node and link positions.
interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface LinkPosition {
  id: string;
  source: NodePosition;
  target: NodePosition;
}

const CayleyTree: React.FC = () => {
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [links, setLinks] = useState<LinkPosition[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [shinedNode, setShinedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    // Set dimensions for the radial layout.
    const width = 928;
    const height = 928;

    // centers
    const cx = width * 0.5;
    const cy = height * 0.54;
    const radius = Math.min(width, height) / 2 - 80;

    // Create a radial cluster layout.
    const cluster = d3
      .cluster<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // Build the hierarchy and apply the cluster layout.
    const root = cluster(d3.hierarchy(treeData));

    // Helper function to convert polar coordinates (angle in radians and radius)
    // to Cartesian coordinates. Subtracting Math.PI/2 rotates the layout so that
    // 0 radians is at the top.
    function radialPoint(angle: number, r: number): [number, number] {
      return [
        r * Math.cos(angle - Math.PI / 2),
        r * Math.sin(angle - Math.PI / 2),
      ];
    }

    // Compute node positions in Cartesian coordinates.
    const nodesData = root.descendants();
    const computedNodes: NodePosition[] = nodesData.map((d) => {
      const [x, y] = radialPoint(d.x, d.y);
      return {
        id: d.data.id,
        x: x + cx,
        y: y + cy,
      };
    });

    // Compute link positions as straight lines.
    const linksData = root.links();
    const computedLinks: LinkPosition[] = linksData.map((link) => {
      const [sx, sy] = radialPoint(link.source.x, link.source.y);
      const [tx, ty] = radialPoint(link.target.x, link.target.y);
      return {
        id: `${link.source.data.id}->${link.target.data.id}`,
        source: { id: link.source.data.id, x: sx + cx, y: sy + cy },
        target: { id: link.target.data.id, x: tx + cx, y: ty + cy },
      };
    });

    // Update state.
    setNodes(computedNodes);
    setLinks(computedLinks);

    // Setup zoom and pan.
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const g = d3.select<SVGGElement, unknown>(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(
      zoom as unknown as (
        selection: d3.Selection<SVGSVGElement, unknown, null, undefined>
      ) => void
    );
  }, [treeData]);

  // Edge/vertex hover & click effects.
  const handleHover = (id: string, isHovered: boolean) => {
    setHighlightedNode(isHovered ? id : null);
  };

  const handleClick = (id: string) => {
    setShinedNode(id === shinedNode ? null : id);
  };

  return (
    <div className={styles.cayleyContainer}>
      <svg ref={svgRef} width="100vw" height="100vh" className={styles.cayley}>
        <g ref={gRef}>
          {links.map((link) => (
            <Edge
              key={link.id}
              sourceX={link.source.x}
              sourceY={link.source.y}
              targetX={link.target.x}
              targetY={link.target.y}
              onHover={(hovered) => handleHover(link.id, hovered)}
              isHighlighted={highlightedNode === link.id}
            />
          ))}
          {nodes.map((node) => (
            <Vertex
              key={node.id}
              id={node.id}
              x={node.x}
              y={node.y}
              onClick={handleClick}
              onHover={handleHover}
              isHighlighted={highlightedNode === node.id}
              isShined={shinedNode === node.id}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CayleyTree;
