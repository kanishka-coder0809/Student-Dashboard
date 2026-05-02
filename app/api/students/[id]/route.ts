import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Student GET ID]', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
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
    if (body.name !== undefined) payload.name = body.name;
    if (body.rollNo !== undefined) payload.roll_no = body.rollNo;
    if (body.class !== undefined) payload.class = body.class;
    if (body.attendance !== undefined) payload.attendance_percentage = body.attendance;
    if (body.email !== undefined) payload.email = body.email;

    const { data, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Student PUT ID]', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Student DELETE ID]', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
