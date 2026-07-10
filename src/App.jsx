import AppRouter from './router/AppRouter'
import { CampaignProvider } from './services/campaign/campaignContext'

export default function App() {
  return (
    <CampaignProvider>
      <AppRouter />
    </CampaignProvider>
  )
}