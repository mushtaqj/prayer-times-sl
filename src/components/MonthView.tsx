import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PrayerTime } from '@/hooks/usePrayerTimes'

interface MonthViewProps {
  getMonthPrayers: (month: number) => PrayerTime[]
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MonthView({ getMonthPrayers }: MonthViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const prayers = getMonthPrayers(selectedMonth)
  const today = new Date()
  const isCurrentMonth = selectedMonth === today.getMonth() + 1

  const prevMonth = () => setSelectedMonth(m => m === 1 ? 12 : m - 1)
  const nextMonth = () => setSelectedMonth(m => m === 12 ? 1 : m + 1)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-28 text-center font-semibold">
              {monthNames[selectedMonth - 1]}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 md:-mx-6">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                <th className="px-3 py-2 text-left text-sm font-bold border-2 border-[var(--foreground)]">Day</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Fajr</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Sunrise</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Dhuhr</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Asr</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Maghrib</th>
                <th className="px-3 py-2 text-center text-sm font-bold border-2 border-[var(--foreground)]">Isha</th>
              </tr>
            </thead>
            <tbody>
              {prayers.map((prayer) => {
                const isToday = isCurrentMonth && prayer.day === today.getDate()
                return (
                  <tr
                    key={prayer.day}
                    className={`transition-colors ${
                      isToday
                        ? 'bg-[var(--secondary)] font-bold'
                        : 'hover:bg-[var(--muted)]'
                    }`}
                  >
                    <td className="px-3 py-2 text-sm border-2 border-[var(--foreground)]">
                      {prayer.day} {monthNames[selectedMonth - 1].slice(0, 3)}
                      {isToday && <span className="ml-2 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 rounded-lg">Today</span>}
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.fajr}</td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.sunrise}</td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.dhuhr}</td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.asr}</td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.maghrib}</td>
                    <td className="px-3 py-2 text-sm text-center border-2 border-[var(--foreground)]">{prayer.isha}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
