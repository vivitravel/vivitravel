"use client";

import { FileDown } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-border-soft px-3 py-2 text-sm text-muted hover:border-turquoise hover:text-turquoise transition-colors print:hidden"
    >
      <FileDown size={15} />
      PDF
    </button>
  );
}
