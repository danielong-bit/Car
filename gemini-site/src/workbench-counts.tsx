import * as React from "react";
import { CountUpNumber } from "./components/react-bits/count-up";

export type OwnerCounts = { available: number; booked: number; sold: number; drafts: number };
const labels: Array<[keyof OwnerCounts, string]> = [["available", "Available"], ["booked", "Booked"], ["sold", "Sold"], ["drafts", "Drafts"]];

export function WorkbenchCounts({ counts }: { counts: OwnerCounts }) {
  return <div className="owner-count-grid" aria-label="Current vehicle counts">
    {labels.map(([key, label]) => <div className="owner-count-card" key={key}>
      <span>{label}</span><strong><CountUpNumber value={counts[key]} durationMs={280} /></strong>
    </div>)}
  </div>;
}
