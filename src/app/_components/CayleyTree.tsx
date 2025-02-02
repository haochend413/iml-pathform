"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import Vertex from "./Vertex";
import Edge from "./Edge";

export interface TreeNode {
  id: string;
  children: TreeNode[];
}

// Generates a quadratic Cayley tree: each node gets 4 children until depth reaches 0.
export const generateTree = (depth: number, parentId = "root"): TreeNode => {
  if (depth === 0) return { id: parentId, children: [] };

  return {
    id: parentId,
    children: Array.from({ length: 4 }, (_, i) =>
      generateTree(depth - 1, `${parentId}-${i}`)
    ),
  };
};

const treeData: TreeNode = generateTree(3);

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
  // Arrays of nodes and links with positions computed via D3
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [links, setLinks] = useState<LinkPosition[]>([]);

  // Interaction state for vertices and edges.
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [shinedNode, setShinedNode] = useState<string | null>(null);
  const [highlightedEdge, setHighlightedEdge] = useState<string | null>(null);

  useEffect(() => {
    const width = 800;
    const height = 600;

    // Create a D3 hierarchy from our tree data.
    const root = d3.hierarchy<TreeNode>(treeData);
    // Use d3.tree to compute layout; we set the size to the SVG dimensions.
    const treeLayout = d3.tree<TreeNode>().size([width, height]);
    treeLayout(root);

    // Use non-null assertion operator (!) to tell TypeScript that root.x and root.y are defined.
    const offsetX = width / 2 - root.x!;
    const offsetY = height / 2 - root.y!;

    // Map each d3 node to our NodePosition type.
    const computedNodes: NodePosition[] = root.descendants().map((d) => ({
      id: d.data.id,
      x: d.x! + offsetX,
      y: d.y! + offsetY,
    }));

    // Map each link from parent to child.
    const computedLinks: LinkPosition[] = root.links().map((link) => ({
      id: `${link.source.data.id}->${link.target.data.id}`,
      source: {
        id: link.source.data.id,
        x: link.source.x! + offsetX,
        y: link.source.y! + offsetY,
      },
      target: {
        id: link.target.data.id,
        x: link.target.x! + offsetX,
        y: link.target.y! + offsetY,
      },
    }));

    setNodes(computedNodes);
    setLinks(computedLinks);
  }, []);

  // Callback when a vertex is hovered.
  const handleVertexHover = (id: string, isHovered: boolean) => {
    setHighlightedNode(isHovered ? id : null);
  };

  // Callback when a vertex is clicked.
  const handleVertexClick = (id: string) => {
    setShinedNode(id);
  };

  // Callback when an edge is hovered.
  const handleEdgeHover = (id: string, isHovered: boolean) => {
    setHighlightedEdge(isHovered ? id : null);
  };

  return (
    <svg width="100vw" height="500vh" style={{ border: "1px solid #ccc" }}>
      {/* Render edges first so they appear beneath vertices */}
      {links.map((link) => (
        <Edge
          key={link.id}
          sourceX={link.source.x}
          sourceY={link.source.y}
          targetX={link.target.x}
          targetY={link.target.y}
          onHover={(isHovered: boolean) => handleEdgeHover(link.id, isHovered)}
          isHighlighted={highlightedEdge === link.id}
        />
      ))}
      {/* Render vertices */}
      {nodes.map((node) => (
        <Vertex
          key={node.id}
          id={node.id}
          x={node.x}
          y={node.y}
          onClick={handleVertexClick}
          onHover={handleVertexHover}
          isHighlighted={highlightedNode === node.id}
          isShined={shinedNode === node.id}
        />
      ))}
    </svg>
  );
};

export default CayleyTree;
