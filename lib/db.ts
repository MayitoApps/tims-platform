import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { HotelDeal, MarketingTask } from './types';
import { INITIAL_DEALS, INITIAL_MARKETING_TASKS } from './initial-data';

// Helper to get neon SQL client
export function getDb(): NeonQueryFunction<false, false> | null {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.STORAGE_URL;

  if (!url) {
    return null;
  }

  try {
    return neon(url);
  } catch (error) {
    console.error('Error initializing Neon DB client:', error);
    return null;
  }
}

// Auto-migration & Table initialization
let tablesInitialized = false;

export async function ensureTables(): Promise<boolean> {
  if (tablesInitialized) return true;
  const sql = getDb();
  if (!sql) return false;

  try {
    // 1. Hotel Deals Table
    await sql`
      CREATE TABLE IF NOT EXISTS hotel_deals (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        client_name TEXT NOT NULL,
        company_or_agency TEXT NOT NULL,
        hotel_name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'bodas_sociales',
        selected_spaces JSONB NOT NULL DEFAULT '[]'::jsonb,
        requested_rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
        stage TEXT NOT NULL,
        total_value NUMERIC NOT NULL,
        currency TEXT NOT NULL DEFAULT 'MXN',
        room_nights INTEGER NOT NULL DEFAULT 0,
        attendees_count INTEGER NOT NULL DEFAULT 0,
        check_in_date TEXT NOT NULL,
        check_out_date TEXT NOT NULL,
        assigned_rep TEXT NOT NULL,
        notes TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        created_at TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Marketing Tasks Table
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_tasks (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        hotel_target TEXT NOT NULL,
        category TEXT NOT NULL,
        stage TEXT NOT NULL,
        priority TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        assigned_to TEXT NOT NULL,
        due_date TEXT NOT NULL,
        description TEXT,
        asset_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed hotel deals if table is empty
    const dealRows = await sql`SELECT COUNT(*)::int as count FROM hotel_deals;`;
    const dealCount = (dealRows[0] as { count: number })?.count || 0;
    if (dealCount === 0 && INITIAL_DEALS.length > 0) {
      for (const deal of INITIAL_DEALS) {
        await sql`
          INSERT INTO hotel_deals (
            id, code, client_name, company_or_agency, hotel_name, category,
            selected_spaces, requested_rooms, stage, total_value, currency,
            room_nights, attendees_count, check_in_date, check_out_date,
            assigned_rep, notes, contact_email, contact_phone, created_at
          ) VALUES (
            ${deal.id}, ${deal.code}, ${deal.clientName}, ${deal.companyOrAgency},
            ${deal.hotelName}, ${deal.category},
            ${JSON.stringify(deal.selectedSpaces || [])}::jsonb,
            ${JSON.stringify(deal.requestedRooms || [])}::jsonb,
            ${deal.stage}, ${deal.totalValue}, ${deal.currency || 'MXN'},
            ${deal.roomNights || 0}, ${deal.attendeesCount || 0},
            ${deal.checkInDate}, ${deal.checkOutDate}, ${deal.assignedRep},
            ${deal.notes || ''}, ${deal.contactEmail || ''}, ${deal.contactPhone || ''},
            ${deal.createdAt}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed marketing tasks if table is empty
    const taskRows = await sql`SELECT COUNT(*)::int as count FROM marketing_tasks;`;
    const taskCount = (taskRows[0] as { count: number })?.count || 0;
    if (taskCount === 0 && INITIAL_MARKETING_TASKS.length > 0) {
      for (const task of INITIAL_MARKETING_TASKS) {
        await sql`
          INSERT INTO marketing_tasks (
            id, code, title, hotel_target, category, stage, priority,
            requested_by, assigned_to, due_date, description, asset_url, created_at
          ) VALUES (
            ${task.id}, ${task.code}, ${task.title}, ${task.hotelTarget},
            ${task.category}, ${task.stage}, ${task.priority},
            ${task.requestedBy}, ${task.assignedTo}, ${task.dueDate},
            ${task.description || ''}, ${task.assetUrl || null}, ${task.createdAt}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    tablesInitialized = true;
    return true;
  } catch (error) {
    console.error('Error running ensureTables migration:', error);
    return false;
  }
}

// Convert DB row to HotelDeal interface
export function mapRowToDeal(row: any): HotelDeal {
  return {
    id: row.id,
    code: row.code,
    clientName: row.client_name,
    companyOrAgency: row.company_or_agency || row.client_name,
    hotelName: row.hotel_name || row.hotel,
    category: row.category || 'bodas_sociales',
    selectedSpaces: typeof row.selected_spaces === 'string' ? JSON.parse(row.selected_spaces) : (row.selected_spaces || []),
    requestedRooms: typeof row.requested_rooms === 'string' ? JSON.parse(row.requested_rooms) : (row.requested_rooms || []),
    stage: row.stage,
    totalValue: Number(row.total_value) || 0,
    currency: row.currency || 'MXN',
    roomNights: Number(row.room_nights) || 0,
    attendeesCount: Number(row.attendees_count) || 0,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    assignedRep: row.assigned_rep,
    notes: row.notes || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    createdAt: row.created_at
  };
}

// Convert DB row to MarketingTask interface
export function mapRowToMarketingTask(row: any): MarketingTask {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    hotelTarget: row.hotel_target,
    category: row.category,
    stage: row.stage,
    priority: row.priority,
    requestedBy: row.requested_by,
    assignedTo: row.assigned_to,
    dueDate: row.due_date,
    description: row.description || '',
    assetUrl: row.asset_url || undefined,
    createdAt: row.created_at
  };
}
