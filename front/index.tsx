import './index.css'
import './header_v2.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

// Main App with React Router
const App = () => <RouterProvider router={router} />

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}
