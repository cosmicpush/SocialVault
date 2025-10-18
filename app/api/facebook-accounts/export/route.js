import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { prepareForExport } from '@/utils/crypto'

export async function GET() {
  try {
    const accounts = await prisma.facebookAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        group: true, // Include group data for export
      },
    })

    const content = prepareForExport(accounts)

    // Set appropriate headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'text/plain')
    headers.set(
      'Content-Disposition',
      `attachment; filename="facebook-accounts-${new Date().toISOString().split('T')[0]}.txt"`
    )

    return new NextResponse(content, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error exporting accounts:', error)
    return NextResponse.json(
      { error: 'Error exporting accounts' },
      { status: 500 }
    )
  }
}
