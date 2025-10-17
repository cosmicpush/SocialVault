// Common headers for API responses
export const noCacheHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Type': 'application/json',
}

// Helper function for successful JSON responses
export function successResponse(data) {
  return new NextResponse(JSON.stringify(data), {
    headers: noCacheHeaders,
  })
}

// Helper function for text file downloads
export function textFileResponse(content, filename) {
  return new Response(Buffer.from(content, 'utf-8'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, must-revalidate, max-age=0',
    },
  })
}

// Helper function for error responses
export function errorResponse(message, status = 500) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: noCacheHeaders,
    }
  )
}
