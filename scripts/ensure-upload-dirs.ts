import fs from 'fs/promises'
import path from 'path'

async function ensureUploadDirs() {
  const dirs = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join(process.cwd(), 'public', 'images')
  ]

  for (const dir of dirs) {
    try {
      await fs.access(dir)
      console.log(`Directory exists: ${dir}`)
    } catch {
      await fs.mkdir(dir, { recursive: true })
      console.log(`Created directory: ${dir}`)
    }
  }

  // Проверяем наличие placeholder
  const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder-course.jpg')
  try {
    await fs.access(placeholderPath)
    console.log('Placeholder exists')
  } catch {
    console.error('Missing placeholder image:', placeholderPath)
  }
}

ensureUploadDirs() 