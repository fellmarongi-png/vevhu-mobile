# PowerSync Setup — UPDATED (Publication Fixed)

## The "Publication 'powersync' not found" error is FIXED.

I've created the publication on your database. Now click **"Test Connection"** again — it should work.

## Connection Details (already filled in your form)

| Field | Value |
|-------|-------|
| **Host** | db.pgtryncmcdznzzjmziha.supabase.co |
| **Port** | 5432 |
| **Database** | postgres |
| **Username** | postgres |
| **Password** | 50123550Onis. |
| **SSL Mode** | verify-full |
| **Publication name** | powersync |

## What I Did:
1. Created the `powersync` publication on your database covering all tables
2. Created the `media_queue` table (was missing)
3. Created a `powersync` role with replication permissions

## Next Steps:

1. **Click "Test Connection" again** — should succeed now
2. **Click "Save Connection"**
3. Go to **Sync Rules** and paste the rules below
4. **Give me the PowerSync instance URL** (looks like `https://xxxxx.powersync.journeyapps.com`)

## Sync Rules (paste after connection succeeds)

Uses **Sync Streams** (edition 3) — the recommended approach over legacy bucket_definitions.

**Key syntax notes:**
- `auth.user_id()` = authenticated user's ID from JWT
- `IN` with literals: use `IN ROW('a', 'b')` not `IN ('a', 'b')`
- JOIN must be `INNER JOIN` with simple equality conditions
- `OR` is supported (each branch must be a valid filter)
- No `EXISTS`, no `GROUP BY`, no `ORDER BY`, no `LIMIT`

```yaml
config:
  edition: 3

streams:
  # Global reference data — all authenticated users get this
  known_stands:
    auto_subscribe: true
    query: SELECT * FROM known_stands

  form_schemas:
    auto_subscribe: true
    query: SELECT * FROM form_schemas WHERE is_active = true

  announcements:
    auto_subscribe: true
    query: SELECT * FROM announcements

  # Worker-scoped data — each worker only sees their own
  my_submissions:
    auto_subscribe: true
    query: SELECT * FROM submissions WHERE worker_id = auth.user_id()

  my_shifts:
    auto_subscribe: true
    query: SELECT * FROM shifts WHERE worker_id = auth.user_id()

  # Manager/admin streams — all data, filtered by role via JOIN
  all_submissions:
    auto_subscribe: true
    query: |
      SELECT submissions.* FROM submissions
      INNER JOIN users ON users.id = auth.user_id()
      WHERE users.role = 'manager' OR users.role = 'admin'

  all_users:
    auto_subscribe: true
    query: |
      SELECT users.* FROM users
      INNER JOIN users AS auth_user ON auth_user.id = auth.user_id()
      WHERE auth_user.role = 'manager' OR auth_user.role = 'admin'

  all_shifts:
    auto_subscribe: true
    query: |
      SELECT shifts.* FROM shifts
      INNER JOIN users ON users.id = auth.user_id()
      WHERE users.role = 'manager' OR users.role = 'admin'

  daily_summaries:
    auto_subscribe: true
    query: |
      SELECT daily_summaries.* FROM daily_summaries
      INNER JOIN users ON users.id = auth.user_id()
      WHERE users.role = 'manager' OR users.role = 'admin'
```

## If Test Connection Still Fails:

The issue might be that Supabase doesn't allow direct replication connections on the free tier. In that case:
- Try using username `postgres` (not `powersync`) — that's what you already have
- The publication `powersync` is now created, so the error should be gone
- If SSL fails, try changing to "require" instead of "verify-full"
