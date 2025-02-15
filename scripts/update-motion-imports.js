const fs = require('fs')
const path = require('path')
const glob = require('glob')

const updateFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  
  // Skip if file is already using m components
  if (content.includes("const { m } = useAnimation()")) {
    return
  }

  // Skip lib/motion.ts and lib/framer-animations.ts
  if (filePath.includes('lib/motion.ts') || filePath.includes('lib/framer-animations.ts')) {
    return
  }

  // Skip animation-provider.tsx
  if (filePath.includes('animation-provider.tsx')) {
    return
  }

  let newContent = content

  // Remove any existing useAnimation declarations
  newContent = newContent.replace(/const\s*{\s*m\s*}\s*=\s*useAnimation\(\)\s*\n/g, '')

  // Replace imports
  newContent = newContent.replace(
    /import\s*{([^}]*)}\s*from\s*["']framer-motion["']/g,
    (match, importString) => {
      // Keep AnimatePresence if it's imported
      const hasAnimatePresence = importString.includes('AnimatePresence')
      const cleanedImports = importString
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== 'motion' && !i.startsWith('type'))
        .filter(i => i !== 'HTMLMotionProps')
        .filter((i, index, arr) => arr.indexOf(i) === index) // Remove duplicates
        .join(', ')

      const animationImport = 'import { useAnimation } from "@/components/providers/animation-provider"'
      const motionTypesImport = 'import type { HTMLMotionProps } from "framer-motion"'
      
      const importStatements = []
      if (hasAnimatePresence || cleanedImports) {
        importStatements.push(`import { ${hasAnimatePresence ? 'AnimatePresence' : ''}${cleanedImports ? (hasAnimatePresence ? ', ' : '') + cleanedImports : ''} } from "framer-motion"`)
      }
      if (content.includes('HTMLMotionProps')) {
        importStatements.push(motionTypesImport)
      }
      importStatements.push(animationImport)
      
      return importStatements.join('\n')
    }
  )

  // Add m declaration after use client directive and imports
  if (newContent.includes('"use client"')) {
    const lines = newContent.split('\n')
    let lastImportIndex = -1
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import ')) {
        lastImportIndex = i
      }
    }

    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, '', 'const { m } = useAnimation()')
      newContent = lines.join('\n')
    } else {
      newContent = newContent.replace(
        /"use client"(\s*)/,
        `"use client"\n\nconst { m } = useAnimation()\n`
      )
    }
  }

  // Replace motion components with m components
  newContent = newContent.replace(/motion\.([\w]+)/g, 'm.$1')

  // Write back to file if changes were made
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent)
    console.log(`Updated ${filePath}`)
  }
}

const main = async () => {
  try {
    const files = glob.sync('**/*.{ts,tsx}', {
      ignore: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'scripts/**',
        'lib/motion.ts',
        'lib/framer-animations.ts',
        'components/providers/animation-provider.tsx'
      ]
    })

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8')
        if (content.includes('framer-motion')) {
          updateFile(file)
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }

    console.log('Finished updating files')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main() 