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
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.toString()
  return proxyToApi(`/api/marks${query ? `?${query}` : ''}`)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const proxiedBody = {
    studentId: body.studentId ?? body.student_id,
    subject: body.subject,
    marksObtained: body.marksObtained ?? body.marks_obtained,
    homeworkStatus: body.homeworkStatus ?? body.homework_status,
    comments: body.comments ?? body.teacher_comments,
  }

  return proxyToApi('/api/marks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proxiedBody),
  })
}
