// Shared utility: merges Tailwind class strings safely.
// clsx handles conditionals/arrays; twMerge resolves Tailwind conflicts (e.g. two bg-* classes).
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
