# Razor Command Center

Internal Next.js executive operations dashboard for Razor workflows.

## Local Development

```bash
npm install
npm run dev
```

- App runs at: `http://localhost:3333`

## Environment Variables

Add these to `.env.local` (or deployment secrets):

- `COMMAND_CENTER_PASSWORD` — required password for the login screen and auth middleware session.
- `MEETING_ROOM_SIGNING_SECRET` — HMAC secret used to sign/validate meeting invite tokens.
- `MEETING_ROOM_AGENT_KEY` — optional shared key for Jarvis/agent webhook posting.
- `NEXT_PUBLIC_MEETING_BASE_URL` — base URL used to generate invite links (supports path prefixes like `https://aituned.io/secret-location`).

## Agent Meeting Room MVP (Phase-1 Wiring)

### What was added
- Route: `/meeting-room`
- API: `GET/POST /api/meeting-room`
- Session bootstrap API: `POST /api/meeting-room/bootstrap`
- Invite API: `POST /api/meeting-room/invite`
- Token validation API: `GET/POST /api/meeting-room/validate`
- Agent ingress API: `POST /api/meeting-room/agent`
- Persistent store: `data/meeting-room/events.json`
- Architecture + workflow doc: `docs/agent-meeting-room-mvp.md`

### Quick UI test
1. Start app with `npm run dev`.
2. Open `http://localhost:3333/meeting-room`.
3. Click **Create New Session + Invites**.
4. Copy/share Jeff/Tyler links and Jarvis token/webhook.
5. Join generated Jitsi room and post events.

### API smoke tests

```bash
# 1) Create a meeting + invites
curl -X POST "http://localhost:3333/api/meeting-room/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{}'

# 2) Validate a token (replace <TOKEN>)
curl "http://localhost:3333/api/meeting-room/validate?token=<TOKEN>"

# 3) Post Jarvis backchannel using API key auth
curl -X POST "http://localhost:3333/api/meeting-room/agent" \
  -H "Content-Type: application/json" \
  -H "x-agent-key: $MEETING_ROOM_AGENT_KEY" \
  -d '{
    "meetingId": "mr_example",
    "type": "BackchannelMessage",
    "payload": {
      "from": "jarvis",
      "to": "jackbot",
      "message": "Latency spike detected on ASR bridge.",
      "severity": "warning"
    }
  }'
```
