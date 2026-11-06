import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { ContentPublication } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<ContentPublication> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
    await sql`
      UPDATE content_publications
      SET
        title = COALESCE(${updates.title ?? null}, title),
        hotel = COALESCE(${updates.hotel ?? null}, hotel),
        channel = COALESCE(${updates.channel ?? null}, channel),
        publish_date = COALESCE(${updates.publishDate ?? null}, publish_date),
        status = COALESCE(${updates.status ?? null}, status),
        responsible = COALESCE(${updates.responsible ?? null}, responsible),
        asset_url = COALESCE(${updates.assetUrl ?? null}, asset_url)
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id, updates });
  } catch (error) {
    console.error('Error updating publication in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores autorizados pueden eliminar publicaciones.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id });
    }

    await ensureTables();
    await sql`DELETE FROM content_publications WHERE id = ${id};`;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting publication from DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
