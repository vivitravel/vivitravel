"use client";

import { FileDown } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-border-soft px-4 py-2 text-sm font-semibold text-navy hover:border-turquoise hover:text-turquoise transition-colors print:hidden"
    >
      <FileDown size={15} />
      Descargar PDF
    </button>
  );
}
