import { usePoll, apiFetch } from '../../lib/useEyroWS'

interface LedgerTask {
  task_id: string
  goal: string
  status: string
  step_cursor: number
  total_steps: number
  step_results: { tool_id?: string; action?: string; success?: boolean }[]
  created_at: string
  error?: string | null
}

const STATUS_CLASS: Record<string, string> = {
  running: 'ts-running', completed: 'ts-done', paused: 'ts-paused',
  failed: 'ts-failed', cancelled: 'ts-failed', pending: 'ts-paused',
}

function timeLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export function TasksView() {
  const { data, error } = usePoll<{ tasks: LedgerTask[] }>(
    () => apiFetch('/api/tasks').then(r => r.json()),
    5000,
  )

  const tasks = data?.tasks ?? []
  const active = tasks.filter(t => t.status === 'running' || t.status === 'paused' || t.status === 'pending')
  const done   = tasks.filter(t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="content-panel">
        <div className="panel-title">Tasks</div>
        <div className="panel-sub">What Eyro is doing and has done. Start tasks by talking to Eyro on Home.</div>

        {error && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
            OS offline — showing cached state
          </div>
        )}

        {!error && tasks.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 24, textAlign: 'center' }}>
            No tasks yet. Ask Eyro to do something on Home.
          </div>
        )}

        {active.length > 0 && (
          <>
            <div className="section-label">Active</div>
            {active.map(t => <TaskCard key={t.task_id} task={t} />)}
          </>
        )}

        {done.length > 0 && (
          <>
            <div className="section-label" style={{ marginTop: 16 }}>Completed</div>
            {done.map(t => <TaskCard key={t.task_id} task={t} />)}
          </>
        )}
      </div>
    </div>
  )
}

function TaskCard({ task }: { task: LedgerTask }) {
  const steps = buildSteps(task)
  return (
    <div className="task-card">
      <div className="task-top">
        <div className="task-name">{task.goal}</div>
        <span className={`task-status ${STATUS_CLASS[task.status] ?? 'ts-done'}`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </span>
      </div>
      <div className="task-steps">
        {steps.map((s, i) => (
          <div key={i} className="task-step">
            <div className={`step-dot ${s.state}`} />
            {s.label}
          </div>
        ))}
      </div>
      <div className="task-meta">
        <span>Started {timeLabel(task.created_at)}</span>
        <span>{task.task_id.slice(0, 14)}</span>
        {task.error && <span style={{ color: 'var(--red)' }}>{task.error.slice(0, 40)}</span>}
      </div>
    </div>
  )
}

function buildSteps(task: LedgerTask) {
  const steps: { label: string; state: 'done' | 'active' | 'pending' }[] = []

  task.step_results.forEach((r, i) => {
    const cap    = r.tool_id ?? '?'
    const action = r.action ?? '?'
    steps.push({
      label: `${cap} / ${action}`,
      state: i < task.step_cursor ? 'done' : 'active',
    })
  })

  const remaining = task.total_steps - task.step_cursor
  for (let i = 0; i < Math.min(remaining, 3); i++) {
    steps.push({ label: 'Pending step', state: 'pending' })
  }

  if (steps.length === 0) {
    steps.push({ label: task.status === 'completed' ? 'Completed' : 'In progress', state: task.status === 'completed' ? 'done' : 'active' })
  }

  return steps
}
