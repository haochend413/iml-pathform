import React from "react";

interface EdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  onHover: (isHovered: boolean) => void;
  isHighlighted: boolean;
}

const Edge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  onHover,
  isHighlighted,
}) => {
  return (
    <line
      x1={sourceX}
      y1={sourceY}
      x2={targetX}
      y2={targetY}
      stroke={isHighlighted ? "red" : "#333"}
      strokeWidth={2}
      strokeLinecap="round"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{ transition: "stroke 0.3s", cursor: "pointer" }}
    />
  );
};

export default Edge;
