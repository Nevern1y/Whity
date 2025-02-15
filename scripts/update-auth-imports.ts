import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

const updateImports = async () => {
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'scripts/**']
  })

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    
    // Replace imports
    const updatedContent = content
      .replace(/from ["']@\/lib\/auth["']/g, 'from "@/auth"')
      .replace(/import \{ auth \} from ["']@\/lib\/auth["']/g, 'import { auth } from "@/auth"')
      .replace(/import \{ authOptions \} from ["']@\/lib\/auth["']/g, 'import { authOptions } from "@/auth"')
      .replace(/import \{ checkAuth \} from ["']@\/lib\/auth["']/g, 'import { auth as checkAuth } from "@/auth"')

    if (content !== updatedContent) {
      console.log(`Updating imports in ${file}`)
      writeFileSync(file, updatedContent, 'utf-8')
    }
  }
}

updateImports().catch(console.error) 