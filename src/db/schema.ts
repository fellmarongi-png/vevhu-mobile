import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  worker_id: text("worker_id").notNull(),
  form_schema_version: integer("form_schema_version").notNull(),
  stand_number_official: text("stand_number_official"),
  stand_number_physical: text("stand_number_physical"),
  respondent_type: text("respondent_type"),
  respondent_name: text("respondent_name"),
  respondent_phone: text("respondent_phone"),
  is_legal_owner: integer("is_legal_owner", { mode: "boolean" }),
  owner_name: text("owner_name"),
  owner_phone: text("owner_phone"),
  account_standing: text("account_standing"),
  action_taken: text("action_taken"),
  field_notes: text("field_notes"),
  extra_fields: text("extra_fields", { mode: "json" }),
  gps_latitude: real("gps_latitude"),
  gps_longitude: real("gps_longitude"),
  gps_accuracy: real("gps_accuracy"),
  photos: text("photos", { mode: "json" }),
  audio_recording_key: text("audio_recording_key"),
  audio_duration_seconds: integer("audio_duration_seconds"),
  signature_key: text("signature_key"),
  status: text("status").default("pending"),
  collected_at: text("collected_at").notNull(),
  synced_at: text("synced_at"),
});

export const mediaQueue = sqliteTable("media_queue", {
  id: text("id").primaryKey(),
  submission_id: text("submission_id").notNull(),
  file_path: text("file_path").notNull(),
  file_type: text("file_type").notNull(),
  file_size: integer("file_size"),
  upload_status: text("upload_status").default("pending"),
  r2_key: text("r2_key"),
  retry_count: integer("retry_count").default(0),
  created_at: text("created_at").notNull(),
});

export const knownStands = sqliteTable("known_stands", {
  id: text("id").primaryKey(),
  stand_number: text("stand_number").notNull(),
  zone: text("zone"),
  area: text("area"),
  registered_owner_name: text("registered_owner_name"),
  registered_owner_id: text("registered_owner_id"),
  account_status: text("account_status"),
  additional_data: text("additional_data", { mode: "json" }),
});

export const formSchemas = sqliteTable("form_schemas", {
  id: text("id").primaryKey(),
  version: integer("version").notNull(),
  name: text("name").notNull(),
  fields: text("fields", { mode: "json" }).notNull(),
  scripts: text("scripts", { mode: "json" }).notNull(),
  is_active: integer("is_active", { mode: "boolean" }).default(true),
  published_at: text("published_at"),
});

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  target_type: text("target_type").default("all"),
  is_read: integer("is_read", { mode: "boolean" }).default(false),
  created_at: text("created_at").notNull(),
});
