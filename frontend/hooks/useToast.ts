// hooks/useToast.ts
// Shared across LoginPage and RegisterPage

import { useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, type: ToastType, duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, show, remove };
}