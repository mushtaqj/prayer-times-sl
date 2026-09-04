// HTML page templates for the Prayer Times admin system

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  }
  .icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  h1 { margin-bottom: 12px; font-size: 24px; }
  p { color: #666; margin-bottom: 8px; }
  .note { font-size: 14px; color: #999; }
`

export function successPage({ email, days, isRollback }) {
  const title = isRollback ? 'Rollback Confirmed!' : 'Update Confirmed!'
  const description = isRollback
    ? 'The Hijri calendar rollback has been triggered.'
    : 'The Hijri calendar update has been triggered.'
  const details = isRollback
    ? 'Previous month restored to ongoing status'
    : `Current month completed with ${days} days`
  const bgGradient = isRollback
    ? 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)'
    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
  const iconBg = isRollback ? '#fef3c7' : '#dcfce7'
  const textColor = isRollback ? '#b45309' : '#166534'
  const detailsBg = isRollback ? '#fefce8' : '#f0fdf4'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Prayer Times</title>
      <style>
        ${baseStyles}
        body { background: ${bgGradient}; }
        .icon { background: ${iconBg}; }
        .icon svg { color: ${textColor}; }
        h1 { color: ${textColor}; }
        .details {
          background: ${detailsBg};
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
        }
        .details p { margin: 0; color: ${textColor}; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">
          ${isRollback ? `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          ` : `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          `}
        </div>
        <h1>${title}</h1>
        <p>${description}</p>
        <div class="details">
          <p>${details}</p>
        </div>
        <p class="note">Confirmed by: ${email}</p>
        <p class="note">Changes will be live in ~2 minutes.</p>
      </div>
    </body>
    </html>
  `
}

export function errorPage({ message }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - Prayer Times</title>
      <style>
        ${baseStyles}
        body { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
        .icon { background: #fee2e2; }
        .icon svg { color: #dc2626; }
        h1 { color: #dc2626; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1>Error</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `
}
