import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PreferencesProvider } from '@/lib/preferences'
import { AuthProvider } from '@/lib/auth'
import { ScrollToTop } from '@/lib/ScrollToTop'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Home } from '@/pages/Home'
import { DownloadCenter } from '@/features/download/DownloadCenter'
import { FileDetail } from '@/features/file/FileDetail'
import { Library } from '@/features/library/Library'
import { Departments } from '@/features/pages/Departments'
import { About } from '@/features/pages/About'
import { Agency } from '@/features/pages/Agency'
import { Placeholder } from '@/pages/Placeholder'

// Owner-only + auth routes are code-split to shrink the guest bundle.
const Login = lazy(() => import('@/features/auth/Login').then((m) => ({ default: m.Login })))
const Signup = lazy(() => import('@/features/auth/Signup').then((m) => ({ default: m.Signup })))
const Reset = lazy(() => import('@/features/auth/Reset').then((m) => ({ default: m.Reset })))
const Admin = lazy(() => import('@/features/admin/Admin').then((m) => ({ default: m.Admin })))

function AppLayout() {
  return (
    <div className="min-h-svh flex flex-col bg-app">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  const { t } = useTranslation()
  return (
    <PreferencesProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-svh bg-app" />}>
          <Routes>
            {/* full-screen auth (own branding — no app header/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/admin" element={<Admin />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/download" element={<DownloadCenter />} />
              <Route path="/library" element={<Library />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/about" element={<About />} />
              <Route path="/agency" element={<Agency />} />
              <Route path="/file/:id" element={<FileDetail />} />
              <Route
                path="*"
                element={<Placeholder title={t('notFound.title')} icon="sparkles" note={t('notFound.note')} />}
              />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </PreferencesProvider>
  )
}
