import { useEffect } from 'react'
import { EyroEye } from '../eye/EyroEye'
import { GiscusComments } from './GiscusComments'
import type { EyeState } from '../eye/EyroEye'

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
            <div className="mf-logo-mark">I</div>
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
          <div className="mf-eyebrow">Technical Paper · June 2026</div>
          <h1 className="mf-hero-title">
            Death to<br />
            <span className="mf-hero-title-accent">Agent Wrappers</span>
          </h1>
          <p className="mf-paper-subtitle">
            The Wrapper Problem: Why Prompt-Style Agent Frameworks Are Structurally
            Incapable of Supporting Real Agentic Growth
          </p>
          <p className="mf-paper-author">
            Omni-Ouro — Independent Designer and Developer, Eyro&nbsp;
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
              The dominant paradigm for deploying AI agents today is the prompt-style wrapper: a
              system that directs agent behavior through runtime text injection, chained model calls,
              and retrieved context rather than through persistent, governed, structured state. This
              paper argues that this pattern is not merely suboptimal — it is architecturally
              incompatible with the requirements of genuine agentic growth. The argument is made in
              three parts: a theoretical account of what agentic growth actually requires; a
              technical dissection of why current leading frameworks — including LangChain/LangGraph,
              CrewAI, and OpenClaw — fail to meet those requirements despite their apparent
              sophistication; and a detailed examination of the design decisions behind Eyro, an AI
              agent operating system built on a deterministic, substrate-first architecture, as a
              case study in what the alternative looks like in practice. My claim is not that Eyro
              is a finished answer. The claim is that the direction is correct, that the current
              standard is insufficient, and that the field must grapple with this honestly if real
              progress toward autonomous AI systems is going to happen.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mf-section">
            <div className="mf-section-label">1. Introduction</div>
            <div className="mf-prose">
              <p>
                When the major LLM providers opened their APIs, the development community did what it
                always does: it built abstractions. Frameworks appeared almost immediately — LangChain
                in 2022, CrewAI shortly after, and a long succession of others — each promising to
                take the raw capability of a language model and organize it into something that
                behaved like an agent. You could give it tools. You could give it a persona. You
                could chain its outputs back into its inputs and get something that appeared to reason
                across multiple steps.
              </p>
              <p>
                This wave of tooling served a real purpose. It democratized access to agent-like
                behavior, reduced the engineering barrier to experimentation, and produced enormous
                amounts of practical learning about what users and businesses actually want from AI
                systems. That contribution is real and should not be dismissed.
              </p>
              <p>
                But the scaffolding got confused with the foundation. What began as experimental
                wiring became the default architecture for production deployments. And the field is
                now in a position where the most popular, most widely-cited frameworks for building
                AI agents are, at their structural core, sophisticated prompt pipelines — systems
                whose most important properties are determined not by architecture but by what text
                happens to be in a context window at a given moment.
              </p>
              <p>
                This matters because agentic behavior that actually compounds — agents that get
                better, that maintain consistent identity, that can be trusted with autonomous action
                in consequential environments — requires structural properties that prompt pipelines
                cannot provide. Not approximately. Not without caveats significant enough that the
                gap becomes immaterial. Structurally cannot provide.
              </p>
              <p>
                This paper makes that argument explicitly and builds a case for what the alternative
                looks like.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mf-section">
            <div className="mf-section-label">2. Defining Terms: What Is a Prompt-Style Wrapper?</div>
            <div className="mf-prose">
              <p>
                A prompt-style wrapper, as used here, refers to any system whose primary mechanism
                for directing agent behavior is runtime injection of text into a language model's
                context window. The defining characteristic is not simplicity — some of these systems
                are architecturally complex. The defining characteristic is that state, identity,
                goals, memory, and governance exist as text in a prompt rather than as structured,
                persistent, addressable data with enforcement semantics outside the model.
              </p>
              <p>
                This definition covers more of the landscape than it might initially seem:
              </p>
            </div>
            <pre className="mf-code-block">{`Prompt-Style Wrapper Patterns:

  [1] Role/goal/constraint definition → system prompt injection
  [2] Memory simulation               → retrieved text injected into context
  [3] Multi-agent collaboration       → one agent's output becomes another's input
  [4] Tool use                        → LLM output parsed and executed externally
  [5] "Governance"                    → instructions the model is expected to follow`}</pre>
            <div className="mf-prose">
              <p>
                These are not edge-case descriptions. They are accurate descriptions of
                LangChain/LangGraph's architecture, CrewAI's architecture, and the architecture of
                OpenClaw — currently among the most popular agent frameworks in production use.
              </p>
              <p>
                Understanding why sophistication within this paradigm still leaves the fundamental
                problems unsolved is the core of the argument.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mf-section">
            <div className="mf-section-label">3. What Agentic Growth Actually Requires</div>
            <div className="mf-prose">
              <p>
                Before cataloguing failures, it is worth being precise about what we are measuring
                against. "Agentic growth" as used here does not mean task completion or even
                multi-step reasoning. It means the capacity for a system to improve its performance
                over time through structured experience, maintain consistent identity across
                operational contexts, and take autonomous action in ways that can be trusted and
                verified.
              </p>
              <p>
                That definition implies five structural requirements:
              </p>
            </div>
            <pre className="mf-code-block">{`Five Structural Requirements for Genuine Agentic Growth:

  1. PERSISTENT STRUCTURED STATE
     Agent knowledge survives sessions, is addressable by subsystems,
     and updates through governed processes — not through whatever
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
     context — not a structural guarantee. For consequential
     deployments, this is disqualifying.

  5. PROACTIVE AND REACTIVE OPERATIONAL MODES
     An agent that only responds to input is a sophisticated tool,
     not an autonomous actor. Genuine agency requires the capacity
     to initiate behavior from internal state, independent of
     external prompting.`}</pre>
            <div className="mf-prose">
              <p>
                Current frameworks address some of these requirements partially. None address them
                structurally.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mf-section">
            <div className="mf-section-label">4. The Technical Failure Modes of Leading Frameworks</div>

            <h3 className="mf-subsection-title">4.1 LangChain / LangGraph: Sophisticated Scaffolding, Unchanged Substrate</h3>
            <div className="mf-prose">
              <p>
                LangChain is the most widely used agent framework in the world. Its evolution into
                LangGraph represented a genuine architectural improvement — the introduction of a
                stateful graph structure with checkpointed state and explicit memory management was
                a meaningful step forward from the original chain-based design.
              </p>
              <p>
                LangGraph manages short-term memory as part of the agent's state, persisted via
                thread-scoped checkpoints. Long conversations pose a well-documented challenge: a
                full history may not fit inside an LLM's context window, resulting in irrecoverable
                errors, and even when context length is sufficient, most LLMs still perform poorly
                over very long contexts.<Ref n={1} /> LangChain's older memory classes stored state
                only in process memory — restart the Python process and all conversation history is
                lost. As of LangChain v0.3.1, these classes are deprecated, replaced by LangMem and
                LangGraph checkpointers.<Ref n={2} /> LangMem, LangChain's dedicated long-term
                memory layer, does not enforce any particular storage type and relies on a vector
                database or key-value store backend configured as tools passed to the agent — not as
                structural substrate.<Ref n={3} /> Third-party benchmarks have measured LangMem's
                p95 retrieval latency at nearly 60 seconds under load.
              </p>
              <p>
                But the performance numbers are a symptom, not the disease. The deeper architectural
                issue is this: even with persistent checkpointers, the LLM in a LangGraph pipeline
                is forced to act as the central processing unit and working memory simultaneously.
                Every reasoning step requires the model to reconstruct context from whatever has been
                serialized into its input. State is not an independent artifact the agent reads from
                — it is a property of the pipeline that must be re-injected into the model on every
                call.
              </p>
              <p>
                This means the agent has no cognitive home that survives model version changes,
                framework upgrades, or architectural refactoring. In LangGraph, if the checkpointer
                fails, state is lost. If the context window overflows, older state is truncated
                without signal. If the developer refactors the pipeline, state schema compatibility
                must be manually maintained. The agent and its state are inseparable from the
                pipeline that produces them — which means the agent has no independent existence
                at all.
              </p>

              <h3 className="mf-subsection-title">4.2 CrewAI: Role Specialization Without Structural State</h3>
              <p>
                CrewAI represents the most thoughtful current attempt at multi-agent architecture
                within the wrapper paradigm. Its role-based design assigns distinct responsibilities
                to agents with support for hierarchical modes — a manager agent supervising and
                delegating to subordinates — and distributed modes with bidirectional communication
                and shared memory.<Ref n={4} /> The introduction of Flows added deterministic
                orchestration on top of the probabilistic agent layer, and CrewAI Enterprise added
                hallucination guardrails capable of reacting to certain conditions at runtime.<Ref n={5} />
              </p>
              <p>
                This is genuinely more sophisticated than a single-agent prompt pipeline. But it does
                not escape the paradigm.
              </p>
              <p>
                Agents in CrewAI are defined by specialized roles, goals, and backstories encoded in
                YAML configuration files — described in CrewAI's own documentation as "specialized
                AI personas" whose properties "shape how they approach tasks."<Ref n={6} /> Role
                identity in CrewAI is a configuration file that gets injected into a system prompt.
                It is not structurally enforced at runtime. An agent's role can be contradicted by
                sufficiently strong input context, overridden by a manager agent's delegated
                instructions, or diluted across a long task execution.
              </p>
              <p>
                Flows orchestrate task order, conditional branching, retries, and feedback loops,
                with each agent receiving context from previous steps and the orchestrator
                maintaining core control.<Ref n={7} /> But "each agent gets context from previous
                steps" is the wrapper pattern under a different name. State is passed as context,
                not held as substrate. When the task ends, that state is gone unless explicitly
                serialized by the developer. The manager agent that supervised the run has no
                persistent representation of what worked and what did not that carries into the
                next run.
              </p>
              <p>
                CrewAI focuses on role-based multi-agent collaboration while explicitly offering
                less flexibility for complex agentic architecture.<Ref n={8} /> That trade-off is
                honest. But it understates the structural limitation: specialization without
                persistent state is parallelized forgetfulness. Each run begins from the same blank
                substrate. The crew learns nothing.
              </p>

              <h3 className="mf-subsection-title">4.3 OpenClaw: The Tool Array as a False Architecture</h3>
              <p>
                OpenClaw is perhaps the most instructive case study because its appeal is viscerally
                compelling: a local AI agent with access to a massive, extensible tool array —
                files, shell, calendar, web, messaging — that genuinely does things rather than just
                outputting text. Its rapid adoption (nearly 200,000 GitHub stars within months of
                release) reflects how clearly it demonstrates what people actually want from an AI
                agent.
              </p>
              <p>
                OpenClaw's architectural logic is not complicated: the LLM handles intelligent
                decision-making, and conversation history along with tool execution are kept locally
                by the user.<Ref n={9} /> Its extensibility comes from ClawHub, a community registry
                of skills that extend the agent's capabilities. Installing a skill is effectively
                running unreviewed third-party code with the same permissions as the agent
                itself.<Ref n={10} />
              </p>
              <p>
                The security consequences of building governance on top of this pattern rather than
                into the foundation should not be overlooked. In February 2026, an attacker exploited
                the way an OpenClaw-powered coding agent processed instructions and used prompt
                injection to install software on users' systems — not through complex malware, but
                through text that the model treated as valid instructions, ultimately affecting
                approximately 4,000 developers.<Ref n={11} /> A security audit of ClawHub found
                that roughly 12% of available skills were malicious, containing data exfiltration
                code, prompt injection payloads, and other threats, with 8 vulnerabilities rated
                critical.<Ref n={12} />
              </p>
              <p>
                The source of these vulnerabilities is not poor implementation. It is the
                architecture — and it represents a violation of two foundational security principles.
              </p>
              <p>
                First, the Principle of Least Privilege. OpenClaw's agent operates with shell access,
                file system permissions, and network capability simultaneously, governed only by
                LLM-level behavioral instructions. There is no structural mechanism to scope
                permissions to the task at hand. Every action the agent could ever take is available
                on every call, because the governance layer is inside the reasoning engine, not
                above it.
              </p>
              <p>
                Second, the absence of data/instruction separation. This vulnerability class is not
                new. It is structurally reminiscent of early Von Neumann architecture exploits —
                buffer overflows, code injection — that arose from storing executable instructions
                and raw data in the same address space with no hardware-enforced boundary between
                them. The fix for those vulnerabilities was not smarter parsing. It was architectural
                separation: execute bits, memory protection, privilege rings. Prompt wrappers
                recreate the pre-separation architecture in a new domain. Large language models treat
                everything in context as equivalent tokens — system prompts, user input, retrieved
                documents, injected tool results all become the same stream.<Ref n={13} /> The
                "security firewall" is inside the probabilistic parsing engine itself. That is not
                a security architecture. It is mathematically stupid.
              </p>
              <p>
                No LLM vendor has solved prompt injection at the model level.<Ref n={14} /> The
                solution is not a better model. It is enforcing the trust boundary at the
                architecture level, before the model ever sees the input or before the model can
                act on the input.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mf-section">
            <div className="mf-section-label">5. Eyro: A Case Study in the Substrate-First Alternative</div>
            <div className="mf-prose">
              <p>
                Eyro is an AI agent operating system in active development. Its architecture was not
                designed in reaction to the failure modes above — it was designed from the beginning
                with different assumptions about where agent properties should live. The result
                illustrates concretely what the alternative looks like and why the architectural
                decisions matter.
              </p>

              <h3 className="mf-subsection-title">5.1 The Persistent Cognitive Substrate: The LLM as Stateless Execution Unit</h3>
              <p>
                The central architectural decision in Eyro is the Persistent Cognitive Substrate
                (PCS) — a durable, structured state layer that serves as the canonical source of
                truth for everything the agent system knows, has recorded, and has been authorized
                to act on.
              </p>
              <p>
                The PCS is not a context window. It is not a vector store. It is not a
                session-scoped checkpoint. It is the agent's persistent home — a governed data
                structure that exists outside any individual model call and survives sessions, model
                version changes, and operational contexts.
              </p>
              <p>
                This resolves context amnesia structurally. But the more important consequence is
                what it does to the LLM's role in the system:
              </p>
            </div>
            <pre className="mf-code-block">{`Wrapper Architecture:
  LLM = CPU + Working Memory + State Store + Governance Engine
        [All responsibilities collapsed into one probabilistic unit]

Eyro Architecture:
  LLM = Stateless Execution Unit with strictly defined I/O boundaries
  PCS = Persistent state, knowledge, and agent identity
  Governance Layer = Structural enforcement outside the model
        [Responsibilities separated by architectural boundary]`}</pre>
            <div className="mf-prose">
              <p>
                In Eyro, the LLM receives a bounded input, performs a reasoning step, and returns a
                structured output. It does not hold state between calls. It does not manage its own
                memory. It does not enforce its own behavioral constraints. These responsibilities
                belong to components with the structural properties required to fulfill them:
                persistence, addressability, and enforcement semantics that do not depend on model
                behavior.
              </p>
              <p>
                This makes a clear distinction between "state holding itself" and "state being passed
                as context". An agent that returns after a week does not reconstruct itself from
                injected history — it reads from a substrate that was never lost. State is an
                independent artifact with its own integrity guarantees and versioning, not a side
                effect of the pipeline that produces it.
              </p>

              <h3 className="mf-subsection-title">5.2 Foundry Query: Deterministic Capability Lookup Over Context Bloat</h3>
              <p>
                RAG is a genuine advance. The architectural intuition behind it — that agents should
                not need to hold everything in working memory — is correct. The implementation,
                however, still produces a familiar failure mode: over-injection of retrieved content
                fills context with noise, or under-injection leaves the agent without what it needs.
                In both cases, the agent is at the mercy of a retrieval system that operates on
                semantic similarity rather than structured access.
              </p>
              <p>
                Eyro's Foundry Query system was designed around a different analogy: a search engine
                rather than a document retriever.
              </p>
            </div>
            <pre className="mf-code-block">{`Traditional RAG:
  Query → Semantic vector search → Raw chunk retrieval →
  Inject chunks into context → Model reasons over noisy context

Foundry Query:
  Query → Deterministic schema registry lookup →
  Typed capability pointer or structured data reference returned →
  Agent invokes specific resource on demand`}</pre>
            <div className="mf-prose">
              <p>
                Foundry Query uses a deterministic, strictly typed schema registry for capability
                and knowledge lookup. When an agent needs to perform an action, it queries the
                registry and receives an exact API schema or targeted data pointer — not raw vector
                chunks. The agent knows what tools are available and precisely how to invoke them,
                without having to ingest the entire knowledge base to find out.
              </p>
              <p>
                The practical consequence is constraint on context injection by design. An agent
                asked to schedule a task does not need the entire system state in its context window.
                It needs to know that a scheduling interface exists, what its parameters are, and
                how to call it. Foundry Query provides exactly that and nothing more. The agent
                knows where to look, and will reason its way through when and how far to look.
                Imagine every Google search you ever made showing your name, your operator's name,
                your address, your job, your car, etc. when all you asked was for the closest
                wing spot.
              </p>

              <h3 className="mf-subsection-title">5.3 The Tutor: External Evaluation, Not Self-Reflection</h3>
              <p>
                Reflection loops in current frameworks share a structural property: they ask the
                same reasoning system that produced an output to evaluate that output. The model
                critiques itself from within the context that shaped the original response — bounded
                by the same priors, the same blind spots, and the inherent circularity of the
                process. This is structurally inconsistent in the same way a narcissist cannot be
                trusted to diagnose their own narcissism. The diagnostic criteria must be interpreted
                by the very ego being evaluated.
              </p>
              <p>
                Eyro's Tutor is architecturally distinct. It operates entirely outside the agent's
                operational context — a background evaluation process that reviews agent outputs
                against expected performance parameters, generates structured learning artifacts,
                and surfaces them for review before any updates are promoted into the system's
                knowledge base.
              </p>
              <p>
                The agent does not teach itself. The agent does not participate in its own
                evaluation. The Tutor is not a tool the agent can invoke or a persona that can be
                overridden by sufficiently strong input context. It is a separate system with a
                separate operational existence, and the path from Tutor evaluation to Foundry update
                is a governed process — what the system learns is an explicit decision, not a side
                effect of operation.
              </p>
              <p>
                This distinction matters for the same reason external code review matters more than
                self-review: evaluator independence from the evaluated process is the mechanism that
                makes feedback trustworthy. A reflection loop that shares context with the agent it
                reflects on is not independent. It is the same lens examining itself.
              </p>

              <h3 className="mf-subsection-title">5.4 Freedom Levels, Risk Monitoring, and Autonomous Mode: Governance as Structure</h3>
              <p>
                Every production agent framework has some form of behavioral constraints. CrewAI has
                hallucination guardrails. OpenClaw has system prompt instructions about what the
                agent should and should not do. LangGraph supports conditional routing that can block
                certain execution paths. The commonality is that these constraints are advisory —
                only implemented as instructions the model is expected to follow, with no structural
                mechanism preventing non-compliance.
              </p>
              <p>
                Eyro implements behavioral governance through freedom levels — a four-tier constraint
                architecture (levels 0–3) where each level determines what actions an agent may take
                without explicit authorization, escalation, or human review. The critical difference
                from advisory constraints is structural enforcement: when operating at freedom level
                0 no action can be taken regardless of what the model's output says. The governance
                layer evaluates the requested action before execution. It does not ask the model to
                comply — it controls the execution surface the model has access to.
              </p>
              <p>
                This is paired with a risk monitoring layer that evaluates behavioral drift against
                expected parameters at the system level — not by asking the agent to govern itself
                better, but by observing operational output against defined boundaries. Escalation
                or halting when parameters are exceeded is handled structurally. Every tool is given
                a risk level and the risks are mapped to freedom levels that allow them. An agent
                will not be able to execute a tool that requires freedom level 3 if they are in
                freedom level 1.
              </p>
              <p>
                Autonomous mode represents the final gate of this progression: at every freedom
                level, the agent can initiate and execute sequences of actions that fit the allowed
                risk, made trustworthy precisely because the governance architecture underneath it
                provides verifiable behavioral bounds.
              </p>
              <p>
                Rather than a linear extension of the agent's freedom levels, Autonomous Mode
                operates as an orthogonal, fail-safe layer. It functions essentially as a protective
                envelope around an existing protective layer. For example, even when an agent is
                granted max-tier execution rights (Freedom Level 3), turning Autonomous Mode off
                forces a hard state interception: the underlying governance engine will actively
                block high-risk actions, requiring manual validation and authorization before the
                state transition can commit. Which means no random purchases or crypto trades at
                3am unless you leave the gate open.
              </p>
              <p>
                This is what enforcement above the model level actually looks like. The trust
                boundary is not inside the probabilistic parsing engine. It is in the layer that
                decides what the engine is ever allowed to touch.
              </p>

              <h3 className="mf-subsection-title">5.5 Breath and the PCS Heartbeat: Proactive and Reactive as First-Class Modes</h3>
              <p>
                Most agent systems are fundamentally reactive. They wait for input, process it, and
                return output. The appearance of proactivity — scheduled tasks, triggered automations
                — is generally implemented externally: cron jobs or webhook handlers that inject new
                inputs to restart the reactive cycle. The agent itself has no native concept of
                autonomous initiation.
              </p>
              <p>
                Eyro distinguishes between two operational modes at the architectural level. For
                engineers, the analogy:
              </p>
            </div>
            <pre className="mf-code-block">{`PCS Heartbeat  →  Interrupt Handler
  Responds to incoming signals, user input, and state changes
  with governed, contextually appropriate action.
  Optimized for low-latency, synchronous/asynchronous response.
  Analogous to hardware or network interrupt handling in a kernel —
  the system reacts to an external event with a defined handler.

Breath  →  Kernel Daemon / Cron Scheduler
  Initiates agent behavior based on internal state delta evaluations,
  scheduled triggers, or environmental conditions —
  independent of external input.
  Analogous to a native kernel daemon executing lifecycle loops:
  it does not wait to be called; it evaluates internal state
  and acts when conditions are met.`}</pre>
            <div className="mf-prose">
              <p>
                The distinction is not merely conceptual. The two modes have different operational
                profiles, different governance requirements, and different relationships to the PCS
                state that informs them. The heartbeat is the agent responding. Breath is the agent
                acting.
              </p>
              <p>
                An agent that can only respond is a sophisticated tool. An agent that can initiate
                from internal state is something closer to an autonomous actor. Eyro treats both
                modes as first-class architectural concerns, not engineering afterthoughts layered
                on top of a reactive core.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mf-section">
            <div className="mf-section-label">6. The Standard Must Change</div>
            <div className="mf-prose">
              <p>
                The natural objection is widespread: wrapper-based systems work for many
                applications, they are easier and faster to build, and they have demonstrated clear
                product-market fit. Why demand a higher standard?
              </p>
              <p>
                The answer is that "works for many applications" and "capable of serving as the
                substrate for genuine autonomous agency" are different claims. Wrapper-based systems
                are somewhat acceptable for bounded, well-supervised, largely stateless tasks. They
                are not appropriate as the foundation for agents operating with meaningful autonomy
                in consequential environments — and the field's current trajectory is toward exactly
                those deployments. Enterprise AI agent adoption is projected to grow from roughly
                11% to 40% through late 2026.<Ref n={15} /> The architectural debt being accumulated
                now will be paid at scale.
              </p>
              <p>
                The security incidents already on record are instructive. The Clinejection attack —
                prompt injection causing real-world supply chain compromise affecting thousands of
                developers — was not a failure of model intelligence or prompt engineering skill. It
                was a predictable consequence of building an autonomous system on a contextual
                foundation where the trust boundary between instructions and data is enforced
                probabilistically by the language model itself. That is an architectural problem.
                Architectural problems do not yield to prompt improvements or more careful guardrail
                wording.
              </p>
              <p>
                There is also an honesty problem in how current frameworks are described. A role
                defined in YAML and injected as a system prompt is not a structurally enforced
                identity. A reflection loop within the same context that produced the original output
                is not independent evaluation. A guardrail expressed as a prompt instruction is not
                a behavioral guarantee. Calling these things by names that imply structural
                properties they do not have sets expectations the systems cannot meet and obscures
                the design work that actually needs to happen.
              </p>
              <p>
                Eyro is one attempt to do that design work differently. It is incomplete. There are
                open engineering questions, trade-offs not yet fully resolved, and components in
                active development. The argument here is not that Eyro is finished — it is that the
                architectural skeleton is correct, that the problems it addresses are real and
                unsolved by current frameworks, and that the field needs more systems designed with
                these requirements as starting assumptions rather than retrofit additions.
              </p>
              <p>
                The gap between what the current standard produces and what genuine autonomous agency
                requires will not close through incremental improvement of the wrapper pattern. It
                requires building differently, from the substrate up.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mf-section">
            <div className="mf-section-label">7. Conclusion</div>
            <div className="mf-prose">
              <p>
                Prompt-style agent wrappers have served the AI field well as an acceleration layer.
                They will continue to serve well in the bounded, supervised contexts they are suited
                for. What they cannot do — and what the field increasingly needs — is serve as the
                foundation for agents capable of genuine autonomy, reliable identity, structural
                learning, and verifiable governance.
              </p>
              <p>
                The failure modes are not engineering challenges within the paradigm. They are
                properties of the paradigm. Context window amnesia, identity drift under adversarial
                conditions, self-referential evaluation loops that cannot escape their own priors,
                governance imposed through text instructions to a model that treats all text as
                equivalent, reactive-only operational profiles — these follow directly from the
                architecture. They are as predictable as buffer overflows on a system with no
                memory protection.
              </p>
              <p>
                The alternative, illustrated through Eyro's design decisions, is a substrate-first
                approach that treats persistent state, execution/learning separation, external
                evaluation, structural governance, and proactive agency as first-class architectural
                requirements. This approach is harder to build. It requires upfront investment in
                structural decisions that wrapper frameworks defer or avoid. It does not yet have
                the ecosystem, the tooling, or the deployment track record of the incumbent
                frameworks.
              </p>
              <p>
                What it has is the correct foundation. And the field needs to be honest about
                whether the current standard is sufficient for the systems it is trying to build.
              </p>
              <p>
                Further information on Eyro's architecture and development is available at{' '}
                <a href="https://eyro.io/" className="mf-inline-link">eyro.io</a>.
              </p>
            </div>
          </section>

          {/* Author note */}
          <div className="mf-author-note">
            <p>
              Omni-Ouro own the rights and IP of Eyro, an AI agent operating system in active
              development. This paper reflects independent research. The author acknowledges that
              Eyro is a work in progress — the argument is not that one implementation is complete,
              but that the direction is correct and the current standard needs to change.
            </p>
          </div>

          {/* References */}
          <section className="mf-section mf-references">
            <div className="mf-section-label">References</div>
            <ol className="mf-footnotes">
              <li id="fn-1">LangChain Documentation. "Memory Overview." docs.langchain.com/oss/python/concepts/memory. Accessed June 2026.{' '}<a href="#ref-1" className="mf-fn-back">↩</a></li>
              <li id="fn-2">Atlan. "Long-Term Memory LangChain Agents: LangGraph and LangMem Guide." atlan.com. April 2026.{' '}<a href="#ref-2" className="mf-fn-back">↩</a></li>
              <li id="fn-3">DigitalOcean. "LangMem SDK for Agent Long-Term Memory." digitalocean.com. February 2026.{' '}<a href="#ref-3" className="mf-fn-back">↩</a></li>
              <li id="fn-4">EmergentMind. "CrewAI: Multi-Agent AI Systems." emergentmind.com. August 2025.{' '}<a href="#ref-4" className="mf-fn-back">↩</a></li>
              <li id="fn-5">CrewAI Blog. "How to Build Agentic Systems: The Missing Architecture for Production AI Agents." crewai.com. December 2025.{' '}<a href="#ref-5" className="mf-fn-back">↩</a></li>
              <li id="fn-6">Firecrawl. "Building Multi-Agent Systems with CrewAI — A Comprehensive Tutorial." firecrawl.dev. May 2025.{' '}<a href="#ref-6" className="mf-fn-back">↩</a></li>
              <li id="fn-7">Ghosh, J. "Mastering CrewAI Flows: Building Hierarchical Multi-Agent Systems." Medium. August 2025.{' '}<a href="#ref-7" className="mf-fn-back">↩</a></li>
              <li id="fn-8">Towards Data Science. "How to Build Your Own Agentic AI System Using CrewAI." towardsdatascience.com. November 2025.{' '}<a href="#ref-8" className="mf-fn-back">↩</a></li>
              <li id="fn-9">36Kr English. "Claude's 'Shrimpification': Can't Kill OpenClaw but Sets a Ceiling for It." eu.36kr.com. March 2026.{' '}<a href="#ref-9" className="mf-fn-back">↩</a></li>
              <li id="fn-10">Immersive Labs. "Why You Should Uninstall OpenClaw AI Immediately: A Security Warning." immersivelabs.com. March 2026.{' '}<a href="#ref-10" className="mf-fn-back">↩</a></li>
              <li id="fn-11">Data Science Dojo. "Prompt Injection & Claude Computer Use: 2026 Guide." datasciencedojo.com. March 2026.{' '}<a href="#ref-11" className="mf-fn-back">↩</a></li>
              <li id="fn-12">ClaudeFast. "OpenClaw vs Claude Code: Which Should You Use? (2026)." claudefa.st. June 2026.{' '}<a href="#ref-12" className="mf-fn-back">↩</a></li>
              <li id="fn-13">centminmod. "explain-openclaw: Prompt Injection Attacks." GitHub. March 2026.{' '}<a href="#ref-13" className="mf-fn-back">↩</a></li>
              <li id="fn-14">centminmod. "explain-openclaw: Prompt Injection Attacks." GitHub. March 2026.{' '}<a href="#ref-14" className="mf-fn-back">↩</a></li>
              <li id="fn-15">Skywork AI / Gartner via Presidio. "The Definitive Guide to the OpenClaw System Prompt: Architecture, Products, and Future Trends." skywork.ai. March 2026.{' '}<a href="#ref-15" className="mf-fn-back">↩</a></li>
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
            <div className="mf-logo-mark mf-logo-mark-sm">I</div>
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
