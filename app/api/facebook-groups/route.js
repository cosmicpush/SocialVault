import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
  try {
    const groups = await prisma.facebookGroup.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    })

    return NextResponse.json(
      groups.map((group) => ({
        id: group.id,
        name: group.name,
        order: group.order,
        accountCount: group._count.accounts,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }))
    )
  } catch (error) {
    console.error('Error fetching Facebook groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    const maxOrderGroup = await prisma.facebookGroup.findFirst({
      orderBy: { order: 'desc' },
    })
    const nextOrder = (maxOrderGroup?.order ?? -1) + 1

    const group = await prisma.facebookGroup.create({
      data: {
        name: name.trim(),
        order: nextOrder,
      },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error creating group:', error)
    let message = 'Failed to create group'
    if (error.code === 'P2002') {
      message = 'A group with this name already exists'
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const { id, name } = await req.json()

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const group = await prisma.facebookGroup.update({
      where: { id: Number(id) },
      data: { name: name.trim() },
    })

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error updating group:', error)
    let message = 'Failed to update group'
    if (error.code === 'P2002') {
      message = 'A group with this name already exists'
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Group id is required' },
        { status: 400 }
      )
    }

    const accountCount = await prisma.facebookAccount.count({
      where: { groupId: Number(id) },
    })

    if (accountCount > 0) {
      return NextResponse.json(
        {
          error:
            'Group still has accounts. Move or delete them before removing the group.',
        },
        { status: 400 }
      )
    }

    await prisma.facebookGroup.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}

