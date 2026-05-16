import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, botToken, chatId } = body

    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Bot Token is required' },
        { status: 400 }
      )
    }

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // If image provided (data URL), send as photo with multipart/form-data
    if (body.image) {
      const match = String(body.image).match(/^data:(.+);base64,(.*)$/)
      if (!match) {
        return NextResponse.json({ success: false, error: 'Invalid image data' }, { status: 400 })
      }
      const mime = match[1]
      const b64 = match[2]
      const buffer = Buffer.from(b64, 'base64')

      const formData = new FormData()
      formData.append('chat_id', String(chatId))
      if (message) formData.append('caption', String(message))
      // filename with appropriate extension
      const ext = mime.split('/')[1] || 'jpg'
      const fileName = `photo.${ext}`
      const blob = new Blob([buffer], { type: mime })
      // @ts-ignore - add Blob with filename
      formData.append('photo', blob, fileName)

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.ok) {
        return NextResponse.json({ success: true, data })
      }
      return NextResponse.json({ success: false, error: data.description || 'Failed to send photo' }, { status: 400 })
    }

    // fallback: send text message
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const data = await response.json()

    if (data.ok) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json(
        { success: false, error: data.description || 'Failed to send message' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Telegram error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
