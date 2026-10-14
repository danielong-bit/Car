"use client";

import { useEffect, useRef, useState } from "react";

type Media = { id: string; url: string; fileName: string };
type Vehicle = { id: string; stockId: string; make: string; model: string; variant: string; year: number | null; priceRm: number | null; mileageKm: number | null; body: string; color: string; description: string; status: "draft" | "published" | "archived"; media: Media[] };
type Form = Omit<Vehicle, "id" | "media">;
const blank: Form = { stockId: "", make: "", model: "", variant: "", year: null, priceRm: null, mileageKm: null, body: "", color: "", description: "", status: "draft" };

export default function StudioClient() {
  const [list, setList] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(blank);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const current = list.find((v) => v.id === editing);

  async function load() {
    const response = await fetch("/api/admin/vehicles", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load inventory.");
    const data = await response.json() as { vehicles: Vehicle[] };
    setList(data.vehicles);
  }
  useEffect(() => { load().catch((e) => { setMessage(e.message); setError(true); }); }, []);

  function notice(text: string, failed = false) { setMessage(text); setError(failed); }
  function setField<K extends keyof Form>(field: K, value: Form[K]) { setForm((prior) => ({ ...prior, [field]: value })); }
  function scrollToEditor() { window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  function select(v: Vehicle) { setEditing(v.id); setForm({ stockId: v.stockId, make: v.make, model: v.model, variant: v.variant, year: v.year, priceRm: v.priceRm, mileageKm: v.mileageKm, body: v.body, color: v.color, description: v.description, status: v.status }); notice(""); scrollToEditor(); }
  function startNew() { setEditing(null); setForm(blank); notice(""); scrollToEditor(); }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); notice("");
    try {
      const response = await fetch(editing ? `/api/admin/vehicles/${editing}` : "/api/admin/vehicles", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { id?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save vehicle.");
      await load();
      if (!editing && data.id) setEditing(data.id);
      notice(editing ? "Vehicle saved." : "Draft created. You can add photos now.");
    } catch (e) { notice(e instanceof Error ? e.message : "Could not save vehicle.", true); }
    finally { setBusy(false); }
  }

  async function upload(files: FileList | File[]) {
    if (!editing) return notice("Save the draft before adding photos.", true);
    setBusy(true); notice("");
    try {
      let uploaded = 0;
      for (const file of Array.from(files)) {
        const data = new FormData(); data.set("vehicleId", editing); data.set("file", file);
        const response = await fetch("/api/admin/media", { method: "POST", body: data });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(`${file.name}: ${result.error || "Upload failed."}`);
        uploaded++;
      }
      await load(); notice(`${uploaded} photo${uploaded === 1 ? "" : "s"} added.`);
    } catch (e) { await load(); notice(e instanceof Error ? e.message : "Upload failed.", true); }
    finally { setBusy(false); setDragging(false); if (picker.current) picker.current.value = ""; }
  }

  async function removePhoto(id: string) {
    if (!confirm("Remove this photo from the vehicle?")) return;
    setBusy(true);
    try { const response = await fetch(`/api/admin/media/${id}`, { method: "DELETE" }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "Could not remove photo."); await load(); notice("Photo removed."); }
    catch (e) { notice(e instanceof Error ? e.message : "Could not remove photo.", true); }
    finally { setBusy(false); }
  }

  return <div className="studio-wrap">
    <div className="studio-intro"><div><h2>Inventory studio</h2><p>Create drafts, add photos, then publish confirmed stock.</p></div><button className="studio-button secondary" onClick={startNew}>+ New vehicle</button></div>
    {message && <div className={`studio-message ${error ? "error" : ""}`} role={error ? "alert" : "status"}>{message}</div>}
    <section className="studio-editor" aria-label="Vehicle editor"><h3>{editing ? `Edit ${current?.make || "vehicle"} ${current?.model || ""}` : "New vehicle draft"}</h3><p>Only published vehicles appear in the public showroom. Enter verified stock details.</p>
      <form className="studio-form" onSubmit={save}>
        <label>Stock ID *<input required maxLength={50} pattern="[A-Za-z0-9_-]+" value={form.stockId} onChange={(e) => setField("stockId", e.target.value)} placeholder="e.g. JRC-001" /></label>
        <label>Make *<input required value={form.make} onChange={(e) => setField("make", e.target.value)} placeholder="Audi" /></label>
        <label>Model *<input required value={form.model} onChange={(e) => setField("model", e.target.value)} placeholder="S5 Avant" /></label>
        <label>Variant<input value={form.variant} onChange={(e) => setField("variant", e.target.value)} /></label>
        <label>Year<input type="number" min="1950" max={new Date().getFullYear() + 2} value={form.year ?? ""} onChange={(e) => setField("year", e.target.value === "" ? null : Number(e.target.value))} /></label>
        <label>Price (RM)<input type="number" min="0" value={form.priceRm ?? ""} onChange={(e) => setField("priceRm", e.target.value === "" ? null : Number(e.target.value))} /></label>
        <label>Mileage (km)<input type="number" min="0" value={form.mileageKm ?? ""} onChange={(e) => setField("mileageKm", e.target.value === "" ? null : Number(e.target.value))} /></label>
        <label>Body type<input value={form.body} onChange={(e) => setField("body", e.target.value)} placeholder="Wagon, SUV, MPV…" /></label>
        <label>Colour<input value={form.color} onChange={(e) => setField("color", e.target.value)} /></label>
        <label>Status<select value={form.status} onChange={(e) => setField("status", e.target.value as Form["status"])}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
        <label className="full">Description<textarea maxLength={3000} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Add only confirmed vehicle details." /></label>
        <div className="studio-form-actions"><button className="studio-button" disabled={busy} type="submit">{busy ? "Working…" : editing ? "Save vehicle" : "Create draft"}</button><span>Publishing requires year, price, mileage and at least one photo.</span></div>
      </form>
      {editing && <><div className={`dropzone ${dragging ? "dragging" : ""}`} aria-label="Choose vehicle photos to upload, or drop photo files here" aria-disabled={busy} onDragEnter={(e) => { e.preventDefault(); if (!busy) setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={(e) => { e.preventDefault(); setDragging(false); }} onDrop={(e) => { e.preventDefault(); if (!busy) upload(e.dataTransfer.files); }} onClick={() => !busy && picker.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!busy) picker.current?.click(); } }}><input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => e.target.files && upload(e.target.files)} /><strong>Drop vehicle photos here, or tap to choose</strong><span>JPG, PNG or WebP · up to 10 MB each · photos only</span></div><div className="media-strip">{current?.media.map((m) => <div className="media-tile" key={m.id}><img src={m.url} alt={m.fileName} /><button type="button" disabled={busy} onClick={() => removePhoto(m.id)}>Remove photo</button></div>)}</div></>}
    </section>
    <div className="studio-list">{list.map((v) => <article className="studio-row" key={v.id}><div><strong><span className={`status ${v.status}`}>{v.status}</span>{v.make} {v.model}</strong><p>{v.stockId} · {v.year || "Year pending"} · {v.priceRm == null ? "Price pending" : `RM ${v.priceRm.toLocaleString("en-MY")}`} · {v.media.length} photos</p></div><div className="studio-row-actions"><button onClick={() => select(v)}>Edit listing</button></div></article>)}{!list.length && <div className="studio-row"><p>No vehicles yet. Create your first draft above.</p></div>}</div>
  </div>;
}
