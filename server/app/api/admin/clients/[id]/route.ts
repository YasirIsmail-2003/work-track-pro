import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../_lib/supabaseServerClient';

export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const body = await req.json();
    const update: any = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.contact_email !== undefined) update.contact_email = body.contact_email;
    if (body.contact_phone !== undefined) update.contact_phone = body.contact_phone;

    const { data, error } = await supabaseAdmin.from('clients').update(update).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
