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
    const groupIdParam = url.searchParams.get('groupId')
    const groupIdFilter = groupIdParam ? Number(groupIdParam) : null

    if (getTags === 'true') {
      const tags = await getUniqueTags()
      return new Response(JSON.stringify(tags), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Fetching Facebook accounts...')
    const accounts = await prisma.facebookAccount.findMany({
      where: groupIdFilter ? { groupId: groupIdFilter } : undefined,
      orderBy: { order: 'asc' },
      include: {
        group: true, // Include group data
      },
    })
    console.log(`Successfully fetched ${accounts.length} accounts`)

    const decryptedAccounts = accounts.map((account) => ({
      ...decryptFacebookAccount(account),
      group: account.group, // Preserve group data after decryption
    }))

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
      const { accounts, groupId } = data

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
        where: groupId ? { groupId: Number(groupId) } : undefined,
        orderBy: { order: 'asc' }
      })

      const decryptedAccounts = updatedAccounts.map(account =>
        decryptFacebookAccount(account)
      )

      return NextResponse.json(decryptedAccounts)
    }

    if (data.action === 'move') {
      const { accountIds = [], targetGroupId } = data

      if (!Array.isArray(accountIds) || accountIds.length === 0 || !targetGroupId) {
        return NextResponse.json(
          { error: 'Invalid move payload' },
          { status: 400 }
        )
      }

      const maxOrder = await prisma.facebookAccount.findFirst({
        where: { groupId: Number(targetGroupId) },
        orderBy: { order: 'desc' },
      })

      let nextOrder = (maxOrder?.order ?? -1) + 1

      for (const id of accountIds) {
        await prisma.facebookAccount.update({
          where: { id: Number(id) },
          data: {
            groupId: Number(targetGroupId),
            order: nextOrder++,
          },
        })
      }

      const updatedAccounts = await prisma.facebookAccount.findMany({
        orderBy: { order: 'asc' },
      })

      return NextResponse.json(
        updatedAccounts.map((account) => decryptFacebookAccount(account))
      )
    }

    // Regular account creation
    const encryptedData = encryptFacebookAccount(data)

    let groupId = data.groupId ? Number(data.groupId) : null
    if (!groupId) {
      const fallbackGroup = await prisma.facebookGroup.findFirst({
        orderBy: { order: 'asc' },
      })
      groupId = fallbackGroup?.id ?? null
    }

    if (!groupId) {
      return NextResponse.json(
        { error: 'No groups available. Create a group first.' },
        { status: 400 }
      )
    }

    // Get the highest order value to append new account at the end
    const maxOrderAccount = await prisma.facebookAccount.findFirst({
      where: {
        groupId,
      },
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
        group: { connect: { id: groupId } },
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
        group: data.groupId
          ? { connect: { id: Number(data.groupId) } }
          : { disconnect: true },
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
      include: {
        group: true, // Include group data for export
      },
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
