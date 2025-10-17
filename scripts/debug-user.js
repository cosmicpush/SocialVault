'use strict'

const { PrismaClient } = require('@prisma/client')
const CryptoJS = require('crypto-js')
require('dotenv').config()

const prisma = new PrismaClient()
const key = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY

if (!key) {
  console.error('Error: ENCRYPTION_KEY not found in environment variables')
  process.exit(1)
}

function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, key)
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8)
    if (!decryptedText) return encryptedText

    if (decryptedText.startsWith('v1:')) {
      return decryptedText.substring(3)
    }
    return decryptedText
  } catch (error) {
    console.error('Decryption error:', error)
    return 'Error: Failed to decrypt'
  }
}

async function debugUser(username) {
  try {
    console.log('Looking up user:', username)
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      console.log('User not found in database')
      return
    }

    console.log('\nUser details:')
    console.log('ID:', user.id)
    console.log('Username:', user.username)
    console.log('Encrypted password:', user.password)
    console.log('Decrypted password:', decrypt(user.password))
    console.log('2FA Enabled:', user.twoFAEnabled)
    console.log('2FA Secret exists:', !!user.twoFASecret)
    console.log(
      'Last login:',
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'
    )
    console.log('Created at:', new Date(user.createdAt).toLocaleString())
    console.log('Updated at:', new Date(user.updatedAt).toLocaleString())

    // Test password decryption
    try {
      const decryptedPass = decrypt(user.password)
      if (decryptedPass === 'Error: Failed to decrypt') {
        console.log(
          '\nWarning: Password decryption failed - encryption key might be incorrect'
        )
      }
    } catch (error) {
      console.log('\nWarning: Password decryption failed:', error.message)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get username from command line arguments
const username = process.argv[2]
if (!username) {
  console.log('Usage: node debug-user.js <username>')
  process.exit(1)
}

debugUser(username)
