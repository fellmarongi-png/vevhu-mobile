import { useQuery } from "@powersync/react-native";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useContext } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../src/services/powersync";
import { AuthContext } from "../_layout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read_by: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isReadByUser(is_read_by: string | null, userId: string): boolean {
  if (!is_read_by || !userId) return false;
  // is_read_by is stored as a JSON array string, e.g. '["uuid1","uuid2"]'
  return is_read_by.includes(userId);
}

function safeRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AnnouncementsScreen() {
  const { session } = useContext(AuthContext);
  const userId = session?.user?.id ?? "";

  const { data: announcements, isLoading } = useQuery<Announcement>(
    "SELECT * FROM announcements ORDER BY created_at DESC",
  );

  const unreadCount = (announcements ?? []).filter(
    (a) => !isReadByUser(a.is_read_by, userId),
  ).length;

  const markAsRead = useCallback(
    async (item: Announcement) => {
      if (!userId || isReadByUser(item.is_read_by, userId)) return;

      try {
        // Parse existing readers (gracefully handle malformed JSON)
        let readers: string[] = [];
        if (item.is_read_by) {
          try {
            const parsed = JSON.parse(item.is_read_by);
            if (Array.isArray(parsed)) readers = parsed;
          } catch {
            // is_read_by was not valid JSON — start fresh
          }
        }

        if (!readers.includes(userId)) {
          readers.push(userId);
        }

        await db.execute("UPDATE announcements SET is_read_by = ? WHERE id = ?", [
          JSON.stringify(readers),
          item.id,
        ]);
      } catch (err) {
        console.warn("[Announcements] markAsRead error:", err);
      }
    },
    [userId],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Announcements</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} unread</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading…</Text>
        </View>
      ) : (announcements ?? []).length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No announcements yet</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const read = isReadByUser(item.is_read_by, userId);
            return (
              <TouchableOpacity
                style={[styles.card, !read && styles.cardUnread]}
                onPress={() => markAsRead(item)}
                activeOpacity={0.75}
              >
                {!read && <View style={styles.unreadDot} />}
                <Text style={[styles.cardTitle, !read && styles.cardTitleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardDate}>{safeRelativeTime(item.created_at)}</Text>
                {!read && <Text style={styles.tapHint}>Tap to mark as read</Text>}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 8,
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#333" },
  badge: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  list: { padding: 16, paddingTop: 8 },

  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1976D2",
  },
  cardTitle: { fontSize: 16, fontWeight: "500", color: "#444", marginRight: 16 },
  cardTitleUnread: { fontWeight: "700", color: "#1a1a1a" },
  cardMessage: { fontSize: 14, color: "#666", marginTop: 6, lineHeight: 20 },
  cardDate: { fontSize: 12, color: "#999", marginTop: 8 },
  tapHint: { fontSize: 11, color: "#1976D2", marginTop: 6, fontStyle: "italic" },
});
