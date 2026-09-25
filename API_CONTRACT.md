# ResearchMind AI — Backend API Contract

**Purpose:** this document is the complete specification of the HTTP API the
ResearchMind frontend expects. It was derived directly from the frontend source
tree, so every field name, enum value and status string here is what the UI
actually reads.

**How the frontend is wired today (important context):**

- There is **no HTTP client yet**. Zero `fetch`, zero axios, zero react-query.
  All data access goes through two mock service modules:
  - `src/services/researchService.ts`
  - `src/services/billingService.ts`
- Those modules are explicitly documented as "written to be swapped for HTTP
  calls" — every function already returns a `Promise` and every component calls
  them from a `useEffect`. **Swapping the implementation is the only change
  required; no component redesign is needed.**
- The canonical type definitions live in:
  - `src/types/research.ts` — the source of truth for all research schemas
  - `src/types/billing.ts` — the source of truth for all billing schemas
- Example payloads for every schema live in `src/data/mock*.ts`. These are
  literal reference payloads you can use to write your seeders and tests.

**How to read this document:**

| Section | Contents |
| --- | --- |
| [1. Conventions](#1-conventions) | Base URL, headers, auth, error envelope, pagination |
| [2. Auth](#2-auth) | Session, OAuth, user profile |
| [3. Projects](#3-projects) | Project CRUD |
| [4. Documents](#4-documents) | Upload, list, delete, reprocess, transcripts |
| [5. Participants](#5-participants) | Participant roster |
| [6. Analysis](#6-analysis) | Themes, codes, relationships, evidence |
| [7. Chat](#7-chat) | Conversations, messages, AI answers, voice |
| [8. Reports](#8-reports) | Report generation, retrieval, export |
| [9. Billing](#9-billing) | Plans, subscription, usage, invoices, portal |
| [10. Misc](#10-misc) | Search, settings, help, sales |
| [11. Full endpoint index](#11-full-endpoint-index) | Every route on one page |
| [12. Non-functional notes](#12-non-functional-notes) | Real-time, limits, i18n, data residency |

**Endpoint tiers** used throughout:

- **T1 — Required.** The frontend calls this today. A mock function exists.
- **T2 — Implied.** The UI has a button for it that currently fires a
  "coming soon" toast. You will need these to make the UI complete.
- **T3 — Optional.** Speculative; not present in any UI. Design freely.

---

## 1. Conventions

### 1.1 Base URL

Not yet defined. The frontend has **no environment variable and no API client**.
Recommended, and what the code comments imply:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

| Item | Value |
| --- | --- |
| Proposed dev base | `http://localhost:8000/api/v1` |
| Proposed prod base | `https://api.researchmind.ai/api/v1` |
| Path prefix | `/api/v1` |
| Content type | `application/json; charset=utf-8` (except multipart) |

> The project ships as a static SPA behind nginx (`nginx.conf`, `Dockerfile`).
> `nginx.conf` currently has **no** `proxy_pass`, and its `try_files` fallback
> would swallow `/api/*` requests and return `index.html`. You must add a
> `location /api/ { proxy_pass ... }` block (or a Vite dev proxy in
> `vite.config.ts`) before anything will work.

### 1.2 Authentication

The current prototype stores `{ name, email }` in `localStorage` under
`researchmind.auth.user` and defines `isAuthenticated` as "is that key
non-null". **There is no token of any kind.** You get to design this properly.

Recommended scheme, which fits the existing call sites without changing them:

```
Authorization: Bearer <access_token>
```

| Aspect | Recommendation |
| --- | --- |
| Token type | JWT access token (short-lived, ~15 min) |
| Refresh | `HttpOnly` + `Secure` + `SameSite=Lax` cookie, or a rotating refresh token |
| Transport | HTTPS only |
| Storage | Prefer `HttpOnly` cookie; the frontend would then only need `credentials: 'include'` |
| Revocation | Server-side session table (needed for a real logout) |

Every research endpoint below requires authentication. Anonymous visitors see
an empty workspace (`onlyForUsers` in `researchService.ts:35` returns `[]`) and
are limited to **1 free action** — one chat message or one upload batch — after
which the login modal opens. See [§7.5](#75-anonymous-free-tier).

### 1.3 Required headers

```http
GET /api/v1/projects HTTP/1.1
Host: api.researchmind.ai
Authorization: Bearer eyJhbGciOi...
Accept: application/json
Content-Type: application/json      # for requests with a body
```

| Header | Direction | Required | Notes |
| --- | --- | --- | --- |
| `Authorization` | request | yes (T1 research routes) | `Bearer <token>` |
| `Accept` | request | recommended | `application/json` |
| `Content-Type` | request | on bodies | `application/json` or `multipart/form-data` |
| `X-Request-Id` | request | recommended | client-generated UUID, echo in response for tracing |
| `X-Idempotency-Key` | request | recommended on POSTs | prevents duplicate charges/uploads on retry |
| `RateLimit-Limit` | response | recommended | see [§12](#12-non-functional-notes) |
| `RateLimit-Remaining` | response | recommended | |
| `RateLimit-Reset` | response | recommended | |

### 1.4 Response envelope

**Important:** every T1 list endpoint returns a **bare JSON array**, not an
envelope. The frontend assigns the response directly to array state, e.g.
`src/pages/Projects.tsx:23`:

```ts
listProjects().then((result) => {
  setProjects(result)      // result must BE the array
})
```

The same is true for `listDocuments`, `listThemes`, `listThemeRelationships`,
`listReports`, `listConversations`, `listParticipants`, `listBillingPlans`,
`listInvoices`, and `getMessages`.

So:

```jsonc
// GET /api/v1/projects  ->  200
[ { "id": "healthcare-access", "name": "Healthcare Access Study", ... } ]
```

If you prefer a paginated envelope such as `{ "data": [...], "meta": {...} }`,
the frontend must be updated to unwrap it. For the T1 routes that is a ~6-line
change in each mock service function. For T2+ routes you are free to use an
envelope.

Suggested error envelope (safe to add now — the frontend has no error handling
at all, so anything goes, but this is a good default):

```jsonc
{
  "error": {
    "code": "validation_error",     // stable, machine-readable, snake_case
    "message": "Name is required.",  // human-readable, safe to show in a toast
    "fieldErrors": {                 // optional, per-field
      "name": ["Name is required."]
    },
    "requestId": "req_01JBXYZ..."
  }
}
```

### 1.5 Status codes

| Code | When |
| --- | --- |
| `200 OK` | successful read, or successful POST that returns a body |
| `201 Created` | successful creation with a resource in the body |
| `202 Accepted` | long-running job started (upload, transcription, report generation) |
| `204 No Content` | successful DELETE |
| `400 Bad Request` | malformed request |
| `401 Unauthorized` | missing/expired/invalid token |
| `403 Forbidden` | authenticated but not permitted (plan limit, not a project member) |
| `404 Not Found` | resource does not exist **or** is not visible to this user |
| `409 Conflict` | duplicate name, already-processing document |
| `413 Payload Too Large` | upload exceeds size limit |
| `415 Unsupported Media Type` | unsupported file extension/MIME type |
| `422 Unprocessable Entity` | semantic validation failure |
| `429 Too Many Requests` | rate or quota limit hit — return `Retry-After` |
| `500 / 502 / 503` | server error / upstream AI provider error / maintenance |

### 1.6 Pagination

No T1 endpoint paginates today — every one returns the complete list. If you
add pagination, note that the frontend renders whatever array it receives and
has **no "load more" control**, so partial lists will look like data loss.

Recommended for now: no pagination on the list endpoints below (dataset sizes
are small), but do design for it:

```jsonc
{
  "data": [ /* ... */ ],
  "meta": { "page": 1, "pageSize": 25, "total": 412, "totalPages": 17 }
}
```

If you must paginate `GET /projects/{id}/documents` (uploads can grow large),
you need to add a pagination control to `src/pages/ResearchData.tsx` in the
same change.

### 1.7 Date & number formats

| Type | Format | Example |
| --- | --- | --- |
| All timestamps | ISO 8601, **UTC**, with milliseconds, `Z` suffix | `"2026-09-17T09:20:00.000Z"` |
| All `Evidence.timestamp` | `mm:ss` **or** `hh:mm:ss` string offset, **not** a date | `"04:32"`, `"1:12:07"` |
| `Evidence.page` | integer | `4` |
| `fileSize` | **pre-formatted display string** — see warning below | `"2.4 MB"` |
| `Invoice.amount` | number, major currency units, unrounded | `19` |
| `confidence`, `strength`, `relevance` | float `0`–`1`, 2 dp | `0.94` |

> ### ⚠️ `fileSize` is a formatted string, not bytes
>
> `ResearchDocument.fileSize` is typed `string` (`src/types/research.ts:48`) and
> the UI renders it directly. Observed values: `"128 KB"`, `"2.4 MB"`,
> `"412 MB"`. **You must return a pre-formatted string**, not an integer byte
> count, or the UI will show raw numbers.
>
> Recommended: return the display string as the field, and additionally expose
> `fileSizeBytes` as a real integer for any future logic. The frontend ignores
> unknown fields, so this is safe.
>
> The current mock derives it as `${Math.max(1, Math.round(size / 1024))} KB`
> (`researchService.ts:169`) — a deliberate simplification for a prototype that
> never actually handles bytes. Do not copy that formula; format properly
> (use 1024 for KB, 1048576 for MB, 1 dp below 10, 0 dp above).

### 1.8 Enum values (exhaustive — these are hard-coded in the UI)

| Type | Allowed values |
| --- | --- |
| `DocumentStatus` | `processing` \| `processed` \| `failed` |
| `DocumentKind` | `interview` \| `focus_group` \| `survey` \| `notes` \| `audio` \| `video` \| `pdf` \| `docx` \| `csv` |
| `ChatMessage.role` | `user` \| `assistant` |
| `ResearchProject.status` | `active` \| `archived` |
| `ResearchReport.status` | `draft` \| `final` |
| `SubscriptionStatus` | `active` \| `trialing` \| `past_due` \| `cancelled` |
| `BillingInterval` | `monthly` \| `annual` |
| `Invoice.status` | `paid` \| `open` \| `refunded` |
| `Participant` fields | `age: number \| null`, `location: string \| null` — **both optional** |

`ResearchDocument.type` is a free-text display label, **not** an enum. Observed
values: `Interview`, `Focus Group`, `Survey`, `Research Notes`. The UI's filter
chips are hard-coded to exactly these four (`ResearchData.tsx:13`), and
filtering is an exact `===` match — see [§4.1](#41-get-projectsprojectiddocuments).

---

## 2. Auth

The prototype's login form collects only a name and an email, with no password
field, and the "Sign in with Google" / "Sign in with GitHub" buttons hard-code
a name and email without launching any OAuth flow (`LoginForm.tsx:98-113`).
There is **no register flow and no logout endpoint**. All of the below is T2 —
you are building the real thing, not matching existing code.

### 2.1 `POST /auth/login` — T2

Email + password sign-in.

```jsonc
// Request
{
  "email": "t.moyo@university.ac.zw",
  "password": "correct-horse-battery-staple"
}
```

```jsonc
// 200
{
  "user": {
    "id": "usr_01JBXYZ...",
    "name": "Dr. T. Moyo",
    "email": "t.moyo@university.ac.zw",
    "role": "lead_researcher",      // see note
    "avatarUrl": null,
    "title": "Lead Researcher",
    "organization": "University of Zimbabwe",
    "createdAt": "2026-01-08T11:20:00.000Z"
  },
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 900                   // seconds
}
```

> The current `AuthUser` interface is only `{ name, email }`
> (`src/auth/AuthContext.tsx:4`). The extra fields above are additive and safe.
> The `role` values the UI's plan language implies: `researcher`, `lead_researcher`,
> `admin`, `owner`. Note the prototype hard-codes the display string
> `'Lead Researcher · Healthcare Access Study'` in `Settings.tsx:121`.

**Responses:** `400` invalid credentials · `401` bad credentials · `403`
account disabled · `429` rate-limited (lockout protection — this endpoint is
the primary brute-force target).

### 2.2 `POST /auth/register` — T2

```jsonc
// Request
{
  "name": "Dr. T. Moyo",
  "email": "t.moyo@university.ac.zw",
  "password": "correct-horse-battery-staple",
  "organization": "University of Zimbabwe"   // optional
}
```

```jsonc
// 201 — identical body to 2.1
```

**Responses:** `409` email already registered · `422` weak password.

### 2.3 `POST /auth/oauth/{provider}` — T2

`provider` ∈ `google` | `github`. Recommended: return an authorization URL and
let the client redirect.

```jsonc
// 200
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...&state=<csrf>"
}
```

Callback: `GET /auth/callback/{provider}?code=...&state=...` → `200` with the
same body as `2.1`. Use PKCE + `state` CSRF protection.

### 2.4 `POST /auth/logout` — T2

Revokes the server-side session. `204 No Content`.

The frontend calls `logout()` locally, which removes `researchmind.auth.user`
from `localStorage` and navigates to `/` (`Sidebar.tsx:50-54`).

> **Known frontend bug worth fixing alongside the backend work:**
> `researchmind.usage.count` is **not** cleared on logout
> (`AuthContext.tsx:48-51` removes only `AUTH_USER_KEY`). Once auth is real,
> this counter should come from `GET /billing/subscription` → `usage[]` instead
> of `localStorage`, which removes the bug and the whole free-tier mechanism in
> one change. See [§7.5](#75-anonymous-free-tier).

### 2.5 `GET /auth/me` — T2

Session restore on page load. Returns the `user` object from §2.1, unwrapped.

The current session restore is a lazy `useState` initializer reading
`localStorage` (`AuthContext.tsx:27-34`). Replace it with this call plus a token
refresh, and the app survives tab closes and device switches.

**Responses:** `401` no valid session.

### 2.6 `PATCH /auth/password` — T3

```jsonc
{ "currentPassword": "...", "newPassword": "..." }
```

`204 No Content`.

### 2.7 `POST /auth/forgot-password` / `POST /auth/reset-password` — T3

```jsonc
// forgot
{ "email": "t.moyo@university.ac.zw" }
// -> 202, always, regardless of whether the email exists (no enumeration)

// reset
{ "token": "...", "password": "..." }
// -> 204
```

---

## 3. Projects

### 3.1 `ResearchProject` schema

```jsonc
{
  "id": "healthcare-access",                  // string, url-safe, used in the path
  "name": "Healthcare Access Study",
  "description": "Understanding the barriers that affect access to primary healthcare among young people in urban and rural communities.",
  "documentCount": 24,                        // int, total uploaded files
  "participantCount": 41,                     // int, DISTINCT participants across ALL data
  "interviewCount": 18,                       // int
  "focusGroupCount": 3,                       // int
  "themes": [                                 // string[] — theme NAMES, not ids
    "Financial Barriers", "Geographic Access", "Healthcare Quality",
    "Cultural Beliefs", "Waiting Times"
  ],
  "codes": [                                  // string[] — code NAMES, not ids
    "Transport costs", "Consultation fees", "Medication costs",
    "Distance to clinic", "Staff availability"
  ],
  "status": "active",                         // 'active' | 'archived'
  "createdAt": "2026-05-12T08:00:00.000Z",
  "updatedAt": "2026-09-17T09:20:00.000Z"
}
```

> **`themes` and `codes` are arrays of plain strings, not objects.** This is
> easy to get wrong: the full theme objects live in `ResearchTheme`
> (`src/types/research.ts:103`) and the full code objects in `ResearchCode`
> (`:97`), but inside a `ResearchProject` they are denormalised to bare names.
> `ProjectOverview.tsx:97` renders `project.themes` directly as text. Your
> denormalised names must match the `name` field of the corresponding
> `ResearchTheme` / `ResearchCode` exactly, or the cross-references break.

> **The four count fields are denormalised aggregates.** If the frontend has to
> fetch documents and themes to build a project card, every project page does
> an N+1. Compute and store them. `updatedAt` must be bumped whenever any
> document, theme or report in the project changes — it drives the "updated
> 2 days ago" label on the project card (`ProjectCard.tsx:44`).

### 3.2 `GET /projects` — **T1**

Called by `Projects.tsx:23` (project grid), `ResearchData.tsx:37` (to resolve
project names for the data table), and `Sidebar.tsx:62`.

No request body, no query parameters. Returns a bare array, newest
`updatedAt` first.

```jsonc
// 200
[
  {
    "id": "healthcare-access",
    "name": "Healthcare Access Study",
    "description": "Understanding the barriers that affect access to primary healthcare among young people in urban and rural communities.",
    "documentCount": 24,
    "participantCount": 41,
    "interviewCount": 18,
    "focusGroupCount": 3,
    "themes": ["Financial Barriers", "Geographic Access", "Healthcare Quality", "Cultural Beliefs", "Waiting Times"],
    "codes": ["Transport costs", "Consultation fees", "Medication costs", "Distance to clinic", "Staff availability"],
    "status": "active",
    "createdAt": "2026-05-12T08:00:00.000Z",
    "updatedAt": "2026-09-17T09:20:00.000Z"
  }
  // ... 5 more in the reference seed
]
```

**Responses:** `401` unauthenticated.

> The project grid is empty for anonymous visitors, and the empty state reads
> *"Create a project to see your research workspace"* — so returning `[]` rather
> than `401` for guests is acceptable, but `401` is more correct and the
> frontend already gates the screen on `isAuthenticated` first.

### 3.3 `POST /projects` — **T1 (mocked locally)**

The "New project" modal in `Projects.tsx:52-78` fabricates the object in the
browser and prepends it to local state. It is lost on reload — the UI says so
explicitly at `Projects.tsx:169`: *"projects are stored locally and reset when
you reload the page"*. **This is the first thing to wire up.**

Only two fields are collected (`Projects.tsx:17-19`):

```jsonc
// Request
{
  "name": "Healthcare Access Study",
  "description": "Understanding the barriers…"
}
```

`description` is optional — the frontend substitutes
`"New research project. Upload data to begin analysis."` when blank
(`Projects.tsx:60-61`). Server-side default is fine.

```jsonc
// 201 — the created project, counters zeroed
{
  "id": "healthcare-access",
  "name": "Healthcare Access Study",
  "description": "Understanding the barriers…",
  "documentCount": 0,
  "participantCount": 0,
  "interviewCount": 0,
  "focusGroupCount": 0,
  "themes": [],
  "codes": [],
  "status": "active",
  "createdAt": "2026-10-02T10:00:00.000Z",
  "updatedAt": "2026-10-02T10:00:00.000Z"
}
```

**Responses:** `409` duplicate name for this user · `403` plan's project limit
reached · `422` name empty or > 200 chars.

### 3.4 `GET /projects/{projectId}` — **T1**

Called by `ProjectLayout.tsx:45` on every project page. Note it accepts an
`undefined` id (`researchService.ts:42`) and returns `undefined` — it is the
shell guard, not a data fetch.

```jsonc
// 200
{ "id": "healthcare-access", "name": "Healthcare Access Study", "...": "see §3.1" }
```

**Responses:** `404` not found or not a member. The frontend redirects to
`/projects` on a falsy result (`ProjectLayout.tsx:49-51`).

### 3.5 `PATCH /projects/{projectId}` — T2

Rename, re-describe, archive. `status: 'archived'` is the only write path to
`archived` — the prototype has one archived project (`water-sanitation`).

```jsonc
// Request — all fields optional
{ "name": "...", "description": "...", "status": "active" }
```

```jsonc
// 200
{ "...": "full ResearchProject" }
```

### 3.6 `DELETE /projects/{projectId}` — T2

`204 No Content`. Cascade-delete documents, participants, themes, reports,
conversations and messages. Consider a soft-delete window for data-recovery
purposes — deleting a research corpus is irreversible and users will do it by
accident.

---

## 4. Documents

### 4.1 `ResearchDocument` schema

```jsonc
{
  "id": "doc-01",
  "projectId": "healthcare-access",
  "name": "Interview_01.docx",       // original filename, as uploaded
  "kind": "interview",               // DocumentKind enum, derived from extension
  "type": "Interview",               // free-text display label
  "extension": "DOCX",               // UPPERCASE, no dot
  "fileSize": "128 KB",              // formatted string, see §1.7 warning
  "status": "processed",             // 'processing' | 'processed' | 'failed'
  "participantCount": 1,            // int, participants detected in this file
  "language": "English",             // detected, e.g. 'English' | 'Shona' | 'Ndebele'
  "uploadedAt": "2026-09-17T07:10:00.000Z",
  "updatedAt": "2026-09-17T07:14:00.000Z"   // bumped when processing completes
}
```

The frontend derives `kind` from the extension in
`researchService.ts:153-160`. **The accepted upload extensions are hard-coded in
the frontend** at `ResearchData.tsx:12` and `:259`:

```ts
const ACCEPTED_EXTENSIONS = ['PDF', 'DOCX', 'CSV', 'MP3', 'WAV', 'MP4']
```

So the `<input type="file">` already filters client-side. **The server must
re-validate** — do not trust this list. Map the same way the mock does:

| Extension | `kind` | `type` (display) |
| --- | --- | --- |
| `PDF` | `pdf` | `Research Notes` |
| `DOCX` | `docx` | `Interview` |
| `CSV` | `csv` | `Research Notes` |
| `MP3` | `audio` | `Interview` |
| `WAV` | `audio` | `Interview` |
| `MP4` | `video` | `Research Notes` |
| anything else | `notes` | `Research Notes` |

> This mock mapping is **crude and partly wrong** — a `DOCX` is labelled
> `Interview` purely because of its extension. Real data has both interview
> transcripts and research notes as `.docx`, which is exactly why
> `kind ∈ {interview, focus_group, survey}` exists as a separate concept from
> the file type. The correct model: `kind` describes **what the file is in the
> study** (interview, focus group, survey, notes), and `type` is its human
> label, while `extension` describes the container. Derive `kind` from
> document *content* and let the user override it, rather than from the
> extension.
>
> The two axes genuinely do collide in the reference data: `FocusGroup_01.pdf`
> has `kind: 'focus_group'`, while `Clinic_Observation_Notes.pdf` has
> `kind: 'notes'`. Both are `PDF`. **No extension-based rule can reproduce
> this** — it requires content analysis or user input.

> **`type` filtering is an exact match.** `ResearchData.tsx:63` does
> `document.type === typeFilter` against hard-coded chips
> `['All', 'Interview', 'Focus Group', 'Survey', 'Research Notes']`
> (`ResearchData.tsx:13`). If you return `"Focus group"` or `"interview"` the
> chip silently returns zero rows. Return the exact strings above.
> Search (`ResearchData.tsx:59-62`) is case-insensitive substring matching on
> `name` and `type` only, done in the browser — no server involvement.

### 4.2 `GET /projects/{projectId}/documents` — **T1**

Called by `ResearchData.tsx:37` and `ProjectOverview.tsx:41`.

Bare array, newest `uploadedAt` first. The UI does all filtering and sorting
client-side, so **return the complete list** — pagination here looks like data
loss (see §1.6).

```jsonc
// 200
[
  {
    "id": "doc-01",
    "projectId": "healthcare-access",
    "name": "Interview_01.docx",
    "kind": "interview",
    "type": "Interview",
    "extension": "DOCX",
    "fileSize": "128 KB",
    "status": "processed",
    "participantCount": 1,
    "language": "English",
    "uploadedAt": "2026-09-17T07:10:00.000Z",
    "updatedAt": "2026-09-17T07:14:00.000Z"
  }
  // 12 records in the reference seed, covering all three statuses
]
```

**All three statuses are load-bearing in the UI:**

| `status` | UI behaviour | Reference record |
| --- | --- | --- |
| `processing` | amber badge + spinner, actions hidden | `doc-07` `Clinic_Observation_Notes.docx` |
| `processed` | green badge, full action menu | `doc-01` … `doc-08` |
| `failed` | red badge, menu reduced to **Retry only** | `doc-09` `Community_Meeting.mp4` |

`DataTable.tsx:141-163` branches on exactly this: a failed document's menu has
one item (Retry); a processing document has no menu at all. If you emit an
unknown status string, the row falls through to the full menu and renders an
unrecognised badge.

**Responses:** `404` unknown project.

### 4.3 `POST /projects/{projectId}/documents` — **T1 (upload)**

Called by `ResearchData.tsx:80` from both the file picker and the drag-drop
label. Multi-file, so use `multipart/form-data` with repeated `files` parts —
**not** a JSON array of base64.

```http
POST /api/v1/projects/healthcare-access/documents HTTP/1.1
Authorization: Bearer eyJhbGciOi...
Content-Type: multipart/form-data; boundary=----X
Content-Length: 49152000

------X
Content-Disposition: form-data; name="files"; filename="Interview_01.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

<binary>
------X
Content-Disposition: form-data; name="files"; filename="FocusGroup_01.pdf"
Content-Type: application/pdf

<binary>
------X--
```

The frontend passes only `{ name, size }` per file (`ResearchData.tsx:82`) and
never reads the bytes — the file objects are dropped on the floor. Send the real
`File` objects.

```jsonc
// 202 — one record per accepted file, status 'processing'
[
  {
    "id": "doc-13",
    "projectId": "healthcare-access",
    "name": "Interview_05.docx",
    "kind": "interview",
    "type": "Interview",
    "extension": "DOCX",
    "fileSize": "1.2 MB",
    "status": "processing",
    "participantCount": 0,
    "language": "English",
    "uploadedAt": "2026-10-02T10:15:00.000Z",
    "updatedAt": "2026-10-02T10:15:00.000Z"
  }
]
```

**Design notes:**

- **`202`, not `201`/blocking.** Transcription of a 412 MB MP4 takes minutes.
  The reference `doc-09` is stamped `uploadedAt 16:22` → `updatedAt 16:41`,
  i.e. 19 minutes of processing. Return immediately with `processing` records
  and push the transition via [§7.4](#74-realtime-updates) or polling.
- **Return a record per file, including failures.** The frontend does
  `setDocuments(prev => [...created, ...prev])` and shows
  `created.map(d => d.name)` as the success list
  (`ResearchData.tsx:85-86`). Returning a single aggregate object breaks the UI.
  For a rejected file, either omit it and report separately, or return it with
  `status: "failed"`.
- **Never trust `kind`/`type`/`language` from the client.** The frontend only
  knows the extension. Detect language server-side — the reference data includes
  `Shona` and `Ndebele`, and those values are rendered directly.
- **Partial-batch success:** a 40-file upload where 3 fail should not fail the
  whole request. Consider per-file status plus a `207`-style summary, or just
  return the successful ones and a `warnings` array.
- **Limits:** enforce size and count server-side. Free/Student plan is
  25 documents/cycle, Researcher 250, Team 1000, Institution unlimited
  (`mockBilling.ts:10-55`). Return `403` when exceeded.

**Responses:** `403` plan document limit reached · `413` file too large ·
`415` unsupported extension/MIME · `422` empty batch.

### 4.4 `DELETE /projects/{projectId}/documents/{documentId}` — **T1 (mocked locally)**

`confirmDelete` in `ResearchData.tsx:96-101` filters the item out of local
state and toasts *"File deleted"*. No server call. Wire this to the real route.

`204 No Content`.

**Responses:** `404` unknown document · `409` document still processing.

### 4.5 `POST /projects/{projectId}/documents/{documentId}/reprocess` — **T1 (mocked locally)**

`handleRetry` in `ResearchData.tsx:103-113` flips the status to `processing`
locally, then to `processed` after a 2.2 s timeout. Available only when
`status === 'failed'`.

```jsonc
// 202
{ "id": "doc-09", "status": "processing", "updatedAt": "2026-10-02T10:20:00.000Z" }
```

**Responses:** `409` already processing.

### 4.6 `POST /projects/{projectId}/documents/{documentId}/transcript` — T2

Fires the "Transcript" row action in the document menu
(`DataTable.tsx:90-93` → `comingSoon('Generating a transcript')`). **Only enabled
when `kind === 'audio'`** — the button is `disabled` for every other kind
(`DataTable.tsx:156-159`, `:71`), so the server only ever sees audio.

```jsonc
// 202
{ "documentId": "doc-05", "status": "processing" }
```

`202` is mandatory: the reference audio file is 48.1 MB and its processing spans
`15:44` → `18:09` — 2h25m, a 48-minute job. Never block.

### 4.7 `GET /projects/{projectId}/documents/{documentId}/transcript` — T2

```jsonc
// 200
{
  "documentId": "doc-05",
  "language": "Ndebele",
  "status": "ready",                 // 'processing' | 'ready' | 'failed'
  "segments": [
    { "id": "seg-001", "startMs": 0,      "endMs": 4200,  "speaker": "P07", "text": "…" },
    { "id": "seg-002", "startMs": 4200,   "endMs": 11800, "speaker": "P08", "text": "…" }
  ],
  "translation": null,               // or a parallel segments array; see §12.4
  "createdAt": "2026-09-16T18:09:00.000Z"
}
```

`startMs`/`endMs` must line up with the `mm:ss` strings the chat returns in
`Evidence.timestamp` — that is how a click on a citation seeks the player.

**Responses:** `404` no document · `409` transcript not ready.

### 4.8 `PATCH /projects/{projectId}/documents/{documentId}` — T3

User override of `kind`, `type`, `participantCount`, or re-labelling `name`.
Needed once `kind` is content-derived and the heuristic guesses wrong.

---

## 5. Participants

### 5.1 `Participant` schema

```jsonc
{
  "id": "p01",
  "label": "P01",                    // pseudonymous display label
  "projectId": "healthcare-access",
  "age": 19,                         // optional -> may be absent or null
  "location": "Urban",               // optional -> may be absent or null
  "interviewCount": 1                // int, documents this participant appears in
}
```

> **This is sensitive data.** Participants are pseudonymous (`P01`, not names),
> which is a deliberate research-ethics design choice. `age` and `location` are
> both optional precisely so a participant can withhold them. Preserve that:
> never make them required, never default them, and never expose them on an
> endpoint the participant's consent does not cover.

### 5.2 `GET /projects/{projectId}/participants` — **T1 (currently dead code)**

`listParticipants` exists at `researchService.ts:90` and `participants` is seeded
with 8 records in `mockProjects.ts:151-160`, **but no component imports it.**
The UI never displays a participant roster today. Build the endpoint anyway —
evidence attribution and the upcoming participant-comparison features need it.

Bare array, same shape as every other list endpoint.

### 5.3 `GET /projects/{projectId}/participants/{participantId}` — T3

Single participant. Useful for the evidence drill-down.

### 5.4 `GET /projects/{projectId}/participants/{participantId}/excerpts` — T3

Every coded excerpt attributed to one participant, as `Evidence[]`. This is the
data behind the "compare urban vs rural participants" answer in
`mockMessages.ts:124-167`.

---

## 6. Analysis

### 6.1 `ResearchTheme` schema

```jsonc
{
  "id": "theme-financial",
  "projectId": "healthcare-access",
  "name": "Financial Barriers",
  "description": "Costs associated with consultation fees, medication and transport consistently shape whether and when participants seek care.",
  "sourceCount": 19,                 // int, documents contributing to this theme
  "excerptCount": 32,                // int, supporting excerpts
  "participantCount": 14,            // int
  "confidence": 0.94,                // float 0-1, model confidence
  "codes": [                         // nested code objects
    { "id": "code-transport-costs",    "name": "Transport costs",     "excerptCount": 12 },
    { "id": "code-consultation-fees",  "name": "Consultation fees",   "excerptCount": 11 },
    { "id": "code-medication-costs",    "name": "Medication costs",    "excerptCount": 9 }
  ]
}
```

> **`codes` here are full objects; in `ResearchProject` they are bare strings.**
> See the warning in §3.1. This inconsistency is in the frontend types
> (`ResearchCode` at `research.ts:97` vs `ResearchProject.codes: string[]` at
> `:33`) and is easy to get wrong on the server.

> **`confidence` is a float `0`–`1`, never a percentage.** `ThemeCard.tsx:12`
> renders it as a percentage by multiplying by 100. Reference range in the seed
> data: `0.78`–`0.94`.

### 6.2 `ThemeRelationship` schema

```jsonc
{
  "id": "rel-1",
  "sourceThemeId": "theme-financial",   // must reference a theme in THIS project
  "targetThemeId": "theme-geographic",
  "strength": 0.86                      // float 0-1, co-occurrence strength
}
```

### 6.3 `GET /projects/{projectId}/themes` — **T1**

Called by `Analysis.tsx:27` and `ProjectOverview.tsx:41`. Bare array.

`ThemeRelationshipMap.tsx:63-64` looks each `sourceThemeId`/`targetThemeId` up
in the themes array it fetched separately, and skips unresolvable edges. So
**return relationships referencing only themes in the same project** — a
cross-project id renders as a silently missing edge.

### 6.4 `GET /projects/{projectId}/themes/relationships` — **T1**

Called by `Analysis.tsx:27`. Bare array of `ThemeRelationship`.

Note the mock resolves project membership by looking up both endpoint themes
and comparing `projectId` (`researchService.ts:65-69`) — meaning a relationship
is project-scoped only if **both** its themes are. Mirror that scoping rule.

### 6.5 `POST /projects/{projectId}/themes` — T3

Manual theme creation. The "Theme review and approval workflow" is a listed
Team-plan feature (`mockBilling.ts:45`), which implies create/rename/merge and
an approval state on themes.

```jsonc
// Request
{ "name": "Cultural Beliefs", "description": "…" }
// 201
{ "id": "theme-cultural", "projectId": "…", "codes": [], "sourceCount": 0,
  "excerptCount": 0, "participantCount": 0, "confidence": 0 }
```

### 6.6 `PATCH /projects/{projectId}/themes/{themeId}` — T3

Rename / re-describe / approve.

### 6.7 `DELETE /projects/{projectId}/themes/{themeId}` — T3

`204 No Content`.

### 6.8 `GET /projects/{projectId}/themes/{themeId}/excerpts` — T3

Evidence for one theme, as `Evidence[]`. Backs the per-theme evidence drill-down.

### 6.9 `GET /projects/{projectId}/excerpts/{excerptId}` — T2

Backs the "source viewer" — `EvidencePanel.tsx:111` → `comingSoon('The source
viewer')`. The user clicks a citation and expects the source document, the
surrounding context, and the transcript seek position.

```jsonc
// 200
{
  "excerpt": { "id": "ev-01", "...": "see §6.10" },
  "document": { "id": "doc-03", "name": "Interview_03.docx", "kind": "interview", "...": "see §4.1" },
  "context": {
    "before": "…text preceding the quote…",
    "quote": "Sometimes I don't go to the clinic because I don't have enough money for transport.",
    "after": "…text following the quote…"
  },
  "seekToMs": 272000                  // derive from the "04:32" timestamp for audio
}
```

### 6.10 `Evidence` schema

The single most important shape in the app — it is what makes claims citable.

```jsonc
{
  "id": "ev-01",
  "source": "Interview 03",       // display label, e.g. 'Interview 03' / 'Focus Group 02'
  "participant": "P03",           // pseudonymous label
  "timestamp": "04:32",           // optional, mm:ss offset (NOT a date)
  "page": 4,                      // optional, int — for PDFs
  "quote": "Sometimes I don't go to the clinic because I don't have enough money for transport.",
  "theme": "Healthcare Access",   // optional
  "code": "Financial Barriers",   // optional
  "documentId": "doc-03",         // optional — see note below
  "language": "Shona",            // optional, original language of the quote
  "relevance": 0.96               // optional, float 0-1
}
```

Rendered across three components, so populate what you can:

| Component | Fields it reads |
| --- | --- |
| `EvidenceCard.tsx` | `source`, `participant`, `timestamp`, `page`, `quote`, `theme`, `code`, `language` |
| `EvidencePanel.tsx` | `participant`, `timestamp`, `theme`, `code`, `language`, `relevance`, `source`, `quote` |
| `ChatMessage.tsx` | `evidence[].id`, `evidence[].source` |

Notes:

- **`source` is a display string, not a filename or a join key.** Reference
  values are `"Interview 03"` and `"Focus Group 02"` — note the *space*, while
  the actual file is `Interview_03.docx` with an *underscore*. If you derive
  `source` from `name`, you must transform it: strip the extension, then replace
  `_` with ` `. It is displayed verbatim next to the quote, so it must read like
  prose.
- **`documentId` is declared in the type but is `undefined` in every seeded
  example** (`mockMessages.ts:42-75`). Nothing currently reads it, and
  `EvidencePanel`'s source viewer is unimplemented. Populate it anyway — it is
  the only stable link back to the document, and §6.9 needs it.
- **`relevance` is 0–1, displayed as a percentage.** Reference values:
  `0.84`–`0.97`.
- **`quote` is a verbatim excerpt from the participant**, not a paraphrase. The
  product's whole claim is that every answer is traceable. Non-verbatim
  `quote` values undermine it.
- **Original-language `language` is the ethically significant one.** Two of the
  three seeded quotes are in `Shona` and `Ndebele`, and the mock methodology
  answer (`mockMessages.ts:290`) explicitly warns the researcher to acknowledge
  in the write-up that non-English transcripts were analysed in translation. Do
  not silently normalise everything to English.

---

## 7. Chat

### 7.1 `ChatMessage` schema

```jsonc
{
  "id": "msg-01",
  "role": "assistant",              // 'user' | 'assistant'
  "content": "## Major Barriers to Healthcare Access\n\n…",
  "createdAt": "2026-09-17T09:02:24.000Z",
  "projectId": "healthcare-access", // optional
  "evidence": [ /* Evidence[] */ ]  // optional
}
```

> **`content` is GitHub-flavoured Markdown**, rendered by a markdown
> component. Reference answers use `##`/`###` headings, `**bold**`, `1.`/`-`
> ordered lists, and paragraphs (`mockMessages.ts:19-37`, `:82-96`).
> `sendChatMessage` returns **only the assistant turn** — the user turn is
> constructed optimistically in the browser (`ProjectChat.tsx:52-60`) and never
> sent back as a stored message. So `POST .../chat` returns a single
> `ChatMessage`, not an array.

### 7.2 `Conversation` schema

```jsonc
{
  "id": "conv-healthcare-barriers",
  "projectId": "healthcare-access",
  "title": "Healthcare Barriers Analysis",
  "preview": "What are the major barriers affecting access to healthcare?",  // first user message
  "updatedAt": "2026-09-17T09:20:00.000Z",
  "messageCount": 6
}
```

`preview` and `messageCount` are denormalised for the sidebar's "Recent Chats"
list (`Sidebar.tsx:62`), which renders every conversation across every project
and shows only `title` + `updatedAt`. Sort by `updatedAt` descending.

### 7.3 `GET /projects/{projectId}/messages` — **T1**

Called by `ProjectChat.tsx:34`. Bare array, `createdAt` **ascending** (oldest
first — the chat window renders in order). One seed pair exists
(`msg-01` user, `msg-02` assistant with 3 evidence items) in
`mockMessages.ts:8-78`.

The signature takes a `projectId` and **not** a conversation id, and the
prototype returns all messages for the project regardless of the
`?conversation=` query param. Since real conversations must be isolated from
each other, the moment you have more than one conversation per project, add:

```
GET /projects/{projectId}/conversations/{conversationId}/messages
```

and keep the flat route working by defaulting to the project's most recent
conversation. See [§12.6](#126-conversation-scoping).

### 7.4 `POST /projects/{projectId}/chat` — **T1**

The core AI endpoint. Named in the source comment at `researchService.ts:125`:
*"Later this becomes `POST /projects/{id}/chat`"*.

```jsonc
// Request
{
  "projectId": "healthcare-access",
  "question": "What are the major barriers affecting access to healthcare among young people?"
}
```

`projectId` is in the body as well as the path, because the mock function
signature is `sendChatMessage(projectId, question)` and it passes the id into
the returned message. In production, **the path id wins** and the body copy is
ignored (or validated to match). Keeping it is harmless and saves a frontend
edit.

```jsonc
// 200
{
  "id": "msg-1759389123456",
  "role": "assistant",
  "content": "## Major Barriers to Healthcare Access\n\nBased on the interviews and focus groups in **Healthcare Access Study**, three recurring barriers emerged across 24 documents.\n\n### 1. Cost of Healthcare\n…",
  "createdAt": "2026-09-17T09:02:24.000Z",
  "projectId": "healthcare-access",
  "evidence": [
    {
      "id": "ev-01",
      "source": "Interview 03",
      "participant": "P03",
      "timestamp": "04:32",
      "quote": "Sometimes I don't go to the clinic because I don't have enough money for transport.",
      "theme": "Healthcare Access",
      "code": "Financial Barriers",
      "language": "Shona",
      "relevance": 0.96
    }
  ]
}
```

**Requirements:**

- **Persist the user turn too.** The frontend renders its optimistic copy
  immediately, but the next `GET .../messages` replaces local state entirely
  (`ProjectChat.tsx:35-38`). If you don't store the user message, it vanishes on
  reload. `role: 'user'`, same `ChatMessage` shape, `evidence` omitted.
- **`evidence` is what makes this product defensible.** Always return
  grounded excerpts; return `evidence: []` rather than unsupported prose when
  retrieval finds nothing. The UI has a "Always show evidence citations"
  setting (`Settings.tsx:54`), so the field must be reliably populated.
- **`id` format is free** — the mock uses `msg-${Date.now()}`. Real ids
  (ULIDs/UUIDs) are fine and better.
- **Latency budget:** the mock simulates 900 ms (`researchService.ts:131`) and
  the UI shows a typing indicator while awaiting. A real LLM+RAG call will take
  3–20 s. **Design for streaming** — see [§12.1](#121-streaming-chat) — or the
  user stares at a spinner for 20 seconds. The frontend has no streaming
  support today and will need a small change.
- **Idempotency:** send `X-Idempotency-Key`. Users retry, and each retry against
  a metered LLM endpoint costs money.
- **Quota:** Researcher plan allows 2,000 queries/cycle (`mockBilling.ts:23`).
  Return `429` with `Retry-After` and a `quota_exceeded` error code when spent;
  the frontend should surface the paywall.
- **Transcribe before answering:** if a relevant document is still `processing`,
  the answer is incomplete. Return what you have with lower `relevance`, or
  `409` with a `pending_documents` hint. Do not silently answer from partial data.

**Reference answer catalogue** (from `mockMessages.ts:80-305`) — the five
intents the prototype fakes, useful as test fixtures for retrieval quality:

| Intent | Trigger keywords in the mock matcher | Evidence items |
| --- | --- | --- |
| Healthcare barriers | `barrier`, `barriers`, `access`, `challenge` (**default**) | 2 |
| Compare participants | `compare`, `urban`, `rural`, `differ`, `difference` | 2 |
| Evidence | `evidence`, `quote`, `quotes`, `source`, `supporting` | 3 |
| Themes | `theme`, `themes`, `recurring`, `pattern` | 2 |
| Methodology | `method`, `methodology`, `sample`, `approach` | 1 |

The mock matcher is a naive lowercase substring match with a hard-coded
fallback to "healthcare barriers" — so an unrecognised question returns a
barriers answer. **Do not reproduce this.** It exists to make the prototype
demo well; real retrieval must return "I couldn't find evidence for that" when
it has none.

### 7.5 `GET /projects/{projectId}/conversations` — **T1**

Called by `Sidebar.tsx:62` (all conversations, no project filter) and
`ProjectOverview.tsx:41` (project-scoped). Bare array.

### 7.6 `POST /projects/{projectId}/conversations` — T2

```jsonc
// Request — body optional, server generates the title from the first question
{ "title": "Healthcare Barriers Analysis" }
// 201
{ "id": "conv-…", "projectId": "…", "title": "…", "preview": "", "updatedAt": "…", "messageCount": 0 }
```

The UI's "New chat" link is `/projects/:id/chat?new=<token>`
(`ProjectChat.tsx:14`), where the token is only used to skip the message fetch
and start empty. Wire it to conversation creation.

### 7.7 `PATCH /projects/{projectId}/conversations/{conversationId}` — T3

Rename.

### 7.8 `DELETE /projects/{projectId}/conversations/{conversationId}` — T3

`204 No Content`.

### 7.9 `POST /chat/transcribe` — T2

Backs the voice-input mic in `ChatInput.tsx:58` → `comingSoon('Voice input')`.
Web Speech API on the client, or an audio upload.

```jsonc
// Request
{ "audio": <base64 or multipart>, "language": "en" }
// 200
{ "text": "What are the major barriers affecting access to healthcare?" }
```

### 7.10 Anonymous free tier

Both metered client-side gates use the same rule —
`ProjectChat.tsx:46-50` and `ResearchData.tsx:72-76`:

```ts
if (!isAuthenticated && usageCount >= 1) { openLogin(); return }
recordUsage()
```

So an anonymous visitor gets **exactly one** action total — one chat message
*or* one upload batch, not one of each — after which the login modal opens. The
counter lives in `localStorage` under `researchmind.usage.count` and is
**not cleared on logout**.

**Recommendation: drop the client-side counter entirely** and have the server
own it. Return the anonymous allowance from `GET /billing/subscription` and let
`403 quota_exceeded` drive the paywall. A localStorage counter is trivially
resettable and is not a security control.

---

## 8. Reports

### 8.1 `ResearchReport` schema

```jsonc
{
  "id": "report-healthcare-thematic",
  "projectId": "healthcare-access",
  "title": "Healthcare Access Thematic Analysis",
  "summary": "A thematic analysis of 24 documents examining the barriers that shape healthcare access among young people.",
  "createdAt": "2026-09-17T08:00:00.000Z",
  "sections": [                      // string[] — section HEADINGS only
    "Executive Summary",
    "Methodology",
    "Major Themes",
    "Participant Comparison",
    "Evidence",
    "Conclusions"
  ],
  "status": "final"                  // 'draft' | 'final'
}
```

> **`sections` is an array of heading strings, not objects.** The report card
> renders `report.sections.join(' · ')` (`Reports.tsx:89`). There is no section
> *body* anywhere in the current model — the report body lives wherever the
> export produces it. If you want a viewer, add `ReportSection` objects under a
> **new** field (`sectionContents`); do not change `sections` to objects, or the
> card breaks.

`sections` is effectively free-form: the 5 seeded reports use 6 different
section sets, so the backend should generate the outline from the project's
content rather than validate against a fixed list.

### 8.2 `GET /projects/{projectId}/reports` — **T1**

Called by `Reports.tsx:27` and `ProjectOverview.tsx:41`. Bare array.

### 8.3 `POST /projects/{projectId}/reports` — T2

Fires "Generate Report" (`Reports.tsx:45`), and also "Report" in the per-document
menu (`DataTable.tsx:167-170`).

```jsonc
// Request — all optional
{
  "title": "Healthcare Access Thematic Analysis",
  "type": "thematic_analysis",       // 'thematic_analysis' | 'evidence_summary' | 'comparison' | 'custom'
  "themeIds": ["theme-financial"],   // optional, scope to specific themes
  "sections": ["Executive Summary", "Methodology", "Major Themes"]
}

// 202 — generation is long-running
{
  "id": "report-2026-10-a1b2",
  "projectId": "healthcare-access",
  "title": "Healthcare Access Thematic Analysis",
  "summary": "",
  "createdAt": "2026-10-02T11:00:00.000Z",
  "sections": [],
  "status": "draft"
}
```

`202` with a `draft` record, then transition when done. Note the reference
`summary` says *"thematic analysis of 24 documents"* — **the generated summary
cites the real document count**, so it must be computed from the project, not
templated.

### 8.4 `GET /projects/{projectId}/reports/{reportId}` — T2

Backs the "View" button (`Reports.tsx:97` → `comingSoon('The report viewer')`).
Returns the `ResearchReport` plus, additively, the rendered body:

```jsonc
// 200
{
  "id": "report-…",
  "...": "all ResearchReport fields",
  "content": "## Executive Summary\n\n…",   // markdown
  "status": "draft",
  "generation": { "state": "ready", "progress": 100, "startedAt": "…", "completedAt": "…" }
}
```

### 8.5 `GET /projects/{projectId}/reports/{reportId}/export?format=pdf|docx` — T2

Fires "Export PDF" / "Export DOCX" (`Reports.tsx:105`, `:113`).

Returns the **file itself** with `Content-Type: application/pdf` or the DOCX
MIME type, plus `Content-Disposition: attachment; filename="…"`. Not a JSON
envelope.

"Export to PDF and DOCX" is a listed **Researcher** plan feature
(`mockBilling.ts:29`) — gate it at `403` for the free Student plan.

Generation is slow, so a two-step flow (request → poll → download) is
reasonable, but the export should also be reachable synchronously for short
reports.

---

## 9. Billing

### 9.1 `BillingPlan` schema

```jsonc
{
  "id": "researcher",
  "name": "Researcher",
  "tagline": "For individual researchers running active studies.",
  "monthlyPrice": 19,          // number | null. null => "Contact sales"
  "annualPrice": 15,           // EFFECTIVE MONTHLY price when billed annually. number | null
  "limits": {
    "documents": 250,          // per cycle. -1 => unlimited
    "queries": 2000,           // per cycle. -1 => unlimited
    "seats": 1                 // -1 => unlimited
  },
  "features": [
    "250 documents per month",
    "2,000 AI research queries",
    "Multilingual transcription and translation",
    "Export to PDF and DOCX",
    "Priority email support"
  ],
  "highlight": true            // optional; true on the Team plan only
}
```

> **`annualPrice` is the effective *monthly* rate, not the yearly total.**
> Researcher is `19` monthly / `15` annual, i.e. $15/mo billed as $180/yr. The
> plan card shows this number next to "/month" (`Subscription.tsx:77`), so
> return the per-month figure. Returning `180` displays a 10× price error.

> **`null` prices mean "Contact sales", not "free".** The Institution plan has
> `monthlyPrice: null` / `annualPrice: null` and `-1` limits. The UI branches on
> `plan.monthlyPrice === null` to show "Contact sales" instead of a price
> (`Subscription.tsx:368`). The Student plan uses `0` for free — `0` and `null`
> are different states and must not be conflated.

> **Sentinel `-1` for unlimited** appears in `limits` and in
> `SubscriptionUsage.limit`. Never return `null`, `Infinity`, or a huge number
> for unlimited — the frontend compares against `-1` literally.

`highlight` marks the recommended plan; exactly one plan should set it
(`Subscription.tsx:139`).

### 9.2 `Subscription` schema

```jsonc
{
  "planId": "researcher",
  "status": "active",                    // 'active' | 'trialing' | 'past_due' | 'cancelled'
  "interval": "monthly",                 // 'monthly' | 'annual'
  "renewsAt": "2026-10-12T00:00:00.000Z",// period end AND renewal date
  "paymentMethod": {
    "brand": "Visa",                     // e.g. 'Visa', 'Mastercard'
    "last4": "4242",
    "expiry": "04/29"                    // MM/YY string, not a date
  },
  "usage": [
    { "label": "Documents processed", "used": 168, "limit": 250, "unit": "" },
    { "label": "AI research queries",  "used": 1240, "limit": 2000, "unit": "" },
    { "label": "Storage used",         "used": 12.4, "limit": 25, "unit": "GB" },
    { "label": "Researcher seats",     "used": 1, "limit": 1, "unit": "" }
  ]
}
```

Notes:

- **`usage` is a display-oriented heterogeneous list.** `used` is `12.4` for
  storage and `1240` for queries; `unit` is `"GB"` for storage and `""` for
  plain counts. `Subscription.tsx:98-103` renders `label`, `used`, `limit`,
  `unit` generically. Keep the labels stable — they are UI strings, and a test
  or translation layer will depend on them.
- **`renewsAt` does triple duty:** "Renews on …" (`Subscription.tsx:250`),
  "Next invoice" (`:300`), and "Resets …" for usage (`:312`). One field, three
  meanings. Keep that contract or fix the UI.
- **`paymentMethod.expiry` is `"04/29"`, not an ISO date.** String
  concatenation, no parsing.
- **`paymentMethod` must be nullable.** The prototype always has one
  (`mockBilling.ts:71-75`), but a `trialing` subscription without a card is
  normal. Handle `null` in the UI when you wire this up.
- **The `usage[]` array replaces the `localStorage` free-tier counter** — see
  the note in §2.4. It is the single best place to drive the paywall from the
  server.

### 9.3 `Invoice` schema

```jsonc
{
  "id": "invoice-2026-09",
  "number": "RM-2026-009",              // human-facing invoice number
  "issuedAt": "2026-09-12T00:00:00.000Z",
  "amount": 19,                         // number, major units, unrounded
  "currency": "USD",                    // ISO 4217
  "status": "paid",                     // 'paid' | 'open' | 'refunded'
  "description": "Researcher plan · monthly"
}
```

`Subscription.tsx:411` renders `${invoice.amount.toFixed(2)}` — return a
**number**, not a pre-formatted string, and do not round to 2 dp yourself.
`description` uses a middle dot `·` as separator.

### 9.4 `GET /billing/subscription` — **T1**

Called by `SubscriptionPage.tsx:197`. Returns the `Subscription` object from
§9.2, unwrapped — not an array, not enveloped.

> **The prototype has no auth gate on this route.** `billingService.ts` returns
> data regardless of session, and `/subscription` is reachable by anonymous
> visitors, who see a populated plan page. Gate it properly with `401` and
> return `null` (or `204`) when no subscription exists — a free user with no
> subscription is a normal state and the current model has no way to express
> it.

### 9.5 `GET /billing/plans` — **T1**

Called by `SubscriptionPage.tsx:197`. Bare array of 4 plans.

Consider making this public (`200` without auth) — it is pricing-page data and
users need to see it before signing up.

### 9.6 `GET /billing/invoices` — **T1**

Called by `SubscriptionPage.tsx:197`. Bare array, newest `issuedAt` first.
Return only the requesting user's invoices.

### 9.7 `PUT /billing/subscription` — T2

Fires the plan card "Choose plan" action
(`Subscription.tsx:366-372` → `comingSoon('Switching to the … plan')`). For
`monthlyPrice === null` plans the UI instead toasts
`comingSoon('Contacting the sales team')` — see §10.1.

```jsonc
// Request
{ "planId": "team", "interval": "annual" }
// 200
{ "planId": "team", "status": "active", "interval": "annual", "renewsAt": "…", "paymentMethod": {…}, "usage": [ … ] }
```

Behaviour to decide: immediate proration vs. next-cycle change. Immediate
proration is what most users expect from a plan card. Confirm via
`X-Idempotency-Key`; return `402 Payment Required` on a declined card.

Guard rails: `409` if already on that plan and interval · `403` if the plan is
not available in their region · `402` card declined.

### 9.8 `DELETE /billing/subscription` — T2

Fires "Cancel plan" (`Subscription.tsx:268`).

```jsonc
// Request — optional, controls immediate vs. period-end
{ "cancelAtPeriodEnd": true }
// 200
{ "planId": "researcher", "status": "active", "renewsAt": "…", "…": "…", "cancelsAt": "2026-10-12T00:00:00.000Z" }
```

Prefer `cancelAtPeriodEnd: true` as the default. **Downgrading to Student
(limits 25/200/1) on a project with 24 documents and 1,240 queries used will
break their workspace** — surface a confirmation with the overage, and decide
what happens to data above the new limit (archive? read-only? refuse?).

### 9.9 `PUT /billing/payment-method` — T2

Fires "Update payment method" (`Subscription.tsx:264`).

Collect card details in a Stripe Elements / hosted field on the client, send
only the resulting payment-method token to your server — **never raw card
numbers**. Return the updated `Subscription`, or a `PaymentMethod` plus the
`Subscription` with its `paymentMethod` refreshed.

```jsonc
// Request
{ "paymentMethodId": "pm_1AbCdEfGh" }   // from your payment provider
// 200
{ "brand": "Visa", "last4": "4242", "expiry": "04/29" }
```

### 9.10 `POST /billing/portal` — T2

Fires "Manage billing" (`Subscription.tsx:222`). Create a provider-hosted
portal session and return the URL:

```jsonc
// 200
{ "url": "https://billing.stripe.com/session/live_xxx" }
```

The frontend then does `window.location.href = url`. Best practice: you get
card management, invoice history, plan changes and tax details without building
any of it.

### 9.11 `GET /billing/invoices/{invoiceId}/download` — T2

Fires the download button in the billing-history list
(`Subscription.tsx:417` → `comingSoon('Invoice downloads')`).

Returns the **file** — `application/pdf` — with
`Content-Disposition: attachment; filename="RM-2026-009.pdf"`. Not JSON.

Add `?format=html` if you want a printable browser-viewable invoice. Return
`404` for invoices not belonging to the requesting user.

### 9.12 `POST /billing/invoices/{invoiceId}/email` — T3

Email a copy. `202`, no body.

---

## 10. Misc

### 10.1 `POST /sales/contact` — T2

Fires for Institution-plan selection, where
`plan.monthlyPrice === null` (`Subscription.tsx:367-370` →
`comingSoon('Contacting the sales team')`).

```jsonc
// Request
{
  "name": "Dr. T. Moyo",
  "email": "t.moyo@university.ac.zw",
  "organization": "University of Zimbabwe",
  "planId": "institution",
  "seats": 40,
  "message": "Evaluating ResearchMind for our faculty."
}
// 202
```

### 10.2 `GET /projects` search — T2

The header has a search box wired to `comingSoon('Research search')`
(`Header.tsx:49`). The projects page does client-side matching on
`name` + `description` (`Projects.tsx:34-42`) — server-side search should
cover documents, themes, excerpts and reports too, not just projects.

```http
GET /api/v1/search?q=transport&projectId=healthcare-access&types=document,excerpt,report
```

### 10.3 `GET /help/articles` — T2

Fires `comingSoon('The help centre')` (`Sidebar.tsx:291`). A docs or CMS
endpoint.

### 10.4 Profile & preferences — T2/T3

`PATCH /users/me` backs the "Edit profile" button
(`Settings.tsx:125` → `comingSoon('Profile editing')`).

```jsonc
// Request
{ "name": "Dr. T. Moyo", "title": "Lead Researcher", "organization": "University of Zimbabwe", "avatarUrl": "…" }
// 200 — the user object from §2.1
```

> The current profile display is hard-coded to `'Dr. T. Moyo'` and
> `'Lead Researcher · Healthcare Access Study'` (`Settings.tsx:115, 118-121`).
> "…· Healthcare Access Study" implies the user's **current project**, which
> is not derivable from a user record. Either add a `currentProjectId` to the
> user object or drop that suffix in the UI.

`GET /users/me/preferences` / `PUT /users/me/preferences` — T3. The three
settings toggles in `Settings.tsx:40-59` are pure `useState` with no persistence
today, so they reset on every visit. Persist them server-side:

```jsonc
{
  "autoTranscribe": true,      // 'Automatically transcribe uploads'
  "autoTranslate": false,      // 'Translate transcripts to English'
  "showEvidence": true,        // 'Always show evidence citations'
  "theme": "system"            // 'light' | 'dark' | 'system' — currently localStorage only
}
```

`showEvidence` matters for the backend: if the user disables evidence, the
frontend strips citations client-side, but you should also stop returning
potentially large `evidence` arrays in chat responses to save bandwidth.

### 10.5 Language support — T3

`Settings.tsx:21-25` hard-codes a table:

```jsonc
[
  { "code": "en", "label": "English", "status": "Supported" },
  { "code": "sn", "label": "Shona",   "status": "Planned" },
  { "code": "nd", "label": "Ndebele", "status": "Planned" }
]
```

A `GET /languages` endpoint returning this (with real ISO 639-1 codes and
per-language processing capability) removes another hard-coded table.

---

## 11. Full endpoint index

| # | Method | Path | Tier | Called from |
| --- | --- | --- | --- | --- |
| 1 | `POST` | `/auth/login` | T2 | *not wired* — `LoginForm.tsx:56` |
| 2 | `POST` | `/auth/register` | T2 | *no UI exists* |
| 3 | `POST` | `/auth/oauth/{provider}` | T2 | *no UI* — `LoginForm.tsx:98-113` |
| 4 | `GET` | `/auth/callback/{provider}` | T2 | — |
| 5 | `POST` | `/auth/logout` | T2 | *not wired* — `AuthContext.tsx:48` |
| 6 | `GET` | `/auth/me` | T2 | *not wired* — `AuthContext.tsx:27` |
| 7 | `PATCH` | `/auth/password` | T3 | — |
| 8 | `POST` | `/auth/forgot-password` | T3 | — |
| 9 | `POST` | `/auth/reset-password` | T3 | — |
| 10 | `GET` | `/projects` | **T1** | `Projects.tsx:23`, `ResearchData.tsx:37` |
| 11 | `POST` | `/projects` | **T1** | `Projects.tsx:52` *(local only)* |
| 12 | `GET` | `/projects/{projectId}` | **T1** | `ProjectLayout.tsx:45` |
| 13 | `PATCH` | `/projects/{projectId}` | T2 | — |
| 14 | `DELETE` | `/projects/{projectId}` | T2 | — |
| 15 | `GET` | `/projects/{projectId}/documents` | **T1** | `ResearchData.tsx:37`, `ProjectOverview.tsx:41` |
| 16 | `POST` | `/projects/{projectId}/documents` | **T1** | `ResearchData.tsx:80` |
| 17 | `DELETE` | `/projects/{projectId}/documents/{documentId}` | **T1** | `ResearchData.tsx:96` *(local only)* |
| 18 | `POST` | `/projects/{projectId}/documents/{documentId}/reprocess` | **T1** | `ResearchData.tsx:103` *(local only)* |
| 19 | `PATCH` | `/projects/{projectId}/documents/{documentId}` | T3 | — |
| 20 | `POST` | `/projects/{projectId}/documents/{documentId}/transcript` | T2 | `DataTable.tsx:92` |
| 21 | `GET` | `/projects/{projectId}/documents/{documentId}/transcript` | T2 | — |
| 22 | `GET` | `/projects/{projectId}/participants` | **T1** | *dead code* — `researchService.ts:90` |
| 23 | `GET` | `/projects/{projectId}/participants/{participantId}` | T3 | — |
| 24 | `GET` | `/projects/{projectId}/participants/{participantId}/excerpts` | T3 | — |
| 25 | `GET` | `/projects/{projectId}/themes` | **T1** | `Analysis.tsx:27`, `ProjectOverview.tsx:41` |
| 26 | `POST` | `/projects/{projectId}/themes` | T3 | — |
| 27 | `GET` | `/projects/{projectId}/themes/relationships` | **T1** | `Analysis.tsx:27` |
| 28 | `PATCH` | `/projects/{projectId}/themes/{themeId}` | T3 | — |
| 29 | `DELETE` | `/projects/{projectId}/themes/{themeId}` | T3 | — |
| 30 | `GET` | `/projects/{projectId}/themes/{themeId}/excerpts` | T3 | — |
| 31 | `GET` | `/projects/{projectId}/excerpts/{excerptId}` | T2 | `EvidencePanel.tsx:111` |
| 32 | `GET` | `/projects/{projectId}/conversations` | **T1** | `Sidebar.tsx:62`, `ProjectOverview.tsx:41` |
| 33 | `POST` | `/projects/{projectId}/conversations` | T2 | `ProjectChat.tsx:14` (`?new=`) |
| 34 | `PATCH` | `/projects/{projectId}/conversations/{conversationId}` | T3 | — |
| 35 | `DELETE` | `/projects/{projectId}/conversations/{conversationId}` | T3 | — |
| 36 | `GET` | `/projects/{projectId}/messages` | **T1** | `ProjectChat.tsx:34` |
| 37 | `POST` | `/projects/{projectId}/chat` | **T1** | `ProjectChat.tsx:65` |
| 38 | `POST` | `/chat/transcribe` | T2 | `ChatInput.tsx:58` |
| 39 | `GET` | `/projects/{projectId}/reports` | **T1** | `Reports.tsx:27`, `ProjectOverview.tsx:41` |
| 40 | `POST` | `/projects/{projectId}/reports` | T2 | `Reports.tsx:45`, `DataTable.tsx:169` |
| 41 | `GET` | `/projects/{projectId}/reports/{reportId}` | T2 | `Reports.tsx:97` |
| 42 | `GET` | `/projects/{projectId}/reports/{reportId}/export` | T2 | `Reports.tsx:105`, `:113` |
| 43 | `GET` | `/billing/subscription` | **T1** | `Subscription.tsx:197` |
| 44 | `GET` | `/billing/plans` | **T1** | `Subscription.tsx:197` |
| 45 | `GET` | `/billing/invoices` | **T1** | `Subscription.tsx:197` |
| 46 | `PUT` | `/billing/subscription` | T2 | `Subscription.tsx:366` |
| 47 | `DELETE` | `/billing/subscription` | T2 | `Subscription.tsx:268` |
| 48 | `PUT` | `/billing/payment-method` | T2 | `Subscription.tsx:264` |
| 49 | `POST` | `/billing/portal` | T2 | `Subscription.tsx:222` |
| 50 | `GET` | `/billing/invoices/{invoiceId}/download` | T2 | `Subscription.tsx:417` |
| 51 | `POST` | `/billing/invoices/{invoiceId}/email` | T3 | — |
| 52 | `POST` | `/sales/contact` | T2 | `Subscription.tsx:367` |
| 53 | `GET` | `/search` | T2 | `Header.tsx:49` |
| 54 | `GET` | `/users/me` | T2 | `Settings.tsx:115` *(hard-coded)* |
| 55 | `PATCH` | `/users/me` | T2 | `Settings.tsx:125` |
| 56 | `GET`/`PUT` | `/users/me/preferences` | T3 | `Settings.tsx:40-59` *(not persisted)* |
| 57 | `GET` | `/languages` | T3 | `Settings.tsx:21` *(hard-coded)* |
| 58 | `GET` | `/help/articles` | T2 | `Sidebar.tsx:291` |

**Totals:** 21 × T1 · 24 × T2 · 13 × T3.

### 11.1 T1 endpoints not yet reached by the UI

These three have a working mock service function but the UI manipulates local
state instead of calling them. Wiring them is pure win:

| Endpoint | UI currently does |
| --- | --- |
| `POST /projects` | fabricates the project locally, loses it on reload (`Projects.tsx:52-78`) |
| `DELETE /projects/{id}/documents/{docId}` | filters local state (`ResearchData.tsx:96-101`) |
| `POST /projects/{id}/documents/{docId}/reprocess` | fakes a 2.2 s timeout (`ResearchData.tsx:103-114`) |

### 11.2 Wires to cut

Once the backend exists, delete these — they are prototype scaffolding:

| Now | Becomes |
| --- | --- |
| `src/services/researchService.ts` (177 lines of `simulateLatency` + mock imports) | thin `fetch` wrappers |
| `src/services/billingService.ts` (31 lines) | thin `fetch` wrappers |
| `src/data/mock*.ts` (6 files, 911 lines) | server seed data / test fixtures |
| `researchmind.auth.user` in `localStorage` | `GET /auth/me` + token refresh |
| `researchmind.usage.count` in `localStorage` | `subscription.usage[]` (§7.5) |
| `isAuthenticated()` in `src/auth/session.ts` | a real session check |
| `onlyForUsers()` guard in `researchService.ts:35` | server-side `401` |

`researchmind.theme` and `researchmind.sidebar.collapsed` are legitimately
client-side and should stay in `localStorage` (or move to §10.4 preferences for
cross-device sync).

---

## 12. Non-functional notes

### 12.1 Streaming chat

The single largest UX gap. The mock simulates 900 ms; a real RAG answer over 24
documents takes 3–20 s, and the frontend shows a typing indicator the whole
time. Two options:

**A. Server-Sent Events** — works with plain `EventSource`, no client library.
Note the app has **no** WebSocket/SSE code today and no socket library in
`package.json`, so SSE is the smaller change.

**B. WebSocket** — needed anyway for §12.5, if you go that route.

Either way, the frontend needs changes in `sendChatMessage` and
`ProjectChat.handleSend`, because both assume a single resolved message. The
per-message shape does not change — you stream partial `content` and send
`evidence` last. This is a T3 decision in the app's current form but strongly
recommended before real users meet real latency.

### 12.2 Long-running processing

Transcription, thematic analysis and report generation are all async and all
exceed a normal request timeout. The `202` + status-field pattern in
§4.3/§4.6/§8.3 assumes a client that polls or subscribes. Right now nothing
does, so pick one:

- **Polling** — simplest. `GET /projects/{id}/documents` already returns
  `status`; re-fetch every few seconds while any document is `processing`.
  Note the frontend has no polling at all today, so this needs a small addition.
- **SSE / WebSocket** — see §12.5.

The audio reference in `mockDocuments.ts` is stamped with 2h25m of processing
(`15:44` → `18:09`), so whatever you pick must survive long jobs — a
per-request-held HTTP connection is not viable.

### 12.3 Rate limits and quotas

Enforce server-side; the client counters are cosmetic. The plan limits in
`BillingPlan.limits` are your source of truth:

| Plan | `documents` | `queries` | `seats` |
| --- | --- | --- | --- |
| `student` | 25 | 200 | 1 |
| `researcher` | 250 | 2,000 | 1 |
| `team` | 1,000 | 10,000 | 5 |
| `institution` | -1 | -1 | -1 |

Return `429` with `Retry-After` for burst limits and `403` +
`{"error":{"code":"quota_exceeded"}}` for exhausted plan quotas. Include
`X-RateLimit-Limit` / `-Remaining` / `-Reset` on responses (§1.3).

### 12.4 Internationalisation

The app is explicitly multilingual in a way that is unusual and worth taking
seriously: research data in `Shona` and `Ndebele`, analysed in English
translation, with the **original language preserved per excerpt**
(`Evidence.language`) and an explicit warning in the generated methodology
report that translation was used (`mockMessages.ts:290`).

Implications:

- Never overwrite the original transcript. Store the source-language text
  alongside any translation (`settings.autoTranslate` in §10.4).
- `Evidence.quote` should be verbatim in the participant's own words;
  `language` says which.
- `ResearchDocument.language` is detected per file and rendered directly.
- Do not assume English query input means an English corpus.

### 12.5 Realtime

No realtime exists. The two candidates are `ResearchDocument.status` transitions
after processing and theme/report generation progress. See §12.1 for the
transport recommendation. If you add it, keep `Authorization` on the WebSocket
upgrade request — browsers cannot set headers on `new WebSocket(url)`, so pass a
short-lived token as a query param or use a subprotocol.

### 12.6 Conversation scoping

`getMessages(projectId)` takes a project, not a conversation
(`researchService.ts:98`), and the `?conversation=` param in the URL is read but
never passed to the service (`ProjectChat.tsx:13, 34`). Meanwhile
`Conversation.messageCount` implies messages are per-conversation.

So the two models disagree. Pick one:

- **Per-conversation (recommended)** — add
  `GET /projects/{id}/conversations/{convId}/messages` (§7.3) and create
  conversations explicitly (§7.6).
- **Per-project single thread** — drop the `conversations` table and
  `messageCount`, and rename accordingly.

The sidebar already lists conversations across projects, which favours
per-conversation.

### 12.7 Data residency & audit

The Institution plan sells *"Data residency and audit logs"* and
*"Unlimited seats with SSO"* (`mockBilling.ts:58-60`). Those are contractual
promises, not just features:

- Per-tenant data residency (region pinning on storage).
- An append-only audit log: who accessed which participant data, when.
- SSO (SAML/OIDC) and SCIM provisioning for institutions.

This is also a research-ethics surface. Participants are pseudonymous by design
(`P01`), and `age`/`location` are optional. Treat that as a requirement, not a
default: access to raw participant data should be logged and auditable from day
one, and consent scope should be enforceable per project.

### 12.8 Other known frontend issues

Reported here because they affect how you should design the API:

| Issue | Location | Impact on backend design |
| --- | --- | --- |
| No error handling anywhere | all service calls | Every endpoint must fail loudly; add a global handler |
| `recordUsage()` not cleared on logout | `AuthContext.tsx:48-51` | Drop the localStorage counter; use `subscription.usage[]` |
| Hard-coded project id fallbacks | `ResearchData.tsx:79`, `Sidebar.tsx:71`, `Header.tsx:71`, `FinalCTA.tsx:49` all fall back to `'healthcare-access'` | Harmless server-side, but demo-only data will leak into real tests |
| `listParticipants` is dead code | `researchService.ts:90` | No UI consumer; build it for the roadmap, not for a current screen |
| `getProject()` accepts `undefined` id | `researchService.ts:42` | Returns `undefined`; guard rather than 404 a missing path param |
| `nginx.conf` has no `proxy_pass` | `nginx.conf` | `/api/*` will be swallowed by the SPA fallback — add a proxy block |
| No `server.proxy` in Vite | `vite.config.ts` | Same problem in dev |
| Stale committed `dist/` | `dist/` | Built from an older commit; will drift from `src/` |

---

## Appendix A — Reference seed data

Complete, valid payload examples for every schema, taken from the frontend
`src/data/` files. Use them as fixtures.

| Schema | Source file | Records |
| --- | --- | --- |
| `ResearchProject` | `mockProjects.ts:3` | 6 (5 `active`, 1 `archived`) |
| `Conversation` | `mockProjects.ts:108` | 5 |
| `Participant` | `mockProjects.ts:151` | 8 (all `healthcare-access`) |
| `ResearchDocument` | `mockDocuments.ts:3` | 12 (9 `processed`, 1 `processing`, 1 `failed`, +1) |
| `ResearchTheme` | `mockAnalysis.ts:3` | 5 (all `healthcare-access`) |
| `ThemeRelationship` | `mockAnalysis.ts:86` | 6 |
| `ResearchReport` | `mockReports.ts:3` | 5 (3 `final`, 2 `draft`) |
| `ChatMessage` | `mockMessages.ts:8` | 2 (1 user, 1 assistant with 3 `Evidence`) |
| `BillingPlan` | `mockBilling.ts:3` | 4 |
| `Subscription` | `mockBilling.ts:66` | 1 |
| `Invoice` | `mockBilling.ts:84` | 4 (all `paid`) |

## Appendix B — Where each response field is read

Useful for deciding which fields are load-bearing versus decorative.

**`ResearchProject`** — `name` + `description` (`ProjectCard.tsx:20,30`),
`status` (`:22`), `updatedAt` (`:44`), `documentCount`/`interviewCount`/
`focusGroupCount` (`ProjectCard.tsx:8-10`), `participantCount` +
`description` + `themes[]` (`ProjectOverview.tsx:94,97,178-181`),
`name` + `status` + counts (`ProjectLayout.tsx:85,103,105`).

**`ResearchDocument`** — `extension`, `name`, `fileSize`, `language`, `type`,
`projectId`, `participantCount`, `status`, `updatedAt` (`DataTable.tsx:249-279`),
`kind` + `status` for menu branching (`:71-72`), `name`/`type` for search and
filtering (`ResearchData.tsx:59-65`).

**`ResearchTheme`** — `name`, `description`, `excerptCount`,
`participantCount`, `sourceCount`, `confidence` (`ThemeCard.tsx:12,18,23,29,36,42,47,51`),
`codes[].name`, `codes[].excerptCount` (`:67,69`).

**`ThemeRelationship`** — `sourceThemeId`, `targetThemeId`
(`ThemeRelationshipMap.tsx:63-64`), `strength` (`:75,77`), `confidence`
(`:105`).

**`Evidence`** — `participant`, `timestamp`, `theme`, `code`, `language`,
`relevance`, `source`, `quote` (`EvidencePanel.tsx:21-28,63,87,99`),
`source`, `participant`, `timestamp`, `page`, `quote`, `theme`, `code`,
`language` (`EvidenceCard.tsx:25-54`), `id`, `source` (`ChatMessage.tsx:48,54`).

**`ChatMessage`** — `role` (`ChatMessage.tsx:13`), `createdAt` (`:36`),
`content` (`:41`), `evidence[].id`, `evidence[].source` (`:48,54`).

**`BillingPlan`** — `limits.documents`/`queries`/`seats`,
`monthlyPrice`, `annualPrice`, `highlight`, `features[]`
(`Subscription.tsx:63-69,77,139,164`).

**`Subscription`** — `planId` (`:213`), `status` (`:235`), `renewsAt`
(`:250,300,312`), `interval` (`:203,252`), `paymentMethod.brand`/`last4`/`expiry`
(`:281,284`), `usage[].label`/`used`/`limit`/`unit` (`:98-103`).

**`Invoice`** — `description`, `number`, `issuedAt`, `amount`, `status`, `id`
(`Subscription.tsx:395-411`).
