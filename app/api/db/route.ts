import { NextResponse } from 'next/server'
import { initDb } from '../../../lib/db'

export async function GET() {
  try {
    await initDb()
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      links: {
        createReports: '/api/reports',
        getReports: '/api/reports',
        telegram: '/api/telegram',
        initDb: '/api/db',
      },
    })
  } catch (error) {
    console.error('GET /api/db error', error)
    return NextResponse.json({ success: false, error: 'Failed to initialize database' }, { status: 500 })
  }
}
