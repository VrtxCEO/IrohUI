import { useEffect } from 'react'
import { EyroEye } from '../eye/EyroEye'
import { GiscusComments } from './GiscusComments'
import type { EyeState } from '../eye/EyroEye'
import eyroEyeSrc from '../../assets/eyro_eye.svg'

interface FloatingEye {
  state: EyeState
  size: number
  x: string
  y: string
  maxOpacity: number
  duration: number
  delay: number
}

const EYES: FloatingEye[] = [
  { state: 'idle',       size: 380, x:  '-2%', y:  '2%',  maxOpacity: 0.07, duration: 13, delay: 0   },
  { state: 'capability', size: 220, x:  '75%', y:  '1%',  maxOpacity: 0.11, duration:  9, delay: 2.7 },
  { state: 'network',    size: 290, x:  '-1%', y: '55%',  maxOpacity: 0.06, duration: 15, delay: 1.4 },
  { state: 'idle',       size: 140, x:  '76%', y: '68%',  maxOpacity: 0.12, duration:  8, delay: 4.3 },
  { state: 'processing', size: 200, x:  '84%', y: '35%',  maxOpacity: 0.07, duration: 17, delay: 0.6 },
  { state: 'capability', size: 120, x:  '26%', y: '87%',  maxOpacity: 0.09, duration:  7, delay: 3.5 },
  { state: 'idle',       size: 100, x:  '12%', y: '40%',  maxOpacity: 0.10, duration: 12, delay: 6.2 },
  { state: 'network',    size: 240, x:  '52%', y: '14%',  maxOpacity: 0.05, duration: 11, delay: 2.1 },
  { state: 'idle',       size:  75, x:  '46%', y: '93%',  maxOpacity: 0.08, duration: 20, delay: 5.5 },
  { state: 'capability', size: 160, x:  '90%', y: '84%',  maxOpacity: 0.07, duration: 10, delay: 7.2 },
  { state: 'network',    size:  90, x:  '38%', y: '48%',  maxOpacity: 0.04, duration: 22, delay: 8.9 },
  { state: 'idle',       size: 180, x:  '62%', y: '74%',  maxOpacity: 0.06, duration: 14, delay: 3.8 },
]

const DISCORD_URL = 'https://discord.gg/eyro'

function Ref({ n }: { n: number }) {
  return (
    <sup>
      <a href={`#fn-${n}`} className="mf-ref" id={`ref-${n}`}>[{n}]</a>
    </sup>
  )
}

export function ManifestoPage() {
  useEffect(() => {
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    const root = document.getElementById('root')
    if (root) root.style.overflow = 'auto'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      if (root) root.style.overflow = ''
    }
  }, [])

  return (
    <div className="mf-root">
      <div className="mf-eyes-layer" aria-hidden="true">
        {EYES.map((eye, i) => (
          <div
            key={i}
            className="mf-eye-outer"
            style={{ left: eye.x, top: eye.y, opacity: eye.maxOpacity }}
          >
            <div
              className="mf-eye-inner"
              style={{
                animationDuration: `${eye.duration}s`,
                animationDelay: `-${eye.delay}s`,
              }}
            >
              <EyroEye state={eye.state} size={eye.size} />
            </div>
          </div>
        ))}
      </div>

      <div className="mf-vignette" aria-hidden="true" />

      <header className="mf-header">
        <div className="mf-header-inner">
          <a href="/" className="mf-logo">
            <img src={eyroEyeSrc} className="mf-logo-eye" alt="Eyro" />
            <span className="mf-logo-name">eyro<span>OS</span></span>
          </a>
          <nav className="mf-header-nav">
            <a href={DISCORD_URL} className="mf-btn-ghost" target="_blank" rel="noreferrer">Discord</a>
            <a href="/?signup=1" className="mf-btn-accent">Create Account</a>
          </nav>
        </div>
      </header>

      <main className="mf-main">

        {/* ── HERO ── */}
        <section className="mf-hero">
          <div className="mf-eyebrow">Technical Paper · August 2026</div>
          <h1 className="mf-hero-title">
            Death to<br />
            <span className="mf-hero-title-accent">Agent Wrappers</span>
          </h1>
          <p className="mf-paper-subtitle">
            The Wrapper Problem: Why Prompt-Style Agent Frameworks Are Structurally
            Incapable of Supporting Real Agentic Growth
          </p>
          <p className="mf-paper-author">
            Omni-Ouro, Independent Designer and Developer, Eyro&nbsp;
            <a href="https://eyro.io/" className="mf-author-link">eyro.io</a>
          </p>
          <div className="mf-hero-cta">
            <a href="/?signup=1" className="mf-btn-accent mf-btn-lg">Join the Beta</a>
            <a href={DISCORD_URL} className="mf-btn-ghost mf-btn-lg" target="_blank" rel="noreferrer">Discord Community</a>
          </div>
        </section>

        {/* ── DOCUMENT ── */}
        <div className="mf-doc">

          {/* Abstract */}
          <div className="mf-abstract">
            <div className="mf-abstract-label">Abstract</div>
            <p>
              The dominant way AI agents get built today is the prompt-style wrapper: a system
              that directs behavior through runtime text injection, chained model calls, and
              retrieved context rather than through persistent, governed, structured state. This
              paper argues that pattern is not just suboptimal, it is architecturally incompatible
              with genuine agentic growth. I lay out what agentic growth actually requires, examine
              why three widely used frameworks (LangChain/LangGraph, CrewAI, and OpenClaw) fall
              short of those requirements despite real sophistication, and use Eyro, an agent
              operating system built on a deterministic, substrate-first architecture, as a case
              study in what the alternative looks like. My claim isn't that Eyro is finished. It's
              that the direction is correct, the current standard is insufficient, and the field
              needs to grapple with that honestly.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mf-section">
            <div className="mf-section-label">1. Introduction</div>
            <div className="mf-prose">
              <p>
                When OpenClaw launched, I was one of the people who got pulled in fast. An agent
                that could handle things while I was away, replying to messages, running errands,
                effectively letting me be in two places at once, felt like exactly the kind of
                thing this industry had been promising for years without delivering. I spent about
                two days deep in it: reading the docs, watching demos, testing it against real
                tasks. By the end I knew it wasn't going to hold up. It's a genuinely clever idea
                sitting on a foundation that can't support it, and every improvement the team has
                shipped since (credit to them, there have been real ones) has patched a symptom
                while leaving the underlying assumption untouched: that memory, identity, and
                governance can all live as text inside whatever a model happens to be reasoning
                over at a given moment.
              </p>
              <p>
                That assumption isn't unique to OpenClaw. It's the load-bearing idea behind nearly
                every popular agent framework in production today. LangChain, CrewAI, and the rest
                democratized access to agent-like behavior and taught the field a lot about what
                people actually want from these systems. That contribution is real. But the
                scaffolding got confused with the foundation, and the field is now building
                consequential systems on architectures whose most important properties are
                determined not by design but by whatever text happens to be sitting in a context
                window at a given moment.
              </p>
              <p>
                Agentic behavior that actually compounds, agents that improve over time, hold a
                consistent identity, and can be trusted with autonomous action, requires structural
                properties that prompt pipelines cannot provide. Not approximately. Structurally
                cannot provide. This paper makes that case and shows what the alternative looks
                like.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mf-section">
            <div className="mf-section-label">2. Defining Terms: What Is a Prompt-Style Wrapper?</div>
            <div className="mf-prose">
              <p>
                A prompt-style wrapper is any system whose primary mechanism for directing agent
                behavior is runtime injection of text into a model's context window. The defining
                trait isn't simplicity (some of these systems are architecturally complex), it's
                that state, identity, goals, memory, and governance exist as text in a prompt
                rather than as structured, persistent, addressable data enforced outside the model.
              </p>
              <p>That covers more of the landscape than it might seem:</p>
            </div>
            <pre className="mf-code-block">{`Prompt-Style Wrapper Patterns:

  [1] Role/goal/constraint definition → system prompt injection
  [2] Memory simulation               → retrieved text injected into context
  [3] Multi-agent collaboration       → one agent's output becomes another's input
  [4] Tool use                        → LLM output parsed and executed externally
  [5] "Governance"                    → instructions the model is expected to follow`}</pre>
            <div className="mf-prose">
              <p>
                These aren't edge cases. They're accurate descriptions of LangChain/LangGraph,
                CrewAI, and OpenClaw, three of the most widely used agent frameworks in production
                today.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mf-section">
            <div className="mf-section-label">3. What Agentic Growth Actually Requires</div>
            <div className="mf-prose">
              <p>
                Before cataloguing failures, it's worth being precise about what we're measuring
                against. Agentic growth here doesn't mean task completion or multi-step reasoning.
                It means the capacity to improve performance over time through structured
                experience, hold a consistent identity across contexts, and take autonomous action
                in ways that can be trusted and verified. That implies five structural
                requirements:
              </p>
            </div>
            <pre className="mf-code-block">{`Five Structural Requirements for Genuine Agentic Growth:

  1. PERSISTENT STRUCTURED STATE
     Agent knowledge survives sessions, is addressable by subsystems,
     and updates through governed processes, not through whatever
     text persists in a conversation thread.

  2. ARCHITECTURAL SEPARATION OF EXECUTION AND LEARNING
     The component that performs tasks and the component that updates
     knowledge from those tasks must be distinct. Conflating them
     accumulates noise alongside signal with no reliable way to
     separate them.

  3. EXTERNAL, NON-SELF-DIRECTED EVALUATION
     A system cannot reliably assess its own outputs from within the
     same reasoning context that produced them. Evaluator independence
     is the mechanism that makes feedback signals trustworthy.

  4. STRUCTURAL BEHAVIORAL GOVERNANCE
     Behavioral constraints enforced through text instructions are
     probabilistic. Compliance is a function of model behavior under
     context, not a structural guarantee. For consequential
     deployments, this is disqualifying.

  5. PROACTIVE AND REACTIVE OPERATIONAL MODES
     An agent that only responds to input is a sophisticated tool,
     not an autonomous actor. Genuine agency requires the capacity
     to initiate behavior from internal state, independent of
     external prompting.`}</pre>
            <div className="mf-prose">
              <p>Current frameworks address some of this partially. None address it structurally.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mf-section">
            <div className="mf-section-label">4. The Technical Failure Modes of Leading Frameworks</div>

            <h3 className="mf-subsection-title">4.1 LangChain / LangGraph: Sophisticated Scaffolding, Unchanged Substrate</h3>
            <div className="mf-prose">
              <p>
                LangChain is the most widely used agent framework in the world, and LangGraph's
                stateful graph structure with checkpointed state was a real improvement over the
                original chain-based design. But long conversations still overflow context windows
                or degrade model performance well before they run out of room,<Ref n={1} /> and
                LangChain's older in-process memory classes, wiped by a simple restart, were
                deprecated in favor of LangGraph checkpointers and LangMem.<Ref n={2} /> LangMem
                itself doesn't enforce any particular storage backend; it's a thin layer over
                whatever vector database or key-value store gets configured as a tool.<Ref n={3} />
              </p>
              <p>
                The deeper issue isn't performance, it's that the LLM in a LangGraph pipeline has
                to act as CPU and working memory at once. State isn't an independent artifact the
                agent reads from, it's a property of the pipeline that gets re-serialized into the
                model on every call. If the checkpointer fails, state is lost. If the context
                window overflows, older state is truncated without signal. The agent has no
                cognitive home that survives model changes or pipeline refactors, because the agent
                and its state were never separable to begin with.
              </p>

              <h3 className="mf-subsection-title">4.2 CrewAI: Role Specialization Without Structural State</h3>
              <p>
                CrewAI is the most thoughtful current attempt at multi-agent architecture inside
                the wrapper paradigm. Its role-based design supports hierarchical modes (a manager
                agent delegating to subordinates) and distributed modes with shared
                memory,<Ref n={4} /> and its Flows layer adds deterministic orchestration plus
                hallucination guardrails on top of the probabilistic agent layer.<Ref n={5} />
                That's genuinely more sophisticated than a single-agent pipeline. It doesn't escape
                the paradigm, though.
              </p>
              <p>
                Agent roles in CrewAI are YAML configuration injected into a system prompt,
                described in CrewAI's own docs as personas that "shape how they approach
                tasks."<Ref n={6} /> That's not a structurally enforced identity; it can be
                contradicted by strong input context or overridden by a manager agent's
                instructions. Flows still pass state as context between steps rather than holding
                it as substrate,<Ref n={7} /> so when a run ends, whatever state existed disappears
                unless a developer explicitly serializes it. Specialization without persistent
                state is parallelized forgetfulness: every run starts from the same blank slate,
                and the crew learns nothing between them.<Ref n={8} />
              </p>

              <h3 className="mf-subsection-title">4.3 OpenClaw: The Tool Array as a False Architecture</h3>
              <p>
                OpenClaw is the most instructive case, because its appeal is real: a local-first
                agent with access to a genuinely useful tool array (files, shell, calendar,
                messaging) that does things instead of just describing them. Its architecture is
                simple by design: the model handles decision-making, and conversation history and
                tool execution stay local.<Ref n={9} /> Its extensibility comes from ClawHub, a
                community skill marketplace, and installing a skill is effectively running
                unreviewed third-party code with the agent's own permissions.<Ref n={10} /> A
                security audit of ClawHub found that roughly 12% of available skills were malicious
                (data exfiltration, prompt injection payloads, and worse), with 8 vulnerabilities
                rated critical.<Ref n={11} />
              </p>
              <p>
                The same trust model produced a real incident in February 2026, though not the one
                people usually attribute to OpenClaw. Attackers used a malicious GitHub issue title
                to trick Cline's AI-powered triage bot, which had shell access on a CI runner, into
                leaking publishing credentials. Those credentials were used to push a trojanized
                package to npm whose install script silently pulled down and ran OpenClaw itself,
                reaching an estimated 4,000 developer machines.<Ref n={12} /> Cline is a different
                tool, but it's built on the identical premise: give a model your credentials and
                your shell, and trust the prompt to behave. Whichever tool sits on either side of
                an incident like this, the vulnerability class is the same.
              </p>
              <p>
                That's a violation of two basic security principles. First, least privilege:
                OpenClaw's agent holds shell, filesystem, and network access simultaneously, scoped
                only by instructions the model is asked to follow, because the governance layer
                sits inside the reasoning engine instead of above it. Second, the absence of any
                real boundary between instructions and data. Models treat everything in context
                (system prompts, user input, retrieved documents, tool output) as the same stream
                of tokens.<Ref n={13} /> No LLM vendor has solved prompt injection at the model
                level,<Ref n={14} /> and it isn't going to be solved by a better model. It has to
                be solved by enforcing the trust boundary at the architecture level, before the
                model ever acts on the input.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mf-section">
            <div className="mf-section-label">5. Eyro: What the Alternative Looks Like</div>
            <div className="mf-prose">
              <p>
                Eyro is an AI agent operating system I've been building from a different set of
                assumptions: that the properties above have to live outside the model, not inside
                a prompt.
              </p>
              <p>
                The central decision is what I call the Persistent Cognitive Substrate, a durable,
                structured state layer that's the canonical source of truth for what the system
                knows and is authorized to do. It isn't a context window, a vector store, or a
                session checkpoint. It's the agent's actual home, and it survives sessions, model
                changes, and everything else that resets a wrapper's memory. That reframes what the
                LLM is for:
              </p>
            </div>
            <pre className="mf-code-block">{`Wrapper Architecture:
  LLM = CPU + Working Memory + State Store + Governance Engine
        [All responsibilities collapsed into one probabilistic unit]

Eyro Architecture:
  LLM = Stateless Execution Unit with strictly defined I/O boundaries
  Substrate = Persistent state, knowledge, and agent identity
  Governance Layer = Structural enforcement outside the model
        [Responsibilities separated by architectural boundary]`}</pre>
            <div className="mf-prose">
              <p>
                In Eyro, the model receives a bounded input, reasons over it, and returns a
                structured output. It doesn't hold state between calls, manage its own memory, or
                enforce its own behavior. Those jobs belong to components built for persistence,
                addressability, and enforcement that doesn't depend on the model behaving itself.
                An agent that comes back after a week doesn't reconstruct itself from injected
                history, it reads from a substrate that was never lost.
              </p>
              <p>
                Two more pieces follow from the same premise. Knowledge lookup works like a
                deterministic search engine rather than a retrieval system: instead of stuffing raw
                chunks into context on semantic similarity, the agent queries a typed registry and
                gets back an exact pointer or capability definition, nothing more than it needs for
                the task in front of it. And evaluation happens outside the agent entirely: a
                separate background process reviews outputs against expected performance, produces
                structured learning artifacts, and surfaces them for review before anything gets
                promoted into the system's knowledge. The agent doesn't grade its own homework, for
                the same reason self-review is weaker than independent review anywhere else: a
                system can't reliably audit itself from inside the context that produced the thing
                being audited.
              </p>
              <p>
                The last piece is governance and initiative. Behavioral limits are enforced
                structurally through tiered permission levels rather than through instructions the
                model is expected to follow, so an action that requires a permission level the
                agent doesn't have simply cannot execute, regardless of what the model outputs. And
                the system distinguishes between responding to input and acting on its own: most
                agent tooling only ever reacts, with anything that looks proactive bolted on
                externally through cron jobs or webhooks. Eyro treats initiating action from
                internal state as a first-class mode, not an afterthought.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mf-section">
            <div className="mf-section-label">6. The Standard Must Change</div>
            <div className="mf-prose">
              <p>
                The natural objection: wrapper-based systems work for plenty of applications,
                they're faster to build, and they have real product-market fit. Why demand more?
              </p>
              <p>
                Because "works for many applications" and "can serve as the substrate for genuine
                autonomous agency" are different claims. Wrapper-based systems are fine for
                bounded, supervised, largely stateless tasks. They're not a sound foundation for
                agents operating with real autonomy in consequential environments, and that's
                exactly where the field is heading: Gartner projects enterprise AI agent adoption
                climbing from under 5% to roughly 40% by the end of 2026.<Ref n={15} /> The
                architectural debt being taken on now gets paid at scale.
              </p>
              <p>
                The Cline supply-chain compromise described above is instructive here. It wasn't a
                failure of model intelligence or prompt engineering skill. It was the predictable
                result of building an autonomous system on a foundation where the boundary between
                instructions and data is enforced probabilistically, by the model itself. That's an
                architecture problem, and architecture problems don't yield to better prompts or
                more careful guardrail wording.
              </p>
              <p>
                There's also an honesty problem in how these systems get described. A role defined
                in YAML and injected as a system prompt is not a structurally enforced identity. A
                reflection loop running in the same context that produced the original output is
                not independent evaluation. A guardrail expressed as a prompt instruction is not a
                behavioral guarantee. Calling these things by names that imply properties they
                don't have sets expectations the systems can't meet.
              </p>
              <p>
                Eyro is one attempt to do this differently, and it's incomplete: there are open
                questions and components still in progress. The argument isn't that Eyro is
                finished. It's that the architecture is right, the problems it addresses are real,
                and the field needs more systems designed around these requirements from the start
                instead of retrofitted later.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mf-section">
            <div className="mf-section-label">7. Conclusion</div>
            <div className="mf-prose">
              <p>
                Prompt-style agent wrappers have earned their place as an acceleration layer, and
                they'll keep serving the bounded, supervised use cases they're suited for. What
                they can't do, and what the field increasingly needs, is serve as the foundation
                for agents capable of real autonomy, reliable identity, structural learning, and
                verifiable governance.
              </p>
              <p>
                These failures aren't engineering gaps inside the paradigm. They're properties of
                the paradigm: context amnesia, identity drift, self-referential evaluation loops
                that can't escape their own priors, governance that's really just text a model is
                asked to comply with, reactive-only operation. They follow directly from the
                architecture, as predictably as a buffer overflow follows from a system with no
                memory protection.
              </p>
              <p>
                The alternative, the substrate-first approach Eyro is built on, treats persistent
                state, separated execution and learning, external evaluation, structural
                governance, and proactive agency as first-class requirements rather than deferred
                ones. It's harder to build, and it doesn't yet have the ecosystem or track record
                of the incumbents. What it has is the right foundation, and the field needs to be
                honest about whether the current standard is actually sufficient for what it's
                trying to build.
              </p>
              <p>
                Further information on Eyro's development is available at{' '}
                <a href="https://eyro.io/" className="mf-inline-link">eyro.io</a>.
              </p>
            </div>
          </section>

          {/* Author note */}
          <div className="mf-author-note">
            <p>
              I own the rights and IP to Eyro, an AI agent operating system still very much in
              progress. This paper grew out of my own two-day rabbit hole with OpenClaw rather than
              pure research; I went in excited and came out convinced the idea deserved a better
              foundation. I'm not claiming Eyro is a finished answer to the problems described here.
              I'm claiming the direction is correct, and that building the missing structure in
              from the start beats bolting it on after the fact.
            </p>
          </div>

          {/* References */}
          <section className="mf-section mf-references">
            <div className="mf-section-label">References</div>
            <ol className="mf-footnotes">
              <li id="fn-1">LangChain Documentation. "Memory Overview." docs.langchain.com/oss/python/concepts/memory. Accessed 2026.{' '}<a href="#ref-1" className="mf-fn-back">↩</a></li>
              <li id="fn-2">Atlan. "Long-Term Memory LangChain Agents: LangGraph and LangMem Guide." atlan.com. April 2026.{' '}<a href="#ref-2" className="mf-fn-back">↩</a></li>
              <li id="fn-3">DigitalOcean. "LangMem SDK for Agent Long-Term Memory." digitalocean.com. February 2026.{' '}<a href="#ref-3" className="mf-fn-back">↩</a></li>
              <li id="fn-4">EmergentMind. "CrewAI: Multi-Agent AI Systems." emergentmind.com. August 2025.{' '}<a href="#ref-4" className="mf-fn-back">↩</a></li>
              <li id="fn-5">CrewAI Blog. "How to Build Agentic Systems: The Missing Architecture for Production AI Agents." crewai.com. December 2025.{' '}<a href="#ref-5" className="mf-fn-back">↩</a></li>
              <li id="fn-6">Firecrawl. "Building Multi-Agent Systems with CrewAI, A Comprehensive Tutorial." firecrawl.dev. May 2025.{' '}<a href="#ref-6" className="mf-fn-back">↩</a></li>
              <li id="fn-7">Ghosh, J. "Mastering CrewAI Flows: Building Hierarchical Multi-Agent Systems." Medium. August 2025.{' '}<a href="#ref-7" className="mf-fn-back">↩</a></li>
              <li id="fn-8">Towards Data Science. "How to Build Your Own Agentic AI System Using CrewAI." towardsdatascience.com. November 2025.{' '}<a href="#ref-8" className="mf-fn-back">↩</a></li>
              <li id="fn-9">36Kr English. "Claude's 'Shrimpification': Can't Kill OpenClaw but Sets a Ceiling for It." eu.36kr.com. March 2026.{' '}<a href="#ref-9" className="mf-fn-back">↩</a></li>
              <li id="fn-10">Immersive Labs. "Why You Should Uninstall OpenClaw AI Immediately: A Security Warning." immersivelabs.com. March 2026.{' '}<a href="#ref-10" className="mf-fn-back">↩</a></li>
              <li id="fn-11">ClaudeFast. "OpenClaw vs Claude Code: Which Should You Use? (2026)." claudefa.st. June 2026.{' '}<a href="#ref-11" className="mf-fn-back">↩</a></li>
              <li id="fn-12">Khan, A. Security disclosure on the February 2026 Cline npm supply-chain compromise, corroborated by Snyk and the Cloud Security Alliance.{' '}<a href="#ref-12" className="mf-fn-back">↩</a></li>
              <li id="fn-13">centminmod. "explain-openclaw: Prompt Injection Attacks." GitHub. March 2026.{' '}<a href="#ref-13" className="mf-fn-back">↩</a></li>
              <li id="fn-14">centminmod. "explain-openclaw: Prompt Injection Attacks." GitHub. March 2026.{' '}<a href="#ref-14" className="mf-fn-back">↩</a></li>
              <li id="fn-15">Gartner. Enterprise AI agent adoption forecast (roughly 5% to 40% through 2026), as reported in industry coverage. 2026.{' '}<a href="#ref-15" className="mf-fn-back">↩</a></li>
            </ol>
          </section>

        </div>

        {/* ── CTA ── */}
        <section className="mf-cta-section">
          <div className="mf-cta-eye" aria-hidden="true">
            <EyroEye state="idle" size={120} />
          </div>
          <div className="mf-section-label">Join the Beta</div>
          <h2 className="mf-cta-title">Shape what comes next.</h2>
          <p className="mf-cta-sub">
            We're inviting the first wave of builders to work directly with the Eyro OS.
            Not a waitlist. A conversation.
          </p>
          <div className="mf-cta-btns">
            <a href="/?signup=1" className="mf-btn-accent mf-btn-lg">Create an Account</a>
            <a href={DISCORD_URL} className="mf-btn-ghost mf-btn-lg" target="_blank" rel="noreferrer">Join the Discord</a>
          </div>
        </section>

        {/* ── COMMENTS ── */}
        <section className="mf-comments-section">
          <GiscusComments />
        </section>

        {/* ── FOOTER ── */}
        <footer className="mf-footer">
          <div className="mf-footer-logo">
            <img src={eyroEyeSrc} className="mf-logo-eye mf-logo-eye-sm" alt="Eyro" />
            <span className="mf-footer-name">eyroOS</span>
          </div>
          <div className="mf-footer-links">
            <a href="/" className="mf-footer-link">App</a>
            <a href={DISCORD_URL} className="mf-footer-link" target="_blank" rel="noreferrer">Discord</a>
          </div>
          <div className="mf-footer-copy">© 2025 Eyro. All rights reserved.</div>
        </footer>

      </main>
    </div>
  )
}
