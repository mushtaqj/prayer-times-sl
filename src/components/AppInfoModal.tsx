import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Globe, BookOpen, Calculator, Bell, Github, Heart, ExternalLink } from 'lucide-react'

interface AppInfoModalProps {
    isOpen: boolean
    onClose: () => void
}

const APP_VERSION = '1.0.0'

export function AppInfoModal({ isOpen, onClose }: AppInfoModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 max-h-[85vh] overflow-y-auto">
                {/* Header with Logo */}
                <div className="flex flex-col items-center text-center pt-2 pb-4">
                    <img
                        src="/icon-192x192.png"
                        alt="Prayer Times Logo"
                        className="w-20 h-20 rounded-2xl shadow-lg mb-4"
                    />
                    <h2 className="text-2xl font-serif font-semibold text-primary">
                        Prayer Times
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Comprehensive Islamic utilities for Sri Lanka
                    </p>
                    <span className="mt-2 px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        v{APP_VERSION}
                    </span>
                </div>

                {/* Features Section */}
                <div className="space-y-4 py-4 border-t border-border/40">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        Features
                    </h3>

                    {/* Prayer Calculation */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 bg-primary/10 p-2 rounded-lg h-fit text-primary">
                            <Calculator className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">Prayer Times</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Based on <span className="font-medium text-foreground/80">ACJU</span> methodology for all 25 districts
                            </p>
                        </div>
                    </div>

                    {/* Hijri Calendar */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 bg-emerald-500/10 p-2 rounded-lg h-fit text-emerald-600 dark:text-emerald-400">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">Hijri Calendar</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Local moon sighting data with Islamic events
                            </p>
                        </div>
                    </div>

                    {/* Virtues */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 bg-amber-500/10 p-2 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">Islamic References</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Virtues from Quran & authentic Hadith collections
                            </p>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="flex gap-3">
                        <div className="mt-0.5 bg-blue-500/10 p-2 rounded-lg h-fit text-blue-600 dark:text-blue-400">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">Push Notifications</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                Get reminded before each prayer time
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Source */}
                <div className="py-4 border-t border-border/40">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
                        Data Source
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Prayer times provided by the <span className="font-medium text-foreground/80">All Ceylon Jamiyyathul Ulama (ACJU)</span>,
                            the official Islamic body of Sri Lanka recognized for religious guidance.
                        </p>
                    </div>
                </div>

                {/* Developer Section */}
                <div className="py-4 border-t border-border/40">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
                        Developer
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center text-primary font-semibold">
                            M
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">Mushtaq Jameel</p>
                            <p className="text-xs text-muted-foreground">Software Engineer</p>
                        </div>
                        <a
                            href="https://github.com/mushtaqj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border/40">
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the Muslim community
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/mushtaqj/prayer-times-sl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                                <Github className="w-3 h-3" />
                                Source Code
                            </a>
                            <a
                                href="https://github.com/mushtaqj/prayer-times-sl/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Report Issue
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <Button onClick={onClose} variant="outline" size="sm" className="px-8">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
