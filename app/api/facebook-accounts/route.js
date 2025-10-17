import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import {
  encryptFacebookAccount,
  decryptFacebookAccount,
  prepareForExport,
} from '@/utils/crypto'

// Add this new function to get unique tags
async function getUniqueTags() {
  try {
    const accounts = await prisma.facebookAccount.findMany({
      select: { tags: true },
    })

    // Decrypt accounts using existing decryptFacebookAccount function
    const allTags = accounts
      .map((account) => decryptFacebookAccount(account).tags) // Use decryptFacebookAccount
      .filter(Boolean) // Remove any null/undefined values
      .map((tags) => tags.split(','))
      .flat()
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    return [...new Set(allTags)]
  } catch (error) {
    console.error('Error getting unique tags:', error)
    return []
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const getTags = url.searchParams.get('getTags')

    if (getTags === 'true') {
      const tags = await getUniqueTags()
      return new Response(JSON.stringify(tags), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Fetching Facebook accounts...')
    const accounts = await prisma.facebookAccount.findMany({
      orderBy: { order: 'asc' }
    })
    console.log(`Successfully fetched ${accounts.length} accounts`)

    const decryptedAccounts = accounts.map((account) =>
      decryptFacebookAccount(account)
    )

    return new Response(JSON.stringify(decryptedAccounts), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching Facebook accounts:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch accounts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(req) {
  try {
    const data = await req.json()
    
    // Handle reorder request
    if (data.action === 'reorder') {
      const { accounts } = data
      
      // Update the order for each account
      const updatePromises = accounts.map((account, index) =>
        prisma.facebookAccount.update({
          where: { id: account.id },
          data: { order: index }
        })
      )
      
      await Promise.all(updatePromises)
      
      // Return the updated accounts in the new order
      const updatedAccounts = await prisma.facebookAccount.findMany({
        orderBy: { order: 'asc' }
      })
      
      const decryptedAccounts = updatedAccounts.map(account =>
        decryptFacebookAccount(account)
      )
      
      return NextResponse.json(decryptedAccounts)
    }
    
    // Regular account creation
    const encryptedData = encryptFacebookAccount(data)
    
    // Get the highest order value to append new account at the end
    const maxOrderAccount = await prisma.facebookAccount.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (maxOrderAccount?.order ?? -1) + 1
    
    const account = await prisma.facebookAccount.create({
      data: {
        userId: encryptedData.userId,
        password: encryptedData.password,
        email: encryptedData.email,
        emailPassword: encryptedData.emailPassword || null,
        recoveryEmail: encryptedData.recoveryEmail || null,
        twoFASecret: encryptedData.twoFASecret || null,
        tags: encryptedData.tags || '',
        dob: data.dob || null,
        order: nextOrder,
      },
    })
    return NextResponse.json(decryptFacebookAccount(account))
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Error creating account' },
      { status: 500 }
    )
  }
}

export async function PUT(req) {
  try {
    const data = await req.json()
    const encryptedData = encryptFacebookAccount(data)
    const account = await prisma.facebookAccount.update({
      where: { id: data.id },
      data: {
        userId: encryptedData.userId,
        password: encryptedData.password,
        email: encryptedData.email,
        emailPassword: encryptedData.emailPassword || null,
        recoveryEmail: encryptedData.recoveryEmail || null,
        twoFASecret: encryptedData.twoFASecret || null,
        tags: encryptedData.tags || '',
        dob: data.dob || null,
        // Don't update order here, only via reorder action
      },
    })
    return NextResponse.json(decryptFacebookAccount(account))
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Error updating account' },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const data = await req.json()
    await prisma.facebookAccount.delete({
      where: { id: data.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    )
  }
}

export async function PATCH(req) {
  try {
    const { format = 'text' } = await req.json()
    const accounts = await prisma.facebookAccount.findMany({
      orderBy: { order: 'asc' },
    })

    const content = prepareForExport(accounts, format)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': format === 'json' ? 'application/json' : 'text/plain',
        'Content-Disposition': `attachment; filename="facebook-accounts.${format === 'json' ? 'json' : 'txt'}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting accounts:', error)
    return NextResponse.json(
      { error: 'Error exporting accounts' },
      { status: 500 }
    )
  }
}
