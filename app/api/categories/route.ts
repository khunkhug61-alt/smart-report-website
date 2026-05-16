import { NextResponse } from 'next/server'
import { query } from '../../../lib/db'

export async function GET() {
  try {
    const res = await query('SELECT id, name, icon FROM categories ORDER BY id')
    return NextResponse.json({ success: true, data: res.rows })
  } catch (error) {
    console.error('GET /api/categories error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
