export interface Submission {
  id: string;
  worker_id: string;
  form_schema_version: number;
  stand_number_official: string;
  stand_number_physical: string;
  respondent_type: string;
  respondent_name: string;
  respondent_phone: string;
  is_legal_owner: boolean;
  owner_name: string | null;
  owner_phone: string | null;
  account_standing: string | null;
  action_taken: string | null;
  field_notes: string | null;
  extra_fields: Record<string, unknown>;
  gps_latitude: number;
  gps_longitude: number;
  gps_accuracy: number;
  photos: PhotoRecord[];
  audio_recording_key: string | null;
  audio_duration_seconds: number | null;
  signature_key: string | null;
  status: SubmissionStatus;
  collected_at: string;
  synced_at: string | null;
}

export interface PhotoRecord {
  key: string;
  type: "stand" | "document";
  timestamp: string;
  local_path?: string;
}

export type SubmissionStatus = "pending" | "synced" | "flagged" | "complete" | "disputed";
