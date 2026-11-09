import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { SalesActivity } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<SalesActivity> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
    await sql`
      UPDATE sales_activities
      SET
        type = COALESCE(${updates.type ?? null}, type),
        executive_name = COALESCE(${updates.executiveName ?? null}, executive_name),
        executive_email = COALESCE(${updates.executiveEmail ?? null}, executive_email),
        date = COALESCE(${updates.date ?? null}, date),
        time = COALESCE(${updates.time ?? null}, time),
        phone = COALESCE(${updates.phone ?? null}, phone),
        client_name = COALESCE(${updates.clientName ?? null}, client_name),
        answered = COALESCE(${updates.answered !== undefined ? updates.answered : null}, answered),
        notes = COALESCE(${updates.notes ?? null}, notes),
        company = COALESCE(${updates.company ?? null}, company),
        email = COALESCE(${updates.email ?? null}, email),
        acquisition_date = COALESCE(${updates.acquisitionDate ?? null}, acquisition_date),
        subject = COALESCE(${updates.subject ?? null}, subject),
        contact_method = COALESCE(${updates.contactMethod ?? null}, contact_method),
        client_feedback = COALESCE(${updates.clientFeedback ?? null}, client_feedback),
        next_date = COALESCE(${updates.nextDate ?? null}, next_date),
        evidence_url = COALESCE(${updates.evidenceUrl ?? null}, evidence_url),
        folio = COALESCE(${updates.folio ?? null}, folio),
        hotel = COALESCE(${updates.hotel ?? null}, hotel),
        event_dates = COALESCE(${updates.eventDates ?? null}, event_dates),
        quantity = COALESCE(${updates.quantity ?? null}, quantity),
        service = COALESCE(${updates.service ?? null}, service),
        amount = COALESCE(${updates.amount ?? null}, amount),
        valid_until = COALESCE(${updates.validUntil ?? null}, valid_until),
        proof_url = COALESCE(${updates.proofUrl ?? null}, proof_url),
        scheduled_date = COALESCE(${updates.scheduledDate ?? null}, scheduled_date),
        receiver_name = COALESCE(${updates.receiverName ?? null}, receiver_name),
        receiver_role = COALESCE(${updates.receiverRole ?? null}, receiver_role),
        minutes = COALESCE(${updates.minutes ?? null}, minutes),
        attendance_proof_url = COALESCE(${updates.attendanceProofUrl ?? null}, attendance_proof_url),
        invitation_proof_url = COALESCE(${updates.invitationProofUrl ?? null}, invitation_proof_url),
        attendees = COALESCE(${updates.attendees ?? null}, attendees),
        topic = COALESCE(${updates.topic ?? null}, topic),
        agreements = COALESCE(${updates.agreements ?? null}, agreements),
        next_action = COALESCE(${updates.nextAction ?? null}, next_action),
        assigned_rep = COALESCE(${updates.assignedRep ?? null}, assigned_rep),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id, updates });
  } catch (error) {
    console.error('Error updating sales activity in DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

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

