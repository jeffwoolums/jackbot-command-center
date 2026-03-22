'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginFormProps {
  nextPath: string
}

export default function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setError(payload.error || 'Invalid password')
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch (submitError) {
      console.error('Login failed', submitError)
      setError('Unable to sign in right now')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,168,83,0.16),transparent_35%),linear-gradient(180deg,#0f1117_0%,#0b0d12_100%)]" />
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#2a2d37] bg-[#1a1d27]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.35em] text-[#d4a853]">Authorized Access</p>
        <h1 className="mt-4 text-3xl font-semibold">Razor Command Center</h1>
        <p className="mt-3 text-sm leading-6 text-[#9ca3af]">
          Protected operations console. Enter the command password to continue.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-[#9ca3af]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[#2a2d37] bg-[#11141d] px-4 py-3 text-white outline-none transition focus:border-[#d4a853] focus:ring-2 focus:ring-[#d4a853]/20"
              placeholder="Enter command password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#d4a853] px-4 py-3 font-medium text-[#11141d] transition hover:bg-[#e1b663] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Entering...' : 'Enter'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-[#9ca3af]">
          Protected • Authorized Personnel Only
        </p>
      </div>
    </div>
  )
}
