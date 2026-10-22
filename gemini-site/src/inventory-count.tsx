import * as React from "react";
import { createRoot } from "react-dom/client";
import { CountUpNumber } from "./components/react-bits/count-up";

type InventoryCounts = { available: number; sold: number };
declare global { interface Window { dannyInventoryCounts?: InventoryCounts } }

function labels() {
  const language = document.documentElement.lang;
  if (language === "zh-Hans" || language === "zh") return { available: "可售", sold: "已售" };
  if (language === "ms") return { available: "Tersedia", sold: "Terjual" };
  return { available: "Available", sold: "Sold" };
}

function InventoryCount() {
  const [counts, setCounts] = React.useState<InventoryCounts>(() => window.dannyInventoryCounts ?? { available: 0, sold: 0 });
  const [, setLanguageVersion] = React.useState(0);
  React.useEffect(() => {
    const update = (event: Event) => {
      const next = (event as CustomEvent<InventoryCounts>).detail;
      if (next && Number.isFinite(next.available) && Number.isFinite(next.sold)) setCounts(next);
    };
    window.addEventListener("danny:inventory-counts", update);
    const languageChanged = () => setLanguageVersion((current) => current + 1);
    document.addEventListener("danny:language-change", languageChanged);
    return () => {
      window.removeEventListener("danny:inventory-counts", update);
      document.removeEventListener("danny:language-change", languageChanged);
    };
  }, []);
  const text = labels();
  return <div className="inventory-count-summary">
    <div><CountUpNumber value={counts.available} className="inventory-count-value" /><span>{text.available}</span></div>
    <div><CountUpNumber value={counts.sold} className="inventory-count-value" /><span>{text.sold}</span></div>
  </div>;
}

const mount = document.getElementById("inventoryCountMount");
if (mount) createRoot(mount).render(<InventoryCount />);
