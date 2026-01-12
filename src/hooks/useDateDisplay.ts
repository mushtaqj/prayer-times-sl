import { useMemo } from 'react'

interface DateDisplayOptions {
  weekday?: 'long' | 'short' | 'narrow'
  year?: 'numeric' | '2-digit'
  month?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit'
  day?: 'numeric' | '2-digit'
}

const DEFAULT_OPTIONS: DateDisplayOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export function useDateDisplay(
  date: Date = new Date(),
  options: DateDisplayOptions = DEFAULT_OPTIONS
): string {
  return useMemo(() => {
    return date.toLocaleDateString('en-US', options)
  }, [date, options])
}

export function useTodayDisplay(
  options: DateDisplayOptions = DEFAULT_OPTIONS
): string {
  return useMemo(() => {
    return new Date().toLocaleDateString('en-US', options)
  }, [options])
}
