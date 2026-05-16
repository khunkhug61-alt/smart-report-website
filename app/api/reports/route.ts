import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../lib/db'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const editToken = url.searchParams.get('editToken')

    if (id) {
      const res = await query('SELECT * FROM reports WHERE id = $1', [id])
      return NextResponse.json({ success: true, data: res.rows[0] || null })
    }

    if (editToken) {
      const res = await query('SELECT * FROM reports WHERE edit_token = $1', [editToken])
      return NextResponse.json({ success: true, data: res.rows[0] || null })
    }

    // list all
    const res = await query('SELECT * FROM reports ORDER BY created_at DESC')
    return NextResponse.json({ success: true, data: res.rows })
  } catch (error) {
    console.error('GET /api/reports error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { category_id, category, description, location, image_url } = body

    if (!description) {
      return NextResponse.json({ success: false, error: 'Description is required' }, { status: 400 })
    }

    // resolve category_id from category name if provided
    if (!category_id && category) {
      const catRes = await query('SELECT id FROM categories WHERE name = $1 LIMIT 1', [category])
      if (catRes.rows[0]) {
        category_id = catRes.rows[0].id
      } else {
        const insertCat = await query('INSERT INTO categories(name, icon) VALUES($1,$2) RETURNING id', [category, null])
        category_id = insertCat.rows[0].id
      }
    }

    const id = randomUUID()
    const editToken = randomUUID() + randomUUID()
    const status = 'pending'

    const insert = await query(
      `INSERT INTO reports(id, category_id, description, location, image_url, status, edit_token, created_at, updated_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,now(),now()) RETURNING *`,
      [id, category_id ? Number(category_id) : null, description, location || null, image_url || null, status, editToken]
    )

    return NextResponse.json({ success: true, data: insert.rows[0] })
  } catch (error) {
    console.error('POST /api/reports error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, updates, editToken } = body

    if (!id && !editToken) {
      return NextResponse.json({ success: false, error: 'id or editToken is required' }, { status: 400 })
    }

    // Build dynamic set clause
    const fields: string[] = []
    const values: any[] = []
    let idx = 1
    for (const key of Object.keys(updates || {})) {
      fields.push(`${key} = $${idx}`)
      values.push((updates as any)[key])
      idx++
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 })
    }

    const whereClause = id ? `id = $${idx}` : `edit_token = $${idx}`
    values.push(id || editToken)

    const q = `UPDATE reports SET ${fields.join(', ')}, updated_at = now() WHERE ${whereClause} RETURNING *`
    const res = await query(q, values)
    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (error) {
    console.error('PUT /api/reports error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const editToken = url.searchParams.get('editToken')

    if (!id && !editToken) {
      return NextResponse.json({ success: false, error: 'id or editToken is required' }, { status: 400 })
    }

    if (id) {
      await query('DELETE FROM reports WHERE id = $1', [id])
      return NextResponse.json({ success: true })
    }

    await query('DELETE FROM reports WHERE edit_token = $1', [editToken])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/reports error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
