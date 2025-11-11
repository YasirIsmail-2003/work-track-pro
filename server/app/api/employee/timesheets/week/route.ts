import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../_lib/supabaseServerClient';

const Query = z.object({ start: z.string().regex(/\d{4}-\d{2}-\d{2}/) });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = Query.parse(Object.fromEntries(url.searchParams.entries()));
    const start = q.start;
    const end = new Date(new Date(start).getTime() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const { data } = await supabaseAdmin.from('timesheets').select('*').gte('week_start', start).lte('week_end', end);
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('timesheets week', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
