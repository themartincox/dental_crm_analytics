export default function TableToolbar({ value, onChange, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        placeholder="Search…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-2 py-1 w-full max-w-sm"
        aria-label="Search list"
      />
      {children}
    </div>
  );
}

