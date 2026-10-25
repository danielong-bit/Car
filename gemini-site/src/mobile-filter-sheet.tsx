import * as React from "react";
import { createRoot } from "react-dom/client";
import { Check, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

type DraftFilters = {
  search: string;
  make: string;
  status: string;
  sort: string;
  featured: boolean;
};

type FilterConfig = {
  filters: DraftFilters;
  statuses: Array<{ value: string; label: string }>;
  makes: string[];
  sorts: Array<{ value: string; label: string }>;
  labels: {
    filters: string;
    status: string;
    brand: string;
    sortBy: string;
    featured: string;
    reset: string;
    showResults: string;
    close: string;
    description: string;
  };
};

declare global {
  interface Window {
    getInventoryFilterSheetConfig?: () => FilterConfig;
  }
}

const defaults: DraftFilters = { search: "", make: "", status: "", sort: "price-up", featured: false };
const fallback: FilterConfig = {
  filters: defaults,
  statuses: [],
  makes: [],
  sorts: [],
  labels: {
    filters: "Filters",
    status: "Status",
    brand: "Brand",
    sortBy: "Sort by",
    featured: "Featured only",
    reset: "Reset",
    showResults: "Show results",
    close: "Close filters",
    description: "Choose what you want to see.",
  },
};

function readConfig(): FilterConfig {
  return window.getInventoryFilterSheetConfig?.() ?? fallback;
}

function activeFilterCount(filters: DraftFilters) {
  return [filters.status, filters.make, filters.sort !== "price-up", filters.featured].filter(Boolean).length;
}

function MobileFilterSheet() {
  const [config, setConfig] = React.useState<FilterConfig>(readConfig);
  const [draft, setDraft] = React.useState<DraftFilters>(() => ({ ...config.filters }));
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const updateConfig = (event: Event) => {
      const next = (event as CustomEvent<FilterConfig>).detail;
      if (next) setConfig(next);
    };
    window.addEventListener("danny:inventory-filter-config", updateConfig);
    return () => window.removeEventListener("danny:inventory-filter-config", updateConfig);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const latest = readConfig();
      setConfig(latest);
      setDraft({ ...latest.filters });
    }
    setOpen(nextOpen);
  };

  const applyFilters = () => {
    window.dispatchEvent(new CustomEvent("danny:inventory-filter-apply", { detail: draft }));
    setOpen(false);
  };

  const activeCount = activeFilterCount(config.filters);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button type="button" className="mobile-filter-sheet-trigger" aria-label={`${config.labels.filters}${activeCount ? `, ${activeCount}` : ""}`}>
          <SlidersHorizontal aria-hidden="true" />
          <span>{config.labels.filters}</span>
          {activeCount > 0 && <span className="mobile-filter-active-count" aria-hidden="true">{activeCount}</span>}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" showCloseButton={false} className="mobile-filter-sheet-panel">
        <SheetHeader>
          <span className="mobile-filter-sheet-handle" aria-hidden="true" />
          <div className="mobile-filter-sheet-heading">
            <SheetTitle>{config.labels.filters}</SheetTitle>
            <SheetClose asChild>
              <button type="button" className="mobile-filter-sheet-close" aria-label={config.labels.close}>
                <X aria-hidden="true" />
              </button>
            </SheetClose>
          </div>
          <SheetDescription className="mobile-filter-sheet-description">{config.labels.description}</SheetDescription>
        </SheetHeader>

        <div className="mobile-filter-sheet-body">
          <section className="mobile-filter-group" aria-labelledby="mobileFilterStatusLabel">
            <h3 id="mobileFilterStatusLabel">{config.labels.status}</h3>
            <div className="mobile-filter-status-options">
              {config.statuses.map((option) => (
                <button
                  type="button"
                  key={option.value || "all"}
                  className={`mobile-filter-option${draft.status === option.value ? " is-selected" : ""}`}
                  aria-pressed={draft.status === option.value}
                  onClick={() => setDraft((current) => ({ ...current, status: option.value }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {config.makes.length > 0 && (
            <section className="mobile-filter-group" aria-labelledby="mobileFilterBrandLabel">
              <h3 id="mobileFilterBrandLabel">{config.labels.brand}</h3>
              <div className="mobile-filter-brand-options">
                {config.makes.map((make) => (
                  <button
                    type="button"
                    key={make}
                    className={`mobile-filter-option${draft.make === make ? " is-selected" : ""}`}
                    aria-pressed={draft.make === make}
                    onClick={() => setDraft((current) => ({ ...current, make: current.make === make ? "" : make }))}
                  >
                    {make}
                    {draft.make === make && <Check aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mobile-filter-group" aria-labelledby="mobileFilterSortLabel">
            <h3 id="mobileFilterSortLabel">{config.labels.sortBy}</h3>
            <select id="mobileFilterSort" aria-labelledby="mobileFilterSortLabel" value={draft.sort} onChange={(event) => setDraft((current) => ({ ...current, sort: event.target.value }))}>
              {config.sorts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </section>
        </div>

        <SheetFooter>
          <button type="button" className="mobile-filter-reset" onClick={() => setDraft({ ...defaults })}>{config.labels.reset}</button>
          <button type="button" className="mobile-filter-apply" onClick={applyFilters}>{config.labels.showResults}</button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const mount = document.getElementById("mobileFilterSheetMount");
if (mount) createRoot(mount).render(<MobileFilterSheet />);
