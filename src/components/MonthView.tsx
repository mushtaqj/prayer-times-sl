import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    <Card>
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
        <div className="overflow-x-auto -mx-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Day</TableHead>
                <TableHead className="text-center">Fajr</TableHead>
                <TableHead className="text-center">Sunrise</TableHead>
                <TableHead className="text-center">Dhuhr</TableHead>
                <TableHead className="text-center">Asr</TableHead>
                <TableHead className="text-center">Maghrib</TableHead>
                <TableHead className="text-center">Isha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prayers.map((prayer) => {
                const isToday = isCurrentMonth && prayer.day === today.getDate()
                return (
                  <TableRow
                    key={prayer.day}
                    className={cn(isToday && "bg-primary/10 font-medium")}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {prayer.day} {monthNames[selectedMonth - 1].slice(0, 3)}
                        {isToday && <Badge variant="default" className="text-xs">Today</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{prayer.fajr}</TableCell>
                    <TableCell className="text-center">{prayer.sunrise}</TableCell>
                    <TableCell className="text-center">{prayer.dhuhr}</TableCell>
                    <TableCell className="text-center">{prayer.asr}</TableCell>
                    <TableCell className="text-center">{prayer.maghrib}</TableCell>
                    <TableCell className="text-center">{prayer.isha}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
