import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { MarksModel } from '@/lib/models/Marks'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const studentId = searchParams.get('studentId')
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    // Single mark by ID
    if (id) {
      const mark = await MarksModel.findById(id)
        .populate('studentId', 'name rollNo class')
        .lean()

      if (!mark) {
        return NextResponse.json({ error: 'Mark not found' }, { status: 404 })
      }

      return NextResponse.json(mark)
    }

    // Multiple marks by student ID or all
    let query: any = {}
    if (studentId) {
      query.studentId = studentId
    }

    const marks = await MarksModel.find(query)
      .populate('studentId', 'name rollNo class')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(marks)
  } catch (error) {
    console.error('[Marks GET]', error)
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const marksData = {
      studentId: body.studentId,
      subject: body.subject,
      marksObtained: body.marksObtained,
      maxMarks: body.maxMarks || 100,
      grade: body.grade,
      homeworkStatus: body.homeworkStatus || 'Incomplete',
      teacherComments: body.teacherComments || ''
    }

    const marks = await MarksModel.create(marksData)
    return NextResponse.json(marks, { status: 201 })
  } catch (error: any) {
    console.error('[Marks POST]', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Marks for this student and subject already exist' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create marks' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing marks ID' }, { status: 400 })
    }

    const body = await request.json()
    const marks = await MarksModel.findByIdAndUpdate(id, body, { new: true })

    if (!marks) {
      return NextResponse.json({ error: 'Marks not found' }, { status: 404 })
    }

    return NextResponse.json(marks)
  } catch (error) {
    console.error('[Marks PUT]', error)
    return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing marks ID' }, { status: 400 })
    }

    const marks = await MarksModel.findByIdAndDelete(id)

    if (!marks) {
      return NextResponse.json({ error: 'Marks not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Marks DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete marks' }, { status: 500 })
  }
}
