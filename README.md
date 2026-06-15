# CallAudit Frontend — AI Call QA Dashboard

React + Vite SPA for uploading call recordings, viewing AI-generated QA evaluations, managing agents, and monitoring analytics.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Browser["Browser (React SPA)"]
        direction TB
        ROUTER["react-router-dom v6"]
        AUTH["AuthContext<br/>JWT Token Storage"]
        THEME["Dark/Light Mode<br/>localStorage"]
        UI["Tailwind CSS<br/>lucide-react icons<br/>framer-motion animations"]
        CHARTS["recharts<br/>Line / Bar / Pie"]
    end

    subgraph PAGES["Page Components (14)"]
        PUBLIC["Login / Register"]
        PROTECTED["Dashboard / Upload / Calls<br/>Evaluations / Analytics<br/>Agents / AgentDetails<br/>AgentUpload / AddAgent<br/>Results / Profile / Users"]
    end

    subgraph COMPONENTS["Shared Components (10)"]
        LAYOUT["DashboardLayout<br/>Sidebar + Main"]
        UPLOAD["UploadForm<br/>Drag & Drop"]
        SCORE["ScoreCard<br/>Radial + Category Bars"]
        TRANS["TranscriptViewer<br/>3-Tab View"]
        GUARD["ProtectedRoute<br/>Auth + Role Guard"]
        SKEL["Skeleton<br/>Loading States"]
        EMPTY["EmptyState<br/>Placeholder UI"]
        MODAL["ConfirmModal<br/>Delete Confirmation"]
        CARD["AgentCard<br/>Agent Summary"]
        EVAL["EvaluationList<br/>Recent Widget"]
    end

    SERVICES["api.js<br/>axios client<br/>+ interceptor"] -->|HTTP| API["FastAPI Backend<br/>port 8000/api/*"]

    ROUTER --> PAGES
    PAGES --> COMPONENTS
    PAGES --> SERVICES
    COMPONENTS --> AUTH
    PROTECTED --> GUARD
    GUARD --> AUTH
```

---

## Route Structure

```mermaid
flowchart TD
    APP["App.jsx<br/><BrowserRouter>"] --> PUBLIC["Public Routes"]
    APP --> PRIVATE["Protected Routes<br/><ProtectedRoute + DashboardLayout>"]

    PUBLIC --> LOGIN["/login<br/>Login.jsx"]
    PUBLIC --> REGISTER["/register<br/>Register.jsx"]

    PRIVATE --> DASH["/ (Dashboard)<br/>KPI cards + Charts + Quick nav"]
    PRIVATE --> UPLOAD["/upload<br/>UploadForm + EvaluationList"]
    PRIVATE --> CALLS["/calls<br/>Calls table + status + delete"]
    PRIVATE --> EVALS["/evaluations<br/>Evaluation grid + search"]
    PRIVATE --> RESULT["/results/:id<br/>ScoreCard + TranscriptViewer"]
    PRIVATE --> ANALYTICS["/analytics<br/>Trends + Breakdown + Stats"]
    PRIVATE --> PROFILE["/profile<br/>User details"]

    PRIVATE --> AGENTS["/agents<br/>Agent card grid"]
    PRIVATE --> AGENT_NEW["/agents/new<br/>Add agent form"]
    PRIVATE --> AGENT_ID["/agents/:id<br/>Agent stats + history"]
    PRIVATE --> AGENT_UPLOAD["/agents/:id/upload<br/>Agent upload form"]

    PRIVATE --> USERS["/users<br/>Admin: user table + CRUD"]

    style USERS fill:#fef3c7,stroke:#f59e0b
    style LOGIN fill:#dbeafe,stroke:#3b82f6
    style REGISTER fill:#dbeafe,stroke:#3b82f6
```

---

## Component Tree

```mermaid
graph TB
    ROOT["main.jsx<br/><BrowserRouter><br/><AuthProvider><br/><App/>"] --> APP["App.jsx<br/><Routes> / <AnimatePresence>"]

    subgraph AUTH_WRAPPER["AuthProvider (AuthContext)"]
        APP
    end

    APP --> PUBLIC["Public Routes<br/>(no layout)"]
    APP --> PROT["Protected Routes<br/><ProtectedRoute>"]

    PUBLIC --> LG["Login.jsx<br/>email + password form"]
    PUBLIC --> RG["Register.jsx<br/>name + email + password form"]

    PROT --> DL["DashboardLayout.jsx<br/>flex: sidebar + main"]
    DL --> SB["Sidebar.jsx<br/>nav links + dark mode + user"]
    DL --> MAIN["\<main\> area"]

    MAIN --> PT["PageTransition.jsx<br/>framer-motion wrapper"]

    PT --> DASH["Dashboard.jsx<br/>KPI cards + 3 charts + nav"]
    PT --> UP["UploadPage.jsx<br/>UploadForm + EvaluationList"]
    PT --> CA["Calls.jsx<br/>Call table + ConfirmModal"]
    PT --> EV["Evaluations.jsx<br/>Grid + search bar"]
    PT --> RE["ResultsPage.jsx<br/>ScoreCard + TranscriptViewer"]
    PT --> AN["Analytics.jsx<br/>Charts + stats"]
    PT --> PR["Profile.jsx<br/>User details card"]
    PT --> AG["Agents.jsx<br/>AgentCard grid"]
    PT --> ANEW["AddAgent.jsx<br/>Agent creation form"]
    PT --> ADET["AgentDetails.jsx<br/>Stats + eval history"]
    PT --> AUPL["AgentUpload.jsx<br/>Agent upload form"]
    PT --> US["Users.jsx<br/>Table + ConfirmModal"]

    UP --> UF["UploadForm.jsx<br/>Drag & drop + validation"]
    UP --> EL["EvaluationList.jsx<br/>Recent evals widget"]

    RE --> SC["ScoreCard.jsx<br/>Radial + 9 category bars"]
    RE --> TV["TranscriptViewer.jsx<br/>3-tab conversation view"]

    CA --> CM["ConfirmModal.jsx<br/>Delete confirmation"]
    AG --> AC["AgentCard.jsx<br/>Avatar + score + calls"]

    EV --> ES["EmptyState.jsx<br/>Placeholder"]
    CA --> ES
    AG --> ES

    SC --> SK["Skeleton.jsx<br/>Loading skeletons"]
    EV --> SK

    UF --> API["api.js<br/>Axios client + interceptor"]
    API --> BACKEND["FastAPI /api/*"]
```

---

## Data Flow — Upload to Results

```mermaid
sequenceDiagram
    actor U as User
    participant UP as UploadPage
    participant UF as UploadForm
    participant API as api.js (Axios)
    participant BACK as Backend
    participant CA as Calls Page
    participant RE as ResultsPage
    participant SC as ScoreCard
    participant TV as TranscriptViewer

    U->>UP: Navigate to /upload
    UP->>UF: Render upload form

    U->>UF: Drop audio file
    UF->>UF: Validate file type + size
    UF->>API: POST /api/upload (FormData)
    API->>BACK: HTTP upload
    BACK-->>API: {call_id, status: "pending"}
    API-->>UF: Return result
    UF->>U: Success notification
    UF->>U: Navigate to /calls

    U->>CA: See call list
    CA->>API: GET /api/calls
    API->>BACK: Fetch calls
    BACK-->>API: [{call_id, status, date}, ...]
    API-->>CA: Render table
    CA->>CA: Status badges (pending/completed/failed)

    U->>CA: Click call row
    CA->>U: Navigate to /results/:id

    RE->>API: GET /api/calls/:callId/evaluation
    API->>BACK: Fetch evaluation
    BACK-->>API: {processing_status: "processing"}

    loop Poll every 2s (max 30 attempts)
        RE->>API: GET /api/calls/:callId/evaluation
        API->>BACK: Poll evaluation
        BACK-->>API: {processing_status: "completed", overall_score, ...}
    end

    RE->>SC: Render evaluation scores
    RE->>TV: Render conversation

    MC->>SC: Animated score bars
    MC->>TV: Tabbed transcript display

    SC-->>RE: Strengths + improvements + critical errors
    TV-->>RE: Agent/Customer, Diarized, Plain views

    RE-->>U: Full evaluation result page
```

---

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                    # React entry, <BrowserRouter> + <AuthProvider>
│   ├── App.jsx                     # Route definitions, <AnimatePresence>
│   ├── index.css                   # Tailwind directives + custom layers
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # JWT auth state provider + useAuth hook
│   │
│   ├── layout/
│   │   ├── DashboardLayout.jsx     # Sidebar + main content area wrapper
│   │   ├── Sidebar.jsx             # Navigation, dark mode, user info
│   │   └── Navbar.jsx              # Top header bar (not currently used)
│   │
│   ├── pages/                      # 14 route-level page components
│   │   ├── Login.jsx               # Sign-in form
│   │   ├── Register.jsx            # User registration
│   │   ├── Dashboard.jsx           # KPIs, charts, quick nav
│   │   ├── UploadPage.jsx          # Audio upload + recent evaluations
│   │   ├── Calls.jsx               # Call list table with status
│   │   ├── Evaluations.jsx         # Evaluation grid with search
│   │   ├── ResultsPage.jsx         # Full evaluation detail
│   │   ├── Analytics.jsx           # Trend & category charts
│   │   ├── Agents.jsx              # Agent card grid
│   │   ├── AddAgent.jsx            # Create new agent
│   │   ├── AgentDetails.jsx        # Agent profile + history
│   │   ├── AgentUpload.jsx         # Upload for specific agent
│   │   ├── Users.jsx               # Admin user management
│   │   └── Profile.jsx             # User profile display
│   │
│   ├── components/                 # 10 shared/reusable components
│   │   ├── ProtectedRoute.jsx      # Auth guard + role check
│   │   ├── PageTransition.jsx      # Framer Motion animation wrapper
│   │   ├── UploadForm.jsx          # Drag-and-drop file upload
│   │   ├── ScoreCard.jsx           # Radial + category score display
│   │   ├── TranscriptViewer.jsx    # 3-tab conversation viewer
│   │   ├── AgentCard.jsx           # Clickable agent summary card
│   │   ├── EvaluationList.jsx      # Recent evaluations widget
│   │   ├── ConfirmModal.jsx        # Animated confirmation dialog
│   │   ├── Skeleton.jsx            # Card, Table, Eval loading states
│   │   └── EmptyState.jsx          # Empty list placeholder
│   │
│   └── services/
│       └── api.js                  # Axios client, 21 endpoint functions
│
├── index.html                      # Vite entry HTML
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Dev proxy /api -> localhost:8000
├── tailwind.config.js              # Custom theme, dark mode class
├── postcss.config.js               # PostCSS + Tailwind + Autoprefixer
├── nginx.conf                      # Docker nginx config (SPA + API proxy)
├── Dockerfile                      # Multi-stage build (Node -> nginx)
└── .env.example                    # VITE_API_URL
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 | UI component library |
| **Build** | Vite 5.4 | Dev server + optimized builds |
| **Routing** | react-router-dom 6.26 | SPA client-side routing |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS, dark mode |
| **Icons** | lucide-react | SVG icon library |
| **Charts** | recharts 2.12 | Line, Bar, Pie charts |
| **Animations** | framer-motion 12.40 | Page transitions, staggered lists |
| **HTTP** | axios 1.7 | API client + auth interceptor |
| **Auth** | JWT (localStorage) | Bearer token management |

---

## Features

- **Dashboard** — KPI cards (agents, calls, avg score, critical errors), score trend line chart, category bar chart, clean vs critical error pie chart
- **Upload** — Drag-and-drop audio upload with file validation, recent evaluations widget
- **Calls** — Table view with color-coded processing status badges, admin delete
- **Evaluations** — Searchable grid with score previews, strengths, improvements
- **Results** — Radial overall score, 9 animated category bars, strengths/improvements, critical error alerts, 3-tab transcript viewer
- **Analytics** — Score trends over time, per-category breakdown, error stats
- **Agents** — Card grid with agent scores, create form, detail page with evaluation history
- **Agent Upload** — Upload call audio linked to a specific agent
- **Users** (Admin) — User table with create/delete, role assignment
- **Profile** — Authenticated user details
- **Theme** — Dark/light mode toggle, persisted to localStorage
- **Auth** — JWT-based, ProtectedRoute with role-based access control
- **Responsive** — Mobile hamburger toggle, static sidebar on desktop

---

## Page Views

### Login / Register

```mermaid
flowchart LR
    A["/login"] -->|"email + password"| B["POST /api/auth/login"]
    B -->|"token + user"| C["localStorage<br/>setItem('token')<br/>setItem('user')"]
    C --> D["navigate('/')<br/>Dashboard"]
    D -->|"no account?"| A
    D -->|"need account?"| E["/register"]
    E -->|"name + email + password"| F["POST /api/auth/register"]
    F --> C
```

### Dashboard

```mermaid
flowchart TD
    A["Dashboard.jsx"] --> B["Greeting<br/>'Good Morning/Afternoon/Evening, {name}'"]
    A --> C["KPI Cards<br/>Total Agents / Total Calls<br/>Avg QA Score / Critical Errors"]
    A --> D["Charts<br/>Score Trend (Line)<br/>Category Performance (Bar)<br/>Errors (Pie)"]
    A --> E["Quick Nav Cards<br/>Upload / Evaluations / Analytics"]

    D --> F["useEffect + API calls<br/>getAnalyticsSummary()<br/>getAnalyticsTrends()<br/>getAnalyticsCategories()"]
    F --> G["recharts<br/><ResponsiveContainer>"]
```

### Evaluation Results

```mermaid
flowchart TD
    A["/results/:id"] --> B["useEffect<br/>GET call + evaluation"]
    B --> C{"Processing?"}
    C -->|yes| D["Poll every 2s<br/>max 30 attempts"]
    C -->|no| E["Render Results"]

    E --> F["Agent Info Card<br/>name + avatar"]
    E --> G["ScoreCard<br/>Radial overall + 9 bars"]
    E --> H["TranscriptViewer<br/>3 tabs"]
    E --> I["Critical Errors<br/>alert callout"]

    G --> J["Strengths list"]
    G --> K["Improvements list"]

    H --> L["Agent/Customer<br/>chat bubble view"]
    H --> M["Diarized<br/>SPEAKER_00 format"]
    H --> N["Plain<br/>raw transcript"]
```

---

## Components

| Component | Props | Description |
|-----------|-------|-------------|
| `ProtectedRoute` | `children, roles?` | Auth guard: redirects to `/login` if not authenticated, to `/` if unauthorized role |
| `PageTransition` | `children` | Framer Motion fade + slide-up wrapper for page content |
| `UploadForm` | — | Drag-and-drop zone, file validation (.wav/.mp3/.m4a), remove button, loading spinner |
| `ScoreCard` | `evaluation` | Radial progress (overall score), 9 animated bar charts, strengths/improvements lists |
| `TranscriptViewer` | `conversation?`, `transcript?` | Tabbed: Agent/Customer chat, Diarized text, Plain text |
| `AgentCard` | `agent` | Clickable card with avatar initial, name, dept, avg score, total calls |
| `EvaluationList` | — | Fetches 5 most recent evaluations, shows score + date, navigates to result |
| `ConfirmModal` | `isOpen, onClose, onConfirm, title, message` | Animated confirmation overlay |
| `Skeleton` | — | `CardSkeleton`, `TableSkeleton`, `EvalSkeleton` |
| `EmptyState` | `icon, title, description, buttonText?, onAction?` | Empty list placeholder |

---

## API Service Layer

All 21 backend endpoints are accessible through `src/services/api.js`. The Axios instance:

```mermaid
flowchart LR
    A["api.js"] --> B["axios.create()<br/>baseURL: VITE_API_URL"]
    B --> C["Request Interceptor<br/>Attach Bearer token"]
    B --> D["Response Interceptor<br/>401 → logout + redirect"]

    C --> E["GET /api/auth/me"]
    C --> F["POST /api/auth/login"]
    C --> G["POST /api/auth/register"]
    C --> H["POST /api/upload"]
    C --> I["POST /api/evaluate/:id"]
    C --> J["GET /api/evaluations"]
    C --> K["GET /api/calls"]
    C --> L["GET /api/analytics/*"]
    C --> M["GET/POST/DELETE /api/agents/*"]
    C --> N["GET/POST/DELETE /api/users/*"]
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `""` (empty) | Backend API base URL. In dev, uses Vite proxy. In Docker/nginx, proxied at `/api/`. |

---

## Quick Start

```bash
# 1. Enter frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server (API proxy -> localhost:8000)
npm run dev

# Open http://localhost:5173
```

### Docker

```bash
# From project root
docker compose up -d
# Frontend served at http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview    # Preview at http://localhost:4173
```

---

## Theming

Dark mode uses Tailwind's `class` strategy. Toggled via `Sidebar` component, persisted to `localStorage` under key `theme`. Applied by adding/removing `.dark` class on `<html>` element.

```js
// tailwind.config.js
darkMode: 'class'
```

---

## Development Proxy

In `vite.config.js`, the dev server proxies `/api` requests to the backend:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

This means in development the frontend can use relative paths (`/api/upload`), while production nginx handles the same proxy.
