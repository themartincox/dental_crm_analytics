import React from 'react';

const CompactFooter = () => {
const year = new Date().getFullYear();
const version = import.meta.env?.VITE_APP_VERSION || 'v1.0.0';

return (
<footer className="border-t border-gray-200 bg-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-gray-500">
<span>© {year} AES CRM</span>
<div className="flex items-center gap-4">
<span>
Delivered by{' '}
<a href="https://postino.cc" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 underline">
Postino
</a>
</span>
<a href="/privacy-policy" className="hover:text-gray-700">Privacy</a>
<a href="/terms" className="hover:text-gray-700">Terms</a>
<span className="text-gray-400">{version}</span>
</div>
</div>
</footer>
);
};

export default CompactFooter;