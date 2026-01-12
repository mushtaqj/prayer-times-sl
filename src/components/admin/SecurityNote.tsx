import { Shield } from 'lucide-react'

export function SecurityNote() {
  return (
    <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border">
      <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Two-Factor Verification
      </h3>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li>1. Enter your authorized email and password</li>
        <li>2. Receive confirmation link via email</li>
        <li>3. Click link to confirm the update</li>
        <li>4. Changes deploy automatically</li>
      </ul>
    </div>
  )
}
