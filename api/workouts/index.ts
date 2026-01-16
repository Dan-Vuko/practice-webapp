import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const keys = await kv.keys('workout:*')
    const workouts = await Promise.all(
      keys.map(key => kv.get(key))
    )

    res.status(200).json({
      success: true,
      workouts: workouts.filter(Boolean)
    })
  } catch (error: any) {
    console.error('Error fetching workouts:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      workouts: []
    })
  }
}
