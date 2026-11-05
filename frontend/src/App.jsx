import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertOctagon, ArrowUpRight, Bot, BrainCircuit, Check, CheckCircle2,
  ChevronRight, CircleDot, Clock3, Cloud, Code2, Cpu, Database, ExternalLink,
  FileText, Gauge, GitBranch, History, Loader2, Play, Radio, RefreshCw,
  ShieldCheck, Siren, Sparkles, Terminal, Zap
} from 'lucide-react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const initialIncident = {
  service: 'payments-api',
  error_signature: 'HTTP 502 from upstream gateway — elevated timeout rate detected in checkout requests.',
  severity: 'Critical P0'
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function pretty(value) {
  if (typeof value === 'string') {
    try { return JSON.stringify(JSON.parse(value), null, 2) } catch { return value }
  }
  return JSON.stringify(value, null, 2)
}
function StatCard({ icon: Icon, label, value, note, tone = 'mint' }) {
  return <div className="glass rounded-2xl p-4 sm:p-5">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500">{label}</span>
      <span className={`rounded-xl p-2 ${tone === 'blue' ? 'bg-blue-400/10 text-blue-300' : 'bg-emerald-300/10 text-emerald-300'}`}><Icon size={17}/></span>
    </div>
    <div className="mt-3 text-2xl font-extrabold tracking-tight text-slate-100">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{note}</div>
  </div>
}
function StatusPill({ children, color = 'mint' }) {
  const styles = color === 'red' ? 'border-rose-400/20 bg-rose-400/10 text-rose-300' :
    color === 'amber' ? 'border-amber-300/20 bg-amber-300/10 text-amber-200' :
    color === 'blue' ? 'border-blue-300/20 bg-blue-300/10 text-blue-200' :
    'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
  return <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${styles}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{children}</span>
}

export default function App() {
  const [form, setForm] = useState(initialIncident)
  const [busy, setBusy] = useState('')
  const [output, setOutput] = useState(null)
  const [events, setEvents] = useState([
    { id: 1, time: timeNow(), title: 'Command center initialized', detail: 'Frontend ready · awaiting workflow activity', type: 'system' },
    { id: 2, time: timeNow(), title: 'Hindsight memory connected via n8n', detail: 'Vector recall will be invoked by the triage workflow', type: 'memory' }
  ])
  const [apiState, setApiState] = useState('checking')
  const [apiInfo, setApiInfo] = useState(null)

  const addEvent = (title, detail, type = 'system') => {
    setEvents(prev => [{ id: Date.now() + Math.random(), time: timeNow(), title, detail, type }, ...prev].slice(0, 8))
  }

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`)
      if (!res.ok) throw new Error('API unavailable')
      const data = await res.json()
      setApiInfo(data)
      setApiState('online')
    } catch {
      setApiState('offline')
      setApiInfo(null)
    }
  }
  useEffect(() => { checkHealth(); const id = setInterval(checkHealth, 15000); return () => clearInterval(id) }, [])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  async function trigger(kind) {
    const endpoint = kind === 'incident' ? '/api/trigger-incident-1' : '/api/trigger-remediation-2'
    const label = kind === 'incident' ? 'Triage & Hindsight Analysis' : 'Auto-Remediation & Runbooks'
    setBusy(kind)
    setOutput({ kind, label, loading: true, started: timeNow() })
    addEvent(`${label} requested`, `${form.service} · ${form.severity}`, kind)
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const raw = await res.text()
      let data
      try { data = JSON.parse(raw) } catch { data = { output: raw } }
      if (!res.ok) {
        const detail = data.detail || data.message || raw || `Request failed (${res.status})`
        throw new Error(typeof detail === 'string' ? detail : pretty(detail))
      }
      setOutput({ kind, label, loading: false, success: true, data, completed: timeNow() })
      addEvent(`${label} completed`, 'n8n returned a workflow response', 'success')
    } catch (error) {
      setOutput({ kind, label, loading: false, success: false, error: error.message, completed: timeNow() })
      addEvent(`${label} failed`, error.message, 'error')
    } finally { setBusy('') }
  }

  const severityColor = form.severity === 'Critical P0' ? 'red' : form.severity === 'High P1' ? 'amber' : 'blue'
  const eventIcon = type => type === 'error' ? AlertOctagon : type === 'success' ? CheckCircle2 : type === 'memory' ? BrainCircuit : type === 'incident' ? Siren : Activity
  const outputText = useMemo(() => output?.data ? pretty(output.data) : '', [output])

  return <div className="grid-bg min-h-screen">
    <div className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
            <ShieldCheck size={22}/><span className="pulse-dot absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-300"/>
          </div>
          <div><div className="flex items-center gap-2"><span className="text-lg font-extrabold tracking-tight">SENTINEL</span><span className="rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">HINDSIGHT AI</span></div><p className="text-[10px] font-semibold uppercase tracking-[.19em] text-slate-500">Autonomous incident operations</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 sm:flex"><Radio size={14} className="text-emerald-300"/> Hack With Bangalore 4.0</div>
          <StatusPill color={apiState === 'online' ? 'mint' : apiState === 'checking' ? 'amber' : 'red'}>{apiState === 'online' ? 'Bridge online' : apiState === 'checking' ? 'Connecting' : 'Bridge offline'}</StatusPill>
          <button onClick={checkHealth} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-emerald-300/50 hover:text-emerald-200" title="Refresh API status"><RefreshCw size={15}/></button>
        </div>
      </header>

      <section className="relative overflow-hidden py-8 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl"/>
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300"><span className="h-px w-6 bg-emerald-300"/> Operations / Overview</div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Incident response, <span className="text-emerald-300">with memory.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Trigger intelligent triage, retrieve historical context, and orchestrate safe remediation through your n8n-powered workflow layer.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-xs text-slate-400"><Clock3 size={15}/><span className="font-mono">{new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className="text-slate-700">/</span><span>Live workspace</span></div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} label="Control plane" value={apiState === 'online' ? 'Connected' : apiState === 'checking' ? 'Checking' : 'Offline'} note="FastAPI secure bridge" />
        <StatCard icon={BrainCircuit} label="Hindsight memory" value="Workflow-ready" note="Vector recall via n8n" tone="blue"/>
        <StatCard icon={Zap} label="Workflow routes" value="02" note="Triage + remediation"/>
        <StatCard icon={ShieldCheck} label="Execution policy" value="Human gate" note="Review before production changes" tone="blue"/>
      </section>

      <main className="mt-6 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,.92fr)]">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-rose-400/10 p-2.5 text-rose-300"><Siren size={20}/></div><div><h2 className="font-bold text-slate-100">Incident simulator</h2><p className="mt-1 text-xs text-slate-500">Inject a signal into the response pipeline</p></div></div>
            <StatusPill color={severityColor}>{form.severity}</StatusPill>
          </div>

          <div className="space-y-5">
            <div><label className="mb-2 block text-xs font-bold text-slate-300">Target service</label><div className="relative"><Code2 className="absolute left-3 top-3.5 text-slate-500" size={16}/><input className="input-dark pl-10" value={form.service} onChange={e => update('service', e.target.value)} placeholder="e.g. payments-api"/></div></div>
            <div><label className="mb-2 block text-xs font-bold text-slate-300">Error signature / message</label><textarea className="input-dark min-h-[118px] resize-y leading-6" value={form.error_signature} onChange={e => update('error_signature', e.target.value)} placeholder="Paste the error, alert, stack trace summary, or observed symptom..."/></div>
            <div><label className="mb-2 block text-xs font-bold text-slate-300">Severity level</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['Critical P0','High P1','Medium P2','Low P3'].map((s, i) => <button key={s} onClick={() => update('severity', s)} className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${form.severity === s ? (i === 0 ? 'border-rose-400/50 bg-rose-400/10 text-rose-200' : i === 1 ? 'border-amber-300/50 bg-amber-300/10 text-amber-100' : 'border-blue-300/50 bg-blue-300/10 text-blue-100') : 'border-slate-700 bg-slate-900/60 text-slate-500 hover:border-slate-500'}`}><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-rose-400' : i === 1 ? 'bg-amber-300' : i === 2 ? 'bg-blue-300' : 'bg-slate-400'}`}/>{s}</button>)}</div></div>
          </div>

          <div className="my-6 border-t border-slate-800"/>
          <div className="mb-3 flex items-center gap-2"><GitBranch size={15} className="text-slate-500"/><span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Workflow dispatch</span></div>
          <div className="grid gap-3">
            <button disabled={!!busy || !form.service.trim() || !form.error_signature.trim()} onClick={() => trigger('incident')} className="btn-primary flex items-center justify-between rounded-xl px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50">
              <span className="flex items-center gap-3"><span className="rounded-lg bg-black/10 p-2"><BrainCircuit size={19}/></span><span><span className="block text-sm">Triage & Hindsight Analysis</span><span className="mt-1 block text-[10px] font-semibold opacity-70">Webhook 01 · Groq reasoning + vector memory</span></span></span>
              {busy === 'incident' ? <Loader2 className="animate-spin" size={18}/> : <ArrowUpRight size={19}/>}
            </button>
            <button disabled={!!busy || !form.service.trim() || !form.error_signature.trim()} onClick={() => trigger('remediation')} className="btn-secondary flex items-center justify-between rounded-xl px-4 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50">
              <span className="flex items-center gap-3"><span className="rounded-lg bg-blue-300/10 p-2 text-blue-200"><Zap size={19}/></span><span><span className="block text-sm font-bold">Auto-Remediation & Runbooks</span><span className="mt-1 block text-[10px] text-slate-500">Webhook 02 · Runbook recommendation / approval gate</span></span></span>
              {busy === 'remediation' ? <Loader2 className="animate-spin" size={18}/> : <ChevronRight size={19}/>}
            </button>
          </div>
          <p className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-slate-500"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-300"/> Remediation requests are marked for human-in-the-loop approval. Configure your n8n workflow to validate and approve actions before executing production changes.</p>
        </section>

        <div className="space-y-5">
          <section className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2"><Terminal size={17} className="text-emerald-300"/><div><h2 className="text-sm font-bold">AI command output</h2><p className="mt-0.5 text-[10px] text-slate-500">Workflow response · structured payload</p></div></div>
              {output?.loading ? <StatusPill color="amber">Processing</StatusPill> : output?.success ? <StatusPill>Complete</StatusPill> : output ? <StatusPill color="red">Failed</StatusPill> : <StatusPill color="blue">Standby</StatusPill>}
            </div>
            <div className="scanline min-h-[270px] bg-[#080e19] p-4 sm:p-5">
              {!output && <div className="flex min-h-[230px] flex-col items-center justify-center text-center"><div className="mb-4 rounded-2xl border border-slate-700/70 bg-slate-900 p-4 text-slate-500"><Bot size={27}/></div><p className="text-sm font-semibold text-slate-300">Awaiting workflow execution</p><p className="mt-2 max-w-xs text-xs leading-5 text-slate-600">Trigger either workflow to see the AI triage brief, memory context, and runbook response here.</p></div>}
              {output?.loading && <div className="flex min-h-[230px] flex-col items-center justify-center text-center"><Loader2 className="mb-4 animate-spin text-emerald-300" size={28}/><p className="text-sm font-bold text-slate-200">Orchestrating {output.label}</p><p className="mt-2 text-xs text-slate-500">Waiting for n8n workflow response…</p><span className="mt-4 font-mono text-[10px] text-emerald-300/70">REQUEST STARTED · {output.started}</span></div>}
              {output && !output.loading && <div className="feed-enter">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-slate-200">{output.label}</span><span className="font-mono text-[10px] text-slate-600">{output.completed}</span></div>
                {output.success ? <div className="mb-3 flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={14}/> Workflow returned successfully</div> : <div className="mb-3 flex items-center gap-2 text-xs text-rose-300"><AlertOctagon size={14}/> {output.error}</div>}
                <pre className="max-h-[360px] overflow-auto rounded-xl border border-slate-800 bg-[#060b13] p-4 font-mono text-[11px] leading-5 text-sky-100/80">{output.success ? outputText : output.error}</pre>
                {output.success && <button onClick={() => navigator.clipboard?.writeText(outputText)} className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-emerald-300"><FileText size={13}/> Copy response</button>}
              </div>}
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><History size={16} className="text-blue-300"/><h2 className="text-sm font-bold">Event stream</h2></div><span className="font-mono text-[10px] text-slate-600">LATEST {events.length}</span></div>
            <div className="space-y-0">
              {events.map((event, i) => { const Icon = eventIcon(event.type); return <div key={event.id} className="feed-enter relative flex gap-3 pb-4 last:pb-0">
                {i !== events.length - 1 && <span className="absolute bottom-0 left-[13px] top-7 w-px bg-slate-800"/>}
                <span className={`relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-lg border ${event.type === 'error' ? 'border-rose-400/20 bg-rose-400/10 text-rose-300' : event.type === 'success' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400'}`}><Icon size={13}/></span>
                <div className="min-w-0 flex-1 pt-0.5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-300">{event.title}</p><span className="font-mono text-[9px] text-slate-600">{event.time}</span></div><p className="mt-1 truncate text-[10px] text-slate-500">{event.detail}</p></div>
              </div>})}
            </div>
          </section>
        </div>
      </main>

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[{icon:Cloud,title:'n8n orchestration',desc:'Two isolated production webhook routes'},{icon:Cpu,title:'Groq intelligence',desc:'Reasoning and incident summarization'},{icon:Database,title:'Vector hindsight',desc:'Historical incident retrieval and context'}].map(({icon:Icon,title,desc}) => <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4"><span className="rounded-lg bg-slate-800 p-2 text-slate-400"><Icon size={17}/></span><span><span className="block text-xs font-bold text-slate-300">{title}</span><span className="mt-1 block text-[10px] text-slate-500">{desc}</span></span></div>)}
      </section>
      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-800/80 pt-5 text-[10px] text-slate-600 sm:flex-row"><span>© 2026 SENTINEL · HACK WITH BANGALORE 4.0</span><span className="flex items-center gap-2"><CircleDot size={10} className="text-emerald-300"/> Built for observable, accountable incident response</span></footer>
    </div>
  </div>
}
