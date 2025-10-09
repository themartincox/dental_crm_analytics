export default function UndoToast({ open, message, onUndo, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white rounded px-4 py-2 flex items-center gap-3">
      <span>{message}</span>
      <button onClick={onUndo} className="underline">Undo</button>
      <button onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}

