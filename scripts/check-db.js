const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function checkDatabase() {
  console.log('Starting database check...')

  // Define database paths
  const dbPath = '/var/www/bharatiyanews.com/database/dev.db'
  const dbDir = path.dirname(dbPath)

  try {
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`)
      fs.mkdirSync(dbDir, { recursive: true })
    }

    // Check database file
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath)
      console.log('Database file exists:', {
        path: dbPath,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        permissions: stats.mode.toString(8),
        owner: stats.uid,
        group: stats.gid,
      })
    } else {
      console.log(
        `Database file does not exist at ${dbPath}. It will be created by Prisma.`
      )
    }

    // Check Prisma connection
    const prisma = new PrismaClient()
    try {
      console.log('\nTesting database connection...')

      // Test User table
      console.log('\nChecking User table...')
      const users = await prisma.user.findMany()
      console.log(`Found ${users.length} users`)

      if (users.length > 0) {
        console.log('Sample user (username only):', users[0].username)
      }

      // Test Note creation
      console.log('\nTesting Note creation...')
      const testNote = await prisma.note.create({
        data: {
          title: 'Test Note',
          content: 'Test Content',
          tags: 'test',
        },
      })
      console.log('Successfully created test note')

      // Clean up
      await prisma.note.delete({
        where: { id: testNote.id },
      })
      console.log('Successfully deleted test note')

      console.log('\nDatabase check completed successfully')
    } catch (error) {
      console.error('\nError during database operations:', error)
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('\nError checking database:', error)
  }
}

checkDatabase().catch(console.error)
