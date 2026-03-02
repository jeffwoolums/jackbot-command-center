import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type {
  ActionItem,
  AgentQuestion,
  AgentResponse,
  BackchannelMessage,
  MeetingRoomState,
  TranscriptChunk,
} from './types'

interface MeetingRoomDb {
  meetings: Record<string, MeetingRoomState>
}

const DATA_DIR = join(process.cwd(), 'data', 'meeting-room')
const STORE_FILE = join(DATA_DIR, 'events.json')

function emptyState(meetingId: string): MeetingRoomState {
  return {
    meetingId,
    transcript: [],
    agentQuestions: [],
    agentResponses: [],
    actionItems: [],
    backchannel: [],
    updatedAt: new Date().toISOString(),
  }
}

async function ensureStoreFile() {
  await mkdir(DATA_DIR, { recursive: true })

  try {
    await readFile(STORE_FILE, 'utf-8')
  } catch {
    const emptyDb: MeetingRoomDb = { meetings: {} }
    await writeFile(STORE_FILE, JSON.stringify(emptyDb, null, 2))
  }
}

async function loadDb(): Promise<MeetingRoomDb> {
  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as MeetingRoomDb

    if (!parsed || typeof parsed !== 'object' || !parsed.meetings || typeof parsed.meetings !== 'object') {
      return { meetings: {} }
    }

    return parsed
  } catch {
    return { meetings: {} }
  }
}

async function saveDb(db: MeetingRoomDb) {
  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(db, null, 2))
}

function ensureMeetingState(db: MeetingRoomDb, meetingId: string) {
  if (!db.meetings[meetingId]) {
    db.meetings[meetingId] = emptyState(meetingId)
  }

  return db.meetings[meetingId]
}

export function createMeetingEventId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function getMeetingRoomState(meetingId: string) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)

  return state
}

export async function appendTranscriptChunk(meetingId: string, chunk: Omit<TranscriptChunk, 'id' | 'meetingId'>) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)

  const item: TranscriptChunk = {
    ...chunk,
    id: createMeetingEventId('trc'),
    meetingId,
  }

  state.transcript.push(item)
  state.updatedAt = new Date().toISOString()
  await saveDb(db)

  return item
}

export async function appendAgentQuestion(meetingId: string, question: Omit<AgentQuestion, 'id' | 'meetingId' | 'createdAt'>) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)

  const item: AgentQuestion = {
    ...question,
    id: createMeetingEventId('aq'),
    meetingId,
    createdAt: new Date().toISOString(),
  }

  state.agentQuestions.push(item)
  state.updatedAt = new Date().toISOString()
  await saveDb(db)

  return item
}

export async function appendAgentResponse(meetingId: string, response: Omit<AgentResponse, 'id' | 'meetingId' | 'createdAt'>) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)

  const item: AgentResponse = {
    ...response,
    id: createMeetingEventId('ar'),
    meetingId,
    createdAt: new Date().toISOString(),
  }

  state.agentResponses.push(item)
  state.updatedAt = new Date().toISOString()
  await saveDb(db)

  return item
}

export async function appendActionItem(meetingId: string, actionItem: Omit<ActionItem, 'id' | 'meetingId' | 'createdAt' | 'updatedAt'>) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)
  const now = new Date().toISOString()

  const item: ActionItem = {
    ...actionItem,
    id: createMeetingEventId('act'),
    meetingId,
    createdAt: now,
    updatedAt: now,
  }

  state.actionItems.push(item)
  state.updatedAt = now
  await saveDb(db)

  return item
}

export async function appendBackchannelMessage(
  meetingId: string,
  message: Omit<BackchannelMessage, 'id' | 'meetingId' | 'createdAt'>
) {
  const db = await loadDb()
  const state = ensureMeetingState(db, meetingId)

  const item: BackchannelMessage = {
    ...message,
    id: createMeetingEventId('bc'),
    meetingId,
    createdAt: new Date().toISOString(),
  }

  state.backchannel.push(item)
  state.updatedAt = new Date().toISOString()
  await saveDb(db)

  return item
}
