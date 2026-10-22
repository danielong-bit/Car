import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import { WorkbenchCounts, type OwnerCounts } from "./workbench-counts";

type ConfirmOptions = { title: string; description: string; confirmLabel?: string; destructive?: boolean };
type PendingConfirm = ConfirmOptions & { settle: (confirmed: boolean) => void };
declare global {
  interface Window {
    dannyConfirmAction?: (options: ConfirmOptions) => Promise<boolean>;
    dannyOwnerCounts?: OwnerCounts;
  }
}

function WorkbenchUI() {
  const [pending, setPending] = React.useState<PendingConfirm | null>(null);
  const resolver = React.useRef<((confirmed: boolean) => void) | null>(null);

  React.useEffect(() => {
    window.dannyConfirmAction = (options) => new Promise((resolve) => {
      resolver.current = resolve;
      setPending({ ...options, settle: resolve });
    });
    return () => {
      if (resolver.current) resolver.current(false);
      window.dannyConfirmAction = undefined;
    };
  }, []);

  const close = (confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setPending(null);
  };

  return <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) close(false); }}>
    {pending && <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{pending.title}</AlertDialogTitle>
        <AlertDialogDescription>{pending.description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
        <AlertDialogAction className={pending.destructive ? "is-destructive" : undefined} onClick={(event) => { event.preventDefault(); close(true); }}>{pending.confirmLabel || "Continue"}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>}
  </AlertDialog>;
}

const uiMount = document.getElementById("workbenchUiMount");
if (uiMount) createRoot(uiMount).render(<WorkbenchUI />);

let countRoot: Root | null = null;
let countMount: HTMLElement | null = null;
function mountCounts() {
  const next = document.getElementById("ownerCountMount");
  if (next !== countMount) {
    countRoot?.unmount();
    countRoot = null;
    countMount = next;
    if (countMount) countRoot = createRoot(countMount);
  }
  if (countRoot) countRoot.render(<WorkbenchCounts counts={window.dannyOwnerCounts ?? { available: 0, booked: 0, sold: 0, drafts: 0 }} />);
}
const workspace = document.getElementById("workspaceContent");
if (workspace) new MutationObserver(mountCounts).observe(workspace, { childList: true, subtree: true });
mountCounts();
