import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import secureApiService from '../../services/secureApiService';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Source Sans Pro', 'Work Sans'
];

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="flex items-center gap-3">
      <input type="color" value={value || '#ffffff'} onChange={(e)=>onChange(e.target.value)} className="h-8 w-12 p-0 border rounded" />
      <input type="text" value={value || ''} onChange={(e)=>onChange(e.target.value)} placeholder="#RRGGBB" className="flex-1 border rounded px-3 py-2 text-sm" />
    </div>
  </div>
);

const BrandingSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    practice_name: '',
    logo_url: '',
    primary_color: '#2563eb',
    secondary_color_1: '#14b8a6',
    secondary_color_2: '#f59e0b',
    secondary_color_3: '#ef4444',
    font_family: 'Inter'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await secureApiService.makeSecureRequest('/ui/branding', { method: 'GET' });
        if (res?.data) setForm(prev => ({ ...prev, ...res.data }));
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    // Live font preview: inject Google font link when selection changes
    try {
      const id = 'branding-settings-google-font';
      const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(form.font_family)}:wght@400;500;600;700&display=swap`;
      let link = document.getElementById(id);
      if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = href;
    } catch (_) {}
  }, [form.font_family]);

  const save = async () => {
    try {
      setSaving(true);
      await secureApiService.makeSecureRequest('/ui/branding', { method: 'PUT', body: JSON.stringify(form) });
      alert('Branding saved');
    } catch (e) {
      alert('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Branding & Practice Details</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-white border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
                <input value={form.practice_name} onChange={(e)=>setForm({ ...form, practice_name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input value={form.logo_url} onChange={(e)=>setForm({ ...form, logo_url: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput label="Primary Color" value={form.primary_color} onChange={(v)=>setForm({ ...form, primary_color: v })} />
                <ColorInput label="Secondary Color 1" value={form.secondary_color_1} onChange={(v)=>setForm({ ...form, secondary_color_1: v })} />
                <ColorInput label="Secondary Color 2" value={form.secondary_color_2} onChange={(v)=>setForm({ ...form, secondary_color_2: v })} />
                <ColorInput label="Secondary Color 3" value={form.secondary_color_3} onChange={(v)=>setForm({ ...form, secondary_color_3: v })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font (Google Fonts)</label>
                <select value={form.font_family} onChange={(e)=>setForm({ ...form, font_family: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            {/* Preview */}
            <div className="bg-white border rounded-lg p-6" style={{ fontFamily: form.font_family }}>
              <div className="space-y-4">
                <div className="h-10 flex items-center gap-3">
              <Logo path={form.logo_url} />
                  <span className="font-semibold">{form.practice_name || 'Practice Name'}</span>
                </div>
                <div className="h-2 rounded" style={{ backgroundColor: form.primary_color }} />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 rounded" style={{ backgroundColor: form.secondary_color_1 }} />
                  <div className="h-8 rounded" style={{ backgroundColor: form.secondary_color_2 }} />
                  <div className="h-8 rounded" style={{ backgroundColor: form.secondary_color_3 }} />
                </div>
                <p className="text-sm text-gray-500">This preview simulates header colors and font usage. The selection applies across the app.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingSettings;

const Logo = ({ path }) => {
  const [url, setUrl] = React.useState('');
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!path) return;
        if (path.startsWith('http')) { setUrl(path); return; }
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
        const supabaseAnon = import.meta.env?.VITE_SUPABASE_ANON_KEY;
        const sb = createClient(supabaseUrl, supabaseAnon);
        const { data, error } = await sb.storage.from('branding').createSignedUrl(path, 60);
        if (!error && data?.signedUrl && active) setUrl(data.signedUrl);
      } catch (_) {}
    })();
    return () => { active = false; };
  }, [path]);
  if (!path) return <div className="h-10 w-10 bg-gray-200 rounded" />;
  if (!url) return <div className="h-10 w-10 bg-gray-100 animate-pulse rounded" />;
  return <img src={url} alt="logo" className="h-10" />;
};
