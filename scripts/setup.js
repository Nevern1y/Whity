const fs = require('fs')
const path = require('path')

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '') 