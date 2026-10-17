import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import SearchInput from '../components/common/SearchInput';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import useApi from '../hooks/useApi';
import useEscapeKey from '../hooks/useEscapeKey';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { Field, inputClass, selectClass } from '../components/common/Field';

const roles = ['Admin', 'Operator', 'Viewer'];

function ModalShell({ title, onClose, children }) {
  useEscapeKey(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl border border-navy-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role, status: user.status });

  return (
    <ModalShell title="Edit User" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(user.id, form);
        }}
        className="space-y-4"
      >
        <Field label="Name" htmlFor="edit-user-name">
          <input id="edit-user-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        </Field>
        <Field label="Email" htmlFor="edit-user-email">
          <input id="edit-user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
        </Field>
        <Field label="Role" htmlFor="edit-user-role">
          <select id="edit-user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={selectClass}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Status" htmlFor="edit-user-status">
          <select id="edit-user-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <button type="submit" className="w-full rounded-lg bg-navy-900 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors">
          Save Changes
        </button>
      </form>
    </ModalShell>
  );
}

function AddUserModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'Viewer' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" htmlFor="add-user-name">
          <input id="add-user-name" type="text" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
        </Field>
        <Field label="Email" htmlFor="add-user-email">
          <input id="add-user-email" type="email" placeholder="jane@cloudops.io" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required />
        </Field>
        <Field label="Role" htmlFor="add-user-role">
          <select id="add-user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={selectClass}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-navy-900 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors disabled:opacity-60">
          {isSubmitting ? 'Adding…' : 'Add User'}
        </button>
      </form>
    </ModalShell>
  );
}

export default function Users() {
  const { success, error: showError } = useToast();
  const { data: users = [], loading, error, retry, setData: setUsers } = useApi(() => userService.getAll(), []);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const handleSave = async (id, data) => {
    try {
      await userService.update(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
      setEditUser(null);
      success('User updated');
    } catch (err) {
      showError(err?.message || 'Failed to update user');
    }
  };

  const handleCreateUser = async (values) => {
    try {
      const created = await userService.create({
        ...values,
        status: 'active',
        lastLogin: '-',
        createdAt: new Date().toISOString(),
      });
      setUsers((prev) => [...prev, created]);
      setAddOpen(false);
      success(`User ${created.name} added`);
    } catch (err) {
      showError(err?.message || 'Failed to add user');
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await userService.update(user.id, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showError(err?.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage user accounts and permissions">
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-sm">
          <UserPlus size={16} aria-hidden="true" />
          Add User
        </button>
      </PageHeader>

      {loading ? (
        <LoadingSpinner text="Loading users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="w-64" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role" className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-400">
              <option value="all">All Roles</option>
              {roles.map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No users found" description="Try adjusting your search or filters." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-navy-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-navy-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-white text-xs font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-navy-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                          user.role === 'Operator' ? 'bg-blue-50 text-blue-700' :
                          'bg-navy-100 text-navy-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3 text-sm text-navy-500">
                        {user.lastLogin !== '-' ? new Date(user.lastLogin).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditUser(user)} className="rounded-lg px-2 py-1 text-xs text-navy-600 hover:bg-navy-100 transition-colors font-medium" aria-label={`Edit ${user.name}`}>
                            Edit
                          </button>
                          <button onClick={() => toggleStatus(user)} className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                            user.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                          }`}>
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editUser && <EditUserModal key={editUser.id} user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} />}
      {addOpen && <AddUserModal onClose={() => setAddOpen(false)} onCreate={handleCreateUser} />}
    </div>
  );
}
