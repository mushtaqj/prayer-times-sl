// Email templates for the Prayer Times admin system

export function confirmationEmail({ days, confirmUrl }) {
  return {
    subject: `Confirm Hijri Calendar Update (${days} days)`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #dcfce7; border-radius: 50%; padding: 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
        </div>

        <h2 style="color: #166534; text-align: center; margin-bottom: 16px;">
          Confirm Hijri Calendar Update
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          A request was made to complete the current Hijri month with <strong>${days} days</strong>.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}"
             style="display: inline-block; background: #166534; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Confirm Update
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          This link expires in 15 minutes.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  }
}

export function rollbackEmail({ confirmUrl }) {
  return {
    subject: 'Confirm Hijri Calendar Rollback',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #fef3c7; border-radius: 50%; padding: 16px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </div>
        </div>

        <h2 style="color: #b45309; text-align: center; margin-bottom: 16px;">
          Confirm Hijri Calendar Rollback
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          A request was made to <strong>rollback</strong> the last Hijri month completion. This will:
        </p>

        <ul style="color: #374151; line-height: 1.8; margin: 16px 0; padding-left: 20px;">
          <li>Remove the current ongoing month</li>
          <li>Restore the previous month to ongoing status</li>
        </ul>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}"
             style="display: inline-block; background: #b45309; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Confirm Rollback
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          This link expires in 15 minutes.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  }
}
