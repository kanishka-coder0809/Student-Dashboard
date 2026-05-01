import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function proxyToApi(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, init)
  const text = await response.text()

  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  })
}

export async function GET(request: NextRequest) {
  return proxyToApi('/api/classes')
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return proxyToApi('/api/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
