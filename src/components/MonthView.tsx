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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PrayerRow } from '@/components/PrayerRow'
import { ChevronLeft, ChevronRight, ChevronRight as ChevronIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PrayerTime } from '@/hooks/usePrayerTimes'

interface MonthViewProps {
  getMonthPrayers: (month: number) => PrayerTime[]
  location: string
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export function MonthView({ getMonthPrayers, location }: MonthViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<PrayerTime | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const prayers = getMonthPrayers(selectedMonth)
  const today = new Date()
  const isCurrentMonth = selectedMonth === today.getMonth() + 1

  const todayDateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const prevMonth = () => setSelectedMonth(m => m === 1 ? 12 : m - 1)
  const nextMonth = () => setSelectedMonth(m => m === 12 ? 1 : m + 1)

  const handleDayClick = (prayer: PrayerTime) => {
    setSelectedDay(prayer)
    setSheetOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{todayDateString}</p>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Monthly Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="w-24 text-center font-semibold text-sm">
                {monthNames[selectedMonth - 1]}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop: Full Table */}
          <div className="hidden md:block overflow-x-auto">
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
                      <TableCell className="text-center text-sm">{prayer.fajr}</TableCell>
                      <TableCell className="text-center text-sm">{prayer.sunrise}</TableCell>
                      <TableCell className="text-center text-sm">{prayer.dhuhr}</TableCell>
                      <TableCell className="text-center text-sm">{prayer.asr}</TableCell>
                      <TableCell className="text-center text-sm">{prayer.maghrib}</TableCell>
                      <TableCell className="text-center text-sm">{prayer.isha}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: Simplified List */}
          <div className="md:hidden divide-y divide-border">
            {prayers.map((prayer) => {
              const isToday = isCurrentMonth && prayer.day === today.getDate()
              return (
                <button
                  key={prayer.day}
                  onClick={() => handleDayClick(prayer)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 hover:bg-accent transition-colors text-left",
                    isToday && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {monthNames[selectedMonth - 1].slice(0, 3)} {prayer.day}
                      </span>
                      {isToday && (
                        <Badge variant="default" className="text-xs w-fit mt-1">Today</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="text-right">
                      <span className="block">Fajr {prayer.fajr}</span>
                      <span className="block">Maghrib {prayer.maghrib}</span>
                    </div>
                    <ChevronIcon className="w-4 h-4" />
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh]">
          {selectedDay && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {monthNames[selectedMonth - 1]} {selectedDay.day}
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="space-y-1">
                {prayerKeys.map((key) => (
                  <PrayerRow
                    key={key}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                    time={selectedDay[key]}
                  />
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
