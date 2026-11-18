/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Gauge,
  Loader2,
  MapPin,
  MessageCircle,
  Moon,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

export interface VehicleMedia {
  id?: string;
  url: string;
  category?: string;
  visible?: boolean;
  cropX?: number;
  cropY?: number;
  cropZoom?: number;
}

export interface VehicleItem {
  id: string;
  stockId: string;
  brand?: string;
  make: string;
  model: string;
  variant?: string;
  body?: string;
  year?: number | null;
  manufactureYear?: number | null;
  priceRm?: number | null;
  price?: number | null;
  mileageKm?: number | null;
  mileage?: string;
  engine?: string;
  engineCc?: number | null;
  transmission?: string;
  fuelType?: string;
  exteriorColor?: string;
  color?: string;
  interiorColor?: string;
  status: 'available' | 'reserved' | 'sold' | 'draft' | 'archived' | string;
  location?: string;
  auctionGrade?: string;
  interiorGrade?: string;
  conditionNotes?: string;
  description?: string;
  warrantyInfo?: string;
  coverImageUrl?: string;
  gallery?: VehicleMedia[];
  galleryUrls?: string[];
  specialBadges?: string[];
  features?: string[];
  specs?: Record<string, [string, string][]>;
  featured?: boolean;
  lowKm?: boolean;
}

export interface ShowroomStory {
  id: string;
  title: string;
  caption?: string;
  image?: string;
  date?: string;
  published?: boolean;
}

export interface TintPackage {
  id: string;
  brand: string;
  name: string;
  warranty?: string;
  prices?: Record<string, number>;
  published?: boolean;
}

export interface ShowroomDocument {
  vehicles: VehicleItem[];
  homepage?: {
    title?: string;
    heroImage?: string;
    heroTitles?: Record<string, string>;
    showSoldVehicles?: boolean;
    hideAvailableBadge?: boolean;
    autoLowKmBadge?: boolean;
    brandFilterMode?: string;
    brandFilters?: string[];
  };
  finance?: {
    rate?: number;
    tenure?: number;
    downPayment?: number;
  };
  profile?: {
    name?: string;
    phone?: string;
    email?: string;
    location?: string;
    locations?: string[];
    intro?: string;
    facebook?: string;
    facebookPixelId?: string;
    facebookPageId?: string;
  };
  stories?: ShowroomStory[];
  tintPackages?: TintPackage[];
}

export interface LoadingContextValue {
  isLoading: boolean;
  isRefreshing: boolean;
  loadingLabel: string;
  error: string | null;
  setLoadingState: (next: Partial<Pick<LoadingContextValue, 'isLoading' | 'isRefreshing' | 'loadingLabel' | 'error'>>) => void;
  withLoading: <T>(label: string, task: () => Promise<T>, mode?: 'initial' | 'refresh') => Promise<T>;
}

export const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within a LoadingProvider.');
  }
  return ctx;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isLoading: boolean;
    isRefreshing: boolean;
    loadingLabel: string;
    error: string | null;
  }>({
    isLoading: true,
    isRefreshing: false,
    loadingLabel: 'Loading verified showroom inventory…',
    error: null,
  });

  const setLoadingState = useCallback(
    (next: Partial<Pick<LoadingContextValue, 'isLoading' | 'isRefreshing' | 'loadingLabel' | 'error'>>) => {
      setState((prev) => ({ ...prev, ...next }));
    },
    []
  );

  const withLoading = useCallback(
    async <T,>(label: string, task: () => Promise<T>, mode: 'initial' | 'refresh' = 'refresh'): Promise<T> => {
      setState((prev) => ({
        ...prev,
        isLoading: mode === 'initial' ? true : prev.isLoading,
        isRefreshing: mode === 'refresh' ? true : prev.isRefreshing,
        loadingLabel: label,
        error: null,
      }));
      try {
        return await task();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to sync live inventory.';
        setState((prev) => ({ ...prev, error: message }));
        throw err;
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: mode === 'initial' ? false : prev.isLoading,
          isRefreshing: mode === 'refresh' ? false : prev.isRefreshing,
        }));
      }
    },
    []
  );

  const value = useMemo<LoadingContextValue>(
    () => ({
      ...state,
      setLoadingState,
      withLoading,
    }),
    [state, setLoadingState, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {state.isRefreshing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2.5 border-b border-emerald-500/30 bg-slate-950/90 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-md"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" aria-hidden="true" />
          <span>{state.loadingLabel}</span>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

function formatRm(value?: number | null): string {
  if (value == null || !Number.isFinite(Number(value))) return 'Enquire';
  return `RM ${Number(value).toLocaleString('en-MY')}`;
}

function estimateMonthly(price?: number | null, downPct = 10, years = 7, annualRate = 3.2): number | null {
  if (price == null || !Number.isFinite(Number(price)) || Number(price) <= 0) return null;
  const principal = Number(price) * (1 - downPct / 100);
  const months = Math.max(12, years * 12);
  const totalInterest = principal * (annualRate / 100) * years;
  return Math.round((principal + totalInterest) / months);
}

function clampSeoText(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trimEnd()}…`;
}

function statusMeta(status: string): { label: string; className: string } {
  if (status === 'reserved') {
    return {
      label: 'Booked',
      className: 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300',
    };
  }
  if (status === 'sold') {
    return {
      label: 'Sold',
      className: 'border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-300',
    };
  }
  return {
    label: 'Available',
    className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  };
}

function ShowroomSkeleton({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" aria-busy="true" aria-label={label}>
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-800" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>{label}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <div className="h-4 w-36 animate-pulse rounded bg-amber-500/20" />
          <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-slate-800" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-800/80" />
        </section>
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
              <div className="aspect-[4/3] w-full animate-pulse bg-slate-800" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-slate-800" />
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-800/80" />
                <div className="h-7 w-2/5 animate-pulse rounded bg-emerald-950/80" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function ShowroomContent() {
  const { isLoading, isRefreshing, error, withLoading, setLoadingState } = useLoading();
  const [doc, setDoc] = useState<ShowroomDocument | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.dataset.theme !== 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [calcDepositPct, setCalcDepositPct] = useState(10);
  const [calcYears, setCalcYears] = useState(7);
  const [adLandingSource, setAdLandingSource] = useState<{ source: string; campaign: string } | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const trackVisit = useCallback(async (vehicleId?: string) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || (params.has('fbclid') ? 'facebook' : '');
      const utmCampaign = params.get('utm_campaign') || '';
      const payload: Record<string, string> = {
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `sess-${Date.now()}`,
      };
      if (utmSource) payload.s = utmSource.slice(0, 24);
      if (utmCampaign) payload.c = utmCampaign.slice(0, 32);
      if (vehicleId) payload.v = vehicleId.slice(0, 48);
      await fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // Analytics never block browsing
    }
  }, []);

  const trackConversionEvent = useCallback(async (eventName: 'whatsapp_lead' | 'fb_share', vehicleId?: string) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source') || (params.has('fbclid') ? 'facebook' : '');
      const utmCampaign = params.get('utm_campaign') || '';
      const payload: Record<string, string> = {
        event: eventName,
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `evt-${Date.now()}`,
      };
      if (utmSource) payload.s = utmSource.slice(0, 24);
      if (utmCampaign) payload.c = utmCampaign.slice(0, 32);
      if (vehicleId) payload.v = vehicleId.slice(0, 64);
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // Conversion events never block user navigation
    }
  }, []);

  const loadShowroomData = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      await withLoading(
        mode === 'initial' ? 'Initializing live showroom & latest stock…' : 'Refreshing live stock & pricing…',
        async () => {
          let loadedDoc: ShowroomDocument | null = null;
          let updated: string | null = null;

          for (const endpoint of ['/api/content/published', '/published-baseline.json', '/data/public-site.json']) {
            try {
              const response = await fetch(endpoint, { cache: 'no-store' });
              if (!response.ok) continue;
              const payload = await response.json();
              if (payload?.document?.vehicles) {
                loadedDoc = payload.document as ShowroomDocument;
                updated = payload.updatedAt || new Date().toISOString();
                break;
              }
            } catch {
              // Try next source
            }
          }

          if (!loadedDoc) {
            throw new Error('Could not load published showroom stock.');
          }

          setDoc(loadedDoc);
          setLastSyncedAt(updated);
          if (loadedDoc.finance?.downPayment != null) {
            setCalcDepositPct(Number(loadedDoc.finance.downPayment) || 10);
          }
          if (loadedDoc.finance?.tenure != null) {
            setCalcYears(Number(loadedDoc.finance.tenure) || 7);
          }

          const params = new URLSearchParams(window.location.search);
          const targetParam = params.get('vehicle') || params.get('car');
          const utmSource = params.get('utm_source') || (params.has('fbclid') ? 'facebook' : '');
          const utmCampaign = params.get('utm_campaign') || '';
          if (utmSource || utmCampaign) {
            setAdLandingSource({
              source: utmSource || 'facebook',
              campaign: utmCampaign || 'fb_feed_ad',
            });
          }

          if (targetParam) {
            const match = loadedDoc.vehicles.find(
              (v) =>
                v.id.toLowerCase() === targetParam.toLowerCase() ||
                v.stockId.toLowerCase() === targetParam.toLowerCase()
            );
            if (match) {
              setSelectedVehicle(match);
              setActivePhotoIndex(0);
              void trackVisit(match.id);
              return;
            }
          }
          void trackVisit();
        },
        mode
      );
    },
    [trackVisit, withLoading]
  );

  useEffect(() => {
    void loadShowroomData('initial').catch(() => {
      setLoadingState({ isLoading: false });
    });
  }, [loadShowroomData, setLoadingState]);

  const publicVehicles = useMemo(() => {
    const list = doc?.vehicles || [];
    return list.filter((v) => {
      if (!['available', 'reserved', 'sold'].includes(v.status)) return false;
      if (v.status === 'sold' && doc?.homepage?.showSoldVehicles === false) return false;
      return true;
    });
  }, [doc]);

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const v of publicVehicles) {
      if (v.make) set.add(v.make);
    }
    return ['ALL', ...Array.from(set).sort()];
  }, [publicVehicles]);

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publicVehicles.filter((v) => {
      if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
      if (selectedBrand !== 'ALL' && v.make !== selectedBrand) return false;
      if (!q) return true;
      return [v.stockId, v.make, v.model, v.variant, v.exteriorColor, v.location, ...(v.specialBadges || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [publicVehicles, searchQuery, selectedStatus, selectedBrand]);

  const counts = useMemo(() => {
    return {
      total: publicVehicles.length,
      available: publicVehicles.filter((v) => v.status === 'available').length,
      reserved: publicVehicles.filter((v) => v.status === 'reserved').length,
      sold: publicVehicles.filter((v) => v.status === 'sold').length,
    };
  }, [publicVehicles]);

  // Dynamic SEO & OpenGraph Metadata (遵守 applet-seo: 30-60 char title, 120-160 char description)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://danny.stocklist.workers.dev';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = selectedVehicle
    ? `${origin}${pathname}?vehicle=${encodeURIComponent(selectedVehicle.id)}`
    : `${origin}${pathname}`;

  const seoTitle = useMemo(() => {
    if (selectedVehicle) {
      const baseTitle = `${selectedVehicle.manufactureYear || selectedVehicle.year || ''} ${selectedVehicle.make} ${selectedVehicle.model} · ${formatRm(selectedVehicle.priceRm ?? selectedVehicle.price)} | Danny`.trim();
      return clampSeoText(baseTitle, 60);
    }
    return 'Danny Recond Select – Verified Japan Recond Showroom';
  }, [selectedVehicle]);

  const seoDescription = useMemo(() => {
    if (selectedVehicle) {
      const km = selectedVehicle.mileageKm != null ? `${Number(selectedVehicle.mileageKm).toLocaleString('en-MY')} km` : 'inspected mileage';
      const grade = selectedVehicle.auctionGrade ? `Grade ${selectedVehicle.auctionGrade}` : 'verified inspection';
      const raw = `${selectedVehicle.manufactureYear || selectedVehicle.year || ''} ${selectedVehicle.make} ${selectedVehicle.model} (${km}, ${grade}) at ${formatRm(selectedVehicle.priceRm ?? selectedVehicle.price)}. Inspect specs & loan calculator.`;
      return clampSeoText(raw, 160);
    }
    return 'Explore inspected Japanese & UK recond cars with verified auction grades, live stock updates, XPEL/3M tinting, and loan estimates by Danny.';
  }, [selectedVehicle]);

  const ogImage = useMemo(() => {
    const rawPath = selectedVehicle?.coverImageUrl || selectedVehicle?.gallery?.[0]?.url || doc?.homepage?.heroImage || '/assets/mountain-retreat-hero.png';
    if (/^https?:\/\//i.test(rawPath)) return rawPath;
    return `${origin}${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
  }, [selectedVehicle, doc, origin]);

  const jsonLd = useMemo(() => {
    if (selectedVehicle) {
      const priceVal = selectedVehicle.priceRm ?? selectedVehicle.price;
      return {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: `${selectedVehicle.manufactureYear || selectedVehicle.year || ''} ${selectedVehicle.make} ${selectedVehicle.model}`.trim(),
        brand: { '@type': 'Brand', name: selectedVehicle.make },
        model: selectedVehicle.model,
        vehicleIdentificationNumber: selectedVehicle.stockId,
        image: ogImage,
        description: seoDescription,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MYR',
          price: priceVal != null ? String(priceVal) : undefined,
          availability:
            selectedVehicle.status === 'sold'
              ? 'https://schema.org/SoldOut'
              : selectedVehicle.status === 'reserved'
                ? 'https://schema.org/LimitedAvailability'
                : 'https://schema.org/InStock',
          url: canonicalUrl,
        },
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: 'Danny Recond Select',
      description: seoDescription,
      url: canonicalUrl,
      telephone: doc?.profile?.phone ? `+${doc.profile.phone}` : '+60125686528',
      address: doc?.profile?.location || 'Glenmarie & Bukit Jelutong, Shah Alam, Selangor',
    };
  }, [selectedVehicle, ogImage, seoDescription, canonicalUrl, doc]);

  const openVehicleModal = (vehicle: VehicleItem) => {
    setSelectedVehicle(vehicle);
    setActivePhotoIndex(0);
    void trackVisit(vehicle.id);
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('vehicle', vehicle.id);
      window.history.replaceState({}, '', nextUrl.toString());
    }
  };

  const closeVehicleModal = () => {
    setSelectedVehicle(null);
    if (typeof window !== 'undefined') {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('vehicle');
      nextUrl.searchParams.delete('car');
      window.history.replaceState({}, '', nextUrl.toString());
    }
  };

  const handleCopyAdLink = async (vehicle: VehicleItem) => {
    const adUrl = `${origin}/?vehicle=${encodeURIComponent(vehicle.id)}&utm_source=facebook&utm_medium=paid_social&utm_campaign=fb_feed_ad`;
    try {
      await navigator.clipboard.writeText(adUrl);
    } catch {
      // ignore clipboard restrictions
    }
  };

  if (isLoading && !doc) {
    return (
      <>
        <Helmet>
          <html lang="en" />
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <meta property="og:site_name" content="Danny Recond Select" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoTitle} />
          <meta name="twitter:description" content={seoDescription} />
          <meta name="twitter:image" content={ogImage} />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        <ShowroomSkeleton label="Loading verified showroom inventory…" />
      </>
    );
  }

  const financeRate = Number(doc?.finance?.rate ?? 3.2);
  const whatsappNumber = String(doc?.profile?.phone || '60125686528').replace(/\D/g, '');
  const activeGallery = selectedVehicle?.gallery?.length
    ? selectedVehicle.gallery
    : selectedVehicle?.coverImageUrl
      ? [{ url: selectedVehicle.coverImageUrl, category: 'Exterior' }]
      : [];
  const activePhoto = activeGallery[activePhotoIndex] || activeGallery[0];
  const modalMonthly = selectedVehicle
    ? estimateMonthly(selectedVehicle.priceRm ?? selectedVehicle.price, calcDepositPct, calcYears, financeRate)
    : null;

  return (
    <div className={darkMode ? 'min-h-screen bg-[#0c1015] text-slate-100' : 'min-h-screen bg-[#f6f5f1] text-slate-900'}>
      <Helmet>
        <html lang="en" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content="Danny Recond Select" />
        <meta property="og:type" content={selectedVehicle ? 'product' : 'website'} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        {selectedVehicle && selectedVehicle.priceRm != null && (
          <meta property="product:price:amount" content={String(selectedVehicle.priceRm)} />
        )}
        {selectedVehicle && <meta property="product:price:currency" content="MYR" />}
        {selectedVehicle && <meta property="product:retailer_item_id" content={selectedVehicle.stockId || selectedVehicle.id} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Top Navigation */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          darkMode ? 'border-slate-800/90 bg-[#0c1015]/88' : 'border-stone-300/80 bg-[#f6f5f1]/90'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <a href="#top" className="flex flex-col leading-none tracking-[0.14em]">
              <span className="text-lg font-extrabold">DANNY</span>
              <span className="mt-1 text-[9px] font-bold tracking-[0.22em] text-amber-500">RECOND SELECT</span>
            </a>
            <span className="hidden rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-500 sm:inline-flex">
              {counts.available} Available Live
            </span>
          </div>

          <nav className="flex items-center gap-5 text-xs font-semibold">
            <a href="#inventory" className="hover:text-emerald-500">
              Inventory
            </a>
            <a href="#deliveries" className="hover:text-emerald-500">
              Deliveries
            </a>
            <a href="/services/" className="hover:text-emerald-500">
              XPEL &amp; 3M Tint
            </a>
            <a href="/studio/" className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-500 hover:bg-amber-500/20">
              Owner Studio
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadShowroomData('refresh')}
              disabled={isRefreshing}
              title="Refresh live stock from showroom"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/60'
                  : 'border-stone-300 bg-white text-slate-800 hover:border-emerald-600'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} aria-hidden="true" />
              <span className="hidden md:inline">Sync Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle Day / Night theme"
              className={`rounded-lg border p-2 transition ${
                darkMode ? 'border-slate-700 bg-slate-900 text-amber-300' : 'border-stone-300 bg-white text-slate-700'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void trackConversionEvent('whatsapp_lead', selectedVehicle?.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 whitespace-nowrap shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>WhatsApp Danny</span>
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-5 py-8">
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadShowroomData('refresh')}
              className="rounded-lg border border-rose-400/40 px-3 py-1 text-xs font-bold hover:bg-rose-500/20"
            >
              Retry
            </button>
          </div>
        )}

        {/* Hero Section */}
        <section
          className={`relative overflow-hidden rounded-2xl border p-8 md:p-11 ${
            darkMode
              ? 'border-slate-800 bg-gradient-to-br from-slate-900 via-[#111924] to-slate-950'
              : 'border-stone-300 bg-gradient-to-br from-white via-stone-50 to-stone-100'
          }`}
        >
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-500">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Curated Japan &amp; UK Unregistered Recond · Glenmarie &amp; Bukit Jelutong
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              {doc?.homepage?.heroTitles?.en || 'Japanese recond cars. Selected by Danny.'}
            </h1>
            <p className={darkMode ? 'text-sm leading-relaxed text-slate-300' : 'text-sm leading-relaxed text-slate-600'}>
              {doc?.profile?.intro ||
                'Inspected auction grades, verified mileage, transparent monthly financing, and real-time availability synced directly with our Owner Studio & Facebook Ads.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <a
                href="#inventory"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-500"
              >
                Browse {counts.available} Available Units
              </a>
              <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                {lastSyncedAt ? `Live stock synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Live sync active'}
              </span>
            </div>
          </div>
        </section>

        {/* Facebook Ad Attribution Banner when arriving via Ad UTM */}
        {adLandingSource && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs">
            <div className="flex items-center gap-2.5 font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden="true" />
              <span>
                Verified Facebook Ad Sync ({adLandingSource.campaign}) — Displaying Danny&apos;s latest live price &amp; showroom availability.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAdLandingSource(null)}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Dismiss ad sync notice"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inventory Search & Filters */}
        <section id="inventory" className="mt-10 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-500">Live Stockroom</p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Available &amp; Curated Inventory</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'available', 'reserved', 'sold'] as const).map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setSelectedStatus(statusKey)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedStatus === statusKey
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                      : darkMode
                        ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        : 'border-stone-300 bg-white text-slate-700 hover:border-stone-400'
                  }`}
                >
                  {statusKey === 'all'
                    ? `All (${counts.total})`
                    : statusKey === 'reserved'
                      ? `Booked (${counts.reserved})`
                      : statusKey === 'available'
                        ? `Available (${counts.available})`
                        : `Sold (${counts.sold})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 ${
                darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-stone-300 bg-white'
              }`}
            >
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, Stock ID, colour, RS / Type R…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <SlidersHorizontal className="mr-1 h-4 w-4 flex-none text-slate-400" aria-hidden="true" />
              {brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`flex-none rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    selectedBrand === brand
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                      : darkMode
                        ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        : 'border-stone-300 bg-white text-slate-700'
                  }`}
                >
                  {brand === 'ALL' ? 'All Brands' : brand}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredVehicles.map((vehicle) => {
              const price = vehicle.priceRm ?? vehicle.price;
              const monthly = estimateMonthly(price, calcDepositPct, calcYears, financeRate);
              const meta = statusMeta(vehicle.status);
              const cover = vehicle.coverImageUrl || vehicle.gallery?.[0]?.url || '';
              return (
                <article
                  key={vehicle.id}
                  className={`group flex flex-col overflow-hidden rounded-xl border transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-[0_12px_32px_rgba(16,185,129,0.14)] ${
                    darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-stone-300 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openVehicleModal(vehicle)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 text-left"
                  >
                    {cover ? (
                      <img
                        src={cover}
                        alt={`${vehicle.manufactureYear || vehicle.year || ''} ${vehicle.make} ${vehicle.model}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">Photo Pending</div>
                    )}
                    <span className={`absolute top-2.5 right-2.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${meta.className}`}>
                      {meta.label}
                    </span>
                    {vehicle.specialBadges?.[0] && (
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300">
                        {vehicle.specialBadges[0]}
                      </span>
                    )}
                  </button>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold leading-snug">
                        {vehicle.manufactureYear || vehicle.year || ''} {vehicle.make} {vehicle.model}
                      </h3>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">#{vehicle.stockId}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                        {vehicle.mileageKm != null ? `${Number(vehicle.mileageKm).toLocaleString('en-MY')} km` : vehicle.mileage || 'TBA'}
                      </span>
                      {vehicle.auctionGrade && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Grade {vehicle.auctionGrade}
                          {vehicle.interiorGrade || ''}
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-2xl font-extrabold tracking-tight text-emerald-400 tabular-nums">
                        {vehicle.status === 'sold' ? 'SOLD' : formatRm(price)}
                      </p>
                      {monthly != null && vehicle.status !== 'sold' && (
                        <p className="text-xs text-slate-400 tabular-nums">Est. {formatRm(monthly)} / mo</p>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-800/60 pt-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3 w-3 text-rose-400" aria-hidden="true" />
                        {vehicle.location || 'Glenmarie'}
                      </span>
                      <button
                        type="button"
                        onClick={() => openVehicleModal(vehicle)}
                        className="font-bold text-emerald-400 hover:underline"
                      >
                        Inspect Unit →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Customer Deliveries */}
        {(doc?.stories || []).some((s) => s.published !== false) && (
          <section id="deliveries" className="mt-14 space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-500">Customer Handovers</p>
              <h2 className="text-2xl font-bold tracking-tight">Recent Showroom Deliveries</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(doc?.stories || [])
                .filter((s) => s.published !== false)
                .slice(0, 4)
                .map((story) => (
                  <article
                    key={story.id}
                    className={`overflow-hidden rounded-xl border ${
                      darkMode ? 'border-slate-800 bg-slate-900/70' : 'border-stone-300 bg-white'
                    }`}
                  >
                    {story.image && (
                      <img src={story.image} alt={story.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                    )}
                    <div className="space-y-1 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">{story.date || 'Showroom Handover'}</p>
                      <h3 className="text-sm font-bold">{story.title}</h3>
                      {story.caption && <p className="text-xs text-slate-400">{story.caption}</p>}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}
      </main>

      {/* Vehicle Detail & Live Ad Landing Modal */}
      {selectedVehicle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicleModalHeading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            className={`max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
              darkMode ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-stone-300 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-500">
                  STOCK #{selectedVehicle.stockId} · {selectedVehicle.location || 'Glenmarie'}
                </p>
                <h2 id="vehicleModalHeading" className="mt-1 text-2xl font-extrabold">
                  {selectedVehicle.manufactureYear || selectedVehicle.year || ''} {selectedVehicle.make} {selectedVehicle.model}
                </h2>
                {selectedVehicle.variant && <p className="text-sm text-slate-400">{selectedVehicle.variant}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void trackConversionEvent('fb_share', selectedVehicle.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:border-blue-400 whitespace-nowrap"
                >
                  <span>Share on FB ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => void handleCopyAdLink(selectedVehicle)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold hover:border-emerald-500 whitespace-nowrap"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy FB Ad Link
                </button>
                <button
                  type="button"
                  onClick={closeVehicleModal}
                  aria-label="Close vehicle details"
                  className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-3">
                <div className="aspect-[16/10] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  {activePhoto?.url ? (
                    <img src={activePhoto.url} alt={`${selectedVehicle.make} ${selectedVehicle.model}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">No photograph uploaded</div>
                  )}
                </div>
                {activeGallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeGallery.map((media, idx) => (
                      <button
                        key={media.url + idx}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`h-14 w-20 flex-none overflow-hidden rounded-lg border-2 ${
                          idx === activePhotoIndex ? 'border-emerald-400' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={media.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Live Showroom Price</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${statusMeta(selectedVehicle.status).className}`}>
                      {statusMeta(selectedVehicle.status).label}
                    </span>
                  </div>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-400 tabular-nums">
                    {selectedVehicle.status === 'sold' ? 'SOLD' : formatRm(selectedVehicle.priceRm ?? selectedVehicle.price)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Synced directly from Danny&apos;s Owner Workbench{lastSyncedAt ? ` · ${new Date(lastSyncedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>

                {/* Loan Calculator */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      Loan Estimate ({financeRate}% p.a.)
                    </span>
                    <span className="text-base text-emerald-400 tabular-nums">
                      {modalMonthly != null ? `${formatRm(modalMonthly)} / mo` : 'Custom Quote'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="space-y-1">
                      <span className="text-slate-400">Deposit: {calcDepositPct}%</span>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        step={5}
                        value={calcDepositPct}
                        onChange={(e) => setCalcDepositPct(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-slate-400">Tenure</span>
                      <select
                        value={calcYears}
                        onChange={(e) => setCalcYears(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs"
                      >
                        {[5, 7, 9].map((yr) => (
                          <option key={yr} value={yr}>
                            {yr} years
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hi Danny,${adLandingSource ? ` [Facebook Ad · Stock #${selectedVehicle.stockId}]` : ''} I viewed the ${selectedVehicle.manufactureYear || selectedVehicle.year || ''} ${selectedVehicle.make} ${selectedVehicle.model} (#${selectedVehicle.stockId}) on your website. Is it still available?\n${canonicalUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => void trackConversionEvent('whatsapp_lead', selectedVehicle.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Enquire About #{selectedVehicle.stockId} on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`mt-14 border-t py-6 text-xs ${
          darkMode ? 'border-slate-800/80 text-slate-400' : 'border-stone-300/80 text-slate-600'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5">
          <span>Danny Recond Select · Glenmarie &amp; Bukit Jelutong, Shah Alam</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/api/facebook/catalog.csv" className="hover:text-emerald-400">
              Meta Catalog CSV
            </a>
            <a href="/studio/" className="hover:text-emerald-400">
              Owner Studio ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LoadingProvider>
        <ShowroomContent />
      </LoadingProvider>
    </HelmetProvider>
  );
}
