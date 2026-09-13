import AppRouter from './router/AppRouter'
import RouteSeo from './components/seo/RouteSeo'
import { CampaignProvider } from './services/campaign/campaignContext'

import CookieBanner from './components/ui/CookieBanner'
import MetaPixelRouteTracker from '@/components/analytics/MetaPixelRouteTracker'

export default function App() {
  return (
    <CampaignProvider>
      <MetaPixelRouteTracker />
      <RouteSeo />
      <AppRouter />
      <CookieBanner />
    </CampaignProvider>
  )
}
