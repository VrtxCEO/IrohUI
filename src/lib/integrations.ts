/**
 * integrations.ts — what Eyro connects to, for the "Integrations & Adapters"
 * menu and the /integrations pages.
 *
 * omni-ouro.com shows the same menu from its own copy of this list
 * (OmniOuroWebsite/integrations.js) and links here, so add a new entry to both.
 *
 * kind: 'built-in' comes set up in Eyro; 'adapter' is a bridged app connected
 * through an Eyro adapter. logo: an import from src/assets/integrations
 * (taken from the company's own site icon), or leave it out
 * for a letter tile. demo: a video URL once it's recorded.
 */
import agentmailLogo from '../assets/integrations/agentmail.png'
import agentlineLogo from '../assets/integrations/agentline.png'

export interface Integration {
  slug: string
  name: string
  site: string
  kind: 'built-in' | 'adapter'
  tagline: string
  about: string
  withEyro: string[]
  logo?: string
  demo?: string
}

/** How Eyro governs any integration: shown on each page, and the index's intro. */
export const GOVERNED =
  'Every capability in Eyro is governed by your personal configuration. Your agent can be as free or as constrained as you allow.'

export const INTEGRATIONS: Integration[] = [
  {
    slug: 'agentmail',
    name: 'AgentMail',
    site: 'https://www.agentmail.to/',
    kind: 'built-in',
    logo: agentmailLogo,
    tagline: 'Email inboxes for AI agents',
    about:
      'AgentMail gives AI agents their own email inboxes, to send, receive and organise mail with threading and a searchable history.',
    withEyro: [
      'AgentMail comes set up in Eyro, so your agent has its own inbox from the start.',
      GOVERNED,
      'Every message sent goes on the record.',
    ],
  },
  {
    slug: 'agentline',
    name: 'AgentLine',
    site: 'https://agentline.cloud/',
    kind: 'built-in',
    logo: agentlineLogo,
    tagline: 'Phone numbers for AI agents',
    about:
      'AgentLine gives AI agents real US and Canada phone numbers to make and receive calls, with transcripts and two-way SMS.',
    withEyro: [
      'AgentLine comes set up in Eyro, so your agent can call and text from its own number.',
      GOVERNED,
      'Every call and message goes on the record.',
    ],
  },
]

export const KIND_LABEL: Record<Integration['kind'], string> = {
  'built-in': 'Built in',
  adapter: 'Adapter',
}

export function findIntegrations(query: string): Integration[] {
  const q = query.trim().toLowerCase()
  if (!q) return INTEGRATIONS
  return INTEGRATIONS.filter((i) =>
    [i.name, i.tagline, KIND_LABEL[i.kind]].some((s) => s.toLowerCase().includes(q)),
  )
}
