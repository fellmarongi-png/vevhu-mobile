import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

const BUCKET = "vevhu-media";

export async function uploadFile(
  localPath: string,
  storagePath: string,
  contentType: string,
): Promise<string> {
  const fileContent = await FileSystem.readAsStringAsync(localPath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, decode(fileContent), {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return data.path;
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

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
