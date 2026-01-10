import Markdown from 'react-markdown'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

interface VirtuesSheetProps {
    isOpen: boolean
    onClose: () => void
    title: string
    content: string
}

export function VirtuesSheet({ isOpen, onClose, title, content }: VirtuesSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh] sm:max-w-xl sm:mx-auto rounded-t-[20px] sm:rounded-t-none sm:rounded-l-xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-t border-border/50">
                <div className="h-full flex flex-col">
                    <SheetHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
                        <SheetTitle className="text-xl font-serif text-primary">{title}</SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground hidden">
                            Details and virtues
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        <div className="prose dark:prose-invert prose-emerald prose-sm max-w-none leading-relaxed">
                            <Markdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-primary mb-4 mt-2" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-foreground mb-3 mt-6 border-b border-border/50 pb-1" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-foreground/90 mb-2 mt-4" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground/90" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="marker:text-primary/70" {...props} />,
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 bg-primary/5 rounded-r-md italic text-foreground/80" {...props} />
                                    ),
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                }}
                            >
                                {content}
                            </Markdown>
                        </div>
                        {/* Bottom spacer */}
                        <div className="h-8" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
