import { z } from "zod";

const optionalInt = z.number().int().nonnegative().nullable();
export const vehicleInput = z.object({
  stockId: z.string().trim().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/),
  make: z.string().trim().min(2).max(70),
  model: z.string().trim().min(1).max(100),
  variant: z.string().trim().max(100),
  year: optionalInt.refine((value) => value === null || (value >= 1950 && value <= new Date().getFullYear() + 2)),
  priceRm: optionalInt,
  mileageKm: optionalInt,
  body: z.string().trim().max(50),
  color: z.string().trim().max(70),
  description: z.string().trim().max(3000),
  status: z.enum(["draft", "published", "archived"]),
});
