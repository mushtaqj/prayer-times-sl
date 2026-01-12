import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HijriMonthInfo } from '@/lib/data/types'

interface JumpToDateDialogProps {
  availableYears: number[]
  hijriMonths: HijriMonthInfo[]
  onJump: (year: number, month: number) => void
}

export function JumpToDateDialog({ availableYears, hijriMonths, onJump }: JumpToDateDialogProps) {
  const [open, setOpen] = useState(false)
  const [jumpMode, setJumpMode] = useState<'hijri' | 'gregorian'>('hijri')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')

  const handleJump = () => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    if (year && month) {
      onJump(year, month)
      setOpen(false)
      setSelectedMonth('')
      setSelectedYear('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs flex-1">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          Jump to Date
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jump to Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Button
              variant={jumpMode === 'hijri' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setJumpMode('hijri')}
              className="flex-1"
            >
              Hijri
            </Button>
            <Button
              variant={jumpMode === 'gregorian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setJumpMode('gregorian')}
              className="flex-1"
              disabled
            >
              Gregorian
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {hijriMonths.map((month) => (
                    <SelectItem key={month.number} value={String(month.number)}>
                      {month.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears?.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year} AH
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleJump} className="w-full">
            Go to Date
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
