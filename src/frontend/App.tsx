import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { AppShell } from './components/AppShell';
import { Spinner } from './components/ui';
import { Login } from './pages/Login';

// Route-level code splitting: each page is its own chunk, so heavy deps
// (e.g. Recharts) only load on the pages that use them.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Vendors = lazy(() => import('./pages/Vendors').then((m) => ({ default: m.Vendors })));
const VendorPage = lazy(() => import('./pages/VendorPage').then((m) => ({ default: m.VendorPage })));
const Board = lazy(() => import('./pages/Board').then((m) => ({ default: m.Board })));
const Approvals = lazy(() => import('./pages/Approvals').then((m) => ({ default: m.Approvals })));
const Honours = lazy(() => import('./pages/Honours').then((m) => ({ default: m.Honours })));
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));
const Support = lazy(() => import('./pages/Support').then((m) => ({ default: m.Support })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Activity = lazy(() => import('./pages/Activity').then((m) => ({ default: m.Activity })));

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/:slug" element={<VendorPage />} />
          <Route path="/board" element={<Board />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/honours" element={<Honours />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
