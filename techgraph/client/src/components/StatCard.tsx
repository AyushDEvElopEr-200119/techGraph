import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  secondaryText?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  secondaryText,
  onClick,
}) => {
  return (
    <div
      className="stat-box"
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div className="stat-box-header">
        <span className="stat-box-label">{label}</span>
        <div className="stat-icon-pill">
          <Icon size={14} />
        </div>
      </div>

      <div className="stat-box-value">{value}</div>

      {secondaryText && (
        <div className="stat-box-footer">
          <span>{secondaryText}</span>
        </div>
      )}
    </div>
  );
};
