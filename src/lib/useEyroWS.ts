/**
 * useEyroWS — WebSocket hook for EyroOS API.
 *
 * Manages the connection lifecycle, automatic reconnect, and message routing.
 * The caller gets a stable `send` function and `connected`/`busy` state.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TraceEntry } from '../types'
import { getSession, getStoredUser } from './auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8765'

function isLocalhost(url: string): boolean {
  try { const h = new URL(url).hostname; return h === 'localhost' || h === '127.0.0.1' || h === '::1' } catch { return false }
}

function resolveBase(): string {
  const session = getSession()
  const direct = session?.direct_url
  const relay  = session?.relay_url
  return (direct && !isLocalhost(direct)) ? direct
       : (relay  && relay.length > 0)     ? relay
       : direct || API_BASE
}

function getWsBase(): string { return resolveBase().replace(/^http/, 'ws') }

export function getApiBase(): string { return resolveBase() }

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = resolveBase()
  const headers: Record<string, string> = { ...(init?.headers as Record<string, string>) }
  if (!isLocalhost(base)) headers['ngrok-skip-browser-warning'] = 'true'
  return fetch(`${base.replace(/\/$/, '')}${path}`, { ...init, headers })
}

export interface EyroReply {
  text: string
  trace: TraceEntry[]
  taskId: string | null
}

export interface AuthChallenge {
  required_methods: string[]
  original_goal?: string
  risk_level?: number
}

interface UseEyroWSOptions {
  channelId: string
  onReply: (reply: EyroReply) => void
  onError?: (detail: string) => void
  onBusy?: () => void
  onSessionInvalid?: () => void
  onAuthChallenge?: (challenge: AuthChallenge) => void
}

export function useEyroWS({ channelId, onReply, onError, onBusy, onSessionInvalid, onAuthChallenge }: UseEyroWSOptions) {
  const wsRef          = useRef<WebSocket | null>(null)
  const reconnectRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef     = useRef(true)
  const retryDelayRef  = useRef(0) // 0 = immediate first retry
  const sessionInvalidRef = useRef(false)
  const [connected, setConnected]       = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [busy, setBusy]                 = useState(false)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    const wsBase = getWsBase()
    const skipParam = !isLocalhost(wsBase) ? '?ngrok-skip-browser-warning=true' : ''
    const url = `${wsBase}/ws/${encodeURIComponent(channelId)}${skipParam}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => { /* challenge arrives next */ }

    ws.onmessage = (ev) => {
      if (!mountedRef.current) return
      let msg: Record<string, unknown>
      try { msg = JSON.parse(ev.data) }
      catch { return }

      const type = msg['type'] as string
      if (type === 'challenge') {
        const session = getSession()
        const storedUser = getStoredUser()
        if (!session || !storedUser) { ws.close(); return }
        ws.send(JSON.stringify({
          type: 'hello',
          nonce: msg['nonce'],
          connection_token: session.connection_token,
          user_id: storedUser.email,
        }))
      } else if (type === 'session_ok') {
        if (mountedRef.current) {
          retryDelayRef.current = 0 // reset backoff on successful connect
          setConnected(true)
          setReconnecting(false)
        }
      } else if (type === 'auth_error') {
        setBusy(false)
        sessionInvalidRef.current = true // stop retry loop before close
        ws.close()
        onSessionInvalid?.()
      } else if (type === 'auth_challenge') {
        setBusy(false)
        onAuthChallenge?.({
          required_methods: (msg['required_methods'] as string[]) ?? [],
          original_goal: msg['original_goal'] as string | undefined,
          risk_level: msg['risk_level'] as number | undefined,
        })
      } else if (type === 'reply') {
        setBusy(false)
        onReply({
          text: String(msg['text'] ?? ''),
          trace: (msg['trace'] as TraceEntry[]) ?? [],
          taskId: (msg['task_id'] as string | null) ?? null,
        })
      } else if (type === 'busy') {
        onBusy?.()
      } else if (type === 'error') {
        setBusy(false)
        onError?.(String(msg['detail'] ?? 'Unknown error'))
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current || sessionInvalidRef.current) return
      setConnected(false)
      setBusy(false)
      setReconnecting(true)
      // Exponential backoff: 0ms → 1s → 2s → 4s → 8s → 10s (cap)
      const delay = retryDelayRef.current
      retryDelayRef.current = delay === 0 ? 1000 : Math.min(delay * 2, 10000)
      reconnectRef.current = setTimeout(() => { if (mountedRef.current) connect() }, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [channelId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((text: string, threadId?: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return false
    const msg: Record<string, unknown> = { type: 'message', text }
    if (threadId) msg.thread_id = threadId
    ws.send(JSON.stringify(msg))
    setBusy(true)
    return true
  }, [])

  return { send, connected, reconnecting, busy, wsRef }
}

// ---------------------------------------------------------------------------
// Generic polling hook
// ---------------------------------------------------------------------------

export function usePoll<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  deps: unknown[] = [],
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const result = await fetcher()
        if (!cancelled) { setData(result); setLoading(false); setError(null) }
      } catch (e) {
        if (!cancelled) { setError(String(e)); setLoading(false) }
      }
    }
    run()
    const id = setInterval(run, intervalMs)
    return () => { cancelled = true; clearInterval(id) }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

// ---------------------------------------------------------------------------
// REST helpers
// ---------------------------------------------------------------------------

export async function postSetup(data: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${API_BASE}/api/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Setup failed: ${res.status}`)
}

export async function fetchTasks(channelId?: string) {
  const url = channelId
    ? `${API_BASE}/api/tasks?channel_id=${encodeURIComponent(channelId)}`
    : `${API_BASE}/api/tasks`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Tasks fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchFreedomLevel(): Promise<number> {
  const res = await fetch(`${API_BASE}/api/settings/freedom`)
  if (!res.ok) return 2
  const json = await res.json()
  return json.freedom_level ?? 2
}

export async function setFreedomLevel(level: number): Promise<void> {
  await fetch(`${API_BASE}/api/settings/freedom`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  })
}
