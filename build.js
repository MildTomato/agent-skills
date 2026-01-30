#!/usr/bin/env node
/**
 * Build script to compile reference/rules files into AGENTS.md for all skills
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SKILLS_DIR = __dirname

/**
 * Get skill name from SKILL.md frontmatter
 */
async function getSkillName(skillDir) {
  try {
    const skillFile = join(skillDir, 'SKILL.md')
    const content = await readFile(skillFile, 'utf-8')
    const match = content.match(/^name:\s*(.+)$/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

/**
 * Get skill title from SKILL.md
 */
async function getSkillTitle(skillDir) {
  try {
    const skillFile = join(skillDir, 'SKILL.md')
    const content = await readFile(skillFile, 'utf-8')
    // Try to get from first H1 after frontmatter
    const lines = content.split('\n')
    let inFrontmatter = false
    for (const line of lines) {
      if (line.trim() === '---') {
        inFrontmatter = !inFrontmatter
        continue
      }
      if (!inFrontmatter && line.startsWith('# ')) {
        return line.replace(/^#\s+/, '').trim()
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Build AGENTS.md for a single skill
 */
async function buildSkill(skillDir, skillName) {
  const referencesDir = join(skillDir, 'references')
  const rulesDir = join(skillDir, 'rules')

  // Check which directory exists (prefer rules over references)
  let sourceDir = null
  if (
    await stat(rulesDir)
      .then(() => true)
      .catch(() => false)
  ) {
    sourceDir = rulesDir
  } else if (
    await stat(referencesDir)
      .then(() => true)
      .catch(() => false)
  ) {
    sourceDir = referencesDir
  } else {
    console.log(`  ⚠ Skipping ${skillName}: no references/ or rules/ directory`)
    return false
  }

  console.log(`\nBuilding ${skillName}...`)

  // Read metadata if it exists
  let metadata = {
    version: '1.0.0',
    organization: skillName,
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    abstract: `Comprehensive guide for ${skillName}, designed for AI agents and LLMs.`,
    references: [],
  }

  try {
    const metadataFile = join(skillDir, 'metadata.json')
    const metadataContent = await readFile(metadataFile, 'utf-8')
    metadata = { ...metadata, ...JSON.parse(metadataContent) }
  } catch {
    // Use defaults
  }

  // Get skill title
  const skillTitle = (await getSkillTitle(skillDir)) || skillName

  // Read all markdown files from source directory
  const files = await readdir(sourceDir)
  const mdFiles = files
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
    .sort()

  if (mdFiles.length === 0) {
    console.log(`  ⚠ Skipping ${skillName}: no markdown files found`)
    return false
  }

  // Build document
  let md = `# ${skillTitle}\n\n`
  md += `**Version ${metadata.version}**  \n`
  md += `${metadata.organization}  \n`
  md += `${metadata.date}\n\n`
  md += `> **Note:**  \n`
  md += `> This document is mainly for agents and LLMs to follow when maintaining,  \n`
  md += `> generating, or refactoring ${skillTitle.toLowerCase()}. Humans  \n`
  md += `> may also find it useful, but guidance here is optimized for automation  \n`
  md += `> and consistency by AI-assisted workflows.\n\n`
  md += `---\n\n`
  md += `## Abstract\n\n`
  md += `${metadata.abstract}\n\n`
  md += `---\n\n`
  md += `## Table of Contents\n\n`

  // Generate TOC
  mdFiles.forEach((filename, index) => {
    const title = filename
      .replace('.md', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
    const anchor = filename
      .replace('.md', '')
      .toLowerCase()
      .replace(/[^\w-]/g, '-')
    md += `${index + 1}. [${title}](#${anchor})\n`
  })

  md += `\n---\n\n`

  // Read and combine all files
  for (let i = 0; i < mdFiles.length; i++) {
    const filename = mdFiles[i]
    const filePath = join(sourceDir, filename)

    try {
      const content = await readFile(filePath, 'utf-8')
      const title = filename
        .replace('.md', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())

      // Remove the first H1 if it exists (we'll use our own)
      const cleanedContent = content.replace(/^#\s+.*$/m, '').trim()

      md += `## ${i + 1}. ${title}\n\n`
      md += `${cleanedContent}\n\n`
      md += `---\n\n`

      console.log(`  ✓ Processed ${filename}`)
    } catch (error) {
      console.error(`  ✗ Error reading ${filename}:`, error.message)
    }
  }

  // Add references section
  if (metadata.references && metadata.references.length > 0) {
    md += `## References\n\n`
    metadata.references.forEach((ref, i) => {
      md += `${i + 1}. [${ref}](${ref})\n`
    })
  }

  // Write output
  const outputFile = join(skillDir, 'AGENTS.md')
  await writeFile(outputFile, md, 'utf-8')

  console.log(`  ✓ Built AGENTS.md successfully`)
  return true
}

/**
 * Main build function
 */
async function build() {
  console.log('Building AGENTS.md for all skills...\n')

  // Get all directories in skills folder
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true })
  const skillDirs = entries
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'reference'
    )
    .map((entry) => ({
      name: entry.name,
      path: join(SKILLS_DIR, entry.name),
    }))

  if (skillDirs.length === 0) {
    console.log('No skills found')
    return
  }

  let built = 0
  for (const skillDir of skillDirs) {
    const skillName = (await getSkillName(skillDir.path)) || skillDir.name
    const success = await buildSkill(skillDir.path, skillName)
    if (success) built++
  }

  console.log(`\n✓ Build complete: ${built} skill(s) built`)
}

build().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
