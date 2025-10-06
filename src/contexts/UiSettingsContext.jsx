import React, { createContext, useContext, useEffect, useState } from 'react';
import secureApiService from '../services/secureApiService';
import { uiConfig } from '../config/uiConfig';
import { useAuth } from './AuthContext';

const UiSettingsContext = createContext({});

export const useUiSettings = () => useContext(UiSettingsContext);

const defaultSettings = {
  publicFooterEnabled: uiConfig.showGdcFooterPublic,
  publicFooterVariant: 'compact', // 'full' | 'compact'
  internalFooterEnabled: uiConfig.showCompactFooterInternal,
};

export const UiSettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setSettings(defaultSettings);
        setBranding(null);
        return;
      }
      try {
        setLoading(true);
        const res = await secureApiService.makeSecureRequest('/ui/settings', { method: 'GET' });
        const s = res?.data || {};
        setSettings({
          publicFooterEnabled: typeof s.publicFooterEnabled === 'boolean' ? s.publicFooterEnabled : defaultSettings.publicFooterEnabled,
          publicFooterVariant: s.publicFooterVariant || defaultSettings.publicFooterVariant,
          internalFooterEnabled: typeof s.internalFooterEnabled === 'boolean' ? s.internalFooterEnabled : defaultSettings.internalFooterEnabled,
        });
        const b = await secureApiService.makeSecureRequest('/ui/branding', { method: 'GET' });
        if (b?.data) {
          setBranding(b.data);
          try {
            // Apply CSS variables for colors
            const root = document.documentElement;
            if (b.data.primary_color) root.style.setProperty('--color-primary', b.data.primary_color);
            if (b.data.secondary_color_1) root.style.setProperty('--color-accent', b.data.secondary_color_1);
            if (b.data.secondary_color_2) root.style.setProperty('--color-warning', b.data.secondary_color_2);
            if (b.data.secondary_color_3) root.style.setProperty('--color-error', b.data.secondary_color_3);
            // Also apply background/foreground/ring using derived values
            if (b.data.primary_color) root.style.setProperty('--color-ring', b.data.primary_color);
            // Set default background/foreground for consistency; can be extended to configurable values later
            root.style.setProperty('--color-background', '#ffffff');
            root.style.setProperty('--color-foreground', '#111827');
            // Load Google font if set
            if (b.data.font_family) {
              const id = 'tenant-google-font';
              const existing = document.getElementById(id);
              const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(b.data.font_family)}:wght@400;500;600;700&display=swap`;
              if (!existing) {
                const link = document.createElement('link');
                link.id = id;
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
              } else {
                existing.href = href;
              }
              document.body.style.fontFamily = `${b.data.font_family}, Inter, system-ui, sans-serif`;
            }
          } catch (_) {}
        }
      } catch (_) {
        setSettings(defaultSettings);
        setBranding(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <UiSettingsContext.Provider value={{ settings, branding, loading, setSettings, setBranding }}>
      {children}
    </UiSettingsContext.Provider>
  );
};

export default UiSettingsContext;
