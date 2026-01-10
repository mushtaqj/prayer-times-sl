import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Globe, BookOpen, Calculator, Moon } from 'lucide-react'

interface AppInfoModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AppInfoModal({ isOpen, onClose }: AppInfoModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-serif text-primary">
                        <Moon className="w-5 h-5" />
                        About Prayer Times
                    </DialogTitle>
                    <DialogDescription>
                        Comprehensive Islamic utilities for Sri Lanka
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Section 1: Prayer Times */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                            <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Prayer Calculation</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Prayer times are calculated based on the **All Ceylon Jamiyyathul Ulama (ACJU)** methodology for Sri Lankan districts.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Hijri Calendar */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-emerald-500/10 p-2 rounded-full h-fit text-emerald-600 dark:text-emerald-400">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Hijri Calendar</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Dates are synchronized with local moon sighting data officially announced in Sri Lanka and region-specific adjustments.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Virtues Sources */}
                    <div className="flex gap-4">
                        <div className="mt-1 bg-amber-500/10 p-2 rounded-full h-fit text-amber-600 dark:text-amber-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Virtues & References</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Virtues of months and events are sourced from the **Holy Quran** and authentic **Hadith** (Sahih Bukhari, Muslim, Tirmidhi).
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/40 text-center">
                        <p className="text-xs text-muted-foreground">Version 1.0.0 • Developed with Ehsan</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose} variant="outline">Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
