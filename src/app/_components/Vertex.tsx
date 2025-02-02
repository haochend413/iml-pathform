import React from "react";

interface VertexProps {
  x: number;
  y: number;
  id: string;
  onClick: (id: string) => void;
  onHover: (id: string, isHovered: boolean) => void;
  isHighlighted: boolean;
  isShined: boolean;
}

const Vertex: React.FC<VertexProps> = ({
  x,
  y,
  id,
  onClick,
  onHover,
  isHighlighted,
  isShined,
}) => {
  return (
    <circle
      cx={x}
      cy={y}
      r={15}
      fill={isShined ? "gold" : isHighlighted ? "#007acc" : "#ddd"}
      onMouseEnter={() => onHover(id, true)}
      onMouseLeave={() => onHover(id, false)}
      onClick={() => onClick(id)}
      style={{ cursor: "pointer", transition: "fill 0.3s" }}
    />
  );
};

export default Vertex;
