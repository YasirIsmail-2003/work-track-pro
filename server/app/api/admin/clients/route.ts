import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabaseServerClient';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('clients').select('id,name,contact_email,contact_phone,created_at').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clients: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload: any = { name: body.name, contact_email: body.contact_email || null, contact_phone: body.contact_phone || null };
    const { data, error } = await supabaseAdmin.from('clients').insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
