import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { HotelDeal } from '@/lib/types';


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<HotelDeal> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
