import AppRouter from './router/AppRouter'
import RouteSeo from './components/seo/RouteSeo'
import { CampaignProvider } from './services/campaign/campaignContext'

import CookieBanner from './components/ui/CookieBanner'

export default function App() {
  return (
    <CampaignProvider>
      <RouteSeo />
      <AppRouter />
      <CookieBanner />
    </CampaignProvider>
  )
}
