import {
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  HotelDeal,
  HotelFactsheet
} from './types';

// Hoteles del grupo disponibles para segmentación
export const HOTEL_PROPERTIES = [
  'Grand Resort & Spa',
  'Palacio Central Boutique',
  'Urban Executive Suites',
  'Hacienda Real & Golf Club',
  'General / Todo el Grupo'
];

// Base de datos limpia sin información muestra (listas vacías para inicio real)
export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [];

export const INITIAL_PUBLICATIONS: ContentPublication[] = [];

export const INITIAL_BRIEFS: CreativeBrief[] = [];

export const INITIAL_DEALS: HotelDeal[] = [];

export const INITIAL_FACTSHEETS: HotelFactsheet[] = [];
