import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '1000', 10);

    if (id) {
      const { data, error } = await supabase
        .from('marks')
        .select('*, students(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Mark not found' }, { status: 404 });
        throw error;
      }
      return NextResponse.json(data);
    }

    let query = supabase.from('marks').select('*, students(*)');
    
    if (studentId) {
      // Cast to number for PostgreSQL BIGINT comparison
      const sid = isNaN(Number(studentId)) ? studentId : Number(studentId);
      query = query.eq('student_id', sid);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Marks GET]', error);
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const marksObtained = Number(body.marksObtained ?? body.marks_obtained ?? 0);
    
    // Auto-calculate grade based on marks
    let grade = 'F';
    if (marksObtained >= 90) grade = 'A+';
    else if (marksObtained >= 85) grade = 'A';
    else if (marksObtained >= 75) grade = 'B';
    else if (marksObtained >= 65) grade = 'C';
    else if (marksObtained >= 55) grade = 'D';

    const payload = {
      student_id: body.studentId || body.student_id,
      subject: body.subject,
      marks_obtained: marksObtained,
      grade: grade,
      homework_status: body.homeworkStatus || body.homework_status || 'Incomplete',
      teacher_comments: body.teacherComments || body.teacher_comments || '',
    };

    const { data, error } = await supabase
      .from('marks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Marks for this student and subject already exist' },
          { status: 400 }
        );
      }
      throw error;
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Marks POST]', error);
    return NextResponse.json({ error: 'Failed to create marks' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing marks ID' }, { status: 400 });
    }

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
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Marks PUT]', error);
    return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing marks ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marks')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Marks DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete marks' }, { status: 500 });
  }
}
