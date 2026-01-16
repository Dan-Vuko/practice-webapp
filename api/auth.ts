import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body
  const correctPassword = process.env.AUTH_PASSWORD

  if (!correctPassword) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' })
  }

  if (password === correctPassword) {
    // Set HTTP-only cookie for 30 days
    res.setHeader('Set-Cookie', [
      `portal_auth=${correctPassword}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
    ])

    return res.status(200).json({ success: true })
  }

  return res.status(401).json({ success: false, error: 'Invalid password' })
}
