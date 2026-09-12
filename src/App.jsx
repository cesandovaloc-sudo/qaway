import AppRouter from './router/AppRouter'
import RouteSeo from './components/seo/RouteSeo'
import { CampaignProvider } from './services/campaign/campaignContext'

import CookieBanner from './components/ui/CookieBanner'
import MetaPixel from '@/components/analytics/MetaPixel'

export default function App() {
  return (
    <CampaignProvider>
      <MetaPixel />
      <RouteSeo />
      <AppRouter />
      <CookieBanner />
    </CampaignProvider>
  )
}
