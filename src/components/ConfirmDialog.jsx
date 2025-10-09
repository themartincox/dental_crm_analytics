import React from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="border rounded px-3 py-1">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white rounded px-3 py-1">Delete</button>
        </div>
      </div>
    </div>
  );
}

