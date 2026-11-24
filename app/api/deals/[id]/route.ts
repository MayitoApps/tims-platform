import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { requireAuthSession, requireAdminSession } from '@/lib/auth';
import { HotelDeal, isUserAdmin, matchesUserIdentity } from '@/lib/types';


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const { id } = await params;
    const updates: Partial<HotelDeal> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();

    if (!isUserAdmin(session)) {
      const existing = await sql`SELECT assigned_email, assigned_rep FROM hotel_deals WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 });
      }
      if (!matchesUserIdentity(session, existing[0].assigned_email, existing[0].assigned_rep)) {
        return NextResponse.json({ success: false, error: 'No puedes modificar eventos de otro compañero.' }, { status: 403 });
      }
    }

    // Check if updating only stage or full deal
    if (Object.keys(updates).length === 1 && updates.stage) {
      await sql`
        UPDATE hotel_deals
        SET stage = ${updates.stage}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    } else {
      await sql`
        UPDATE hotel_deals
        SET
          client_name = COALESCE(${updates.clientName}, client_name),
          company_or_agency = COALESCE(${updates.companyOrAgency}, company_or_agency),
          hotel_name = COALESCE(${updates.hotelName}, hotel_name),
          category = COALESCE(${updates.category}, category),
          selected_spaces = COALESCE(${updates.selectedSpaces ? JSON.stringify(updates.selectedSpaces) : null}::jsonb, selected_spaces),
          requested_rooms = COALESCE(${updates.requestedRooms ? JSON.stringify(updates.requestedRooms) : null}::jsonb, requested_rooms),
          stage = COALESCE(${updates.stage}, stage),
          total_value = COALESCE(${updates.totalValue}, total_value),
          currency = COALESCE(${updates.currency}, currency),
          deposit_amount = COALESCE(${updates.depositAmount}, deposit_amount),
          payment_status = COALESCE(${updates.paymentStatus}, payment_status),
          payment_due_date = COALESCE(${updates.paymentDueDate}, payment_due_date),
          room_nights = COALESCE(${updates.roomNights}, room_nights),
          attendees_count = COALESCE(${updates.attendeesCount}, attendees_count),
          check_in_date = COALESCE(${updates.checkInDate}, check_in_date),
          check_out_date = COALESCE(${updates.checkOutDate}, check_out_date),
          assigned_rep = COALESCE(${updates.assignedRep}, assigned_rep),
          assigned_email = COALESCE(${updates.assignedEmail}, assigned_email),
          notes = COALESCE(${updates.notes}, notes),
          comments = COALESCE(${updates.comments ? JSON.stringify(updates.comments) : null}::jsonb, comments),
          contact_email = COALESCE(${updates.contactEmail}, contact_email),
          contact_phone = COALESCE(${updates.contactPhone}, contact_phone),
          requirements = COALESCE(${updates.requirements ? JSON.stringify(updates.requirements) : null}::jsonb, requirements),
          invoices = COALESCE(${updates.invoices ? JSON.stringify(updates.invoices) : null}::jsonb, invoices),
          contract_url = CASE WHEN ${updates.contractUrl !== undefined} THEN ${updates.contractUrl || null} ELSE contract_url END,
          contract_file_name = CASE WHEN ${updates.contractFileName !== undefined} THEN ${updates.contractFileName || null} ELSE contract_file_name END,
          expediente = COALESCE(${updates.expediente ? JSON.stringify(updates.expediente) : null}::jsonb, expediente),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error updating deal in DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession();
    if (auth.errorResponse) return auth.errorResponse;

    const { id } = await params;
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id });
    }

    await ensureTables();
    await sql`
      DELETE FROM hotel_deals
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting deal from DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
