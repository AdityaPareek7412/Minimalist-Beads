export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfka0sdnl'
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/${path}`

  try {
    const response = await fetch(cloudinaryUrl, {
      headers: {
        'Accept': 'image/webp,image/*,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      return new Response('Not found', { status: response.status })
    }

    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/webp'

    return new Response(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Timing-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response('Error fetching image', { status: 500 })
  }
}
