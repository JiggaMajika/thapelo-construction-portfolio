import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { AppShell } from './components/AppShell';
import { Spinner } from './components/ui';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vendors } from './pages/Vendors';
import { VendorPage } from './pages/VendorPage';
import { Board } from './pages/Board';
import { Approvals } from './pages/Approvals';
import { Honours } from './pages/Honours';
import { Reports } from './pages/Reports';
import { Support } from './pages/Support';
import { Settings } from './pages/Settings';
import { Activity } from './pages/Activity';

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
  );
}
