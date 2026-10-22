import { PreorderPage } from './components/preorder/PreorderPage'
import { PreorderSuccess } from './components/preorder/PreorderSuccess'
import { GiveawayRules } from './components/preorder/GiveawayRules'
import { PrivacyPolicy } from './components/preorder/PrivacyPolicy'
import { IntegrationPage, IntegrationsIndex } from './components/preorder/IntegrationPages'
import './index.css'

// eyro.io's public pages. The Eyro App is a separate static app in
// public/app/, served at /app/ (see vercel.json), not part of this bundle.
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/preorder/success') return <PreorderSuccess />
  if (path === '/giveaway') return <GiveawayRules />
  if (path === '/privacy') return <PrivacyPolicy />
  if (path === '/integrations') return <IntegrationsIndex />
  if (path.startsWith('/integrations/')) return <IntegrationPage slug={path.slice('/integrations/'.length)} />
  return <PreorderPage />
}
