import { useState } from 'react'
import { DISCORD_URL, MANIFESTO_URL, RESERVE_PRICE, RESERVE_URL } from '../../lib/preorder'
import { GOVERNED, INTEGRATIONS, KIND_LABEL, findIntegrations } from '../../lib/integrations'
import { IntegrationLogo, SiteHeader } from './SiteHeader'
import './preorder.css'

function Footer() {
  return (
    <footer className="po-foot">
      <span>© {new Date().getFullYear()} <a href="https://omni-ouro.com">Omni-Ouro</a></span>
      <nav>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
        <a href="/integrations">Integrations</a>
        <a href={MANIFESTO_URL}>Manifesto</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </footer>
  )
}

/** /integrations: everything Eyro connects to, searchable. */
export function IntegrationsIndex() {
  const [query, setQuery] = useState('')
  const items = findIntegrations(query)
  return (
    <div className="po">
      <SiteHeader />
      <main className="po-ints">
        <p className="po-kicker">Integrations &amp; Adapters</p>
        <h1>What Eyro connects to</h1>
        <p className="po-lede">
          Some services come built into Eyro. Others connect through adapters. {GOVERNED}
        </p>
        <input
          className="po-int-search po-ints-search"
          type="search"
          placeholder="Search integrations"
          aria-label="Search integrations"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="po-ints-grid">
          {items.map((i) => (
            <a key={i.slug} className="po-ints-card" href={`/integrations/${i.slug}`}>
              <div className="po-ints-card-top">
                <IntegrationLogo item={i} size={40} />
                <span className="po-int-kind">{KIND_LABEL[i.kind]}</span>
              </div>
              <h3>{i.name}</h3>
              <p>{i.tagline}</p>
            </a>
          ))}
        </div>
        {!items.length && <p className="po-int-empty">Nothing matches “{query}”.</p>}
      </main>
      <Footer />
    </div>
  )
}

/** /integrations/<slug>: how Eyro works with one service. */
export function IntegrationPage({ slug }: { slug: string }) {
  const item = INTEGRATIONS.find((i) => i.slug === slug)
  if (!item) return <IntegrationsIndex />
  const host = new URL(item.site).hostname.replace(/^www\./, '')
  return (
    <div className="po">
      <SiteHeader />
      <main className="po-ints">
        <a className="po-ints-back" href="/integrations">← All integrations</a>
        <div className="po-ints-head">
          <IntegrationLogo item={item} size={64} />
          <div>
            <p className="po-kicker">{KIND_LABEL[item.kind]}</p>
            <h1>{item.name}</h1>
          </div>
        </div>
        <p className="po-lede">{item.about}</p>
        <a className="po-ints-site" href={item.site} target="_blank" rel="noreferrer">Visit {host} ↗</a>

        <h2>How it works with Eyro</h2>
        <ul className="po-ints-how">
          {item.withEyro.map((line) => <li key={line}>{line}</li>)}
        </ul>

        <h2>Demo</h2>
        {item.demo ? (
          <video className="po-ints-video" src={item.demo} controls playsInline preload="metadata" />
        ) : (
          <div className="po-ints-soon">A walkthrough of {item.name} running on Eyro is coming soon.</div>
        )}

        <div className="po-cta po-ints-cta">
          <a className="po-btn" href={RESERVE_URL}>Reserve an Eyro Mini for ${RESERVE_PRICE}</a>
          <a className="po-btn po-btn-ghost" href="/integrations">All integrations</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
