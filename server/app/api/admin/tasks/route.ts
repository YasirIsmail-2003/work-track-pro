import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

// GET supports pagination: ?page=1&limit=20
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '20');
    const offset = (Math.max(1, page) - 1) * limit;

    const { data, error, count } = await supabaseAdmin.from('tasks').select('id,title,description,client_id,assignee,status,priority,due_date,created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const tasks = data || [];

    // fetch client names and assignee names in batch
    const clientIds = Array.from(new Set(tasks.map((t: any) => t.client_id).filter(Boolean)));
    const assigneeIds = Array.from(new Set(tasks.map((t: any) => t.assignee).filter(Boolean)));

    const clientsMap: Record<string, any> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabaseAdmin.from('clients').select('id,name').in('id', clientIds as any);
      (clients || []).forEach((c: any) => (clientsMap[c.id] = c));
    }

    const assigneesMap: Record<string, any> = {};
    if (assigneeIds.length > 0) {
      const { data: profiles } = await supabaseAdmin.from('profiles').select('id,full_name').in('id', assigneeIds as any);
      (profiles || []).forEach((p: any) => (assigneesMap[p.id] = p));
    }

    const enriched = tasks.map((t: any) => ({
      ...t,
      client_name: t.client_id ? clientsMap[t.client_id]?.name || null : null,
      assignee_name: t.assignee ? assigneesMap[t.assignee]?.full_name || null : null,
    }));

    return NextResponse.json({ tasks: enriched, meta: { total: count || enriched.length, page, limit } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// POST: create a task
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      title: body.title,
      description: body.description || null,
      client_id: body.client_id || null,
      assignee: body.assignee || null,
      status: body.status || 'PENDING',
      priority: body.priority || 'MEDIUM',
      estimated_hours: body.estimated_hours || 0,
      due_date: body.due_date || null,
    } as any;

    const { data, error } = await supabaseAdmin.from('tasks').insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}

