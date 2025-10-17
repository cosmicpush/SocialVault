const { PrismaClient } = require('@prisma/client')
const { authenticator } = require('otplib')
const CryptoJS = require('crypto-js')

const prisma = new PrismaClient()

const key = process.env.ENCRYPTION_KEY

function encrypt(text) {
  if (!text) return text
  const paddedText = `v1:${text}`
  return CryptoJS.AES.encrypt(paddedText, key).toString()
}

async function createUser(username, password) {
  try {
    // Generate 2FA secret
    const secret = authenticator.generateSecret()
    const twoFAUrl = authenticator.keyuri(username, 'BharatiyanNews', secret)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        username,
        password: encrypt(password),
        twoFASecret: secret,
        twoFAEnabled: true,
      },
    })

    console.log('User created successfully!')
    console.log('Username:', username)
    console.log('2FA Secret:', secret)
    console.log('2FA URL:', twoFAUrl)
    console.log('\nPlease scan this QR code with your authenticator app:')
    console.log(
      'https://www.google.com/chart?chs=200x200&chld=M|0&cht=qr&chl=' +
        encodeURIComponent(twoFAUrl)
    )

    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get username and password from command line arguments
const username = process.argv[2]
const password = process.argv[3]

if (!username || !password) {
  console.log('Usage: node create-user.js <username> <password>')
  process.exit(1)
}

createUser(username, password)
