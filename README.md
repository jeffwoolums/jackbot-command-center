# Jackbot Command Center

Internal Next.js command center for Jackbot operations.

## Local Development

```bash
npm install
npm run dev
```

- App runs at: `http://localhost:3333`

## Agent Meeting Room MVP (Scaffold)

### What was added
- Route: `/meeting-room`
- API: `GET/POST /api/meeting-room`
- Persistent store: `data/meeting-room/events.json`
- Architecture doc: `docs/agent-meeting-room-mvp.md`

### Quick test
1. Start app with `npm run dev`.
2. Open `http://localhost:3333/meeting-room`.
3. Paste a Jitsi URL and click **Join Jitsi Room**.
4. Add transcript chunks and action items via the right-side panel.
5. Confirm persistence by refreshing page (events should remain).

### API smoke tests

```bash
# Fetch current room state
curl "http://localhost:3333/api/meeting-room?meetingId=agent-room-mvp"

# Post transcript chunk event
curl -X POST "http://localhost:3333/api/meeting-room" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "agent-room-mvp",
    "type": "TranscriptChunk",
    "payload": {
      "speaker": "Jeff",
      "source": "human",
      "text": "Let\"s capture this as the MVP baseline.",
      "isFinal": true
    }
  }'
```
