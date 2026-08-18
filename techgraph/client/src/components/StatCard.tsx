import React from "react";

interface StatCardProps {
  label: string;
  value: number;
  secondaryText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  secondaryText,
  onClick,
}) => {
  return (
    <div
      className="stat-box"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="stat-box-label">{label}</div>
      <div className="stat-box-value">{value}</div>
      {secondaryText && <div className="stat-box-footer">{secondaryText}</div>}
    </div>
  );
};
