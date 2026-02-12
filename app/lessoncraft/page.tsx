'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface Segment {
  index: number
  title: string
  voice?: string
  durationSeconds?: number
  audioUrl: string
  key: string
  hasAudio: boolean
  fileSize: number | null
  lastModified: string | null
}

interface Episode {
  id: string
  title: string
  hasAudio: boolean
  isComplete: boolean
  completedSegments: number
  totalSegments: number
  segments: Segment[]
}

interface Series {
  id: string
  title: string
  description?: string
  category: string
  episodes: Episode[]
  totals: {
    episodes: number
    completedEpisodes: number
    episodesWithAudio: number
    segments: number
    completedSegments: number
  }
}

interface ArtworkItem {
  key: string
  filename: string
  size: number
  lastModified: string | null
  tags: string[]
  category: string
}

interface DashboardResponse {
  generatedAt: string
  catalog: {
    version: number
    updatedAt: string
  }
  overview: {
    totalFiles: number
    totalBytes: number
    categoryBreakdown: Array<{
      category: string
      files: number
      bytes: number
    }>
    completionByCategory: Record<string, { completed: number; total: number }>
  }
  series: Series[]
  artwork: ArtworkItem[]
  security: {
    status: string
    apiAuth: string
    dashboardAccess: string
  }
}

interface AssetDetail {
  title: string
  key: string
  type: 'audio' | 'image'
  size: number | null
  lastModified: string | null
  voice?: string
  durationSeconds?: number
  tags?: string[]
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || Number.isNaN(bytes)) return 'Unknown'
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1)
  const value = bytes / 1024 ** i
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}

function formatDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) return 'Unknown'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function formatDate(date?: string | null): string {
  if (!date) return 'Unknown'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function audioStatusClass(episode: Episode): string {
  if (episode.isComplete) return 'text-green-400'
  if (episode.hasAudio) return 'text-amber-400'
  return 'text-red-400'
}

function audioStatusLabel(episode: Episode): string {
  if (episode.isComplete) return 'Complete'
  if (episode.hasAudio) return 'Partial'
  return 'Missing'
}

export default function LessonCraftDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({})
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<string, boolean>>({})
  const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/lessoncraft', { cache: 'no-store' })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Unknown server error' }))
        throw new Error(payload.message || payload.error || `Request failed (${response.status})`)
      }

      const payload = (await response.json()) as DashboardResponse
      setData(payload)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60_000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const totalSeries = data?.series.length || 0
  const totalEpisodes = useMemo(
    () => data?.series.reduce((sum, series) => sum + series.totals.episodes, 0) || 0,
    [data]
  )

  const refreshLabel = data?.generatedAt ? `Updated ${formatDate(data.generatedAt)}` : 'Waiting for data...'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1700px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-amber-300 to-cyan-300 bg-clip-text text-transparent">
              🎧 LessonCraft Media Asset Dashboard
            </h1>
            <p className="text-sm text-slate-400">Visual control panel for all LessonCraft audio + artwork assets</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-400 hover:text-white"
            >
              ← Command Center
            </a>
            <button
              onClick={fetchDashboard}
              className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/25"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1700px] space-y-6 px-6 py-6">
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h2 className="mb-2 text-lg font-semibold text-emerald-300">🔐 Security Status</h2>
          <p className="text-sm text-emerald-100/90">{data?.security.apiAuth || 'Loading security profile...'}</p>
          <p className="mt-1 text-xs text-emerald-200/80">{data?.security.dashboardAccess || 'Dashboard is read-only and intended for visibility + QA.'}</p>
        </section>

        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">Loading LessonCraft assets…</div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <h2 className="text-lg font-semibold text-red-300">Failed to load dashboard</h2>
            <p className="mt-1 text-sm text-red-100/90">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Overview */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-cyan-500/25 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Total files in R2</p>
                <p className="mt-1 text-3xl font-bold text-cyan-300">{data.overview.totalFiles.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-purple-500/25 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Total storage size</p>
                <p className="mt-1 text-3xl font-bold text-purple-300">{formatBytes(data.overview.totalBytes)}</p>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Series / Episodes</p>
                <p className="mt-1 text-3xl font-bold text-amber-300">
                  {totalSeries} / {totalEpisodes}
                </p>
              </div>
              <div className="rounded-xl border border-green-500/25 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Artwork assets</p>
                <p className="mt-1 text-3xl font-bold text-green-300">{data.artwork.length.toLocaleString()}</p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="mb-4 text-lg font-semibold text-amber-300">📦 Category Breakdown</h2>
                <div className="space-y-3">
                  {data.overview.categoryBreakdown.map((entry) => (
                    <div key={entry.category} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-200">{entry.category}</span>
                        <span className="text-slate-400">{entry.files.toLocaleString()} files • {formatBytes(entry.bytes)}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                          style={{ width: `${Math.max(3, (entry.bytes / Math.max(data.overview.totalBytes, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="mb-4 text-lg font-semibold text-amber-300">✅ Audio Completion Status</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(data.overview.completionByCategory).map(([category, stats]) => {
                    const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
                    const textColor = pct === 100 ? 'text-green-400' : pct > 0 ? 'text-amber-400' : 'text-red-400'

                    return (
                      <div key={category} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                        <p className="text-sm text-slate-300">{category}</p>
                        <p className={`text-lg font-semibold ${textColor}`}>
                          {stats.completed}/{stats.total} complete
                        </p>
                        <p className="text-xs text-slate-500">{pct}% coverage</p>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">{refreshLabel} • Catalog updated {formatDate(data.catalog.updatedAt)}</p>
              </div>
            </section>

            {/* Series Browser */}
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-4 text-xl font-semibold text-amber-300">🎬 Series Browser</h2>

              <div className="space-y-4">
                {data.series.map((series) => {
                  const isSeriesOpen = Boolean(expandedSeries[series.id])
                  const seriesCompletion = series.totals.episodes
                    ? Math.round((series.totals.completedEpisodes / series.totals.episodes) * 100)
                    : 0

                  return (
                    <div key={series.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
                      <button
                        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-800/40"
                        onClick={() =>
                          setExpandedSeries((prev) => ({
                            ...prev,
                            [series.id]: !prev[series.id],
                          }))
                        }
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{series.title}</h3>
                            <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                              {series.category}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{series.description || 'No description available'}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-slate-400">Episodes with full audio</p>
                          <p className="text-lg font-semibold text-amber-300">
                            {series.totals.completedEpisodes}/{series.totals.episodes} ({seriesCompletion}%)
                          </p>
                        </div>
                      </button>

                      {isSeriesOpen && (
                        <div className="border-t border-slate-800 p-4">
                          <div className="space-y-3">
                            {series.episodes.map((episode) => {
                              const episodeKey = `${series.id}:${episode.id}`
                              const isEpisodeOpen = Boolean(expandedEpisodes[episodeKey])

                              return (
                                <div key={episode.id} className="rounded-lg border border-slate-800 bg-slate-900/60">
                                  <button
                                    className="flex w-full items-center justify-between gap-3 p-3 text-left transition hover:bg-slate-800/40"
                                    onClick={() =>
                                      setExpandedEpisodes((prev) => ({
                                        ...prev,
                                        [episodeKey]: !prev[episodeKey],
                                      }))
                                    }
                                  >
                                    <div>
                                      <p className="font-medium text-slate-100">{episode.title}</p>
                                      <p className="text-xs text-slate-400">
                                        {episode.completedSegments}/{episode.totalSegments} segments with audio
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className={`text-sm font-semibold ${audioStatusClass(episode)}`}>
                                        {audioStatusLabel(episode)}
                                      </span>
                                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                                        {episode.totalSegments} segments
                                      </span>
                                    </div>
                                  </button>

                                  {isEpisodeOpen && (
                                    <div className="space-y-3 border-t border-slate-800 p-3">
                                      {episode.segments.map((segment) => (
                                        <div
                                          key={`${episode.id}-${segment.index}`}
                                          className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
                                        >
                                          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                              <p className="font-medium text-slate-100">
                                                {segment.title || `Segment ${segment.index}`}
                                              </p>
                                              <p className="text-xs text-slate-400">
                                                Voice:{' '}
                                                <span className="font-medium text-slate-300">{segment.voice || 'unknown'}</span>
                                                {' • '}
                                                Duration est: {formatDuration(segment.durationSeconds)}
                                                {' • '}
                                                Size: {formatBytes(segment.fileSize)}
                                              </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                  segment.hasAudio
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-red-500/20 text-red-300'
                                                }`}
                                              >
                                                {segment.hasAudio ? 'Audio Ready' : 'Missing'}
                                              </span>
                                              <button
                                                onClick={() =>
                                                  setSelectedAsset({
                                                    title: `${episode.title} • ${segment.title || `Segment ${segment.index}`}`,
                                                    key: segment.key,
                                                    type: 'audio',
                                                    size: segment.fileSize,
                                                    lastModified: segment.lastModified,
                                                    voice: segment.voice,
                                                    durationSeconds: segment.durationSeconds,
                                                  })
                                                }
                                                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-amber-400"
                                              >
                                                Details
                                              </button>
                                            </div>
                                          </div>

                                          {segment.hasAudio ? (
                                            <audio
                                              controls
                                              preload="none"
                                              className="w-full"
                                              src={`/api/lessoncraft/object?key=${encodeURIComponent(segment.key)}`}
                                            />
                                          ) : (
                                            <p className="text-xs text-red-300">No audio object found in R2 for this segment.</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Artwork Gallery */}
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-amber-300">🖼️ Artwork Gallery</h2>
                <p className="text-sm text-slate-400">{data.artwork.length.toLocaleString()} images</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {data.artwork.map((art) => (
                  <button
                    key={art.key}
                    onClick={() =>
                      setSelectedAsset({
                        title: art.filename,
                        key: art.key,
                        type: 'image',
                        size: art.size,
                        lastModified: art.lastModified,
                        tags: art.tags,
                      })
                    }
                    className="group overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-left transition hover:border-amber-400"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-900">
                      <img
                        src={`/api/lessoncraft/object?key=${encodeURIComponent(art.key)}`}
                        alt={art.filename}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 p-2">
                      <p className="truncate text-xs font-medium text-slate-200">{art.filename}</p>
                      <p className="truncate text-[11px] text-slate-500">{art.tags.join(' / ') || 'uncategorized'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={() => setSelectedAsset(null)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-amber-300">Asset Details</h3>
                <p className="text-sm text-slate-300">{selectedAsset.title}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-red-400"
              >
                Close
              </button>
            </div>

            {selectedAsset.type === 'image' ? (
              <img
                src={`/api/lessoncraft/object?key=${encodeURIComponent(selectedAsset.key)}`}
                alt={selectedAsset.title}
                className="mb-4 max-h-[50vh] w-full rounded-lg object-contain"
              />
            ) : (
              <audio
                controls
                className="mb-4 w-full"
                src={`/api/lessoncraft/object?key=${encodeURIComponent(selectedAsset.key)}`}
              />
            )}

            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-sm">
              <p>
                <span className="text-slate-400">R2 key:</span> <span className="break-all text-slate-200">{selectedAsset.key}</span>
              </p>
              <p>
                <span className="text-slate-400">Size:</span> <span className="text-slate-200">{formatBytes(selectedAsset.size)}</span>
              </p>
              <p>
                <span className="text-slate-400">Upload date:</span> <span className="text-slate-200">{formatDate(selectedAsset.lastModified)}</span>
              </p>
              {selectedAsset.voice && (
                <p>
                  <span className="text-slate-400">Voice:</span> <span className="text-slate-200">{selectedAsset.voice}</span>
                </p>
              )}
              {selectedAsset.durationSeconds ? (
                <p>
                  <span className="text-slate-400">Duration estimate:</span>{' '}
                  <span className="text-slate-200">{formatDuration(selectedAsset.durationSeconds)}</span>
                </p>
              ) : null}
              {selectedAsset.tags && selectedAsset.tags.length > 0 ? (
                <p>
                  <span className="text-slate-400">Tags:</span> <span className="text-slate-200">{selectedAsset.tags.join(', ')}</span>
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`/api/lessoncraft/object?key=${encodeURIComponent(selectedAsset.key)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
              >
                Open Direct
              </a>
              <a
                href={`/api/lessoncraft/object?key=${encodeURIComponent(selectedAsset.key)}&download=1`}
                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 transition hover:bg-amber-500/20"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
