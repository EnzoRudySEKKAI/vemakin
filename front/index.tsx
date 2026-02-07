import './index.css'
import './header_v2.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { QueryProvider } from './providers/QueryProvider'

// Main App with React Router and Query Provider
const App = () => (
  <QueryProvider>
    <RouterProvider router={router} />
  </QueryProvider>
)

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
