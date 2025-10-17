import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Error fetching messages' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const data = await req.json()
    const message = await prisma.message.create({
      data: {
        content: data.content,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
      },
    })
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Error creating message' },
      { status: 500 }
    )
  }
}

export async function PUT(req) {
  try {
    const data = await req.json()
    const message = await prisma.message.update({
      where: { id: data.id },
      data: {
        content: data.content,
        isEdited: true,
      },
    })
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Error updating message' },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const data = await req.json()
    await prisma.message.delete({
      where: { id: data.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Error deleting message' },
      { status: 500 }
    )
  }
}
