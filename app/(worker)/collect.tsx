import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuid } from "uuid";
import { DynamicForm, type DynamicFormRef } from "../../src/components/form/DynamicForm";
import { AudioRecorder } from "../../src/components/media/AudioRecorder";
import { PhotoCapture } from "../../src/components/media/PhotoCapture";
import { SignaturePad } from "../../src/components/media/SignaturePad";
import { COLORS } from "../../src/config/app";
import { useAuth } from "../../src/hooks/useAuth";
import { useLocation } from "../../src/hooks/useLocation";
import { useWatchedQuery } from "../../src/hooks/usePowerSync";
import { processMediaQueue } from "../../src/services/media-sync";
import { db } from "../../src/services/powersync";
import type { FormSchema } from "../../src/types/form";

const DEFAULT_SCHEMA: FormSchema = {
  id: "default-v1",
  version: 1,
  name: "Field Collection Form",
  is_active: true,
  published_at: new Date().toISOString(),
  fields: [
    {
      id: "stand_number_official",
      type: "text",
      label: "Stand Number (Official Record)",
      placeholder: "e.g. 1042",
      required: true,
      order: 1,
    },
    {
      id: "stand_number_physical",
      type: "text",
      label: "Stand Number (On-Site Physical/Claimed)",
      placeholder: "e.g. 1042-B",
      required: true,
      order: 2,
    },
    {
      id: "is_legal_owner",
      type: "toggle",
      label: "Is Respondent the Registered Legal Owner?",
      required: true,
      order: 3,
    },
    {
      id: "respondent_type",
      type: "dropdown",
      label: "Respondent Type",
      required: true,
      order: 4,
      options: ["Registered Owner", "Tenant", "Caretaker/Relative", "Squatter"],
    },
    {
      id: "respondent_name",
      type: "text",
      label: "Respondent Full Name",
      placeholder: "Full Name of person interviewed",
      required: true,
      order: 5,
    },
    {
      id: "respondent_phone",
      type: "phone",
      label: "Respondent Contact Phone Number",
      required: true,
      order: 6,
    },
    {
      id: "owner_name",
      type: "text",
      label: "Legal Owner Full Name",
      placeholder: "Owner's Full Name (If different from respondent)",
      required: true,
      order: 7,
      section: "owner_details",
      condition: { field: "is_legal_owner", value: false },
    },
    {
      id: "owner_phone",
      type: "phone",
      label: "Legal Owner Contact Phone Number",
      required: true,
      order: 8,
      section: "owner_details",
      condition: { field: "is_legal_owner", value: false },
    },
    {
      id: "account_standing",
      type: "dropdown",
      label: "Account Standing (Rates Paid up to date?)",
      required: true,
      order: 9,
      options: ["Yes", "No", "Unsure"],
    },
    {
      id: "action_taken",
      type: "dropdown",
      label: "Action Taken / Notice Served",
      required: false,
      order: 10,
      section: "account_action",
      condition: { field: "account_standing", value: "No" },
      options: [
        "Verbal warning given",
        "Left address flyer with resident",
        "Owner called directly on-site",
      ],
    },
    {
      id: "field_notes",
      type: "long_text",
      label: "Field Notes & Observations",
      placeholder: "Add any additional remarks or structural findings...",
      required: false,
      order: 11,
    },
  ],
  scripts: [
    {
      id: "intro",
      section: "intro",
      text: "Good day. I am representing Vevhu Resources. We are verifying property records for council urbanization. Are you the registered legal owner of this stand?",
    },
    {
      id: "owner_verified",
      section: "owner_verified",
      text: "✅ Registered Owner Verified: Please confirm contact details and rates standing below.",
      condition: { field: "is_legal_owner", value: true },
    },
    {
      id: "owner_details",
      section: "owner_details",
      text: "📋 Non-Owner Respondent (Tenant/Caretaker): Please record the legal owner's contact details below for council database verification.",
      condition: { field: "is_legal_owner", value: false },
    },
    {
      id: "account_action",
      section: "account_action",
      text: "⚠️ Regularization Required: Our records show your account needs regularization. Please visit our office within 7 days to formalize your standing.",
      condition: { field: "account_standing", value: "No" },
    },
  ],
};

export default function CollectScreen() {
  const { user } = useAuth();
  const { captureLocation } = useLocation();
  const formRef = useRef<DynamicFormRef>(null);

  const { data: schemaRows } = useWatchedQuery<{
    fields: string;
    scripts: string;
    version: number;
    name: string;
  }>("SELECT * FROM form_schemas WHERE is_active = 1 ORDER BY version DESC LIMIT 1");

  const activeSchema: FormSchema = useMemo(() => {
    if (schemaRows && schemaRows.length > 0 && schemaRows[0].fields) {
      try {
        const row = schemaRows[0];
        return {
          id: `dynamic-v${row.version}`,
          version: row.version,
          name: row.name || "Field Collection Form",
          is_active: true,
          published_at: new Date().toISOString(),
          fields: typeof row.fields === "string" ? JSON.parse(row.fields) : row.fields,
          scripts: row.scripts
            ? typeof row.scripts === "string"
              ? JSON.parse(row.scripts)
              : row.scripts
            : undefined,
        };
      } catch (err) {
        console.warn("[Collect] Failed to parse dynamic form schema, using default:", err);
      }
    }
    return DEFAULT_SCHEMA;
  }, [schemaRows]);

  const [photos, setPhotos] = useState<Array<{ uri: string; type: "stand" | "document" }>>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setPhotos([]);
    setAudioUri(null);
    setAudioDuration(0);
    setSignature(null);
    formRef.current?.reset?.();
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (photos.length < 1) {
        Alert.alert("Photo Required", "Please take at least one photo of the stand.");
        return;
      }

      setSaving(true);
      try {
        const gps = await captureLocation();
        const submissionId = uuid();
        const now = new Date().toISOString();

        const photosPayload = photos.map((p) => ({
          key: "",
          type: p.type,
          timestamp: now,
          local_path: p.uri,
        }));

        // Extract known fields; everything else goes into extra_fields
        const knownFields = new Set([
          "stand_number_official",
          "stand_number_physical",
          "respondent_type",
          "respondent_name",
          "respondent_phone",
          "is_legal_owner",
          "owner_name",
          "owner_phone",
          "account_standing",
          "action_taken",
          "field_notes",
        ]);
        const extraFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(formData)) {
          if (!knownFields.has(key)) {
            extraFields[key] = value;
          }
        }

        const str = (v: unknown): string | null => (v == null ? null : String(v));
        const boolToInt = (v: unknown): number => (v === true || v === 1 || v === "true" ? 1 : 0);

        const isOwner =
          boolToInt(formData.is_legal_owner) === 1 ||
          formData.respondent_type === "Registered Owner";
        const finalOwnerName = isOwner ? str(formData.respondent_name) : str(formData.owner_name);
        const finalOwnerPhone = isOwner
          ? str(formData.respondent_phone)
          : str(formData.owner_phone);

        await db.writeTransaction(async (tx) => {
          await tx.execute(
            `INSERT INTO submissions (id, worker_id, form_schema_version, stand_number_official, stand_number_physical, respondent_type, respondent_name, respondent_phone, is_legal_owner, owner_name, owner_phone, account_standing, action_taken, field_notes, extra_fields, gps_latitude, gps_longitude, gps_accuracy, photos, audio_recording_key, audio_duration_seconds, signature_key, status, collected_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              submissionId,
              user?.id || "a0000000-0000-0000-0000-000000000001",
              DEFAULT_SCHEMA.version,
              str(formData.stand_number_official),
              str(formData.stand_number_physical),
              str(formData.respondent_type) || (isOwner ? "Registered Owner" : "Tenant"),
              str(formData.respondent_name),
              str(formData.respondent_phone),
              isOwner ? 1 : 0,
              finalOwnerName,
              finalOwnerPhone,
              str(formData.account_standing),
              str(formData.action_taken),
              str(formData.field_notes),
              JSON.stringify(extraFields),
              gps?.latitude ?? null,
              gps?.longitude ?? null,
              gps?.accuracy ?? null,
              JSON.stringify(photosPayload),
              audioUri ? "" : null,
              audioDuration ? Math.floor(audioDuration / 1000) : null,
              signature ? "" : null,
              "pending",
              now,
            ],
          );

          // Queue photos for background upload
          for (const photo of photos) {
            await tx.execute(
              `INSERT INTO media_queue (id, submission_id, file_path, file_type, file_size, upload_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [uuid(), submissionId, photo.uri, "photo", 0, "pending", now],
            );
          }

          // Queue audio for background upload if present
          if (audioUri) {
            await tx.execute(
              `INSERT INTO media_queue (id, submission_id, file_path, file_type, file_size, upload_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [uuid(), submissionId, audioUri, "audio", 0, "pending", now],
            );
          }

          // Queue signature for background upload if present
          if (signature) {
            await tx.execute(
              `INSERT INTO media_queue (id, submission_id, file_path, file_type, file_size, upload_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [uuid(), submissionId, signature, "signature", 0, "pending", now],
            );
          }
        });

        // Trigger immediate background processing of queued media files
        processMediaQueue().catch((err) =>
          console.warn("[MediaSync] Immediate queue processing error:", err),
        );

        Alert.alert(
          "Saved!",
          "Record saved successfully. It will sync automatically with the dashboard.",
          [{ text: "Collect Another", onPress: resetForm }, { text: "Done" }],
        );
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to save record");
      } finally {
        setSaving(false);
      }
    },
    [photos, audioUri, audioDuration, signature, user, captureLocation, resetForm],
  );

  const handleSavePress = useCallback(() => {
    // Delegate to react-hook-form's handleSubmit via the ref — this runs
    // validation on all registered fields before calling handleFormSubmit.
    formRef.current?.submit();
  }, []);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <DynamicForm
        ref={formRef}
        schema={activeSchema}
        onSubmit={handleFormSubmit}
        defaultValues={{ is_legal_owner: true, account_standing: "Yes" }}
      />

      <View style={styles.mediaSection}>
        <PhotoCapture photos={photos} onPhotosChange={setPhotos} minRequired={1} />

        <AudioRecorder
          onRecordingComplete={(uri, duration) => {
            setAudioUri(uri);
            setAudioDuration(duration);
          }}
        />

        <SignaturePad onSignature={setSignature} />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSavePress}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Record Offline"}</Text>
      </TouchableOpacity>

      <View style={{ height: (useSafeAreaInsets().bottom || 16) + 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mediaSection: { paddingHorizontal: 16 },
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: COLORS.primaryForeground, fontSize: 18, fontWeight: "700" },
  bottomSpacer: { height: 40 },
});
