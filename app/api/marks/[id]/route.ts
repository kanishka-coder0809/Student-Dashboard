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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToApi(`/api/marks/${params.id}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const proxiedBody = {
    subject: body.subject,
    marksObtained: body.marksObtained ?? body.marks_obtained,
    homeworkStatus: body.homeworkStatus ?? body.homework_status,
    comments: body.comments ?? body.teacher_comments,
  }

  return proxyToApi(`/api/marks/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proxiedBody),
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToApi(`/api/marks/${params.id}`, { method: 'DELETE' })
}
