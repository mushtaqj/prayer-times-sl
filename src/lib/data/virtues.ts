/**
 * Virtues Data Access Layer
 * Provides typed access to virtue markdown content
 */

import virtuesJson from '@/data/virtues.json'
import type { VirtuesData } from './types'

// Type assertion for imported JSON
const virtuesData = virtuesJson as VirtuesData

// ============================================================================
// Static Data
// ============================================================================

/** Month virtues by month number */
export const monthVirtues = virtuesData.months

/** Event virtues by event ID */
export const eventVirtues = virtuesData.events

/** Recurring event virtues by key */
export const recurringVirtues = virtuesData.recurring

// ============================================================================
// Query Functions
// ============================================================================

/** Get virtue content for a month */
export function getMonthVirtue(monthNumber: number): string | undefined {
  return virtuesData.months[String(monthNumber)]
}

/** Get virtue content for an event */
export function getEventVirtue(eventId: string): string | undefined {
  return virtuesData.events[eventId]
}

/** Get virtue content for a recurring event */
export function getRecurringVirtue(key: string): string | undefined {
  return virtuesData.recurring[key]
}
