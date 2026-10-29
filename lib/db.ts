import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { HotelDeal, MarketingTask, MarketingCampaign, ContentPublication, CreativeBrief } from './types';
import { INITIAL_DEALS, INITIAL_MARKETING_TASKS, INITIAL_CAMPAIGNS, INITIAL_PUBLICATIONS, INITIAL_BRIEFS } from './initial-data';

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
        deposit_amount NUMERIC DEFAULT 0,
        payment_status TEXT DEFAULT 'pendiente',
        payment_due_date TEXT,
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

    // Dynamic column additions for existing installations
    await sql`ALTER TABLE hotel_deals ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;`;
    await sql`ALTER TABLE hotel_deals ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pendiente';`;
    await sql`ALTER TABLE hotel_deals ADD COLUMN IF NOT EXISTS payment_due_date TEXT;`;
    await sql`ALTER TABLE hotel_deals ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE hotel_deals ADD COLUMN IF NOT EXISTS assigned_email TEXT;`;

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
        checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`ALTER TABLE marketing_tasks ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE marketing_tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE marketing_tasks ADD COLUMN IF NOT EXISTS format TEXT;`;
    await sql`ALTER TABLE marketing_tasks ADD COLUMN IF NOT EXISTS hotel_targets JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE marketing_tasks ADD COLUMN IF NOT EXISTS assigned_email TEXT;`;

    // 3. Marketing Campaigns Table
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        hotel_target TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        budget NUMERIC NOT NULL,
        spent NUMERIC NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        channels JSONB NOT NULL DEFAULT '[]'::jsonb,
        external_links JSONB NOT NULL DEFAULT '[]'::jsonb,
        lead_owner TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;`;

    // 4. Content Publications Table
    await sql`
      CREATE TABLE IF NOT EXISTS content_publications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        hotel TEXT NOT NULL,
        channel TEXT NOT NULL,
        publish_date TEXT NOT NULL,
        status TEXT NOT NULL,
        responsible TEXT NOT NULL,
        asset_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Creative Briefs Table
    await sql`
      CREATE TABLE IF NOT EXISTS creative_briefs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        hotel_target TEXT NOT NULL,
        category TEXT NOT NULL,
        objective TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        key_message TEXT NOT NULL,
        deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
        author TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. App Notifications Table
    await sql`
      CREATE TABLE IF NOT EXISTS app_notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        target_email TEXT,
        target_name TEXT,
        author_name TEXT,
        author_email TEXT,
        link_section TEXT NOT NULL DEFAULT 'marketing',
        target_id TEXT,
        created_at TEXT NOT NULL,
        read BOOLEAN DEFAULT false
      );
    `;

    tablesInitialized = true;
    return true;
  } catch (error) {
    console.error('Error running ensureTables migration:', error);
    return false;
  }
}

// Convert DB row to HotelDeal interface
export function mapRowToDeal(row: any): HotelDeal {
  const totalValue = Number(row.total_value) || 0;
  const depositAmount = Number(row.deposit_amount) || 0;
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
    totalValue,
    currency: row.currency || 'MXN',
    depositAmount,
    paymentStatus: row.payment_status || 'pendiente',
    balanceDue: Math.max(0, totalValue - depositAmount),
    paymentDueDate: row.payment_due_date || undefined,
    roomNights: Number(row.room_nights) || 0,
    attendeesCount: Number(row.attendees_count) || 0,
    checkInDate: row.check_in_date,
    checkOutDate: row.check_out_date,
    assignedRep: row.assigned_rep,
    assignedEmail: row.assigned_email || undefined,
    notes: row.notes || '',
    comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || []),
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
    hotelTargets: typeof row.hotel_targets === 'string' ? JSON.parse(row.hotel_targets) : (row.hotel_targets || []),
    format: row.format || undefined,
    category: row.category,
    stage: row.stage,
    priority: row.priority,
    requestedBy: row.requested_by,
    assignedTo: row.assigned_to,
    assignedEmail: row.assigned_email || undefined,
    dueDate: row.due_date,
    description: row.description || '',
    assetUrl: row.asset_url || undefined,
    checklist: typeof row.checklist === 'string' ? JSON.parse(row.checklist) : (row.checklist || []),
    comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || []),
    createdAt: row.created_at
  };
}

// Convert DB row to MarketingCampaign interface
export function mapRowToCampaign(row: any): MarketingCampaign {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    hotelTarget: row.hotel_target,
    type: row.type,
    status: row.status,
    budget: Number(row.budget) || 0,
    spent: Number(row.spent) || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : (row.channels || []),
    externalLinks: typeof row.external_links === 'string' ? JSON.parse(row.external_links) : (row.external_links || []),
    leadOwner: row.lead_owner,
    description: row.description || '',
    comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || [])
  };
}

// Convert DB row to ContentPublication interface
export function mapRowToPublication(row: any): ContentPublication {
  return {
    id: row.id,
    title: row.title,
    hotel: row.hotel,
    channel: row.channel,
    publishDate: row.publish_date,
    status: row.status,
    responsible: row.responsible,
    assetUrl: row.asset_url || undefined
  };
}

// Convert DB row to CreativeBrief interface
export function mapRowToBrief(row: any): CreativeBrief {
  return {
    id: row.id,
    title: row.title,
    hotelTarget: row.hotel_target,
    category: row.category,
    objective: row.objective,
    targetAudience: row.target_audience,
    keyMessage: row.key_message,
    deliverables: typeof row.deliverables === 'string' ? JSON.parse(row.deliverables) : (row.deliverables || []),
    author: row.author,
    date: row.date
  };
}
