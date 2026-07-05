-- ============================================================
-- Vevhu Field — Initial Database Migration
-- 001_initial.sql
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('worker', 'manager', 'admin');
CREATE TYPE submission_status AS ENUM ('pending', 'synced', 'flagged', 'complete', 'disputed');
CREATE TYPE announcement_target_type AS ENUM ('all', 'worker', 'zone');

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id          UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  role                  user_role        NOT NULL DEFAULT 'worker',
  full_name             TEXT             NOT NULL,
  pin_hash              TEXT,
  email                 TEXT             UNIQUE,
  phone                 TEXT,
  zone_assigned         TEXT,
  daily_target          INT              NOT NULL DEFAULT 30,
  failed_login_attempts INT              NOT NULL DEFAULT 0,
  locked_until          TIMESTAMPTZ,
  is_active             BOOLEAN          NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- HELPER FUNCTIONS FOR RLS & AUTH
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM users WHERE id = p_user_id AND is_active = TRUE LIMIT 1;
$$;

-- ============================================================
-- TABLE: form_schemas
-- ============================================================

CREATE TABLE form_schemas (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  version      INT         NOT NULL,
  name         TEXT        NOT NULL,
  fields       JSONB       NOT NULL DEFAULT '[]',
  scripts      JSONB       NOT NULL DEFAULT '{}',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE: submissions
-- ============================================================

CREATE TABLE submissions (
  id                      UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id               UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  form_schema_version     INT               NOT NULL,
  stand_number_official   TEXT,
  stand_number_physical   TEXT,
  respondent_type         TEXT,
  respondent_name         TEXT,
  respondent_phone        TEXT,
  is_legal_owner          BOOLEAN,
  owner_name              TEXT,
  owner_phone             TEXT,
  account_standing        TEXT,
  action_taken            TEXT,
  field_notes             TEXT,
  extra_fields            JSONB             NOT NULL DEFAULT '{}',
  gps_latitude            DOUBLE PRECISION,
  gps_longitude           DOUBLE PRECISION,
  gps_accuracy            DOUBLE PRECISION,
  photos                  JSONB             NOT NULL DEFAULT '[]',
  audio_recording_key     TEXT,
  audio_duration_seconds  INT,
  signature_key           TEXT,
  status                  submission_status NOT NULL DEFAULT 'pending',
  flagged_reason          TEXT,
  collected_at            TIMESTAMPTZ       NOT NULL,
  synced_at               TIMESTAMPTZ,
  created_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: known_stands
-- ============================================================

CREATE TABLE known_stands (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_number          TEXT        NOT NULL UNIQUE,
  zone                  TEXT,
  area                  TEXT,
  registered_owner_name TEXT,
  registered_owner_id   TEXT,
  account_status        TEXT,
  additional_data       JSONB,
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  imported_by           UUID        REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: shifts
-- ============================================================

CREATE TABLE shifts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checked_in_at     TIMESTAMPTZ,
  checked_out_at    TIMESTAMPTZ,
  gps_checkin_lat   DOUBLE PRECISION,
  gps_checkin_lng   DOUBLE PRECISION,
  gps_checkout_lat  DOUBLE PRECISION,
  gps_checkout_lng  DOUBLE PRECISION,
  records_collected INT         NOT NULL DEFAULT 0,
  notes             TEXT
);

-- ============================================================
-- TABLE: announcements
-- ============================================================

CREATE TABLE announcements (
  id          UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID                     REFERENCES users(id) ON DELETE SET NULL,
  title       TEXT                     NOT NULL,
  message     TEXT                     NOT NULL,
  target_type announcement_target_type NOT NULL DEFAULT 'all',
  target_id   TEXT,
  is_read_by  JSONB                    NOT NULL DEFAULT '[]',
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ              NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: daily_summaries
-- ============================================================

CREATE TABLE daily_summaries (
  id                     UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  date                   DATE             NOT NULL,
  worker_id              UUID             REFERENCES users(id) ON DELETE SET NULL,
  total_records          INT              NOT NULL DEFAULT 0,
  records_with_photos    INT              NOT NULL DEFAULT 0,
  records_with_audio     INT              NOT NULL DEFAULT 0,
  records_with_signature INT              NOT NULL DEFAULT 0,
  records_flagged        INT              NOT NULL DEFAULT 0,
  unique_stands_visited  INT              NOT NULL DEFAULT 0,
  shift_duration_minutes INT              NOT NULL DEFAULT 0,
  target_achievement_pct DOUBLE PRECISION,
  created_at             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  UNIQUE (date, worker_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_auth_user_id                 ON users(auth_user_id);
CREATE INDEX idx_form_schemas_created_by            ON form_schemas(created_by);
CREATE INDEX idx_form_schemas_is_active             ON form_schemas(is_active);

CREATE INDEX idx_submissions_worker_id             ON submissions(worker_id);
CREATE INDEX idx_submissions_stand_number_official ON submissions(stand_number_official);
CREATE INDEX idx_submissions_collected_at          ON submissions(collected_at);
CREATE INDEX idx_submissions_status                ON submissions(status);
CREATE INDEX idx_submissions_worker_status         ON submissions(worker_id, status);

CREATE INDEX idx_known_stands_stand_number ON known_stands(stand_number);
CREATE INDEX idx_known_stands_zone         ON known_stands(zone);
CREATE INDEX idx_known_stands_imported_by  ON known_stands(imported_by);

CREATE INDEX idx_shifts_worker_id     ON shifts(worker_id);
CREATE INDEX idx_shifts_checked_in_at ON shifts(checked_in_at);

CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_announcements_target     ON announcements(target_type, target_id);

CREATE INDEX idx_daily_summaries_date      ON daily_summaries(date);
CREATE INDEX idx_daily_summaries_worker_id ON daily_summaries(worker_id);

-- ============================================================
-- ROW LEVEL SECURITY — ENABLE
-- ============================================================

ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_schemas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_stands    ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: users
-- ============================================================

CREATE POLICY users_select ON users
  FOR SELECT TO authenticated USING (
    id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY users_modify ON users
  FOR ALL TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: form_schemas
-- ============================================================

CREATE POLICY form_schemas_select ON form_schemas
  FOR SELECT TO authenticated USING (
    is_active = TRUE
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY form_schemas_modify ON form_schemas
  FOR ALL TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: submissions
-- ============================================================

CREATE POLICY submissions_select ON submissions
  FOR SELECT TO authenticated USING (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY submissions_insert ON submissions
  FOR INSERT TO authenticated WITH CHECK (worker_id = (SELECT auth.uid()));

CREATE POLICY submissions_update ON submissions
  FOR UPDATE TO authenticated USING (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  ) WITH CHECK (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY submissions_delete ON submissions
  FOR DELETE TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: known_stands
-- ============================================================

CREATE POLICY known_stands_select ON known_stands
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY known_stands_modify ON known_stands
  FOR ALL TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: shifts
-- ============================================================

CREATE POLICY shifts_select ON shifts
  FOR SELECT TO authenticated USING (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY shifts_insert ON shifts
  FOR INSERT TO authenticated WITH CHECK (worker_id = (SELECT auth.uid()));

CREATE POLICY shifts_update ON shifts
  FOR UPDATE TO authenticated USING (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  ) WITH CHECK (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY shifts_delete ON shifts
  FOR DELETE TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: announcements
-- ============================================================

CREATE POLICY announcements_select ON announcements
  FOR SELECT TO authenticated USING (
    (expires_at IS NULL OR expires_at > NOW())
    AND (
      target_type = 'all'
      OR (target_type = 'worker' AND target_id = (SELECT auth.uid())::TEXT)
      OR (
        target_type = 'zone'
        AND target_id = (
          SELECT zone_assigned FROM users WHERE id = (SELECT auth.uid())
        )
      )
      OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
    )
  );

CREATE POLICY announcements_modify ON announcements
  FOR ALL TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- RLS POLICIES: daily_summaries
-- ============================================================

CREATE POLICY daily_summaries_select ON daily_summaries
  FOR SELECT TO authenticated USING (
    worker_id = (SELECT auth.uid())
    OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

CREATE POLICY daily_summaries_modify ON daily_summaries
  FOR ALL TO authenticated USING (
    get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
  );

-- ============================================================
-- STORAGE BUCKET & RLS POLICIES: vevhu-media
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('vevhu-media', 'vevhu-media', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "vevhu_media_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vevhu-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "vevhu_media_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'vevhu-media'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR get_user_role((SELECT auth.uid())) IN ('manager', 'admin')
    )
  );

CREATE POLICY "vevhu_media_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vevhu-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'vevhu-media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE submissions;

