import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../_lib/supabaseServerClient';

export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();
    const update = {} as any;
    ['title', 'description', 'status', 'priority', 'assignee', 'client_id', 'due_date', 'estimated_hours'].forEach((k) => {
      if (body[k] !== undefined) update[k] = body[k];
    });

    const { data, error } = await supabaseAdmin.from('tasks').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from('tasks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
