// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegistrationPage from '@/pages/RegistrationPage'
import LoginPage from '@/pages/admin/LoginPage'
import AdminPage from '@/features/admin/AdminPage'
import LabelPage from '@/features/admin/LabelPage'
import './index.css'
import WhoAmI from '@/pages/admin/WhoAmI'   // <-- add
import BoothsPage from '@/pages/admin/BoothsPage'
import CheckinPage from '@/pages/CheckinPage'

const router = createBrowserRouter([
  { path: '/', element: <RegistrationPage /> },
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/admin/label/:id', element: <LabelPage /> },
  { path: '/checkin', element: <CheckinPage /> }, // guarded inside component
  { path: '/admin/booths', element: <BoothsPage /> },  // <-- add
  { path: '/admin/whoami', element: <WhoAmI /> }   // <-- add
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
)
