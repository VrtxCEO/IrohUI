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
const _FALLBACK_API = API_BASE

function isLocalhost(url: string): boolean {
  try { const h = new URL(url).hostname; return h === 'localhost' || h === '127.0.0.1' || h === '::1' } catch { return false }
}

function getWsBase(): string {
  const session = getSession()
  const direct = session?.direct_url
  const relay  = session?.relay_url
  // Prefer relay when direct is localhost (won't be reachable from mobile/remote)
  const base = (direct && !isLocalhost(direct)) ? direct
             : (relay  && relay.length > 0)     ? relay
             : direct || _FALLBACK_API
  return base.replace(/^http/, 'ws')
}

export interface EyroReply {
  text: string
  trace: TraceEntry[]
  taskId: string | null
}

interface UseEyroWSOptions {
  channelId: string
  onReply: (reply: EyroReply) => void
  onError?: (detail: string) => void
  onBusy?: () => void
}

export function useEyroWS({ channelId, onReply, onError, onBusy }: UseEyroWSOptions) {
  const wsRef        = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef   = useRef(true)
  const [connected, setConnected] = useState(false)
  const [busy, setBusy]           = useState(false)

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
        if (mountedRef.current) setConnected(true)
      } else if (type === 'auth_error') {
        setBusy(false)
        onError?.(String(msg['detail'] ?? 'Authentication failed'))
        ws.close()
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
      if (!mountedRef.current) return
      setConnected(false)
      setBusy(false)
      // Reconnect after 3 s
      reconnectRef.current = setTimeout(() => { if (mountedRef.current) connect() }, 3000)
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

  const send = useCallback((text: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return false
    ws.send(JSON.stringify({ type: 'message', text }))
    setBusy(true)
    return true
  }, [])

  return { send, connected, busy }
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
