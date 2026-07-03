import { uploadFile } from "./media-upload";
import { db } from "./powersync";
import { supabase } from "./supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MediaQueueRow {
  id: string;
  submission_id: string;
  file_path: string;
  file_type: string; // 'photo' | 'audio' | 'signature'
  upload_status: string;
  r2_key: string | null;
  retry_count: number;
  created_at: string;
}

interface SubmissionMediaKeys {
  photos: string[];
  audio_recording_key: string | null;
  signature_key: string | null;
}

export interface QueueStats {
  pending: number;
  uploading: number;
  uploaded: number;
  failed: number;
}

// ---------------------------------------------------------------------------
// Content-type helpers
// ---------------------------------------------------------------------------

function contentTypeForFileType(fileType: string, filePath: string): string {
  if (fileType === "audio") return "audio/m4a";
  if (fileType === "signature") return "image/png";
  // photo — infer from extension, default to jpeg
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

// ---------------------------------------------------------------------------
// processMediaQueue
// ---------------------------------------------------------------------------

/**
 * Process up to 5 pending/retryable items from the media_queue table.
 * After all media for a submission is uploaded, the submission row is
 * updated with the resulting R2 keys.
 */
export async function processMediaQueue(): Promise<void> {
  const rows = await db.getAll<MediaQueueRow>(
    `SELECT * FROM media_queue
     WHERE upload_status = 'pending'
        OR (upload_status = 'failed' AND retry_count < 3)
     ORDER BY created_at ASC
     LIMIT 5`,
  );

  if (rows.length === 0) {
    console.log("[MediaSync] Queue empty — nothing to upload");
    return;
  }

  // Track which submission IDs were fully handled so we can update them
  const processedSubmissionIds = new Set<string>();

  for (const row of rows) {
    // 1. Mark as uploading
    await db.execute(`UPDATE media_queue SET upload_status = 'uploading' WHERE id = ?`, [row.id]);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous";
      const filename = row.file_path.split("/").pop() ?? `${Date.now()}.bin`;
      const contentType = contentTypeForFileType(row.file_type, row.file_path);
      const storagePath = `${userId}/${row.submission_id}/${filename}`;

      // 2. Upload the file to Supabase Storage
      const key = await uploadFile(row.file_path, storagePath, contentType);

      // 4. Success — record R2 key and mark uploaded
      await db.execute(
        `UPDATE media_queue SET upload_status = 'uploaded', r2_key = ? WHERE id = ?`,
        [key, row.id],
      );

      console.log(
        `[MediaSync] Uploaded ${row.file_type} for submission ${row.submission_id}: ${key}`,
      );
      processedSubmissionIds.add(row.submission_id);
    } catch (err) {
      // 5. Failure — increment retry_count and mark failed
      await db.execute(
        `UPDATE media_queue
         SET upload_status = 'failed', retry_count = retry_count + 1
         WHERE id = ?`,
        [row.id],
      );
      console.error(`[MediaSync] Failed to upload ${row.id}:`, err);
    }
  }

  // After processing the batch, update submission rows where all media is done
  for (const submissionId of processedSubmissionIds) {
    await _updateSubmissionMediaKeys(submissionId);
  }
}

// ---------------------------------------------------------------------------
// Internal: update submission media keys once all files are uploaded
// ---------------------------------------------------------------------------

async function _updateSubmissionMediaKeys(submissionId: string): Promise<void> {
  // Check whether any media for this submission is still pending/uploading/failed
  const remaining = await db.getOptional<{ count: number }>(
    `SELECT COUNT(*) AS count FROM media_queue
     WHERE submission_id = ?
       AND upload_status != 'uploaded'`,
    [submissionId],
  );

  if ((remaining?.count ?? 0) > 0) {
    // Not all files done yet — skip for now
    return;
  }

  // Fetch all uploaded rows for this submission
  const uploaded = await db.getAll<{ file_type: string; r2_key: string }>(
    `SELECT file_type, r2_key FROM media_queue
     WHERE submission_id = ? AND upload_status = 'uploaded' AND r2_key IS NOT NULL`,
    [submissionId],
  );

  const keys: SubmissionMediaKeys = {
    photos: [],
    audio_recording_key: null,
    signature_key: null,
  };

  for (const item of uploaded) {
    if (item.file_type === "photo") {
      keys.photos.push(item.r2_key);
    } else if (item.file_type === "audio") {
      keys.audio_recording_key = item.r2_key;
    } else if (item.file_type === "signature") {
      keys.signature_key = item.r2_key;
    }
  }

  await db.execute(
    `UPDATE submissions
     SET photos = ?,
         audio_recording_key = ?,
         signature_key = ?
     WHERE id = ?`,
    [JSON.stringify(keys.photos), keys.audio_recording_key, keys.signature_key, submissionId],
  );

  console.log(`[MediaSync] Updated submission ${submissionId} with R2 keys`);
}

// ---------------------------------------------------------------------------
// getQueueStats
// ---------------------------------------------------------------------------

/**
 * Returns a snapshot of the current media_queue upload status counts.
 */
export async function getQueueStats(): Promise<QueueStats> {
  const rows = await db.getAll<{ upload_status: string; count: number }>(
    `SELECT upload_status, COUNT(*) AS count FROM media_queue GROUP BY upload_status`,
  );

  const stats: QueueStats = { pending: 0, uploading: 0, uploaded: 0, failed: 0 };

  for (const row of rows) {
    switch (row.upload_status) {
      case "pending":
        stats.pending = row.count;
        break;
      case "uploading":
        stats.uploading = row.count;
        break;
      case "uploaded":
        stats.uploaded = row.count;
        break;
      case "failed":
        stats.failed = row.count;
        break;
    }
  }

  return stats;
}
