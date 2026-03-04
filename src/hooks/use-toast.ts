// File: src/hooks/use-toast.ts
import { useCallback } from 'react';

export function useToast() {
  const showToast = useCallback((message: string) => {
    alert(message); // Replace with your UI toast logic (e.g. using Radix, react-toastify, etc.)
  }, []);

  return { showToast };
}
