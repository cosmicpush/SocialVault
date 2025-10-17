import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { decrypt, encrypt } from '@/utils/crypto'

function tokenizeTags(tagsString) {
  if (!tagsString) return []
  return String(tagsString)
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

function joinTags(tagsArray) {
  return tagsArray.join(', ')
}

// List accounts containing a tag
export async function GET(req) {
  try {
    const url = new URL(req.url)
    const from = url.searchParams.get('from')
    if (!from) return NextResponse.json({ error: 'Missing from' }, { status: 400 })

    const rows = await prisma.facebookAccount.findMany({
      select: { id: true, userId: true, tags: true },
      orderBy: { order: 'asc' },
    })

    const candidates = rows
      .map((row) => {
        const userId = decrypt(row.userId)
        const tags = decrypt(String(row.tags || '')) || ''
        const tokens = tokenizeTags(tags)
        if (!tokens.includes(from)) return null
        return { id: row.id, userId, tags }
      })
      .filter(Boolean)

    return NextResponse.json({ count: candidates.length, candidates })
  } catch (e) {
    console.error('GET /tags error', e)
    return NextResponse.json({ error: 'Failed to list candidates' }, { status: 500 })
  }
}

// Bulk replace in all rows (exact token match)
export async function POST(req) {
  try {
    const { fromTag, toTag } = await req.json()
    if (!fromTag || !toTag)
      return NextResponse.json({ error: 'fromTag and toTag required' }, { status: 400 })

    const rows = await prisma.facebookAccount.findMany({ select: { id: true, tags: true } })

    const updates = []
    let matched = 0
    for (const row of rows) {
      const raw = decrypt(String(row.tags || '')) || ''
      const tokens = tokenizeTags(raw)
      if (tokens.includes(fromTag)) {
        matched += 1
        const newTokens = tokens.map((t) => (t === fromTag ? toTag : t))
        const updated = joinTags(newTokens)
        updates.push(
          prisma.facebookAccount.update({ where: { id: row.id }, data: { tags: encrypt(updated) } })
        )
      }
    }

    if (updates.length === 0) return NextResponse.json({ matched: 0, updated: 0 })
    await prisma.$transaction(updates)
    return NextResponse.json({ matched, updated: updates.length })
  } catch (e) {
    console.error('POST /tags error', e)
    return NextResponse.json({ error: 'Failed to replace tags' }, { status: 500 })
  }
}

// Update tags for a single account (full tags string expected)
export async function PATCH(req) {
  try {
    const { id, tags } = await req.json()
    if (!id || typeof tags !== 'string')
      return NextResponse.json({ error: 'id and tags required' }, { status: 400 })

    await prisma.facebookAccount.update({ where: { id }, data: { tags: encrypt(tags) } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /tags error', e)
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
  }
}

