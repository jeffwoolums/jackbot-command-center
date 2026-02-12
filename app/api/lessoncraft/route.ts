import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const CF_EMAIL = process.env.CF_EMAIL
const CF_API_KEY = process.env.CF_API_KEY
const R2_BUCKET = process.env.LESSONCRAFT_R2_BUCKET || 'lessoncraft-audio'
const CATALOG_URL = 'https://api.aituned.io/api/catalog'

const CATEGORY_ORDER = ['CFM Documentary', 'Easter', 'Firesides', 'Devotionals', 'Artwork'] as const

type DashboardCategory = (typeof CATEGORY_ORDER)[number] | 'Other'

interface CatalogSegment {
  index: number
  title: string
  voice?: string
  audioUrl: string
  durationSeconds?: number
  audioAvailable?: boolean
}

interface CatalogEpisode {
  id: string
  title: string
  audioAvailable?: boolean
  segments?: CatalogSegment[]
}

interface CatalogSeries {
  id: string
  title: string
  description?: string
  episodes?: CatalogEpisode[]
}

interface CatalogResponse {
  version: number
  updatedAt: string
  series: CatalogSeries[]
}

interface R2Object {
  key: string
  etag?: string
  size: number
  last_modified?: string
  http_metadata?: {
    contentType?: string
  }
}

interface R2ListResponse {
  success: boolean
  errors?: Array<{ message?: string }>
  result: R2Object[]
  result_info?: {
    cursor?: string
    is_truncated?: boolean
    per_page?: number
  }
}

function getCloudflareAuthHeaders(): HeadersInit {
  if (!CF_ACCOUNT_ID || !CF_EMAIL || !CF_API_KEY) {
    throw new Error('Cloudflare credentials are not configured')
  }

  return {
    'X-Auth-Email': CF_EMAIL,
    'X-Auth-Key': CF_API_KEY,
  }
}

function getCategoryFromKey(key: string): DashboardCategory {
  const lower = key.toLowerCase()
  if (lower.startsWith('documentary/')) return 'CFM Documentary'
  if (lower.startsWith('easter/')) return 'Easter'
  if (lower.startsWith('firesides/')) return 'Firesides'
  if (lower.startsWith('devotionals/')) return 'Devotionals'
  if (lower.startsWith('artwork/')) return 'Artwork'
  return 'Other'
}

function inferCategoryFromSeries(series: CatalogSeries): DashboardCategory {
  const haystack = `${series.id} ${series.title} ${series.description || ''}`.toLowerCase()

  if (haystack.includes('easter')) return 'Easter'
  if (haystack.includes('fireside')) return 'Firesides'
  if (haystack.includes('devotional')) return 'Devotionals'
  if (haystack.includes('cfm') || haystack.includes('come, follow me') || haystack.includes('documentary')) {
    return 'CFM Documentary'
  }

  const firstAudioPath = series.episodes
    ?.flatMap((episode) => episode.segments || [])
    .find((segment) => typeof segment.audioUrl === 'string' && segment.audioUrl.length > 0)
    ?.audioUrl

  if (firstAudioPath) {
    const fromPath = getCategoryFromKey(firstAudioPath)
    if (fromPath !== 'Artwork' && fromPath !== 'Other') {
      return fromPath
    }
  }

  return 'Other'
}

function isArtworkImage(asset: R2Object): boolean {
  const lower = asset.key.toLowerCase()
  if (!lower.startsWith('artwork/')) return false
  return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif')
}

async function fetchCatalog(): Promise<CatalogResponse> {
  const response = await fetch(CATALOG_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`)
  }

  return response.json() as Promise<CatalogResponse>
}

async function fetchAllR2Objects(): Promise<R2Object[]> {
  const allObjects: R2Object[] = []
  let cursor: string | undefined
  let safetyCounter = 0

  do {
    const params = new URLSearchParams({ per_page: '1000' })
    if (cursor) {
      params.set('cursor', cursor)
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects?${params.toString()}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getCloudflareAuthHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`R2 listing failed with status ${response.status}`)
    }

    const payload = (await response.json()) as R2ListResponse
    if (!payload.success) {
      const message = payload.errors?.map((e) => e.message).filter(Boolean).join('; ') || 'Unknown R2 API error'
      throw new Error(message)
    }

    allObjects.push(...(payload.result || []))
    cursor = payload.result_info?.is_truncated ? payload.result_info.cursor : undefined

    safetyCounter += 1
    if (safetyCounter > 200) {
      throw new Error('R2 pagination safety limit reached')
    }
  } while (cursor)

  return allObjects
}

export async function GET() {
  try {
    const [catalog, r2Objects] = await Promise.all([fetchCatalog(), fetchAllR2Objects()])
    const objectByKey = new Map<string, R2Object>(r2Objects.map((asset) => [asset.key, asset]))

    const categoryStats: Record<DashboardCategory, { files: number; bytes: number }> = {
      'CFM Documentary': { files: 0, bytes: 0 },
      Easter: { files: 0, bytes: 0 },
      Firesides: { files: 0, bytes: 0 },
      Devotionals: { files: 0, bytes: 0 },
      Artwork: { files: 0, bytes: 0 },
      Other: { files: 0, bytes: 0 },
    }

    let totalBytes = 0

    for (const asset of r2Objects) {
      const category = getCategoryFromKey(asset.key)
      categoryStats[category].files += 1
      categoryStats[category].bytes += asset.size || 0
      totalBytes += asset.size || 0
    }

    const enrichedSeries = (catalog.series || []).map((series) => {
      const seriesCategory = inferCategoryFromSeries(series)
      const episodes = (series.episodes || []).map((episode) => {
        const segments = (episode.segments || []).map((segment) => {
          const objectMeta = objectByKey.get(segment.audioUrl)
          const hasAudio = Boolean(objectMeta) || Boolean(segment.audioAvailable)

          return {
            ...segment,
            key: segment.audioUrl,
            hasAudio,
            fileSize: objectMeta?.size ?? null,
            lastModified: objectMeta?.last_modified ?? null,
            contentType: objectMeta?.http_metadata?.contentType ?? null,
          }
        })

        const completedSegments = segments.filter((segment) => segment.hasAudio).length
        const hasAudio = completedSegments > 0 || Boolean(episode.audioAvailable)
        const isComplete = segments.length > 0 ? completedSegments === segments.length : hasAudio

        return {
          ...episode,
          hasAudio,
          isComplete,
          completedSegments,
          totalSegments: segments.length,
          segments,
        }
      })

      const completedEpisodes = episodes.filter((episode) => episode.isComplete).length
      const episodesWithAudio = episodes.filter((episode) => episode.hasAudio).length

      return {
        ...series,
        category: seriesCategory,
        episodes,
        totals: {
          episodes: episodes.length,
          completedEpisodes,
          episodesWithAudio,
          segments: episodes.reduce((sum, episode) => sum + episode.totalSegments, 0),
          completedSegments: episodes.reduce((sum, episode) => sum + episode.completedSegments, 0),
        },
      }
    })

    const completionByCategory: Record<(typeof CATEGORY_ORDER)[number], { completed: number; total: number }> = {
      'CFM Documentary': { completed: 0, total: 0 },
      Easter: { completed: 0, total: 0 },
      Firesides: { completed: 0, total: 0 },
      Devotionals: { completed: 0, total: 0 },
      Artwork: { completed: 0, total: 0 },
    }

    for (const series of enrichedSeries) {
      if (series.category in completionByCategory) {
        const category = series.category as keyof typeof completionByCategory
        completionByCategory[category].completed += series.totals.completedEpisodes
        completionByCategory[category].total += series.totals.episodes
      }
    }

    const artwork = r2Objects
      .filter(isArtworkImage)
      .map((asset) => {
        const pathParts = asset.key.split('/').filter(Boolean)
        const filename = pathParts[pathParts.length - 1] || asset.key
        const tags = pathParts.slice(1, -1)

        return {
          key: asset.key,
          filename,
          size: asset.size,
          lastModified: asset.last_modified || null,
          contentType: asset.http_metadata?.contentType || null,
          tags,
          category: tags[0] || 'uncategorized',
        }
      })
      .sort((a, b) => a.key.localeCompare(b.key))

    const categoryBreakdown = CATEGORY_ORDER.map((category) => ({
      category,
      files: categoryStats[category].files,
      bytes: categoryStats[category].bytes,
    }))

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      catalog: {
        version: catalog.version,
        updatedAt: catalog.updatedAt,
      },
      overview: {
        totalFiles: r2Objects.length,
        totalBytes,
        categoryBreakdown,
        completionByCategory,
      },
      series: enrichedSeries,
      artwork,
      security: {
        status: 'Protected',
        apiAuth: 'HMAC token auth via X-App-Token validated with APP_SECRET',
        dashboardAccess: 'Read-only; R2 credentials are server-side only in this command center API route',
      },
    })
  } catch (error) {
    console.error('LessonCraft dashboard API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to load LessonCraft asset data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
