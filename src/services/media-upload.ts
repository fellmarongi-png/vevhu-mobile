import * as FileSystem from "expo-file-system";
import { Paths } from "expo-file-system";
import { CONFIG } from "../config/app";
import { supabase } from "./supabase";

const BUCKET = "vevhu-media";

export async function uploadFile(
  localPath: string,
  storagePath: string,
  contentType: string,
): Promise<string> {
  let fileToUpload = localPath;
  let isTempFile = false;

  // Handle data URIs or base64 strings (e.g., resident signature captures)
  if (localPath.startsWith("data:") || localPath.startsWith("base64,")) {
    const base64Data = localPath.includes("base64,") ? localPath.split("base64,")[1] : localPath;
    const tempFilename = `temp_sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const cacheDir = Paths.cache.uri.endsWith("/") ? Paths.cache.uri : `${Paths.cache.uri}/`;
    fileToUpload = `${cacheDir}${tempFilename}`;
    await FileSystem.writeAsStringAsync(fileToUpload, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    isTempFile = true;
  }

  try {
    // Get valid session access token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || CONFIG.SUPABASE_ANON_KEY;

    const targetUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;

    // Use FileSystem.uploadAsync for native file streaming
    const response = await FileSystem.uploadAsync(targetUrl, fileToUpload, {
      httpMethod: "POST",
      uploadType: ((FileSystem as any).UploadType?.BINARY_CONTENT ?? 1) as any,
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: CONFIG.SUPABASE_ANON_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Upload failed with status ${response.status}: ${response.body}`);
    }

    return storagePath;
  } finally {
    if (isTempFile) {
      await FileSystem.deleteAsync(fileToUpload, { idempotent: true }).catch(() => {});
    }
  }
}

export async function uploadSubmissionMedia(
  submissionId: string,
  files: Array<{ path: string; type: string; contentType: string }>,
): Promise<Array<{ key: string; type: string }>> {
  const results: Array<{ key: string; type: string }> = [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  for (const file of files) {
    const filename = file.path.split("/").pop() || `${Date.now()}.bin`;
    const storagePath = `${user.id}/${submissionId}/${filename}`;
    const key = await uploadFile(file.path, storagePath, file.contentType);
    results.push({ key, type: file.type });
  }

  return results;
}

export function getPublicUrl(key: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}
