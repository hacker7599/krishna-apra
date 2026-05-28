"use client";

import { normalizeHexColor } from "@/lib/hex-color";

export function AdminColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const hex = normalizeHexColor(value || "#ea580c");

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalizeHexColor(e.target.value))}
          placeholder="#ea580c"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]/15"
          spellCheck={false}
        />
        <span
          className="hidden h-11 w-11 shrink-0 rounded-lg border border-slate-200 shadow-inner sm:block"
          style={{ backgroundColor: hex }}
          title={hex}
        />
      </div>
    </label>
  );
}
