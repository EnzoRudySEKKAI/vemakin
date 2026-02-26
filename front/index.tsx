import './index.css'
import './header_v2.css'
import React, { useEffect, startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ErrorBoundary } from './providers/ErrorBoundary'
import { initPerformanceTracking } from './utils/performance'

// Dynamically inject preconnect for API endpoint
const injectApiPreconnect = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl) {
    try {
      const url = new URL(apiUrl)
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = `${url.protocol}//${url.hostname}`
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
      
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = `${url.protocol}//${url.hostname}`
      document.head.appendChild(dnsPrefetch)
    } catch {
      // Invalid URL, skip injection
    }
  }
}

import { FullPageLoader } from './components/ui/FullPageLoader'

const HydrateFallback = () => <FullPageLoader />

const AppContent = () => {
  useEffect(() => {
    injectApiPreconnect()
    
    // Initialize performance tracking for INP monitoring
    // Use startTransition to avoid blocking initial render
    startTransition(() => {
      initPerformanceTracking()
    })
  }, [])

  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} hydrateFallbackElement={<HydrateFallback />} />
      </AuthProvider>
    </QueryProvider>
  )
}

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
)

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}

window.addEventListener('app-ready', () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.classList.add('loaded')
    setTimeout(() => loader.remove(), 400)
  }
})