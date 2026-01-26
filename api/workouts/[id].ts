import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid workout ID' })
    }

    // Find the workout by scanning all keys
    const keys = await kv.keys('workout:*')
    const workouts = await Promise.all(
      keys.map(async key => ({
        key,
        data: await kv.get(key)
      }))
    )

    const match = workouts.find(w => (w.data as any)?.id === id)

    if (match) {
      await kv.del(match.key)
      console.log(`Workout deleted: ${match.key}`)
      res.status(200).json({ success: true })
    } else {
      res.status(404).json({ success: false, error: 'Workout not found' })
    }
  } catch (error: any) {
    console.error('Error deleting workout:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
