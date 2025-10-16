import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegistrationPage from '@/pages/RegistrationPage'
import LoginPage from '@/pages/admin/LoginPage'
import AdminIndex from '@/pages/admin'
import LabelPage from '@/features/admin/LabelPage'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <RegistrationPage /> },
  { path: '/admin/login', element: <LoginPage /> },
  { path: '/admin', element: <AdminIndex /> },
  { path: '/admin/label/:id', element: <LabelPage /> }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
