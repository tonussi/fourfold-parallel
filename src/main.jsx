import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SearchPage from './pages/SearchPage.jsx'
import StoreProvider from './store/StoreProvider'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)