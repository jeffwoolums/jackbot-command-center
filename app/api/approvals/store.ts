import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalItem {
  id: string
  type: string
  content: unknown
  preview: string
  source: string
  createdAt: string
  status: ApprovalStatus
  reviewedAt: string | null
}

const DATA_DIR = join(process.cwd(), 'data')
const APPROVALS_FILE = join(DATA_DIR, 'approvals.json')

async function ensureApprovalsFile() {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    await readFile(APPROVALS_FILE, 'utf-8')
  } catch {
    await writeFile(APPROVALS_FILE, '[]')
  }
}

export async function loadApprovals(): Promise<ApprovalItem[]> {
  await ensureApprovalsFile()
  try {
    const raw = await readFile(APPROVALS_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item: any) => {
        const createdAt = typeof item?.createdAt === 'string' ? item.createdAt : new Date().toISOString()
        const reviewedAt = typeof item?.reviewedAt === 'string' ? item.reviewedAt : null
        const status: ApprovalStatus = item?.status === 'approved' || item?.status === 'rejected' ? item.status : 'pending'

        return {
          id: String(item?.id || `approval-${Date.now()}`),
          type: String(item?.type || 'post'),
          content: item?.content,
          preview: String(item?.preview || ''),
          source: String(item?.source || 'unknown'),
          createdAt,
          status,
          reviewedAt
        } satisfies ApprovalItem
      })
  } catch {
    return []
  }
}

export async function saveApprovals(items: ApprovalItem[]) {
  await ensureApprovalsFile()
  await writeFile(APPROVALS_FILE, JSON.stringify(items, null, 2))
}

export function createApprovalId() {
  return `apr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function makePreview(content: unknown, explicitPreview?: unknown) {
  if (typeof explicitPreview === 'string' && explicitPreview.trim()) return explicitPreview.trim()

  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (trimmed.length <= 240) return trimmed
    return trimmed.slice(0, 240) + '…'
  }

  try {
    const asJson = JSON.stringify(content)
    if (asJson.length <= 240) return asJson
    return asJson.slice(0, 240) + '…'
  } catch {
    return String(content)
  }
}
