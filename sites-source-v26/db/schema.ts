import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const cmsDocuments = sqliteTable('cms_documents', {id:text('id').primaryKey(),body:text('body').notNull(),revision:integer('revision').notNull().default(0),updatedAt:text('updated_at').notNull()});
export const cmsVersions = sqliteTable('cms_versions', {id:text('id').primaryKey(),body:text('body').notNull(),action:text('action').notNull(),actor:text('actor').notNull(),createdAt:text('created_at').notNull()});
export const cmsMedia = sqliteTable('cms_media', {id:text('id').primaryKey(),objectKey:text('object_key').notNull(),name:text('name').notNull(),type:text('type').notNull(),bytes:integer('bytes').notNull(),archived:integer('archived').notNull().default(0),createdAt:text('created_at').notNull()});
export const cmsEnquiries = sqliteTable('cms_enquiries', {id:text('id').primaryKey(),body:text('body').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull()});
export const cmsViews = sqliteTable('cms_views', {id:text('id').primaryKey(),vehicleId:text('vehicle_id').notNull(),day:text('day').notNull(),count:integer('count').notNull().default(0)});

export const vehicles = sqliteTable("vehicles", {
  id: text("id").primaryKey(),
  stockId: text("stock_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  variant: text("variant").notNull().default(""),
  year: integer("year"),
  priceRm: integer("price_rm"),
  mileageKm: integer("mileage_km"),
  body: text("body").notNull().default(""),
  color: text("color").notNull().default(""),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("vehicles_stock_id_unique").on(table.stockId)]);

export const vehicleMedia = sqliteTable("vehicle_media", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  objectKey: text("object_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
