export const uiConfig = {
  // Feature-flag style toggles
  showGdcFooterPublic: (import.meta.env?.VITE_SHOW_GDC_PUBLIC_FOOTER ?? 'true') === 'true',
  showCompactFooterInternal: (import.meta.env?.VITE_SHOW_COMPACT_INTERNAL_FOOTER ?? 'true') === 'true',
};

