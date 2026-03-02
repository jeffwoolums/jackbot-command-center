# Agent Meeting Room MVP (Jeff + Tyler + Jackbot + Jarvis)

## Goal
Ship a lightweight, testable MVP inside **jackbot-command-center** that supports:
- Shared human meeting room in Jitsi
- Near-live transcript feed
- Dual-agent support (Jackbot + external Jarvis)
- Action-item extraction and persistent notes
- Backchannel lane for agent coordination

This is intentionally additive and low-risk: no existing dashboard behavior is replaced.

---

## 1) Jitsi Front-Room Flow

### Happy-path sequence
1. Operator opens `/meeting-room`.
2. Enters a Jitsi URL (or uses default) and clicks **Join Jitsi Room**.
3. UI embeds Jitsi in an iframe for shared audio/video context.
4. Meeting data is scoped by `meetingId` and loaded from `/api/meeting-room`.
5. Transcript + action items update in parallel panels as events are posted.

### Why iframe first
- Fastest MVP path with low integration complexity.
- Keeps front-room independent from orchestration internals.
- Easy later upgrade path to full Jitsi IFrame API/event hooks.

---

## 2) Audio → Transcript Bridge (Low-Latency Target)

### MVP bridge design
- **Input**: meeting audio stream (human speech + optionally agent speech).
- **Bridge worker** (future service): segments audio into ~0.8–1.5s chunks.
- **ASR provider** (streaming): emits interim + final text.
- **Event write**: final chunks posted as `TranscriptChunk` events.

### Latency target (MVP)
- Audio frame capture + buffering: **150–300 ms**
- Streaming ASR decode: **350–900 ms**
- Event write + UI paint: **100–250 ms**
- **End-to-end target**: ~**0.6–1.45 s** to visible transcript line

### Current scaffold status
- UI and API are ready for chunk ingestion.
- Production audio bridge is intentionally stubbed for follow-on implementation.

---

## 3) Dual-Agent Orchestration (Jackbot + Jarvis)

### Logical lanes
- **Front-room lane**: user-visible speech and transcript context.
- **Backchannel lane**: agent-to-agent coordination and arbitration metadata.

### Suggested orchestration loop
1. New `TranscriptChunk` arrives.
2. Router decides if chunk triggers `AgentQuestion` (keyword/rule + intent classifier).
3. Fan out question to:
   - Jackbot responder
   - Jarvis connector (HTTP/webhook adapter)
4. Collect `AgentResponse` candidates.
5. Arbitration selects winner/merge strategy.
6. Winning response optionally sent to TTS for spoken return.
7. Action-item extractor emits `ActionItem` records.

### MVP note
- Event types + persistence are in place now.
- Actual Jarvis transport + arbitration policies can plug into same event model without schema changes.

---

## 4) Response Arbitration + TTS Return Path

### Arbitration rules (MVP-ready strategy)
- Inputs: `AgentResponse[]` for a given `questionId`.
- Score dimensions:
  - relevance to recent transcript window
  - confidence value (if supplied)
  - latency budget compliance
  - policy/safety confidence
- Modes:
  - **single-winner**: publish best answer
  - **merge**: combine Jackbot + Jarvis if complementary
  - **human-confirm**: require manual click before speaking

### TTS path
- Chosen response → TTS service → audio out to front-room.
- Respect UI controls:
  - `human-only mode` forces no agent speech
  - `allow agent audio` enables/disables spoken replies

---

## 5) Notes / Task Extraction + Persistence

### Extraction strategy
- Trigger on final transcript chunks.
- Lightweight rule layer in MVP:
  - imperative phrases (“follow up”, “send”, “schedule”)
  - owner cues (Jeff/Tyler/Jackbot/Jarvis)
  - date expressions for due dates
- Persist each item as `ActionItem` with source chunk references.

### Persistence model (implemented)
- File-backed JSON store at: `data/meeting-room/events.json`
- Meeting-scoped state:
  - transcript
  - agentQuestions
  - agentResponses
  - actionItems
  - backchannel

This keeps the MVP restart-safe without requiring DB migrations.

---

## 6) Auth + Security Model

### MVP baseline
- Runs inside existing Command Center auth boundary.
- API route only writes whitelisted event shapes.
- No external secrets required for scaffold operation.

### Recommended hardening for production
- Require signed session identity per event post.
- Add role checks:
  - host (Jeff/Tyler)
  - observer
  - agent-service
- Encrypt at-rest meeting logs if cross-venture data is sensitive.
- Add retention policy + redaction for PII in transcript payloads.
- Add signed webhook auth for Jarvis connector.

---

## 7) Latency Budget + Fallback Modes

### Budget targets
- Transcript visibility: **< 1.5s** preferred, **< 2.5s** acceptable.
- First agent response candidate: **< 2.5s** preferred.
- TTS start after arbitration: **< 1.2s** preferred.

### Fallback modes
1. **Human-only mode ON**
   - disables agent question routing + TTS
   - transcript/notes continue
2. **Agent audio OFF**
   - agents can draft text responses; no spoken output
3. **Auto-notes OFF**
   - manual action item capture only
4. **Jarvis unavailable**
   - run Jackbot-only path with warning backchannel event
5. **ASR degraded**
   - switch to manual transcript entry UI (already scaffolded)

---

## Implemented MVP Scaffold in This Repo
- `app/meeting-room/page.tsx` — Meeting Room UI route
- `app/api/meeting-room/route.ts` — GET/POST event API
- `lib/meeting-room/types.ts` — event model types
- `lib/meeting-room/store.ts` — file-backed persistence helpers

This creates a stable base for plugging in real streaming ASR, Jarvis transport, arbitration workers, and TTS output next.
