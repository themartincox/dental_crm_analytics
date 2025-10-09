import React from "react";

export default function FormField({ label, id, error, children, required = false, helpText }) {
  const describedBy = error ? `${id}-error` : (helpText ? `${id}-help` : undefined);
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {React.cloneElement(children, { id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {helpText && !error && <p id={`${id}-help`} className="text-xs text-neutral-500 mt-1">{helpText}</p>}
      {error && <p id={`${id}-error`} className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

