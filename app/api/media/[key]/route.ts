import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { vehicleMedia, vehicles } from "@/db/schema";
import { getStudioUser } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)) return new Response("Not found", { status: 404 });
  const db = getDb();
  const rows = await db.select({ type: vehicleMedia.contentType, status: vehicles.status }).from(vehicleMedia).innerJoin(vehicles, eq(vehicleMedia.vehicleId, vehicles.id)).where(eq(vehicleMedia.objectKey, key)).limit(1);
  if (!rows.length || (rows[0].status !== "published" && !await getStudioUser())) return new Response("Not found", { status: 404 });
  const object = await env.BUCKET?.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": rows[0].type, "Cache-Control": rows[0].status === "published" ? "public, max-age=3600" : "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
