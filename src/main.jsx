import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n'
import App from '@src/App.jsx'
import SearchPage from '@src/pages/SearchPage.jsx'
import LoginPage from '@src/pages/Auth/LoginPage'
import StoreProvider from '@src/store/StoreProvider'
import { ThemeProvider } from '@src/contexts/ThemeContext'
import { AuthProvider } from '@src/contexts/AuthContext'
import Layout from '@src/components/Layout'
import ProtectedRoute from '@src/components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <StoreProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Private Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <App />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SearchPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
