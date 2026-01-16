import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const workout = req.body

    if (!workout.id) {
      return res.status(400).json({ success: false, error: 'Workout ID required' })
    }

    const key = `workout:${workout.id}`

    // Store with 1 year expiration (31536000 seconds)
    await kv.set(key, workout, { ex: 31536000 })

    console.log(`Workout saved: ${key}`)
    res.status(200).json({
      success: true,
      id: workout.id,
      key
    })
  } catch (error: any) {
    console.error('Error saving workout:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
