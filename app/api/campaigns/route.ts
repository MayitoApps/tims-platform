import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToCampaign } from '@/lib/db';
import { INITIAL_CAMPAIGNS } from '@/lib/initial-data';
import { MarketingCampaign, isUserAdmin, matchesUserIdentity } from '@/lib/types';
import { requireAuthSession, NO_STORE_HEADERS } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuthSession();
  if (auth.errorResponse) return auth.errorResponse;
  const { session } = auth;

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', campaigns: INITIAL_CAMPAIGNS }, { headers: NO_STORE_HEADERS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM marketing_campaigns
      ORDER BY start_date ASC, created_at DESC;
    `;
    let campaigns = rows.map(mapRowToCampaign);
    if (!isUserAdmin(session)) {
      campaigns = campaigns.filter((c) => matchesUserIdentity(session, undefined, c.leadOwner));
    }
    return NextResponse.json({ source: 'postgres', campaigns }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching campaigns from DB:', error);
    return NextResponse.json(
      { source: 'local_fallback', campaigns: INITIAL_CAMPAIGNS },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;

    const raw: Partial<MarketingCampaign> = await request.json();
    const campaignId = raw.id || `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startDate = (raw.startDate || new Date().toISOString().split('T')[0]).slice(0, 10);
    const endDate = (raw.endDate || startDate).slice(0, 10);

    const campaign: MarketingCampaign = {
      ...raw,
      id: campaignId,
      code: raw.code || `CMP-${Date.now().toString().slice(-4)}`,
      title: raw.title || 'Nueva Campaña',
      hotelTarget: raw.hotelTarget || 'Orgánico Ajusco',
      type: raw.type || 'temporada',
      status: raw.status || 'planificacion',
      budget: Number(raw.budget) || 0,
      spent: Number(raw.spent) || 0,
      startDate,
      endDate,
      channels: Array.isArray(raw.channels) ? raw.channels : [],
      externalLinks: Array.isArray(raw.externalLinks) ? raw.externalLinks : [],
      leadOwner: raw.leadOwner || 'Marketing Team',
      description: raw.description || '',
      comments: Array.isArray(raw.comments) ? raw.comments : []
    };

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
        spent = EXCLUDED.spent,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        channels = EXCLUDED.channels,
        external_links = EXCLUDED.external_links,
        description = EXCLUDED.description;
    `;

    return NextResponse.json({ success: true, source: 'postgres', campaign });
  } catch (error) {
    console.error('Error creating campaign in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
