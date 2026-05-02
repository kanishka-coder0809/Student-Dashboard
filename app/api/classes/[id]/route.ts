import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ success: false, message: 'Class not found' }, { status: 404 });
      throw error;
    }

    return NextResponse.json(data);
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
    const body = await request.json();
    const supabase = await createClient();

    const updatePayload: any = {};
    if (body.class_name !== undefined) updatePayload.class_name = String(body.class_name).trim();
    if (body.section !== undefined) updatePayload.section = String(body.section).trim();
    if (body.description !== undefined) updatePayload.description = String(body.description).trim();

    if (updatePayload.class_name !== undefined && !updatePayload.class_name) {
      return NextResponse.json(
        { success: false, message: 'class_name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('classes')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('classes')
      .delete()
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error deleting class:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete class', error: String(error) },
      { status: 500 }
    );
  }
}
