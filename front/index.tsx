import './index.css'
import './header_v2.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'

const App = () => (
  <QueryProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryProvider>
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
