import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Building2, Phone, Send, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { getBusiness, saGetBusiness, saUpdateBusiness } from '../../api';
import { useBusiness } from '../../context/BusinessContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import axios from 'axios';

export default function SettingsPage() {
  const { businessId, setBusiness } = useBusiness();
  const { token: saToken } = useSuperAdmin();
  const [form, setForm] = useState({ name: '', tagline: '', about: '', phone: '', address: '', telegram_bot_token: '', telegram_chat_id: '', logo: null });
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramResult, setTelegramResult] = useState(null);
  const fileRef = useRef();

  const canEditTelegram = !!saToken; // only super admin can edit telegram config

  useEffect(() => {
    if (!businessId) return;
    // Load public business data
    getBusiness(businessId).then(data => {
      setForm(f => ({ ...f, name: data.name || '', tagline: data.tagline || '', about: data.about || '', phone: data.phone || '', address: data.address || '' }));
      setLogoPreview(data.logo_url || '');
    }).catch(console.error).finally(() => setLoading(false));

    // If super admin, also load telegram config
    if (saToken) {
      saGetBusiness(saToken, businessId).then(data => {
        setForm(f => ({ ...f, telegram_bot_token: data.telegram_bot_token || '', telegram_chat_id: data.telegram_chat_id || '' }));
      }).catch(console.error);
    }
  }, [businessId, saToken]);

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (file) { setForm(f => ({ ...f, logo: file })); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true); setSaved(false);
    try {
      if (!saToken) {
        setError('Settings can only be edited by Super Admin. Ask your platform administrator.');
        return;
      }
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('tagline', form.tagline);
      fd.append('about', form.about);
      fd.append('phone', form.phone);
      fd.append('address', form.address);
      fd.append('telegram_bot_token', form.telegram_bot_token);
      fd.append('telegram_chat_id', form.telegram_chat_id);
      if (form.logo) fd.append('logo', form.logo);

      await saUpdateBusiness(saToken, businessId, fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Refresh business context
      setBusiness(prev => ({ ...prev, name: form.name, tagline: form.tagline, about: form.about, phone: form.phone, logo_url: logoPreview }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const testTelegram = async () => {
    if (!form.telegram_bot_token || !form.telegram_chat_id) {
      setTelegramResult({ success: false, message: 'Enter bot token and chat ID first.' });
      return;
    }
    setTestingTelegram(true); setTelegramResult(null);
    try {
      const url = `https://api.telegram.org/bot${form.telegram_bot_token}/sendMessage`;
      await axios.post(url, {
        chat_id: form.telegram_chat_id,
        text: '✅ Telegram connection test from your store admin panel\\. Everything is working\\!',
        parse_mode: 'MarkdownV2'
      });
      setTelegramResult({ success: true, message: 'Test message sent successfully!' });
    } catch (err) {
      setTelegramResult({ success: false, message: `Failed: ${err?.response?.data?.description || err.message}` });
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) return <div className="space-y-4 max-w-2xl animate-pulse">{[...Array(3)].map((_, i) => <div key={i} className="card h-40" />)}</div>;

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {saToken ? 'Edit store profile and Telegram integration' : 'Contact your platform administrator to edit settings'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5"><Building2 size={18} className="text-blue-600" /><h2 className="font-semibold text-gray-900">Store Profile</h2></div>
          <div className="mb-4">
            <label className="label">Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-xl border overflow-hidden flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-contain" /> : <Building2 size={24} className="text-gray-300" />}
              </div>
              {saToken && (
                <>
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm"><Upload size={14} /> Upload</button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                </>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {[['name', 'Store Name', 'Addis Electronics', 'text'], ['tagline', 'Tagline', 'Best prices in town', 'text'], ['phone', 'Phone', '+251912345678', 'tel'], ['address', 'Address', 'Bole, Addis Ababa', 'text']].map(([key, label, placeholder, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} value={form[key]} onChange={e => f(key, e.target.value)} className="input-field" placeholder={placeholder} disabled={!saToken} />
              </div>
            ))}
            <div>
              <label className="label">About Us</label>
              <textarea value={form.about} onChange={e => f('about', e.target.value)} className="input-field resize-none" rows={3} disabled={!saToken} />
            </div>
          </div>
        </div>

        {/* Telegram */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5"><Send size={18} className="text-blue-600" /><h2 className="font-semibold text-gray-900">Telegram Integration</h2></div>
          {!saToken && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-3 py-2 rounded-lg mb-4">
              🔒 Telegram credentials are managed by the Super Admin only.
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="label">Bot Token</label>
              <div className="relative">
                <input type={showToken ? 'text' : 'password'} value={form.telegram_bot_token} onChange={e => f('telegram_bot_token', e.target.value)}
                  className="input-field pr-10" placeholder="1234567890:AAA..." disabled={!saToken} autoComplete="off" />
                <button type="button" onClick={() => setShowToken(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Group Chat ID</label>
              <input type="text" value={form.telegram_chat_id} onChange={e => f('telegram_chat_id', e.target.value)}
                className="input-field" placeholder="-1001234567890" disabled={!saToken} />
            </div>
            {saToken && (
              <div>
                <button type="button" onClick={testTelegram} disabled={testingTelegram} className="btn-secondary flex items-center gap-2 text-sm">
                  <Send size={14} /> {testingTelegram ? 'Sending...' : 'Send Test Message'}
                </button>
                {telegramResult && (
                  <div className={`mt-2 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${telegramResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {telegramResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {telegramResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"><AlertCircle size={14} />{error}</div>}
        {saved && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"><CheckCircle size={14} />Settings saved!</div>}

        {saToken && (
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-6">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </form>
    </div>
  );
}
