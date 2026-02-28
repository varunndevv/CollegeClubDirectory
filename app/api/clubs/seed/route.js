export async function POST(request) {
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'
  
  try {
    const response = await fetch(`${SERVER_URL}/api/clubs/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Seed API error: ${response.status}`)
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json(
      { error: error.message || 'Seed failed' },
      { status: 500 }
    )
  }
}
