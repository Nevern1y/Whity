import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

const updateFile = (filePath: string) => {
  const content = readFileSync(filePath, 'utf-8')
  
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

  // Replace imports
  newContent = newContent.replace(
    /import\s*{([^}]*)}\s*from\s*["']framer-motion["']/g,
    (match, importString) => {
      // Keep AnimatePresence if it's imported
      const hasAnimatePresence = importString.includes('AnimatePresence')
      const cleanedImports = importString
        .split(',')
        .map((i: string) => i.trim())
        .filter((i: string) => i !== 'motion' && !i.startsWith('type'))
        .filter((i: string) => i !== 'HTMLMotionProps')
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

  // Add m declaration after use client directive
  if (newContent.includes('"use client"')) {
    newContent = newContent.replace(
      /"use client"(\s*)/,
      `"use client"\n\nconst { m } = useAnimation()\n`
    )
  }

  // Replace motion components with m components
  newContent = newContent.replace(/motion\.([\w]+)/g, 'm.$1')

  // Write back to file if changes were made
  if (content !== newContent) {
    writeFileSync(filePath, newContent)
    console.log(`Updated ${filePath}`)
  }
}

const main = async () => {
  try {
    const files = await glob('**/*.{ts,tsx}', {
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
        const content = readFileSync(file, 'utf-8')
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