export type AgentId = 'jackbot' | 'jarvis'

export interface TranscriptChunk {
  id: string
  meetingId: string
  speaker: string
  source: 'human' | 'agent' | 'system'
  text: string
  startedAt: string
  endedAt: string
  confidence?: number
  isFinal: boolean
}

export interface AgentQuestion {
  id: string
  meetingId: string
  askedBy: string
  question: string
  targetAgent: AgentId | 'both'
  contextChunkIds: string[]
  createdAt: string
}

export interface AgentResponse {
  id: string
  meetingId: string
  questionId: string
  agentId: AgentId
  responseText: string
  confidence?: number
  latencyMs?: number
  ttsEligible: boolean
  createdAt: string
}

export interface ActionItem {
  id: string
  meetingId: string
  text: string
  owner: string
  dueAt?: string
  status: 'open' | 'in_progress' | 'done'
  sourceChunkIds: string[]
  createdAt: string
  updatedAt: string
}

export interface BackchannelMessage {
  id: string
  meetingId: string
  from: AgentId | 'system'
  to: AgentId | 'both'
  message: string
  severity: 'info' | 'warning' | 'urgent'
  relatedQuestionId?: string
  createdAt: string
}

export interface MeetingRoomState {
  meetingId: string
  transcript: TranscriptChunk[]
  agentQuestions: AgentQuestion[]
  agentResponses: AgentResponse[]
  actionItems: ActionItem[]
  backchannel: BackchannelMessage[]
  updatedAt: string
}
