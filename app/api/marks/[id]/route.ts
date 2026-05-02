import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('marks')
      .select('*, students(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Mark GET ID]', error);
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const payload: any = {};
    if (body.subject !== undefined) payload.subject = body.subject;
    if (body.marksObtained !== undefined || body.marks_obtained !== undefined) {
      const marks = Number(body.marksObtained ?? body.marks_obtained);
      payload.marks_obtained = marks;
      
      // Re-calculate grade
      let grade = 'F';
      if (marks >= 90) grade = 'A+';
      else if (marks >= 85) grade = 'A';
      else if (marks >= 75) grade = 'B';
      else if (marks >= 65) grade = 'C';
      else if (marks >= 55) grade = 'D';
      payload.grade = grade;
    }
    if (body.homeworkStatus !== undefined || body.homework_status !== undefined) {
      payload.homework_status = body.homeworkStatus ?? body.homework_status;
    }
    if (body.teacherComments !== undefined || body.teacher_comments !== undefined) {
      payload.teacher_comments = body.teacherComments ?? body.teacher_comments;
    }

    const { data, error } = await supabase
      .from('marks')
      .update(payload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Mark PUT ID]', error);
    return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('marks')
      .delete()
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Mark DELETE ID]', error);
    return NextResponse.json({ error: 'Failed to delete marks' }, { status: 500 });
  }
}
