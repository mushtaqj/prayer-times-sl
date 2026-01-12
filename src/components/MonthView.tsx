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
import { ChevronLeft, ChevronRight, ChevronRight as ChevronIcon, MapPin } from 'lucide-react'
import { cn } from '@/lib/tailwind'
import type { DailyPrayerTimes } from '@/lib/data/types'

interface MonthViewProps {
  getMonthPrayers: (month: number) => DailyPrayerTimes[]
  location: string
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export function MonthView({ getMonthPrayers, location }: MonthViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<DailyPrayerTimes | null>(null)
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

  const handleDayClick = (prayer: DailyPrayerTimes) => {
    setSelectedDay(prayer)
    setSheetOpen(true)
  }

  return (
    <>
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="pb-6 px-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{todayDateString}</p>
            <div className="flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">{location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl font-heading text-primary">Monthly Schedule</CardTitle>
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background rounded-md" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="w-24 text-center font-bold text-sm text-foreground">
                {monthNames[selectedMonth - 1]}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background rounded-md" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop: Full Table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-28 font-bold text-primary">Day</TableHead>
                    <TableHead className="text-center font-semibold">Fajr</TableHead>
                    <TableHead className="text-center font-semibold">Sunrise</TableHead>
                    <TableHead className="text-center font-semibold">Dhuhr</TableHead>
                    <TableHead className="text-center font-semibold">Asr</TableHead>
                    <TableHead className="text-center font-semibold">Maghrib</TableHead>
                    <TableHead className="text-center font-semibold">Isha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prayers.map((prayer) => {
                    const isToday = isCurrentMonth && prayer.day === today.getDate()
                    return (
                      <TableRow
                        key={prayer.day}
                        className={cn(
                          "border-border/50 transition-colors hover:bg-muted/50",
                          isToday && "bg-primary/10 hover:bg-primary/15 font-medium"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className={cn(isToday && "text-primary font-bold")}>{prayer.day}</span>
                            <span className="text-xs text-muted-foreground">{monthNames[selectedMonth - 1].slice(0, 3)}</span>
                            {isToday && <Badge variant="default" className="text-[10px] h-5 ml-1 bg-primary hover:bg-primary">Today</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{prayer.fajr}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums text-muted-foreground">{prayer.sunrise}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{prayer.dhuhr}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{prayer.asr}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{prayer.maghrib}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{prayer.isha}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile: Simplified List */}
          <div className="md:hidden space-y-2">
            {prayers.map((prayer) => {
              const isToday = isCurrentMonth && prayer.day === today.getDate()
              return (
                <button
                  key={prayer.day}
                  onClick={() => handleDayClick(prayer)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm transition-all text-left",
                    isToday ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-heading font-medium", isToday && "text-primary font-bold")}>
                          {monthNames[selectedMonth - 1].slice(0, 3)} {prayer.day}
                        </span>
                        {isToday && (
                          <Badge variant="default" className="text-[10px] h-5 bg-primary rounded-full px-2">Today</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="text-right space-y-0.5">
                      <span className="block text-xs uppercase tracking-wider opacity-70">Fajr &bull; Maghrib</span>
                      <span className="block font-medium text-foreground tabular-nums">{prayer.fajr} &bull; {prayer.maghrib}</span>
                    </div>
                    <ChevronIcon className="w-4 h-4 text-primary/50" />
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
