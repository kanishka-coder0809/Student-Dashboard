import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
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
    const supabase = await createClient();

    const className = String(body.class_name ?? '').trim();
    const section = String(body.section ?? '').trim();
    const description = String(body.description ?? '').trim();

    if (!className) {
      return NextResponse.json(
        { success: false, message: 'class_name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([
        {
          class_name: className,
          section,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating class:', error);
    return NextResponse.json(
      { success: false, message: `Failed to create class: ${error instanceof Error ? error.message : (error as any)?.message || String(error)}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('id');
    if (!classId) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 });
    }

    const body = await request.json();
    const supabase = await createClient();

    const updatePayload: any = {};
    if (body.class_name !== undefined) updatePayload.class_name = String(body.class_name).trim();
    if (body.section !== undefined) updatePayload.section = String(body.section).trim();
    if (body.description !== undefined) updatePayload.description = String(body.description).trim();

    const { data, error } = await supabase
      .from('classes')
      .update(updatePayload)
      .eq('id', classId)
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

export async function DELETE(request: NextRequest) {
  try {
    const classId = request.nextUrl.searchParams.get('id');
    if (!classId) {
      return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
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
