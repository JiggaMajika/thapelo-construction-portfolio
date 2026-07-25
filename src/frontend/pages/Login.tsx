import { useState } from 'react';
import { useAuth } from '../lib/auth';

const DEMO_ACCOUNTS = [
  { label: 'GMC Admin', email: 'admin@gmc.test' },
  { label: 'GMC Analyst', email: 'analyst@gmc.test' },
  { label: 'AppSumo Exec', email: 'exec@appsumo.test' },
  { label: 'AppSumo Partnerships', email: 'partnerships@appsumo.test' },
  { label: 'AppSumo Support', email: 'support@appsumo.test' },
  { label: 'AppSumo Finance', email: 'finance@appsumo.test' },
];
const DEMO_PASSWORD = 'BridgeDemo2024!';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  function quick(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-fill p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-sm bg-gold" />
          <h1 className="text-lg font-semibold text-ink">The Bridge</h1>
        </div>
        <div className="card p-6">
          <p className="mb-4 text-sm text-muted">
            GMC &amp; AppSumo shared workspace. Sign in to continue.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="rounded-md bg-status-red/10 px-3 py-2 text-xs text-status-red">
                {error}
              </p>
            )}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-4 card p-4">
          <p className="mb-2 text-xs font-medium text-muted">
            Demo accounts — click to fill, password {DEMO_PASSWORD}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                className="btn-secondary justify-start text-xs"
                onClick={() => quick(a.email)}
                type="button"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
