import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const WORKOUT_DIR = path.join(__dirname, 'workout-history')

// Create workout-history directory if it doesn't exist
if (!fs.existsSync(WORKOUT_DIR)) {
  fs.mkdirSync(WORKOUT_DIR, { recursive: true })
}

app.get('/api/workouts', (req, res) => {
  try {
    const files = fs.readdirSync(WORKOUT_DIR).filter(f => f.endsWith('.json'))
    const workouts = files.map(file => {
      const filepath = path.join(WORKOUT_DIR, file)
      const content = fs.readFileSync(filepath, 'utf8')
      return JSON.parse(content)
    })
    res.json({ success: true, workouts })
  } catch (error) {
    console.error('❌ Error reading workouts:', error)
    res.status(500).json({ success: false, error: error.message, workouts: [] })
  }
})

app.post('/api/save-workout', (req, res) => {
  try {
    const workout = req.body
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `workout-${timestamp}.json`
    const filepath = path.join(WORKOUT_DIR, filename)

    fs.writeFileSync(filepath, JSON.stringify(workout, null, 2))

    console.log(`✅ Workout saved: ${filename}`)
    res.json({ success: true, filename, path: filepath })
  } catch (error) {
    console.error('❌ Error saving workout:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/api/workouts/:id', (req, res) => {
  try {
    const { id } = req.params
    const files = fs.readdirSync(WORKOUT_DIR).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filepath = path.join(WORKOUT_DIR, file)
      const content = JSON.parse(fs.readFileSync(filepath, 'utf8'))
      if (content.id === id) {
        fs.unlinkSync(filepath)
        console.log(`✅ Workout deleted: ${file}`)
        return res.json({ success: true })
      }
    }

    res.status(404).json({ success: false, error: 'Workout not found' })
  } catch (error) {
    console.error('❌ Error deleting workout:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = 3004
app.listen(PORT, () => {
  console.log(`📁 Workout save server running on http://localhost:${PORT}`)
  console.log(`📂 Saving workouts to: ${WORKOUT_DIR}`)
})
