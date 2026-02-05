import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    // Fetch the image from Google Drive
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from Google Drive' },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    
    // Return the image with proper headers to prevent CORB
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}
