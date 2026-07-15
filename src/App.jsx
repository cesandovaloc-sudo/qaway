import AppRouter from './router/AppRouter'
import RouteSeo from './components/seo/RouteSeo'
import { CampaignProvider } from './services/campaign/campaignContext'

export default function App() {
  return (
    <CampaignProvider>
      <RouteSeo />
      <AppRouter />
    </CampaignProvider>
  )
}
