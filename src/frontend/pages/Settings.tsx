import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { ROLE_LABELS, ROLES, canManageUsers } from '@shared/types';
import type { Role } from '@shared/types';
import { Spinner } from '../components/ui';
import { Modal } from '../components/Modal';
import { timeAgo } from '../lib/format';

export function Settings() {
  const { user } = useAuth();
  if (!user) return null;
  const isAdmin = canManageUsers(user.role);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Profile</h2>
        <dl className="space-y-2 text-sm">
          <Row label="Name" value={user.fullName} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={ROLE_LABELS[user.role]} />
          <Row label="Organisation" value={user.organisationName} />
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Notification preferences</h2>
        <p className="mb-3 text-xs text-muted">
          The Bridge sends in-app notifications only — no email. Choose which events reach your bell.
        </p>
        {['Assigned to me', 'Mentions', 'Approvals', 'Overdue items', 'Vendor turns red'].map(
          (n) => (
            <label key={n} className="flex items-center gap-2 py-1 text-sm">
              <input type="checkbox" defaultChecked />
              {n}
            </label>
          ),
        )}
        <p className="mt-2 text-xs text-muted">Preferences are local to this demo build.</p>
      </section>

      {isAdmin && <UserManagement />}
      {isAdmin && <DataExport />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-1.5 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  lastSeenAt: string | null;
}

function UserManagement() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [resetFor, setResetFor] = useState<ManagedUser | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<ManagedUser[]>('/users'),
  });
  const { data: orgs } = useQuery({
    queryKey: ['orgs'],
    queryFn: () => api.get<{ id: string; name: string; type: string }[]>('/orgs'),
  });

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">User management</h2>
        <button className="btn-primary px-2 py-1 text-xs" onClick={() => setAddOpen(true)}>
          Add user
        </button>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Last seen</th>
              <th className="py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="py-2">
                  <p className="font-medium">{u.fullName}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="py-2 text-muted">{ROLE_LABELS[u.role]}</td>
                <td className="py-2 text-muted">{timeAgo(u.lastSeenAt)}</td>
                <td className="py-2 text-right">
                  <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setResetFor(u)}>
                    Reset password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        orgs={orgs ?? []}
        onDone={() => qc.invalidateQueries({ queryKey: ['users'] })}
      />
      <ResetDialog user={resetFor} onClose={() => setResetFor(null)} />
    </section>
  );
}

function AddUserDialog({
  open,
  onClose,
  orgs,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  orgs: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('appsumo_support');
  const [organisationId, setOrganisationId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [err, setErr] = useState('');

  const create = useMutation({
    mutationFn: () =>
      api.post('/users', { email, fullName, role, organisationId, tempPassword }),
    onSuccess: () => {
      onDone();
      onClose();
      setEmail('');
      setFullName('');
      setTempPassword('');
    },
    onError: (e) => setErr((e as Error).message),
  });

  return (
    <Modal open={open} onClose={onClose} title="Add user">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setErr('');
          create.mutate();
        }}
      >
        <div>
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Role</label>
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Organisation</label>
            <select className="input" value={organisationId} onChange={(e) => setOrganisationId(e.target.value)} required>
              <option value="">Select…</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Temporary password (min 12 chars)</label>
          <input className="input" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} minLength={12} required />
          <p className="mt-1 text-xs text-muted">Hand this to the user out of band. They cannot reset by email.</p>
        </div>
        {err && <p className="text-xs text-status-red">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={create.isPending}>Create user</button>
        </div>
      </form>
    </Modal>
  );
}

function ResetDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const [pw, setPw] = useState('');
  const [done, setDone] = useState(false);
  const reset = useMutation({
    mutationFn: () => api.post(`/users/${user!.id}/reset-password`, { tempPassword: pw }),
    onSuccess: () => setDone(true),
  });
  if (!user) return null;
  return (
    <Modal open onClose={onClose} title={`Reset password — ${user.fullName}`}>
      {done ? (
        <p className="py-3 text-sm text-status-green">
          Password reset. Hand the new temporary password to {user.fullName}.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reset.mutate();
          }}
          className="space-y-3"
        >
          <input
            className="input"
            placeholder="New temporary password (min 12)"
            value={pw}
            minLength={12}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={reset.isPending}>Reset</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function DataExport() {
  return (
    <section className="card p-5">
      <h2 className="mb-2 text-sm font-semibold">Data</h2>
      <p className="mb-3 text-xs text-muted">
        Download the full dataset as JSON. A weekly backup also runs automatically to R2.
      </p>
      <a href="/api/admin/export" className="btn-secondary inline-flex">
        Export everything
      </a>
    </section>
  );
}
