// Copiado de React Native Reusables (MIT © 2025 Founded Labs) · packages/registry/src/nativewind/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
