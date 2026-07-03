# Vevhu Resources - Field Data Collection App
## Project Proposal for Management Review

---

### What Is This?

A mobile app for our field workers to collect property verification data in the field — even without internet. All data syncs automatically to a central system where managers can monitor progress, view reports, and download Excel summaries in real time.

---

### The Problem We're Solving

| Current Challenge | How The App Solves It |
|-------------------|----------------------|
| Paper forms get lost or damaged | Everything saved digitally on the phone |
| No way to verify workers visited a stand | GPS automatically records location + photos required |
| Data takes days/weeks to reach the office | Syncs instantly when worker has signal |
| No real-time visibility on team performance | Manager dashboard shows live progress |
| Can't work in areas with no network | App works 100% offline, syncs later |
| Manual Excel data entry at the office | App writes directly to master Excel |
| No proof of resident interaction | Audio recording + signature capture |
| Rigid forms can't be updated easily | Manager can add/remove fields without developer |
| No way to validate Agreement of Sale | App checks if agreement is from Vevhu and issued 2025+ |
| Payment history scattered across paper records | App tracks payment patterns per client |
| No checklist to ensure all steps done | Admin-configurable checklist per visit |

---

### What The System Does

#### For Field Workers (Phone App)

1. **Login** with their name and a 4-digit PIN
2. **Fill in property data** — stand number, respondent details, ownership status
3. **Verify Agreement of Sale** — is it from Vevhu Resources? Was it issued since 2025? (Only Vevhu-issued agreements from 2025 onwards are valid)
4. **Record payment status** — when they last paid, if they owe, why they're not paying
5. **Complete visit checklist** — admin-set checklist ensuring all verification steps are done
6. **Note council status** — has the client visited the council?
7. **Encourage office visit** — record that client was told to visit Vevhu office to sort papers
8. **Take photos** of the stand and any documents shown
9. **Record the conversation** (with resident's knowledge) for verification
10. **Capture resident's signature** on screen as proof of visit
11. **GPS is recorded automatically** — proves the worker was physically there
12. **Works without any internet** — data saved safely on the phone
13. **Syncs automatically** whenever phone gets signal (even 2G)
14. **See their own progress** — daily counts, targets, personal stats

#### For Managers (Web Dashboard - Any Browser)

1. **Live view** of all submissions coming in from the field
2. **Worker performance** — who is collecting, who is idle, daily targets
3. **Map view** — see GPS pins of every stand visited, filter by worker/date/status
4. **Agreement tracking** — quickly see which clients have valid Vevhu agreements
5. **Payment overview** — identify non-paying clients and reasons
6. **Listen to recordings** and view photos/signatures for quality control
7. **Download master Excel** — filtered by date, worker, area, status
8. **Add/remove form fields** — change what workers fill in, no developer needed
9. **Edit checklist items** — add/remove/reorder verification steps that workers must complete
10. **Import existing data** — upload known stand numbers, owner records from Excel
11. **Send announcements** — broadcast messages to all workers or specific teams
12. **Daily summary** — automatic report with team stats
13. **Flag and manage records** — mark items for follow-up, dispute, or completion
14. **User profile & settings** — dark/light mode, password change

---

### What The Worker Sees On Screen

**Step 1:** Login → Enter name and 4-digit PIN

**Step 2:** Start collection → App shows a guided script:

> "Good day. I am from Vevhu Resources. We are verifying property records ahead of council urbanization and rates assessment. Are you the registered owner of this stand?"

**Step 3:** Fill in the form (the script updates based on answers):
- Stand number (official + physical)
- Respondent name, phone, type (owner/tenant/caretaker/squatter)
- If not the owner → script prompts for owner details

**Step 4:** Agreement of Sale verification:
> "Do you have an Agreement of Sale from Vevhu Resources? Only agreements issued by Vevhu since 2025 are valid."
- Has agreement? → From Vevhu or other source? → Year issued?
- If not from Vevhu or pre-2025 → flagged as invalid

**Step 5:** Payment status:
> "We need to verify your payment records. When did you last make a payment?"
- Up to date / Owing but paying / Owing not paying / Never paid
- If not paying → record reason (financial difficulty, dispute, unaware, waiting for papers, other)

**Step 6:** Council & office follow-up:
- Has client gone to the council? (Yes/No/Unknown)
- Encourage client to visit Vevhu office to sort papers
> "Please visit the Vevhu Resources office to sort out your papers. Bring your Agreement of Sale and any payment receipts."

**Step 7:** Complete checklist (pre-set by admin):
- [ ] Agreement of Sale verified
- [ ] Agreement is from Vevhu (2025+)
- [ ] Payment status confirmed
- [ ] Council visit status recorded
- [ ] Client told to visit office
- [ ] Photos taken
- [ ] GPS location captured

**Step 8:** Take photos (minimum 1 required), optionally record conversation

**Step 9:** Resident signs on screen

**Step 10:** Hit "Save" → GPS captured, record stored, ready for next stand

---

### How Data Gets to the Office

```
Worker fills form on phone (no internet needed)
         ↓
Data saved safely on phone
         ↓
Phone detects internet (even brief 2G signal)
         ↓
Data syncs automatically to central database
         ↓
Appears instantly on Manager Dashboard
         ↓
Manager downloads Excel report anytime
```

If a worker has no signal for 3 days — no problem. All data is stored safely on the phone. The moment they get signal (even at home on WiFi), everything uploads automatically.

---

### Security & Verification Features

| Feature | What It Proves |
|---------|---------------|
| GPS coordinates on every record | Worker physically visited the stand |
| Mandatory photo before saving | Visual proof of the property |
| Audio recording option | Verifiable record of what was discussed |
| Signature capture | Resident acknowledges the visit |
| Timestamp on every record | Exact time of visit |
| Agreement of Sale validation | Only Vevhu-issued (2025+) agreements accepted |
| Payment pattern tracking | Clear record of who owes and why |
| Admin-controlled checklist | Ensures every required step is completed |
| Duplicate detection | Prevents same stand being recorded twice |
| Worker-specific login | Every record tied to a specific person |

---

### What Managers Can Control (Without a Developer)

| Action | How |
|--------|-----|
| Add a new question to the form | Drag and drop in Form Builder |
| Remove a question | Delete button in Form Builder |
| Change dropdown options | Edit in Form Builder |
| Update the talking scripts | Edit text in Form Builder |
| Edit the visit checklist | Add/remove/reorder items in Form Builder |
| Add a new field worker | Enter name, phone, assign zone, set PIN |
| Remove a field worker | Deactivate in Worker Management |
| Set daily collection targets | Number input per worker |
| Import known stand data | Upload Excel/CSV file |
| Send message to all workers | Type and broadcast |
| Delete an announcement | Delete button on each announcement |
| Download filtered reports | Select filters, click Export |
| Change dashboard theme | Light/Dark/System in Settings |
| Update password | Settings page |

---

### Monthly Running Costs

| Service | What It Does | Monthly Cost |
|---------|-------------|-------------|
| Database & login system (Supabase) | Stores all data, manages user accounts | Free |
| Photo & audio storage (Supabase Storage) | Stores up to 1GB of media files | Free |
| Offline sync engine (PowerSync) | Keeps phones synced with database | Free (up to 50 users) |
| Manager dashboard hosting (Vercel) | Runs the web dashboard | Free |
| Map display (MapLibre + OpenStreetMap) | Shows GPS locations on a map | Free (unlimited) |
| **Total** | | **$0/month** |

All services are on free tiers that cover our needs for up to 50 field workers. No credit card required. If we scale beyond 50 workers, costs increase to approximately $25-50/month.

---

### One-Time Setup Costs

| Item | Cost |
|------|------|
| Domain name (optional) | ~$10/year |
| Expo developer account (optional, for OTA updates) | Free |
| **Total one-time** | **$0-10** |

No cloud server costs — app is built locally on existing hardware.

---

### What Workers Need

| Requirement | Details |
|-------------|---------|
| Phone | Any Android phone (version 8.0 or newer, 2017+) |
| Storage | ~100MB for the app + space for photos |
| Internet | NOT required for daily work. Only needed briefly to sync |
| Training | 15-minute walkthrough (login, fill form, take photo, save) |

Workers do NOT need:
- Constant internet
- Expensive phones
- Technical knowledge
- App store access (app installed directly via APK)

---

### Data Collected Per Visit

| Field | Example |
|-------|---------|
| Stand number (official) | 1234 |
| Stand number (on-site) | 1234A |
| Respondent type | Tenant |
| Respondent name | John Moyo |
| Respondent phone | 0771234567 |
| Is legal owner? | No |
| Owner name | Peter Ncube |
| Owner phone | 0772345678 |
| **Agreement of Sale** | **Yes - From Vevhu Resources** |
| **Agreement year** | **2025** |
| **Payment status** | **Owing - not paying** |
| **Reason not paying** | **Financial difficulty** |
| **Has visited council** | **No** |
| **Encouraged to visit office** | **Yes** |
| **Checklist completed** | **7/7 items checked** |
| Field notes | Gate was locked, spoke through fence |
| GPS coordinates | -17.8292, 31.0522 |
| Photos | 2 photos attached |
| Audio recording | 4 min 32 sec |
| Signature | Captured |
| Date & time | 2026-07-01 10:34 AM |
| Worker name | Tendai Mhaka |

All of this exports cleanly to one Excel row per visit.

---

### Technology Stack (For IT Reference)

| Component | Technology | Cost |
|-----------|-----------|------|
| Mobile App | React Native / Expo SDK 57 | Free |
| Offline Database | PowerSync + SQLite | Free |
| Backend Database | Supabase (PostgreSQL) | Free tier |
| Media Storage | Supabase Storage | Free tier |
| Web Dashboard | Next.js 16 + shadcn/ui | Free |
| Maps | MapLibre GL (OpenStreetMap) | Free |
| Hosting | Vercel | Free tier |
| Authentication | Supabase Auth (PIN-based for workers, email for managers) | Free |

---

### Timeline

| Phase | What Gets Done | Status |
|-------|---------------|--------|
| 1 | Database setup, accounts system, PowerSync sync | Done |
| 2 | Core phone app (forms, GPS, login) | Done |
| 3 | Photos, audio recording, signatures | Done |
| 4 | Offline sync engine | Done |
| 5 | Manager dashboard (live data, Excel export) | Done |
| 6 | Maps, charts, analytics | Done |
| 7 | Form builder, data import, checklist | Done |
| 8 | Agreement of Sale + Payment tracking fields | Done |
| 9 | Mobile app APK build & testing | In Progress |
| 10 | Deployment to Vercel + field testing | Next |

A working version with basic collection and sync is **ready now**.
Full testing on physical Android devices is **in progress**.

---

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Worker loses phone | Data syncs frequently; if lost after sync, nothing is lost. If lost before sync, only that day's data at risk |
| Phone runs out of battery | Audio + GPS use minimal battery. Worker should charge nightly |
| Very remote area with no signal for weeks | App holds unlimited data locally. Syncs at home/town |
| Worker fabricates data | GPS proves location, mandatory photos prove presence, audio proves conversation, checklist ensures process followed |
| Resident refuses to be recorded | Recording is optional and manual. Worker can proceed without it |
| Form needs to change mid-operation | Manager updates form instantly from dashboard — no developer needed |
| Invalid agreement of sale presented | App validates: must be from Vevhu Resources, issued 2025 or later |
| App needs a bug fix | Over-the-air updates push to phones without reinstalling |

---

### Summary

This system replaces paper-based field collection with a proven, modern digital workflow that:

- **Never loses data** (stored on phone + cloud)
- **Proves work was done** (GPS + photos + audio + signatures + checklist)
- **Validates agreements** (only Vevhu-issued 2025+ agreements accepted)
- **Tracks payments** (who owes, why not paying, when last paid)
- **Ensures process compliance** (admin-configurable checklist)
- **Works anywhere** (no internet required in the field)
- **Gives managers instant visibility** (live dashboard + Excel export)
- **Adapts without a developer** (form builder + checklist editor for managers)
- **Costs nothing to run** ($0/month on free tiers)
- **Works on any Android phone** (no special hardware needed)

---

*Prepared by: IT Department*
*Date: July 2026*
*System: Vevhu Field Collection Platform*
