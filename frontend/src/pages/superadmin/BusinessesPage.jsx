import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, X, Upload, Building2,
  CheckCircle, XCircle, ExternalLink, Eye, EyeOff,
  KeyRound, Settings, ToggleLeft, ToggleRight, Check
} from 'lucide-react';
import {
  saGetBusinesses, saCreateBusiness, saUpdateBusiness,
  saToggleStatus, saDeleteBusiness
} from '../../api';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import axios from 'axios';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nameToSubdomain(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Set Admin Password modal ──────────────────────────────────────────────────

function SetPasswordModal({ business, token, onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await axios.patch(
        `/api/superadmin/businesses/${business.id}/admin-password`,
        { password },
        { headers: { 'x-super-admin': token } }
      );
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-900">Set Admin Password</h2>
            <p className="text-xs text-gray-500 mt-0.5">{business.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Password set!</p>
            <p className="text-sm text-gray-500 mb-4">
              The admin manager can now log in to{' '}
              <span className="font-mono text-gray-700">/adminmanager?business={business.id}</span>
            </p>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
              <p>Admin panel URL:</p>
              <p className="font-mono mt-0.5 break-all">
                {window.location.origin}/adminmanager?business={business.id}
              </p>
            </div>

            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min. 4 characters"
                  required
                  autoFocus
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="input-field"
                placeholder="Repeat password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <KeyRound size={14} />
                {loading ? 'Saving...' : 'Set Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Business form modal ───────────────────────────────────────────────────────

function BusinessForm({ business, onSave, onCancel }) {
  const { token } = useSuperAdmin();
  const [subdomainManuallyEdited, setSubdomainManuallyEdited] = useState(!!business?.subdomain);
  const [form, setForm] = useState({
    name: business?.name || '',
    subdomain: business?.subdomain || '',
    tagline: business?.tagline || '',
    about: business?.about || '',
    phone: business?.phone || '',
    address: business?.address || '',
    telegram_bot_token: business?.telegram_bot_token || '',
    telegram_chat_id: business?.telegram_chat_id || '',
    status: business?.status || 'active',
    color_primary:   business?.color_primary   || '#2563eb',
    color_secondary: business?.color_secondary || '#7c3aed',
    color_tertiary:  business?.color_tertiary  || '#0891b2',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState(business?.logo_url || '');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleNameChange = (val) => {
    setForm(prev => ({
      ...prev,
      name: val,
      subdomain: subdomainManuallyEdited ? prev.subdomain : nameToSubdomain(val),
    }));
  };

  const handleSubdomainChange = (val) => {
    setSubdomainManuallyEdited(true);
    setForm(prev => ({ ...prev, subdomain: val.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (file) { setForm(f => ({ ...f, logo: file })); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'logo' && v !== null) fd.append(k, v); });
      if (form.logo) fd.append('logo', form.logo);
      if (business?.id) await saUpdateBusiness(token, business.id, fd);
      else await saCreateBusiness(token, fd);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900 text-lg">{business ? 'Edit Business' : 'New Business'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Logo */}
          <div>
            <label className="label">Business Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-xl border flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="" className="h-full w-full object-contain" />
                  : <Building2 size={24} className="text-gray-300" />}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
                <Upload size={14} /> Upload Logo
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Business Name *</label>
              <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} className="input-field" placeholder="Addis Furniture" required />
            </div>
            <div>
              <label className="label">
                Subdomain *
                {!subdomainManuallyEdited && form.name && <span className="ml-1 text-xs font-normal text-blue-500">auto-generated</span>}
              </label>
              <div className="flex items-center gap-1">
                <input type="text" value={form.subdomain} onChange={e => handleSubdomainChange(e.target.value)} className="input-field" placeholder="addis-furniture" required />
                <span className="text-sm text-gray-400 whitespace-nowrap">.yoursite.com</span>
              </div>
              {form.subdomain && (
                <p className="text-xs text-gray-400 mt-1">Preview: <span className="font-mono text-gray-600">{form.subdomain}.yoursite.com</span></p>
              )}
            </div>
            <div>
              <label className="label">Tagline</label>
              <input type="text" value={form.tagline} onChange={e => f('tagline', e.target.value)} className="input-field" placeholder="Quality at best prices" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={e => f('phone', e.target.value)} className="input-field" placeholder="+251912345678" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input type="text" value={form.address} onChange={e => f('address', e.target.value)} className="input-field" placeholder="Bole, Addis Ababa" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">About Us</label>
              <textarea value={form.about} onChange={e => f('about', e.target.value)} className="input-field resize-none" rows={2} />
            </div>
          </div>

          {/* Telegram */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🔐 Telegram Integration
              <span className="text-xs font-normal text-gray-400">stored securely, never public</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Bot Token</label>
                <div className="relative">
                  <input type={showToken ? 'text' : 'password'} value={form.telegram_bot_token} onChange={e => f('telegram_bot_token', e.target.value)} className="input-field pr-10" placeholder="1234567890:AAA..." autoComplete="off" />
                  <button type="button" onClick={() => setShowToken(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Group Chat ID</label>
                <input type="text" value={form.telegram_chat_id} onChange={e => f('telegram_chat_id', e.target.value)} className="input-field" placeholder="-1001234567890" />
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🎨 Store Theme Colors
              <span className="text-xs font-normal text-gray-400">applied to buttons & accents in the storefront</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'color_primary',   label: 'Primary',   hint: 'Main buttons, links' },
                { key: 'color_secondary', label: 'Secondary', hint: 'Accents, badges' },
                { key: 'color_tertiary',  label: 'Tertiary',  hint: 'Highlights, prices' },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="flex items-center gap-2">
                    {/* Native color picker */}
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={form[key]}
                        onChange={e => f(key, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title={label}
                      />
                      <div
                        className="w-full h-full rounded-lg"
                        style={{ backgroundColor: form[key] }}
                      />
                    </div>
                    {/* Hex input */}
                    <input
                      type="text"
                      value={form[key]}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(val)) f(key, val);
                      }}
                      className="input-field font-mono text-xs uppercase w-full"
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </div>
              ))}
            </div>

            {/* Live preview strip */}
            <div className="flex gap-2 pt-1">
              <div className="flex-1 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: form.color_primary }}>Primary</div>
              <div className="flex-1 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: form.color_secondary }}>Secondary</div>
              <div className="flex-1 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: form.color_tertiary }}>Tertiary</div>
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => f('status', e.target.value)} className="input-field">
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Business'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Admin password display cell ───────────────────────────────────────────────

function AdminPasswordCell({ password }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs text-gray-800">
        {visible ? password : '••••••••'}
      </span>
      <button
        onClick={() => setVisible(v => !v)}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

// ── Row hamburger menu ────────────────────────────────────────────────────────

function HamburgerMenu({ biz, token, onEdit, onToggle, onDelete, onPasswordSet }) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      {showPassword && (
        <SetPasswordModal
          business={biz}
          token={token}
          onClose={() => { setShowPassword(false); onPasswordSet?.(); }}
        />
      )}

      {/* Visible 3-line hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col items-center justify-center gap-[4px] w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition-colors"
        aria-label="More actions"
        title="Actions"
      >
        <span className="block w-4 h-[2px] bg-current rounded-full" />
        <span className="block w-4 h-[2px] bg-current rounded-full" />
        <span className="block w-4 h-[2px] bg-current rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1.5 overflow-hidden">
          {/* Open Admin Panel — primary action */}
          <a
            href={`/adminmanager?business=${biz.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            <Settings size={14} />
            Open Admin Panel
          </a>

          <a
            href={`/store/${biz.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={14} className="text-gray-400" />
            View Store
          </a>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => { setShowPassword(true); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <KeyRound size={14} className="text-blue-400" />
            Set Admin Password
          </button>

          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit2 size={14} className="text-gray-400" />
            Edit Business
          </button>

          <button
            onClick={() => { onToggle(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            {biz.status === 'active'
              ? <ToggleLeft size={14} className="text-gray-400" />
              : <ToggleRight size={14} className="text-green-500" />}
            {biz.status === 'active' ? 'Disable Business' : 'Enable Business'}
          </button>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete Business
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BusinessesPage() {
  const { token } = useSuperAdmin();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBiz, setEditBiz] = useState(null);

  const load = () => {
    saGetBusinesses(token)
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const handleToggle = async (biz) => {
    const newStatus = biz.status === 'active' ? 'disabled' : 'active';
    try {
      await saToggleStatus(token, biz.id, newStatus);
      setBusinesses(bs => bs.map(b => b.id === biz.id ? { ...b, status: newStatus } : b));
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (biz) => {
    if (!confirm(`Permanently delete "${biz.name}" and all its data?`)) return;
    try {
      await saDeleteBusiness(token, biz.id);
      setBusinesses(bs => bs.filter(b => b.id !== biz.id));
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <BusinessForm
          business={editBiz}
          onSave={() => { setShowForm(false); setEditBiz(null); load(); }}
          onCancel={() => { setShowForm(false); setEditBiz(null); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {businesses.length} tenant{businesses.length !== 1 ? 's' : ''} on this platform
          </p>
        </div>
        <button onClick={() => { setEditBiz(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Business
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : businesses.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No businesses yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Create first business</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Subdomain</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Products</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Orders</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Admin Password</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businesses.map(biz => (
                  <tr key={biz.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {biz.logo_url ? (
                          <img src={biz.logo_url} alt="" className="h-9 w-9 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{biz.name}</p>
                          {biz.phone && <p className="text-xs text-gray-400">{biz.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {biz.subdomain}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-700">{biz.product_count ?? '—'}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-700">{biz.order_count ?? '—'}</td>
                    {/* Admin Password column */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {biz.admin_password ? (
                        <AdminPasswordCell password={biz.admin_password} />
                      ) : (
                        <span className="text-xs text-gray-400 italic">not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                        biz.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {biz.status === 'active' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {biz.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <HamburgerMenu
                          biz={biz}
                          token={token}
                          onEdit={() => { setEditBiz(biz); setShowForm(true); }}
                          onToggle={() => handleToggle(biz)}
                          onDelete={() => handleDelete(biz)}
                          onPasswordSet={load}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
