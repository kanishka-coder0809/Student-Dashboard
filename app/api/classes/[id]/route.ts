import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import ClassModel from '@/lib/models/Class';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const classItem = await ClassModel.findOne({ _id: params.id }).lean();

    if (!classItem) {
      return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classItem);
  } catch (error) {
    console.error('[API] Error fetching class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid class id' }, { status: 400 });
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
    const updatedClass = await ClassModel.findByIdAndUpdate(
      params.id,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const deletedClass = await ClassModel.findOneAndDelete({ _id: params.id }).lean();

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
