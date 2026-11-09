import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToSalesActivity } from '@/lib/db';
import { SalesActivity } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', activities: [] });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM sales_activities
      ORDER BY date DESC, time DESC, created_at DESC;
    `;
    const activities = rows.map(mapRowToSalesActivity);
    return NextResponse.json({ source: 'postgres', activities });
  } catch (error) {
    console.error('Error fetching sales activities from DB:', error);
    return NextResponse.json({ source: 'local_fallback', activities: [] });
  }
}

export async function POST(request: Request) {
  try {
    const raw: Partial<SalesActivity> = await request.json();
    const activityId = raw.id || `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = raw.createdAt || new Date().toISOString();

    const activity: SalesActivity = {
      ...raw,
      id: activityId,
      type: raw.type || 'llamada',
      executiveName: raw.executiveName || 'Ejecutivo',
      date: raw.date || new Date().toISOString().split('T')[0],
      createdAt
    };

    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', activity });
    }

    await ensureTables();
    await sql`
      INSERT INTO sales_activities (
        id, type, executive_name, executive_email, date, time,
        phone, client_name, answered, notes, company, email,
        acquisition_date, subject, contact_method, client_feedback,
        next_date, evidence_url, folio, hotel, event_dates,
        quantity, service, amount, valid_until, proof_url,
        scheduled_date, receiver_name, receiver_role, minutes,
        attendance_proof_url, invitation_proof_url, attendees,
        topic, agreements, next_action, assigned_rep, created_at
      ) VALUES (
        ${activity.id}, ${activity.type}, ${activity.executiveName}, ${activity.executiveEmail || null},
        ${activity.date}, ${activity.time || null},
        ${activity.phone || null}, ${activity.clientName || null}, ${activity.answered ?? null},
        ${activity.notes || null}, ${activity.company || null}, ${activity.email || null},
        ${activity.acquisitionDate || null}, ${activity.subject || null}, ${activity.contactMethod || null},
        ${activity.clientFeedback || null}, ${activity.nextDate || null}, ${activity.evidenceUrl || null},
        ${activity.folio || null}, ${activity.hotel || null}, ${activity.eventDates || null},
        ${activity.quantity ?? null}, ${activity.service || null}, ${activity.amount ?? null},
        ${activity.validUntil || null}, ${activity.proofUrl || null},
        ${activity.scheduledDate || null}, ${activity.receiverName || null}, ${activity.receiverRole || null},
        ${activity.minutes || null}, ${activity.attendanceProofUrl || null}, ${activity.invitationProofUrl || null},
        ${activity.attendees || null}, ${activity.topic || null}, ${activity.agreements || null},
        ${activity.nextAction || null}, ${activity.assignedRep || null}, ${activity.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        executive_name = EXCLUDED.executive_name,
        executive_email = EXCLUDED.executive_email,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        phone = EXCLUDED.phone,
        client_name = EXCLUDED.client_name,
        answered = EXCLUDED.answered,
        notes = EXCLUDED.notes,
        company = EXCLUDED.company,
        email = EXCLUDED.email,
        acquisition_date = EXCLUDED.acquisition_date,
        subject = EXCLUDED.subject,
        contact_method = EXCLUDED.contact_method,
        client_feedback = EXCLUDED.client_feedback,
        next_date = EXCLUDED.next_date,
        evidence_url = EXCLUDED.evidence_url,
        folio = EXCLUDED.folio,
        hotel = EXCLUDED.hotel,
        event_dates = EXCLUDED.event_dates,
        quantity = EXCLUDED.quantity,
        service = EXCLUDED.service,
        amount = EXCLUDED.amount,
        valid_until = EXCLUDED.valid_until,
        proof_url = EXCLUDED.proof_url,
        scheduled_date = EXCLUDED.scheduled_date,
        receiver_name = EXCLUDED.receiver_name,
        receiver_role = EXCLUDED.receiver_role,
        minutes = EXCLUDED.minutes,
        attendance_proof_url = EXCLUDED.attendance_proof_url,
        invitation_proof_url = EXCLUDED.invitation_proof_url,
        attendees = EXCLUDED.attendees,
        topic = EXCLUDED.topic,
        agreements = EXCLUDED.agreements,
        next_action = EXCLUDED.next_action,
        assigned_rep = EXCLUDED.assigned_rep,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true, source: 'postgres', activity });
  } catch (error) {
    console.error('Error saving sales activity to DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

