import './index.css'
import './header_v2.css'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ErrorBoundary } from './providers/ErrorBoundary'

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

const HydrateFallback = () => (
  <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#0F1116] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

const AppContent = () => {
  useEffect(() => {
    injectApiPreconnect()
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
  
  // Delay removing initial loader until React has had a chance to paint
  setTimeout(() => {
    requestAnimationFrame(() => {
      const loader = document.getElementById('initial-loader')
      if (loader) {
        loader.classList.add('loaded')
        setTimeout(() => loader.remove(), 400)
      }
    })
  }, 100)
}