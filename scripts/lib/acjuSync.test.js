import { describe, it, expect } from 'vitest'
import { syncFromAcju } from './acjuSync.js'

// Minimal calendar in the lowdb `db.data` shape, mirroring the real file's
// tail on 2026-10-13: Rabi al-Thani ongoing, Jumada al-Awwal assumed upcoming.
function makeData() {
  return {
    hijriMonths: [
      { number: 4, name: 'Rabi al-Thani' },
      { number: 5, name: 'Jumada al-Awwal' },
      { number: 6, name: 'Jumada al-Akhirah' },
    ],
    months: [
      { hijriYear: 1448, hijriMonth: 4, monthName: 'Rabi al-Thani', gregorianStart: '2026-09-13', days: 30, status: 'ongoing' },
      { hijriYear: 1448, hijriMonth: 5, monthName: 'Jumada al-Awwal', gregorianStart: '2026-10-13', days: 30, status: 'upcoming' },
    ],
  }
}

// Fake ACJU endpoint: maps the posted current_start_date to a JSON reply.
function fakeAcju(replies) {
  const calls = []
  const fetchImpl = async (_url, init) => {
    const start = new URLSearchParams(init.body).get('current_start_date')
    calls.push(start)
    const reply = replies[start]
    if (!reply) throw new Error(`unexpected request for ${start}`)
    return { ok: true, status: 200, json: async () => reply }
  }
  return { fetchImpl, calls }
}

describe('syncFromAcju', () => {
  it('asks ACJU once for the month after the ongoing one and applies that single transition', async () => {
    // Captured from ACJU on 2026-10-16: the month after 2026-09-13 is 2026-10-13.
    const { fetchImpl, calls } = fakeAcju({
      '2026-09-13': { success: true, start_date: '2026-10-13', end_date: '0000-00-00', is_last_start_date: true },
      // Would be asked next by a looping implementation; must never be requested.
      '2026-10-13': { success: true, start_date: '2026-11-11' },
    })
    const data = makeData()

    const transitions = await syncFromAcju(data, { fetchImpl })

    expect(calls).toEqual(['2026-09-13'])
    expect(transitions).toHaveLength(1)
    expect(transitions[0].completed).toMatchObject({ monthName: 'Rabi al-Thani', gregorianStart: '2026-09-13', days: 30 })
    expect(transitions[0].newOngoing).toMatchObject({ monthName: 'Jumada al-Awwal', gregorianStart: '2026-10-13', days: 30 })
    // The new upcoming month is a local 30-day assumption, not fetched from ACJU.
    expect(transitions[0].newUpcoming).toMatchObject({ monthName: 'Jumada al-Akhirah', gregorianStart: '2026-11-12', days: 30 })
    expect(data.months.map((m) => m.status)).toEqual(['completed', 'ongoing', 'upcoming'])
  })

  it('applies nothing when ACJU echoes the ongoing month back (not published yet)', async () => {
    // Captured from ACJU on 2026-10-16 when asking what follows 2026-10-13.
    const { fetchImpl } = fakeAcju({
      '2026-09-13': { success: true, start_date: '2026-09-13', end_date: '2026-10-12', is_last_start_date: false },
    })
    const data = makeData()

    const transitions = await syncFromAcju(data, { fetchImpl })

    expect(transitions).toEqual([])
    expect(data.months.map((m) => m.status)).toEqual(['ongoing', 'upcoming'])
  })

  it('applies nothing when ACJU answers success:false', async () => {
    const { fetchImpl } = fakeAcju({ '2026-09-13': { success: false } })
    const data = makeData()

    expect(await syncFromAcju(data, { fetchImpl })).toEqual([])
    expect(data.months.map((m) => m.status)).toEqual(['ongoing', 'upcoming'])
  })

  it('accepts a 29-day month and corrects the upcoming start date', async () => {
    const { fetchImpl } = fakeAcju({
      '2026-09-13': { success: true, start_date: '2026-10-12' },
    })
    const data = makeData()

    const [t] = await syncFromAcju(data, { fetchImpl })

    expect(t.completed.days).toBe(29)
    expect(t.newOngoing.gregorianStart).toBe('2026-10-12')
    expect(t.newUpcoming.gregorianStart).toBe('2026-11-11')
  })

  it('rejects a next start date that implies an impossible month length', async () => {
    const { fetchImpl } = fakeAcju({
      '2026-09-13': { success: true, start_date: '2026-09-28' },
    })
    const data = makeData()

    await expect(syncFromAcju(data, { fetchImpl })).rejects.toThrow(/Computed 15 days/)
    expect(data.months.map((m) => m.status)).toEqual(['ongoing', 'upcoming'])
  })

  it('throws when the calendar has no ongoing month', async () => {
    const { fetchImpl, calls } = fakeAcju({})
    const data = makeData()
    data.months.forEach((m) => (m.status = 'completed'))

    await expect(syncFromAcju(data, { fetchImpl })).rejects.toThrow(/No ongoing month/)
    expect(calls).toEqual([])
  })
})
