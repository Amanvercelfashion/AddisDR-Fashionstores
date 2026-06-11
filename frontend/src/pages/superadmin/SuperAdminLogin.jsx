import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { superAdminLogin } from '../../api';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SuperAdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useSuperAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await superAdminLogin(form.username, form.password);
      login(res.token, res.admin);
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 rounded-2xl mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Platform control panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="sa-user">Username</label>
              <input
                id="sa-user"
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="input-field"
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label" htmlFor="sa-pass">Password</label>
              <input
                id="sa-pass"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Contact your platform administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}
