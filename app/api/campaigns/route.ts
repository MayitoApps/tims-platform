import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToCampaign } from '@/lib/db';
import { INITIAL_CAMPAIGNS } from '@/lib/initial-data';
import { MarketingCampaign } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', campaigns: INITIAL_CAMPAIGNS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM marketing_campaigns
      ORDER BY start_date ASC, created_at DESC;
    `;
    const campaigns = rows.map(mapRowToCampaign);
    return NextResponse.json({ source: 'postgres', campaigns });
  } catch (error) {
    console.error('Error fetching campaigns from DB:', error);
    return NextResponse.json({ source: 'local_fallback', campaigns: INITIAL_CAMPAIGNS });
  }
}

export async function POST(request: Request) {
  try {
    const campaign: MarketingCampaign = await request.json();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', campaign });
    }

    await ensureTables();
    await sql`
      INSERT INTO marketing_campaigns (
        id, code, title, hotel_target, type, status, budget, spent,
        start_date, end_date, channels, external_links, lead_owner, description
      ) VALUES (
        ${campaign.id}, ${campaign.code}, ${campaign.title}, ${campaign.hotelTarget},
        ${campaign.type}, ${campaign.status}, ${campaign.budget}, ${campaign.spent || 0},
        ${campaign.startDate}, ${campaign.endDate},
        ${JSON.stringify(campaign.channels || [])}::jsonb,
        ${JSON.stringify(campaign.externalLinks || [])}::jsonb,
        ${campaign.leadOwner || 'Marketing Team'}, ${campaign.description || ''}
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hotel_target = EXCLUDED.hotel_target,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        budget = EXCLUDED.budget,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        channels = EXCLUDED.channels,
        description = EXCLUDED.description;
    `;

    return NextResponse.json({ success: true, source: 'postgres', campaign });
  } catch (error) {
    console.error('Error creating campaign in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
