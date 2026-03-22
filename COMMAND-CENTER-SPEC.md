# Razor Command Center - Executive Operations Dashboard

## Project Overview

**Project Name:** Razor Command Center  
**Type:** Executive Operations Dashboard (Next.js WebApp)  
**Deployment:** AItuned.io  
**Access:** Password-protected  

### Purpose
Single-pane-of-glass operations dashboard for Jeff's AI-powered business empire. Provides real-time visibility into agents, infrastructure, projects, finances, and content pipeline.

### Brand Identity
- **Theme:** Dark mode with gold/amber accents (LessonCraft brand alignment)
- **Primary Color:** `#d4a853` (gold), `#f59e0b` (amber-500)
- **Background:** `#020617` (slate-950)
- **Cards:** `#0f172a` (slate-900) with subtle borders
- **Text:** White primary, slate-400 secondary
- **Mobile-First:** Optimized for phone viewing (Jeff's primary device)

---

## Phase 1: Foundation (MVP - Build First)

### 1.1 Authentication System

**Route:** `/login`  
**Implementation:** Simple password protection using Next.js middleware or API route

```
┌─────────────────────────────────────────────────────────┐
│  LOGIN PAGE                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │         🏛 RAZOR COMMAND CENTER                 │   │
│  │                                                  │   │
│  │    [Password Input]                             │   │
│  │                                                  │   │
│  │    [ENTER]                                      │   │
│  │                                                  │   │
│  │    🔐 Protected - Authorized Personnel Only    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Storage:** Environment variable `DASHBOARD_PASSWORD`  
**Session:** HTTP-only cookie, 24-hour expiry  
**Middleware:** Protect all routes except `/login`  

---

### 1.2 Executive Overview (Home)

**Route:** `/` (after login)

```
┌────────────────────────────────────────────────────────────────────┐
│  RAZOR COMMAND CENTER              [LIVE ●]  🕐 14:32:05 CST     │
│  Gospel Tuned Empire HQ                                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ ACTIVE   │ │ TASKS     │ │ COST     │ │ REVENUE  │ │ ERRORS │ │
│  │ AGENTS   │ │ IN FLIGHT │ │ TODAY    │ │ MTD      │ │ 24H    │ │
│  │    3     │ │    7      │ │ $12.45   │ │ $89.00   │ │   0    │ │
│  │ ○○○      │ │ ████░░░   │ │ 📉 -5%   │ │ 📈 +12%  │ │  ✓    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────┐ ┌─────────────────────┐ │
│  │ 🖥 INFRASTRUCTURE                   │ │ 💰 QUICK ACTIONS    │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │ [🚀 Spawn Agent]   │ │
│  │ │ Mac VM  │ │OrangePi │ │RaceStrm │ │ │ [📋 New Task]      │ │
│  │ │  ●ONLINE│ │ ●ONLINE │ │ ●ONLINE │ │ │ [📝 Log Expense]    │ │
│  │ │ CPU:23% │ │ CPU: 8% │ │ CPU:45% │ │ │ [💸 Log Revenue]    │ │
│  │ └─────────┘ └─────────┘ └─────────┘ │ │ [🔄 Sync Status]    │ │
│  └─────────────────────────────────────┘ └─────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ACTIVE TASKS                                                  │ │
│  │  • Codex: Building LessonCraft Flutter - 45 min remaining   │ │
│  │  • Scout: Researching Kalshi markets - 12 min remaining      │ │
│  │  • Builder: Deploying to AItuned.io - waiting for approval   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────┐ ┌──────────────────────────────────────┐│
│  │ 📅 UPCOMING          │ │ 🚨 ALERTS                            ││
│  │ 15:00 - Sprint sync │ │ No active alerts                     ││
│  │ 18:00 - Daily brief │ │                                      ││
│  └──────────────────────┘ └──────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- Active agents: OpenClaw sessions API (`/api/agents`)
- Tasks in flight: OpenClaw subagent API
- Costs: Manual entry + API usage tracking
- Revenue: Manual entry (App Store Connect API later)
- Server health: SSH ping/health checks

**Polling:** 10-second intervals for active data

---

### 1.3 Authentication Implementation

**File:** `app/api/auth/login/route.ts`
```typescript
POST /api/auth/login
Body: { password: string }
Response: { success: boolean, token?: string }
```

**Middleware:** `middleware.ts`
- Check cookie on every request
- Redirect to `/login` if no valid session

---

### 1.4 Basic Layout & Navigation

**Shell Component:** `components/layout/DashboardShell.tsx`

```
┌─────────────────────────────────────────────────────────┐
│ [☰] RAZOR COMMAND    [🔔 2]  [⚙️]  [🚪]               │
├─────────────────────────────────────────────────────────┤
│  🏠    🤖      📊      💰      🖥️      📝      📈     │
│ Home  Agent  Project  Finance  Infra   Content  Apps  │
│       Bench  Mgmt     DashboardMonitor Pipeline        │
└─────────────────────────────────────────────────────────┘
```

**Mobile Navigation:** Bottom tab bar for phone, sidebar for desktop

---

## Phase 2: Core Monitoring

### 2.1 Agent Bench

**Route:** `/agents`

```
┌────────────────────────────────────────────────────────────────────┐
│  🤖 AGENT BENCH                                      [🔄 Refresh] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ CODEX - The Muscle                              [●] ACTIVE    │ │
│  │ "Building LessonCraft Flutter features"                       │ │
│  │ ────────────────────────────────────────────────────────────  │ │
│  │ Tasks: 42 completed │ Success: 94% │ Cost/task: $0.23        │ │
│  │ Current: PR #89 - Feature X (est. 45min)                     │ │
│  │                                                              │ │
│  │ [View Logs] [Stop] [Steer...]                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ KIMI - The Professional                        [○] IDLE      │ │
│  │ Last active: 2 hours ago                                       │ │
│  │ Tasks: 28 completed │ Success: 96% │ Cost/task: $0.18       │ │
│  │                                                              │ │
│  │ [Start Task] [View History]                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ SCOUT - The Researcher                           [○] IDLE     │ │
│  │ Last active: 4 hours ago                                      │ │
│  │ Tasks: 15 completed │ Success: 100% │ Cost/task: $0.12       │ │
│  │                                                              │ │
│  │ [Start Task] [View History]                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│  [🚀 SPAWN NEW AGENT]                                             │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Task description: [                                        ] │  │
│  │ Agent preference: [Any ▼]                                   │  │
│  │ Priority: [Normal ▼]                                        │  │
│  │                                                [SPAWN]      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

**Agent Status States:**
- ● Active (working on task)
- ○ Idle (available)
- ⚠ Error (failed/stuck)
- ⏸ Paused (manually stopped)

**API Endpoints:**
```
GET  /api/agents              - List all agents
GET  /api/agents/[id]         - Get agent details & history
POST /api/agents/spawn        - Spawn new agent task
POST /api/agents/[id]/stop    - Stop active agent
POST /api/agents/[id]/steer   - Redirect agent to new task
GET  /api/agents/[id]/logs   - Stream agent logs (SSE)
```

**Real-time Logs:** Server-Sent Events endpoint for live log streaming

---

### 2.2 Infrastructure Monitor

**Route:** `/infrastructure`

```
┌────────────────────────────────────────────────────────────────────┐
│  🖥️ INFRASTRUCTURE MONITOR                        [🔄 Auto-refresh]
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐ ┌──────────────────────┐                 │
│  │ 🖥 MAC VM            │ │ 🍊 ORANGE PI         │                 │
│  │ 100.83.144.110      │ │ 100.114.87.93       │                 │
│  │                      │ │                      │                 │
│  │ ● ONLINE      23%   │ │ ● ONLINE       8%    │                 │
│  │                      │ │                      │                 │
│  │ CPU    ████░░░ 23%  │ │ CPU    ██░░░░░  8%   │                 │
│  │ RAM    ██████░░ 62%  │ │ RAM    ███░░░░ 38%   │                 │
│  │ DISK   ███░░░░░ 35%  │ │ DISK   ██░░░░░ 22%   │                 │
│  │                      │ │                      │                 │
│  │ Tailscale: ● ONLINE │ │ Tailscale: ● ONLINE │                 │
│  │ SSH: ● Accessible   │ │ SSH: ● Accessible   │                 │
│  │ Docker: N/A         │ │ Docker: ○ Not run   │                 │
│  │                      │ │                      │                 │
│  │ [SSH] [Details]     │ │ [SSH] [Details]     │                 │
│  └──────────────────────┘ └──────────────────────┘                 │
│                                                                     │
│  ┌──────────────────────┐ ┌──────────────────────┐                 │
│  │ 🎮 RACESTREAM        │ │ ☁️ AITUNED.IO        │                 │
│  │ 100.93.38.46        │ │ aituned.io          │                 │
│  │                      │ │                      │                 │
│  │ ● ONLINE      45%   │ │ ● ONLINE       -     │                 │
│  │                      │ │                      │                 │
│  │ CPU    █████░░ 45%  │ │ Status: Deployed     │                 │
│  │ RAM    ██████░ 78%  │ │ SSL: ✓ Valid         │                 │
│  │ DISK   ████░░░░ 48%  │ │ Response: 145ms      │                 │
│  │                      │ │                      │                 │
│  │ Tailscale: ● ONLINE │ │ CDN: ● Healthy       │                 │
│  │ SSH: ● Accessible   │ │ DB: ● Connected      │                 │
│  │ Docker: 4 containers │ │                      │                 │
│  │   ├─ postgres       │ │ [Visit] [Logs]       │                 │
│  │   ├─ redis          │ │                      │                 │
│  │   ├─ cloudflared    │ │                      │                 │
│  │   └─ samba          │ │                      │                 │
│  │                      │ │                      │                 │
│  │ [SSH] [Docker] [Logs]│ │                      │                 │
│  └──────────────────────┘ └──────────────────────┘                 │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**Server Data Collection:**

```typescript
// SSH-based health check structure
interface ServerHealth {
  hostname: string;
  ip: string;
  status: 'online' | 'offline' | 'degraded';
  cpu: number;        // percentage
  memory: number;     // percentage  
  disk: number;       // percentage
  uptime: number;     // seconds
  services: {
    ssh: boolean;
    docker?: boolean;
    dockerContainers?: string[];
  };
  network: {
    tailscale: boolean;
    latency: number; // ms
  };
}
```

**API Endpoints:**
```
GET /api/infrastructure          - Get all server statuses
GET /api/infrastructure/[id]    - Get single server details
POST /api/infrastructure/ping    - Trigger ping check
GET /api/infrastructure/[id]/logs - SSH'd logs (tail)
```

**Data Collection:** 
- 30-second polling interval
- SSH connection pooling for efficiency
- Cache results in Redis/memory to avoid overwhelming servers

---

### 2.3 Project Management (Enhanced Kanban)

**Route:** `/projects`

Existing Kanban → Add:

```
┌────────────────────────────────────────────────────────────────────┐
│  📊 PROJECTS                              [Board] [Gantt] [Sprint]│
├────────────────────────────────────────────────────────────────────┤
│  BACKLOG    │ IN PROGRESS  │  REVIEW     │ DONE                   │
│  ────────── │ ──────────── │ ──────────  │ ──────────             │
│             │              │             │                        │
│  ┌────────┐ │ ┌──────────┐ │ ┌─────────┐ │ ┌──────────────────┐    │
│  │Task A  │ │ │Task D    │ │ │Task C   │ │ │ Task B           │    │
│  │ │      │ │ │ ████░░░░ │ │ │ ██████░ │ │ │ ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓  │    │
│  │Priority│ │ │ 75%      │ │ │ 95%     │ │ │ 100% Complete    │    │
│  └────────┘ │ └──────────┘ │ └─────────┘ │ └──────────────────┘    │
│             │              │             │                        │
│  ┌────────┐ │              │             │                        │
│  │Task E  │ │              │             │                        │
│  └────────┘ │              │             │                        │
│             │              │             │                        │
└────────────────────────────────────────────────────────────────────┘
```

**Gantt Chart View:**

```
┌────────────────────────────────────────────────────────────────────┐
│  PROJECT TIMELINE (Gantt)                              [Month ▼] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LessonCraft     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Mar 15 │
│  Flutter Rewrite ░░░░░░████████████░░░░░░░░░░░░░░░░░░░░░░░  Apr 01 │
│  AItuned Deploy ░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░░  Mar 20 │
│  Content Pipeline░░░░░░░░░░░░░░░░░░░░░░░░░░████████████  Apr 15 │
│  Kalshi Strategy ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Ongoing │
│                                                                     │
│  Today ────────────────────────────────────────────────────────────│
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

**Sprint View:**

```
┌────────────────────────────────────────────────────────────────────┐
│  SPRINT 12 - Mar 15-29                        [2 days remaining]│
├────────────────────────────────────────────────────────────────────┤
│  Velocity: 8 pts │ Completed: 5/12 │ Remaining: 7 pts              │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ THIS SPRINT (12)                                          │   │
│  │ ☐ Task 1 - User auth flow                     [3 pts]     │   │
│  │ ☑ Task 2 - API integration                 [2 pts] ✓      │   │
│  │ ☑ Task 3 - UI components                   [2 pts] ✓      │   │
│  │ ☐ Task 4 - Testing                        [3 pts]        │   │
│  │ ☐ Task 5 - Documentation                  [2 pts]         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ BACKLOG (Prioritized)                                     │   │
│  │ • Task 6 - Performance optimization           [5 pts]    │   │
│  │ • Task 7 - Security audit                   [3 pts]     │   │
│  │ • Task 8 - Mobile responsive                 [2 pts]     │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

**Task Dependencies:**

```
Task A (depends on: none)          Task C (depends on: Task A)
     │                                    │
     └──────► Task B ◄───────────────────┘
                   (depends on: A, C)
```

**Implementation:** 
- Reuse existing KanbanBoard component
- Add Gantt using `gantt-task-react` or custom SVG
- Add Sprint planning with drag-drop priority
- Add dependency tracking in task model

---

## Phase 3: Financial & Analytics

### 3.1 Financial Dashboard

**Route:** `/finance`

```
┌────────────────────────────────────────────────────────────────────┐
│  💰 FINANCIAL DASHBOARD                        [Export] [Settings]│
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ BUDGET   │ │ SPENT    │ │ REVENUE  │ │ ROI      │              │
│  │ $500/mo  │ │ $312     │ │ $89      │ │ +15.2%   │              │
│  │ ██████░░ │ │          │ │          │ │          │              │
│  │ 62% used │ │ This Mo  │ │ MTD      │ │ Projects │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ┌────────────────────────────────────┐ ┌────────────────────────┐ │
│  │ 💸 EXPENSES (This Month)          │ │ 💵 REVENUE (MTD)      │ │
│  │                                 │ │                        │ │
│  │ API Costs:         $145.00     │ │ App Store:  $45.00   │ │
│  │   ├─ OpenAI:  $98               │ │ Subscriptions: $0.00 │ │
│  │   ├─ Anthropic: $42              │ │ Ads:          $0.00  │ │
│  │   └─ Other:      $5              │ │ Other:       $44.00  │ │
│  │                                 │ │                        │ │
│  │ Infrastructure:   $167.00      │ │                        │ │
│  │   ├─ RaceStream:  $45 (power)   │ │ [Manual Entry]        │ │
│  │   ├─ Orange Pi:   $12 (power)   │ │ + Add revenue         │ │
│  │   └─ Cloud:      $110          │ │                        │ │
│  │                                 │ │                        │ │
│  │ TOTAL:           $312.00       │ │ TOTAL:       $89.00   │ │
│  └────────────────────────────────────┘ └────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ 🐗 KALSHI PORTFOLIO                                           ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               ││
│  │ │ INTRADE    │ │ TURNOUT     │ │ TOTAL       │               ││
│  │ │ +$23.50    │ │ -$12.00     │ │ +$11.50     │               ││
│  │ │ 2 positions│ │ 1 position  │ │ 3 positions │               ││
│  │ │ Dem: 53%   │ │ Rep: 48%    │ │             │               ││
│  │ │ [View]     │ │ [View]      │ │ [Details]   │               ││
│  │ └─────────────┘ └─────────────┘ └─────────────┘               ││
│  │                                                                ││
│  │ [Trade History] [Add Position] [Refresh Prices]              ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ ROI BY PROJECT (MTD)                                          ││
│  │ LessonCraft:    +$45 (10 hrs)  = $4.50/hr                      ││
│  │ Command Center: -$30 (5 hrs)   = -$6.00/hr                    ││
│  │ Content:        +$44 (8 hrs)   = $5.50/hr                      ││
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Data Entry Forms:**

```
┌────────────────────────────────────┐
│ + ADD EXPENSE                      │
├────────────────────────────────────┤
│ Category: [API ▼]                  │
│ Provider:   [OpenAI ▼]             │
│ Amount:     [$        ]            │
│ Date:       [2026-03-22]            │
│ Project:    [LessonCraft ▼]        │
│ Description:[                    ] │
│                    [Save] [Cancel]  │
└────────────────────────────────────┘
```

**API Endpoints:**
```
GET  /api/finance/summary         - Budget, spent, revenue summary
GET  /api/finance/expenses        - List expenses (filterable)
POST /api/finance/expenses        - Add expense
GET  /api/finance/revenue         - List revenue entries
POST /api/finance/revenue         - Add revenue
GET  /api/finance/kalshi          - Portfolio positions
POST /api/finance/kalshi/position - Add position
GET  /api/finance/kalshi/prices   - Current market prices
```

**Storage:** JSON files in `data/finance/` or SQLite

---

### 3.2 App Analytics (LessonCraft)

**Route:** `/analytics`

```
┌────────────────────────────────────────────────────────────────────┐
│  📈 LESSONCRAFT ANALYTICS                        [7D ▼] [App Store]│
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ DOWNLOADS│ │ RATINGS   │ │ REVENUE  │ │ CRASHES  │              │
│  │   1,247  │ │   4.7 ★   │ │  $45.00  │ │    0     │              │
│  │ +12% △   │ │ +0.1 △    │ │ +8% △    │ │  0.0%    │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ DOWNLOADS OVER TIME                                          │ │
│  │         █                                                    │ │
│  │       █ █        █                                            │ │
│  │     █ █ █    █ █ █                                            │ │
│  │   █ █ █ █ █ █ █ █ █ █                                        │ │
│  │ ───────────────────────────────────────────────────────────  │ │
│  │ Mon  Tue  Wed  Thu  Fri  Sat  Sun                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────┐ ┌───────────────────────────┐ │
│  │ TOP FEATURES                   │ │ CRASHES (24h)             │ │
│  │ 1. Scripture reading   45%    │ │ No crashes detected ✓     │ │
│  │ 2. Audio playback      32%    │ │                            │ │
│  │ 3. Daily devotional    18%    │ │                            │ │
│  │ 4. Offline mode         5%    │ │ [View Full Crashlytics]   │ │
│  └────────────────────────────────┘ └───────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ REVIEWS (Recent)                                             ││
│  │ ★★★★★ Great app! - "Exactly what I needed for CFM"           ││
│  │ ★★★★☆ Good but... - "Would love offline mode"               ││
│  │ ★★★★★ Love it!  - "The audio is so soothing"                 ││
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- App Store Connect API (future)
- Manual entry (MVP)
- RevenueCat (future)

---

## Phase 4: Content Pipeline

### 4.1 Content Pipeline Dashboard

**Route:** `/content`

```
┌────────────────────────────────────────────────────────────────────┐
│  📝 CONTENT PIPELINE                          [Calendar] [Quality] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ DRAFTS   │ │ IN REVIEW │ │ READY     │ │PUBLISHED │              │
│  │    3     │ │    2      │ │    5     │ │    12    │              │
│  │          │ │           │ │           │ │  this mo │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ PIPELINE STATUS                                             │ │
│  │                                                              │ │
│  │ Morning Light Ep.45 ──────────●─────────────────► Published│ │
│  │ Script: Done ✓ │ Record: Done ✓ │ Edit: Done ✓ │ Upload: ⏳│ │
│  │                                                              │ │
│  │ Come Follow Me Mar ──────────●─────────────────► Review    │ │
│  │ Research: Done ✓ │ Write: Done ✓ │ Humanize: 80% │ Score:  │ │
│  │                                                              │ │
│  │ LDS Story Collection ──────────●─────────────────► Draft  │ │
│  │ Research: 60% │ Sources: 4 │ Outline: ⏳                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ CONTENT CALENDAR (March 2026)                                ││
│  │ ┌────┬────┬────┬────┬────┬────┬────┐                       ││
│  │ │Mon │Tue │Wed │Thu │Fri │Sat │Sun │                       ││
│  │ ├────┼────┼────┼────┼────┼────┼────┤                       ││
│  │ │  2 │  3 │  4 │  5 │  6 │  7 │  8 │                       ││
│  │ │ 📺 │    │ 🎙 │    │ 📺 │    │ 📺 │                       ││
│  │ │ML45│    │CFM │    │ML46│    │ML47│                       ││
│  │ └────┴────┴────┴────┴────┴────┴────┘                       ││
│  │ 📺 = Morning Light  🎙 = Podcast  📝 = Blog                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │ QUALITY SCORES (Pipeline Gospel Standard)                     ││
│  │                                                              ││
│  │ Humanization: ████████████████░░░░░░░ 78%                   ││
│  │ Doctrinal Accuracy: ████████████████████ 95%                 ││
│  │ Engagement: ████████████████░░░░░░░░░ 72%                    ││
│  │ Production Quality: █████████████████░░ 88%                  ││
│  └──────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Content Types:**
- Morning Light episodes (video/audio)
- Come Follow Me written content
- LDS stories
- Social media clips

**Pipeline Stages:**
1. **Idea** - Concept/topic identified
2. **Research** - Gathering sources, scripture references
3. **Writing** - Script/draft creation
4. **Humanization** - AI detection removal
5. **Review** - Quality scoring, fact-check
6. **Production** - Recording, editing
7. **Published** - Live on platform(s)

**API Endpoints:**
```
GET  /api/content           - List all content items
POST /api/content           - Create new content item
PATCH /api/content/[id]     - Update content status
GET  /api/content/calendar  - Get calendar view data
GET  /api/content/stats    - Pipeline statistics
```

---

## Architecture

### Component Hierarchy

```
app/
├── layout.tsx              # Root layout (auth check)
├── page.tsx                # Redirect to dashboard or login
├── login/
│   └── page.tsx            # Login form
├── dashboard/
│   └── page.tsx            # Executive Overview (home)
├── agents/
│   └── page.tsx            # Agent Bench
├── projects/
│   ├── page.tsx            # Kanban + Gantt + Sprint
│   └── [id]/
│       └── page.tsx        # Project detail
├── finance/
│   ├── page.tsx            # Financial dashboard
│   ├── expenses/
│   │   └── page.tsx        # Expense management
│   └── kalshi/
│       └── page.tsx        # Trading view
├── infrastructure/
│   └── page.tsx            # Server monitoring
├── content/
│   └── page.tsx            # Pipeline dashboard
└── analytics/
    └── page.tsx            # App analytics

components/
├── layout/
│   ├── DashboardShell.tsx  # Main layout wrapper
│   ├── Header.tsx          # Top bar with nav
│   ├── Sidebar.tsx         # Desktop navigation
│   └── MobileNav.tsx       # Bottom tabs (mobile)
├── ui/
│   ├── Card.tsx            # Reusable card
│   ├── Button.tsx          # Styled buttons
│   ├── Modal.tsx           # Modal dialog
│   ├── Input.tsx           # Form inputs
│   ├── Badge.tsx           # Status badges
│   ├── Chart.tsx           # Recharts wrapper
│   └── Skeleton.tsx        # Loading states
├── dashboard/
│   ├── StatCard.tsx        # Metric display card
│   ├── QuickActions.tsx    # Action buttons panel
│   ├── AlertsPanel.tsx     # Active alerts
│   └── UpcomingEvents.tsx  # Calendar preview
├── agents/
│   ├── AgentCard.tsx       # Single agent display
│   ├── AgentList.tsx       # Agent grid/list
│   ├── AgentSpawner.tsx    # Spawn form
│   └── LogStream.tsx       # Real-time logs
├── infrastructure/
│   ├── ServerCard.tsx      # Single server display
│   ├── ServerGrid.tsx      # All servers
│   ├── MetricsChart.tsx    # CPU/RAM/Disk charts
│   └── ContainerList.tsx   # Docker containers
├── projects/
│   ├── KanbanBoard.tsx     # Drag-drop board
│   ├── GanttChart.tsx      # Timeline view
│   ├── SprintView.tsx     # Sprint planning
│   └── TaskCard.tsx       # Individual task
├── finance/
│   ├── BudgetOverview.tsx # Budget + spend
│   ├── ExpenseList.tsx    # Expense table
│   ├── RevenueList.tsx    # Revenue table
│   └── KalshiPortfolio.tsx# Trading positions
├── content/
│   ├── PipelineBoard.tsx  # Stage columns
│   ├── ContentCard.tsx    # Content item
│   └── CalendarView.tsx   # Monthly calendar
└── analytics/
    ├── MetricCard.tsx      # App metric
    ├── ChartWrapper.tsx    # Recharts charts
    └── ReviewList.tsx     # App reviews
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
│                                                                  │
│   ┌──────────────┐      ┌──────────────┐      ┌─────────────┐ │
│   │  OpenClaw    │      │   SSH        │      │  GitHub     │ │
│   │  API         │      │   Servers    │      │  API        │ │
│   └──────┬───────┘      └──────┬───────┘      └──────┬──────┘ │
│          │                     │                     │         │
│          ▼                     ▼                     ▼         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              API ROUTE LAYER (Next.js)                  │   │
│   │  /api/agents, /api/infrastructure, /api/finance...    │   │
│   └──────────────────────────┬────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              DATA LAYER (In-Memory Cache)              │   │
│   │  - Server health snapshots                              │   │
│   │  - Agent status cache                                   │   │
│   │  - Polled data (10-30s TTL)                            │   │
│   └──────────────────────────┬────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              CLIENT (React Components)                  │   │
│   │  - SWR/TanStack Query for data fetching                │   │
│   │  - Real-time via polling or SSE                         │   │
│   │  - Optimistic updates                                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Storage

```
data/
├── projects.json           # Tasks, projects (existing)
├── kanban.json             # Kanban board state
├── agents.json             # Agent config, history
├── finance/
│   ├── expenses.json       # Expense entries
│   ├── revenue.json       # Revenue entries
│   └── kalshi.json        # Trading positions
├── infrastructure/
│   └── servers.json        # Server configs
├── content/
│   └── items.json         # Pipeline items
└── settings.json           # Dashboard settings
```

### Real-Time Strategy

| Data Type | Method | Interval |
|-----------|--------|----------|
| Agent status | Polling | 10s |
| Server health | Polling | 30s |
| Task updates | Polling | 10s |
| Log streaming | SSE | Push |
| Financial data | Manual/Polling | 5min |

---

## Phased Build Plan

### Phase 1: Foundation (Week 1)
- [ ] Authentication system (login page + middleware)
- [ ] Basic layout shell with navigation
- [ ] Executive Overview (stats cards, quick actions)
- [ ] Mobile-responsive shell

**Deliverable:** Password-protected dashboard with live stats

### Phase 2: Core Monitoring (Week 2)
- [ ] Agent Bench - list, spawn, stop, steer
- [ ] Real-time log streaming (SSE)
- [ ] Infrastructure Monitor - server cards, health checks
- [ ] SSH integration for server data

**Deliverable:** Full visibility into agents and infrastructure

### Phase 3: Project Management (Week 3)
- [ ] Enhanced Kanban (existing + improvements)
- [ ] Gantt chart view
- [ ] Sprint planning view
- [ ] Task dependencies

**Deliverable:** Complete project management suite

### Phase 4: Financial & Content (Week 4)
- [ ] Financial dashboard - expenses, revenue
- [ ] Kalshi portfolio tracker
- [ ] Content pipeline dashboard
- [ ] App analytics (manual entry MVP)

**Deliverable:** Financial tracking and content pipeline

### Phase 5: Polish & Production (Week 5)
- [ ] Quality of life improvements
- [ ] Dark theme refinements
- [ ] Deployment to AItuned.io
- [ ] Mobile optimizations

**Deliverable:** Production-ready dashboard

---

## Technical Requirements

### Dependencies (Add)
```json
{
  "swr": "^2.2.0",           // Data fetching
  "recharts": "^2.15.0",     // Charts (existing)
  "date-fns": "^3.0.0",      // Date utilities
  "lucide-react": "^0.400.0",// Icons
  "@hello-pangea/dnd": "^18.0.1" // Drag-drop (existing)
}
```

### Environment Variables
```env
# Authentication
DASHBOARD_PASSWORD=your_password_here

# Infrastructure
SSH_KEY_PATH=/path/to/ssh/key
SSH_USER=orangepi

# APIs (future)
OPENCLAW_API_URL=http://localhost:18789
GITHUB_TOKEN=ghp_xxx

# Deployment
NEXT_PUBLIC_APP_URL=https://aituned.io
```

### Security Considerations
1. Password protect all routes via middleware
2. Sanitize all inputs
3. Rate limit API endpoints
4. Use HTTP-only cookies for sessions
5. Add CSRF protection for state-changing operations

---

## Success Metrics

- ✅ Dashboard loads in <2s on mobile
- ✅ Real-time updates within 10s of state change
- ✅ All 7 main sections accessible and functional
- ✅ Password protection working
- ✅ Mobile-responsive down to 320px width
- ✅ Deployed and accessible at AItuned.io

---

*Spec Version: 1.0*  
*Created: 2026-03-22*  
*For: Razor Command Center - Executive Operations Dashboard*
