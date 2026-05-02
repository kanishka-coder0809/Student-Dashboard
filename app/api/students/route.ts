import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { StudentModel } from '@/lib/models/Student'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '1000', 10)

    if (id) {
      const student = await StudentModel.findById(id).lean()
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      return NextResponse.json(student)
    }

    const students = await StudentModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(students)
  } catch (error) {
    console.error('[Students GET]', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()

    const student = await StudentModel.create(body)
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('[Students POST]', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 })
    }

    const body = await request.json()
    const student = await StudentModel.findByIdAndUpdate(id, body, { new: true })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('[Students PUT]', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 })
    }

    const student = await StudentModel.findByIdAndDelete(id)

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Students DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
