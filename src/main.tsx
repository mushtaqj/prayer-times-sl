import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, LocationProvider, PushNotificationProvider } from '@/contexts'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LocationProvider>
          <PushNotificationProvider>
            <App />
          </PushNotificationProvider>
        </LocationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
