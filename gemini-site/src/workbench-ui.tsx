import ClickSpark from "./components/react-bits/ClickSpark";
import {DashboardWelcome} from './dashboard-welcome';
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import FuseButton from "./components/react-bits/FuseButton";
import SwipeRow from "./components/react-bits/SwipeRow";
import SwipeToast from "./components/react-bits/SwipeToast";
import { WorkbenchCounts, type OwnerCounts } from "./workbench-counts";

type ConfirmOptions = { title: string; description: string; confirmLabel?: string; destructive?: boolean };
type PendingConfirm = ConfirmOptions & { settle: (confirmed: boolean) => void };
type ToastOptions = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "error";
  duration?: number;
};
type QueuedToast = ToastOptions & { id: number };

declare global {
  interface Window {
    dannyConfirmAction?: (options: ConfirmOptions) => Promise<boolean>;
    dannyOwnerCounts?: OwnerCounts;
    dannyWorkbenchShowToast?: (options: ToastOptions) => void;
  }
}

function SwipeableVehicle({ host, row, mount }: { host: HTMLElement; row: HTMLElement; mount: HTMLElement }) {
  const slot = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(64);

  React.useLayoutEffect(() => {
    const target = slot.current;
    if (!target) return;
    target.appendChild(row);
    const measure = () => {
      const next = Math.ceil(Math.max(row.getBoundingClientRect().height, row.scrollHeight));
      if (next > 0) setHeight((current) => current === next ? current : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    const frame = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (host.isConnected) host.insertBefore(row, mount);
    };
  }, [host, row, mount]);

  const vehicleId = row.dataset.id || "";
  const dispatchAction = (action: "edit" | "photos") => {
    document.dispatchEvent(new CustomEvent("danny:workbench-row-action", { detail: { id: vehicleId, action } }));
  };

  return <SwipeRow
    label={`Actions for vehicle ${row.querySelector(".wb-vehicle code")?.textContent || ""}`}
    actions={[
      { id: "photos", label: "Photos", color: "#245bc7" },
      { id: "edit", label: "Edit", color: "#17365d" },
    ]}
    fullSwipe={false}
    height={height}
    radius={10}
    actionWidth={78}
    drawerColor="#17365d"
    actionColor="#245bc7"
    rowColor="var(--surface)"
    textColor="var(--ink)"
    onAction={(action: { id: string }) => dispatchAction(action.id === "photos" ? "photos" : "edit")}
    className="wb-stock-swipe"
  >
    <div className="wb-swipe-slot" ref={slot} />
  </SwipeRow>;
}

function ToastStack() {
  const [toasts, setToasts] = React.useState<QueuedToast[]>([]);
  const nextId = React.useRef(0);

  React.useEffect(() => {
    window.dannyWorkbenchShowToast = (options) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { ...options, id }].slice(-3));
    };
    return () => { window.dannyWorkbenchShowToast = undefined; };
  }, []);

  const remove = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));
  return <div className="wb-toast-stack" role="region" aria-label="Workbench notifications" aria-live="polite">
    {toasts.map((toast) => <div className={`wb-toast-item${toast.variant === "error" ? " wb-toast-error" : ""}`} key={toast.id}>
      <SwipeToast
        title={toast.title}
        description={toast.description}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        onClose={() => remove(toast.id)}
        duration={toast.duration ?? 6000}
        inline
        background="var(--wb-toast-bg)"
        color="var(--wb-toast-ink)"
        fuseColor="var(--blue)"
        className="wb-workbench-toast"
      />
    </div>)}
  </div>;
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

  React.useEffect(() => {
    const workspace = document.getElementById("workspaceContent");
    if (!workspace) return;
    const swipeRoots = new Map<HTMLElement, { root: Root; mount: HTMLElement }>();
    const fuseRoots = new Map<HTMLElement, Root>();
    const swipeMedia = window.matchMedia("(max-width: 767px)");

    const refresh = () => {
      for (const [host, item] of swipeRoots) {
        if (!host.isConnected || !swipeMedia.matches) {
          item.root.unmount();
          item.mount.remove();
          swipeRoots.delete(host);
        }
      }
      for (const [mount, root] of fuseRoots) {
        if (!mount.isConnected) {
          root.unmount();
          fuseRoots.delete(mount);
        }
      }
      workspace.querySelectorAll<HTMLElement>("[data-archive-mount]").forEach((mount) => {
        if (fuseRoots.has(mount)) return;
        const root = createRoot(mount);
        fuseRoots.set(mount, root);
        root.render(<FuseButton
          label="Archive"
          undoLabel="Undo"
          doneLabel="Archived"
          undoWindow={4000}
          commitOn="fuseEnd"
          settle="stay"
          pauseOnHover
          size="sm"
          radius={7}
          color="var(--ink)"
          background="var(--surface-2)"
          fuseColor="var(--blue)"
          className="wb-archive-fuse"
          onCommit={() => document.dispatchEvent(new CustomEvent("danny:workbench-archive-request", { detail: { id: mount.dataset.archiveMount } }))}
        />);
      });

      if (!swipeMedia.matches) return;
      workspace.querySelectorAll<HTMLElement>("[data-swipe-host]").forEach((host) => {
        if (swipeRoots.has(host)) return;
        const row = host.querySelector<HTMLElement>(":scope > .wb-row");
        if (!row) return;
        const mount = document.createElement("div");
        mount.className = "wb-swipe-mount";
        host.insertBefore(mount, row);
        const root = createRoot(mount);
        swipeRoots.set(host, { root, mount });
        root.render(<SwipeableVehicle host={host} row={row} mount={mount} />);
      });
    };

    const observer = new MutationObserver(refresh);
    observer.observe(workspace, { childList: true, subtree: true });
    swipeMedia.addEventListener("change", refresh);
    refresh();
    return () => {
      observer.disconnect();
      swipeMedia.removeEventListener("change", refresh);
      swipeRoots.forEach(({ root }) => root.unmount());
      fuseRoots.forEach((root) => root.unmount());
      swipeRoots.clear();
      fuseRoots.clear();
    };
  }, []);

  const close = (confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setPending(null);
  };

  return <>
    <ClickSpark sparkColor={["#245bc7","#81aaff"]} sparkCount={7} sparkSize={9} sparkRadius={24} duration={420} style={{position:"fixed",inset:0,zIndex:10000,pointerEvents:"none"}}>{null}</ClickSpark>
    <DashboardWelcome/>
    <ToastStack />
    <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) close(false); }}>
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
    </AlertDialog>
  </>;
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
if (workspace) new MutationObserver(mountCounts).observe(workspace, { childList: true });
mountCounts();
