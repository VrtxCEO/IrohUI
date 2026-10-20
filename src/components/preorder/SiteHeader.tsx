import { useEffect, useRef, useState } from 'react'
import logoSrc from '../../assets/omni-ouro-logo.png'
import { MANIFESTO_URL, RESERVE_URL } from '../../lib/preorder'
import { KIND_LABEL, findIntegrations } from '../../lib/integrations'
import type { Integration } from '../../lib/integrations'
import { trackCheckout } from '../../lib/pixel'

/** The header on eyro.io's public pages. On the landing page its section
 *  links are in-page anchors; elsewhere they lead back to it. */
export function SiteHeader({ onLanding = false }: { onLanding?: boolean }) {
  const home = onLanding ? '' : '/'

  // Every Reserve button on the page, with or without the promotion code, is
  // a link to the Payment Link; one listener counts them all.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element).closest?.('a')
      if (link?.href.startsWith(RESERVE_URL)) trackCheckout()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <header className="po-head">
      <a className="po-brand" href="/"><img src={logoSrc} alt="" /><strong>EYRO</strong></a>
      <div className="po-head-right">
        <nav className="po-nav" aria-label="Site">
          <a href={`${home}#how`}>How it works</a>
          <a href={`${home}#giveaway`}>Giveaway</a>
          <IntegrationsMenu />
          <a href={`${home}#faq`}>FAQ</a>
          <a href={MANIFESTO_URL}>Manifesto</a>
        </nav>
        <a className="po-btn po-btn-sm" href={RESERVE_URL}>Reserve</a>
      </div>
    </header>
  )
}

export function IntegrationLogo({ item, size = 32 }: { item: Integration; size?: number }) {
  return item.logo
    ? <img className="po-int-logo" src={item.logo} alt="" width={size} height={size} />
    : <span className="po-int-logo po-int-mono" style={{ width: size, height: size, fontSize: size * 0.45 }} aria-hidden="true">{item.name[0]}</span>
}

/** "Integrations & Adapters": hovering opens a searchable list; clicking the
 *  label goes to /integrations, which is also how touch screens get there. */
function IntegrationsMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const closeTimer = useRef<number | undefined>(undefined)
  const root = useRef<HTMLDivElement>(null)
  const items = findIntegrations(query)

  const show = () => { window.clearTimeout(closeTimer.current); setOpen(true) }
  // A short delay, so crossing the gap between the label and the panel doesn't close it.
  const hide = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 150) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div
      ref={root}
      className="po-int"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') show() }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') hide() }}
      onFocus={show}
      onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) hide() }}
    >
      <a href="/integrations" aria-haspopup="true" aria-expanded={open} className={open ? 'on' : undefined}>
        Integrations &amp; Adapters
      </a>
      {open && (
        <div className="po-int-panel" role="menu">
          <input
            className="po-int-search"
            type="search"
            placeholder="Search integrations"
            aria-label="Search integrations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="po-int-list">
            {items.map((i) => (
              <a key={i.slug} className="po-int-item" role="menuitem" href={`/integrations/${i.slug}`}>
                <IntegrationLogo item={i} />
                <span className="po-int-text">
                  <strong>{i.name}</strong>
                  <small>{i.tagline}</small>
                </span>
                <span className="po-int-kind">{KIND_LABEL[i.kind]}</span>
              </a>
            ))}
            {!items.length && <p className="po-int-empty">Nothing matches “{query}”.</p>}
          </div>
          <a className="po-int-all" href="/integrations">All integrations →</a>
        </div>
      )}
    </div>
  )
}
