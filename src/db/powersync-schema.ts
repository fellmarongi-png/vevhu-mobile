import { column, Schema, Table } from "@powersync/common";

const submissions = new Table(
  {
    worker_id: column.text,
    form_schema_version: column.integer,
    stand_number_official: column.text,
    stand_number_physical: column.text,
    respondent_type: column.text,
    respondent_name: column.text,
    respondent_phone: column.text,
    is_legal_owner: column.integer,
    owner_name: column.text,
    owner_phone: column.text,
    account_standing: column.text,
    action_taken: column.text,
    field_notes: column.text,
    extra_fields: column.text,
    gps_latitude: column.real,
    gps_longitude: column.real,
    gps_accuracy: column.real,
    photos: column.text,
    audio_recording_key: column.text,
    audio_duration_seconds: column.integer,
    signature_key: column.text,
    status: column.text,
    flagged_reason: column.text,
    collected_at: column.text,
    synced_at: column.text,
  },
  { indexes: { worker: ["worker_id"], stand: ["stand_number_official"], status: ["status"] } },
);

const known_stands = new Table(
  {
    stand_number: column.text,
    zone: column.text,
    area: column.text,
    registered_owner_name: column.text,
    registered_owner_id: column.text,
    account_status: column.text,
    additional_data: column.text,
  },
  { indexes: { stand_number: ["stand_number"], zone: ["zone"] } },
);

const form_schemas = new Table({
  version: column.integer,
  name: column.text,
  fields: column.text,
  scripts: column.text,
  is_active: column.integer,
  published_at: column.text,
});

const announcements = new Table({
  title: column.text,
  message: column.text,
  target_type: column.text,
  target_id: column.text,
  is_read_by: column.text,
  created_at: column.text,
  expires_at: column.text,
});

const shifts = new Table(
  {
    worker_id: column.text,
    checked_in_at: column.text,
    checked_out_at: column.text,
    gps_checkin_lat: column.real,
    gps_checkin_lng: column.real,
    gps_checkout_lat: column.real,
    gps_checkout_lng: column.real,
    records_collected: column.integer,
    notes: column.text,
  },
  { indexes: { worker: ["worker_id"] } },
);

const media_queue = new Table(
  {
    submission_id: column.text,
    file_path: column.text,
    file_type: column.text,
    file_size: column.integer,
    upload_status: column.text,
    r2_key: column.text,
    retry_count: column.integer,
    created_at: column.text,
  },
  { indexes: { status: ["upload_status"], submission: ["submission_id"] } },
);

export const AppSchema = new Schema({
  submissions,
  known_stands,
  form_schemas,
  announcements,
  shifts,
  media_queue,
});

export type Database = (typeof AppSchema)["types"];
export type SubmissionRecord = Database["submissions"];
export type KnownStandRecord = Database["known_stands"];
