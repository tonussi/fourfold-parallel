import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n'
import App from '@src/App.jsx'
import SearchPage from '@src/pages/SearchPage.jsx'
import StoreProvider from '@src/store/StoreProvider'
import { ThemeProvider } from '@src/contexts/ThemeContext'
import { AuthProvider } from '@src/contexts/AuthContext'
import Layout from '@src/components/Layout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <StoreProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </StoreProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
)
