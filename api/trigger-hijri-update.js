// Vercel Serverless Function to trigger GitHub workflow
// POST /api/trigger-hijri-update

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify admin secret
  const adminSecret = req.headers['x-admin-secret']
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { days } = req.body

  // Validate input
  if (!days || (days !== 29 && days !== 30)) {
    return res.status(400).json({ error: 'Days must be 29 or 30' })
  }

  // GitHub API to trigger workflow_dispatch
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_REPO // format: owner/repo

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/update-hijri.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            days: String(days),
          },
        }),
      }
    )

    if (response.status === 204) {
      return res.status(200).json({
        success: true,
        message: 'Update triggered! The current month will be completed and next month created. Redeploy in ~2 minutes.'
      })
    }

    const errorData = await response.text()
    console.error('GitHub API error:', response.status, errorData)
    return res.status(response.status).json({
      error: 'Failed to trigger workflow',
      details: errorData
    })
  } catch (error) {
    console.error('Error triggering workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
