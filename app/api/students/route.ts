import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    if (id) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        throw error;
      }
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Students GET]', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Map fields from camelCase to snake_case for Postgres if necessary
    const payload = {
      name: body.name,
      roll_no: body.rollNo || body.roll_no,
      class: body.class,
      attendance_percentage: body.attendance ?? body.attendance_percentage ?? 0,
      email: body.email || null,
    };

    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Students POST]', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
    }

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
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Students PUT]', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Students DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
