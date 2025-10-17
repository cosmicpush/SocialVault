import path from 'path'

export function resolveDbPath() {
  // If DATABASE_URL is already an absolute path, return it
  if (process.env.DATABASE_URL?.startsWith('/')) {
    return process.env.DATABASE_URL
  }

  // Get the project root directory
  const projectRoot = process.cwd()

  // Remove the 'file:' prefix if it exists
  const dbPath =
    process.env.DATABASE_URL?.replace('file:', '') || '../database/dev.db'

  // Resolve the absolute path
  const absolutePath = path.resolve(projectRoot, dbPath)

  // Return with 'file:' prefix
  return `file:${absolutePath}`
}
