import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { SalesActivity } from '@/lib/types';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores autorizados pueden eliminar actividades de venta.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id });
    }

    await ensureTables();
    await sql`
      DELETE FROM sales_activities
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting sales activity from DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

