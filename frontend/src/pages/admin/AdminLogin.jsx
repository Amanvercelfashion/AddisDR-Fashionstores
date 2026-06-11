import { useState } from 'react';
import { Lock, AlertCircle, Building2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useBusiness } from '../../context/BusinessContext';
import axios from 'axios';

export default function AdminLogin({ onSuccess }) {
  const { businessId, business } = useBusiness();
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/superadmin/admin-login', {
        business_id: businessId,
        password: password.trim(),
      });
      login(businessId, res.data.business);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Business branding */}
        <div className="text-center mb-8">
          {business?.logo_url ? (
            <img src={business.logo_url} alt={business?.name} className="h-16 w-16 object-contain rounded-2xl mx-auto mb-3" />
          ) : (
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Building2 size={32} className="text-white" />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{business?.name || 'Admin Panel'}</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your store</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="admin-pw">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} /> Admin Password
                </span>
              </label>
              <input
                id="admin-pw"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Password is set by the platform administrator.
        </p>
      </div>
    </div>
  );
}
