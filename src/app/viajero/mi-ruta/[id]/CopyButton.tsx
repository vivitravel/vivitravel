"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => alert("Link copiado al portapapeles"));
      }}
      className="shrink-0 rounded-lg border border-border-soft px-3 py-1.5 text-xs font-semibold hover:bg-surface"
    >
      Copiar
    </button>
  );
}
