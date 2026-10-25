import * as React from "react";
import { CountUpNumber } from "./components/react-bits/count-up";
import BorderGlow from "./components/react-bits/BorderGlow";

export type OwnerCounts = { available: number; booked: number; sold: number; drafts: number };

const META: Array<{
  key: keyof OwnerCounts;
  statusFilter: string;
  label: string;
  sublabel: string;
  accent: string;
  colors: string[];
}> = [
  {
    key: "available",
    statusFilter: "available",
    label: "Available",
    sublabel: "Ready for viewing",
    accent: "var(--mint, #176b4a)",
    colors: ["#176b4a", "#36b37e", "#c8a97e"],
  },
  {
    key: "booked",
    statusFilter: "reserved",
    label: "Booked",
    sublabel: "Deposit received",
    accent: "var(--price-accent, #8a683b)",
    colors: ["#8a683b", "#c8a97e", "#f59e0b"],
  },
  {
    key: "sold",
    statusFilter: "sold",
    label: "Sold",
    sublabel: "Delivered / closed",
    accent: "#b42d45",
    colors: ["#b42d45", "#e11d48", "#c8a97e"],
  },
  {
    key: "drafts",
    statusFilter: "draft",
    label: "Drafts",
    sublabel: "Private preparation",
    accent: "var(--muted, #64748b)",
    colors: ["#64748b", "#94a3b8", "#c8a97e"],
  },
];

export function WorkbenchCounts({ counts }: { counts: OwnerCounts }) {
  const total = Math.max(1, (counts.available || 0) + (counts.booked || 0) + (counts.sold || 0) + (counts.drafts || 0));

  const handleCardClick = (statusFilter: string) => {
    document.dispatchEvent(new CustomEvent("danny:workbench-filter-status", { detail: { status: statusFilter } }));
  };

  return (
    <div className="owner-count-grid" aria-label="Current vehicle counts">
      {META.map(({ key, statusFilter, label, sublabel, accent, colors }) => {
        const val = counts[key] || 0;
        const pct = Math.round((val / total) * 100);
        return (
          <BorderGlow
            key={key}
            backgroundColor="var(--surface)"
            borderRadius={14}
            glowRadius={20}
            glowIntensity={0.45}
            colors={colors}
            className="owner-count-glow-wrap"
          >
            <button
              type="button"
              className={`owner-count-card is-${key}`}
              data-status-jump={statusFilter}
              onClick={() => handleCardClick(statusFilter)}
              title={`Filter vehicles by ${label}`}
            >
              <div className="owner-count-card-top">
                <span className="owner-count-label">
                  <i className="owner-count-dot" style={{ background: accent }} aria-hidden="true" />
                  {label}
                </span>
                <em className="owner-count-pct">{pct}%</em>
              </div>
              <strong>
                <CountUpNumber value={val} durationMs={320} />
              </strong>
              <div className="owner-count-card-foot">
                <small>{sublabel}</small>
                <div className="owner-count-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(val > 0 ? 8 : 0, pct)}%`, background: accent }} />
                </div>
              </div>
            </button>
          </BorderGlow>
        );
      })}
    </div>
  );
}
