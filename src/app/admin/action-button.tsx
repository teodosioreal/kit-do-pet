"use client";
import { useState, useTransition } from "react";
import type { AdminResult } from "./actions";

/** Botão que chama uma server action e mostra a mensagem de retorno. */
export function ActionButton({
  action,
  label,
  confirmText,
  className = "btn-secondary py-2 text-sm",
  pre = false,
}: {
  action: () => Promise<AdminResult | void>;
  label: string;
  confirmText?: string;
  className?: string;
  pre?: boolean;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AdminResult | null>(null);
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          start(async () => setResult((await action()) ?? null));
        }}
      >
        {pending ? "Aguarde..." : label}
      </button>
      {result &&
        (pre ? (
          <pre className="max-h-80 overflow-auto rounded-xl bg-gray-900 p-3 text-xs text-gray-100">{result.message}</pre>
        ) : (
          <p className={`text-xs ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.message}</p>
        ))}
    </div>
  );
}
