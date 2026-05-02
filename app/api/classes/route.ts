import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ClassModel from '@/lib/models/Class';

export async function GET() {
  try {
    await connectToDatabase();
    const classes = await ClassModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(classes);
  } catch (error) {
    console.error('[API] Error fetching classes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch classes', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const className = String(body.class_name ?? '').trim();
    const section = String(body.section ?? '').trim();
    const description = String(body.description ?? '').trim();

    if (!className) {
      return NextResponse.json(
        { success: false, message: 'class_name is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const createdClass = await ClassModel.create({
      class_name: className,
      section,
      description,
    });

    return NextResponse.json(createdClass, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create class', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('id');

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatePayload: Record<string, string> = {};

    if (body.class_name !== undefined) updatePayload.class_name = String(body.class_name).trim();
    if (body.section !== undefined) updatePayload.section = String(body.section).trim();
    if (body.description !== undefined) updatePayload.description = String(body.description).trim();

    if (updatePayload.class_name !== undefined && !updatePayload.class_name) {
      return NextResponse.json(
        { success: false, message: 'class_name is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedClass = await ClassModel.findOneAndUpdate(
      { _id: classId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedClass) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('[API] Error updating class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update class', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('id');

    if (!classId) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const deletedClass = await ClassModel.findOneAndDelete({ _id: classId }).lean();

    if (!deletedClass) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(deletedClass);
  } catch (error) {
    console.error('[API] Error deleting class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete class', error: String(error) },
      { status: 500 }
    );
  }
}
