import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToDeal } from '@/lib/db';
import { INITIAL_DEALS } from '@/lib/initial-data';
import { HotelDeal } from '@/lib/types';


export async function GET() {
  const sql = getDb();

  // If no DB is connected, fallback gracefully to initial deals
  if (!sql) {
    return NextResponse.json({
      source: 'local',
      deals: INITIAL_DEALS
    });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM hotel_deals
      ORDER BY check_in_date ASC, created_at DESC;
    `;

    const deals = rows.map(mapRowToDeal);
    return NextResponse.json({
      source: 'postgres',
      deals
    });
  } catch (error) {
    console.error('Error fetching deals from DB:', error);
    return NextResponse.json({
      source: 'local_fallback',
      deals: INITIAL_DEALS
    });
  }
}

export async function POST(request: Request) {
  try {
    const deal: HotelDeal = await request.json();
    const sql = getDb();

    if (!sql) {
      // Offline/local fallback
      return NextResponse.json({ success: true, source: 'local', deal });
    }

    await ensureTables();
    await sql`
      INSERT INTO hotel_deals (
        id, code, client_name, company_or_agency, hotel_name, category,
        selected_spaces, requested_rooms, stage, total_value, currency,
        deposit_amount, payment_status, payment_due_date,
        room_nights, attendees_count, check_in_date, check_out_date,
        assigned_rep, assigned_email, notes, comments, contact_email, contact_phone, requirements, invoices, created_at
      ) VALUES (
        ${deal.id}, ${deal.code}, ${deal.clientName}, ${deal.companyOrAgency || deal.clientName},
        ${deal.hotelName}, ${deal.category || 'bodas_sociales'},
        ${JSON.stringify(deal.selectedSpaces || [])}::jsonb,
        ${JSON.stringify(deal.requestedRooms || [])}::jsonb,
        ${deal.stage}, ${deal.totalValue}, ${deal.currency || 'MXN'},
        ${deal.depositAmount || 0}, ${deal.paymentStatus || 'pendiente'}, ${deal.paymentDueDate || null},
        ${deal.roomNights || 0}, ${deal.attendeesCount || 0},
        ${deal.checkInDate}, ${deal.checkOutDate}, ${deal.assignedRep},
        ${deal.assignedEmail || null},
        ${deal.notes || ''},
        ${JSON.stringify(deal.comments || [])}::jsonb,
        ${deal.contactEmail || ''}, ${deal.contactPhone || ''},
        ${JSON.stringify(deal.requirements || [])}::jsonb,
        ${JSON.stringify(deal.invoices || [])}::jsonb,
        ${deal.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        client_name = EXCLUDED.client_name,
        company_or_agency = EXCLUDED.company_or_agency,
        hotel_name = EXCLUDED.hotel_name,
        category = EXCLUDED.category,
        selected_spaces = EXCLUDED.selected_spaces,
        requested_rooms = EXCLUDED.requested_rooms,
        stage = EXCLUDED.stage,
        total_value = EXCLUDED.total_value,
        currency = EXCLUDED.currency,
        deposit_amount = EXCLUDED.deposit_amount,
        payment_status = EXCLUDED.payment_status,
        payment_due_date = EXCLUDED.payment_due_date,
        room_nights = EXCLUDED.room_nights,
        attendees_count = EXCLUDED.attendees_count,
        check_in_date = EXCLUDED.check_in_date,
        check_out_date = EXCLUDED.check_out_date,
        assigned_rep = EXCLUDED.assigned_rep,
        assigned_email = EXCLUDED.assigned_email,
        notes = EXCLUDED.notes,
        comments = EXCLUDED.comments,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        requirements = EXCLUDED.requirements,
        invoices = EXCLUDED.invoices,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true, source: 'postgres', deal });
  } catch (error) {
    console.error('Error saving deal to DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
