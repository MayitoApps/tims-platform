export type UserRole = 'marketing' | 'sales' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  initials: string;
}

// -------------------------------------------------------------
// CATÁLOGO DE ESPACIOS POR HOTEL
// -------------------------------------------------------------
export interface HotelSpaceInfo {
  id: string;
  name: string;
  description: string;
  type: 'salon' | 'jardin' | 'hospedaje' | 'restaurante' | 'terraza' | 'bienestar';
}

// -------------------------------------------------------------
// SECCIÓN 1: MARKETING & COMUNICACIÓN
// -------------------------------------------------------------
export type MarketingCampaignStatus = 'planificacion' | 'en_produccion' | 'revision' | 'activa' | 'finalizada';

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  platform: 'figma' | 'drive' | 'canva' | 'dropbox' | 'instagram' | 'otro';
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export const ADMIN_EMAILS = [
  'expansioncomercia.gohb@gmail.com',
  'marketinggrupoorganico@gmail.com'
];

export const DESIGN_RESPONSIBLES = [
  {
    name: 'Estefania Azcona',
    email: 'mkt2.grupoorganico@gmail.com',
    role: 'Diseño & Marketing',
    initials: 'EA'
  },
  {
    name: 'Mario Avalos',
    email: 'artes.grupoorganico@gmail.com',
    role: 'Artes & Diseño Gráfico',
    initials: 'MA'
  }
];

export const REQUIREMENT_FORMATS = [
  'Historia',
  'Carrusel',
  'Cambio en sitio web',
  'Flyer',
  'Poster',
  'Lona',
  'Otro'
] as const;

export type RequirementFormat = (typeof REQUIREMENT_FORMATS)[number] | string;

export interface MarketingCampaign {
  id: string;
  code: string;
  title: string;
  hotelTarget: string;
  type: 'temporada' | 'marca' | 'redes_sociales' | 'relaciones_publicas' | 'influencers' | 'gastronomia';
  status: MarketingCampaignStatus;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  channels: string[];
  externalLinks: ExternalLink[];
  leadOwner: string;
  description: string;
  selectedSpaces?: string[];
  comments?: TaskComment[];
}

export interface ContentPublication {
  id: string;
  title: string;
  hotel: string;
  channel: 'instagram' | 'tiktok' | 'linkedin' | 'newsletter' | 'prensa';
  publishDate: string;
  status: 'idea' | 'redactado' | 'diseñado' | 'programado' | 'publicado';
  responsible: string;
  assetUrl?: string;
}

export interface CreativeBrief {
  id: string;
  title: string;
  hotelTarget: string;
  category: 'shooting_fotografico' | 'comunicado_prensa' | 'campana_digital' | 'evento_marca';
  objective: string;
  targetAudience: string;
  keyMessage: string;
  deliverables: string[];
  author: string;
  date: string;
  spacesTarget?: string[];
}

// -------------------------------------------------------------
// TABLERO POR FASES DE MARKETING (Requerimientos & Entregables)
// -------------------------------------------------------------
export type MarketingTaskStage = 
  | 'backlog'       // Solicitud recibida / Briefing
  | 'en_produccion' // En producción (Diseño / Edición / Desarrollo)
  | 'revision'      // En revisión y aprobación
  | 'aprobado';     // Listo / Publicado / Entregado

export type MarketingTaskCategory =
  | 'diseno_grafico'   // Diseños gráficos (menús, banners, flyers, señalética)
  | 'produccion_video' // Producción y edición de video (Reels, TikTok, dron)
  | 'cambios_web'      // Cambios y mejoras en páginas web
  | 'notas_digitales'  // Notas digitales, blog y comunicados de prensa
  | 'pauta_publicidad' // Configuración de pauta Meta Ads y Google Ads
  | 'fotografia';      // Sesiones fotográficas y retoque

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MarketingTask {
  id: string;
  code: string;
  title: string;
  hotelTarget: string;
  hotelTargets?: string[];
  format?: string;
  category: MarketingTaskCategory;
  stage: MarketingTaskStage;
  priority: 'alta' | 'media' | 'urgente';
  requestedBy: string;
  assignedTo: string;
  assignedEmail?: string;
  dueDate: string;
  description: string;
  assetUrl?: string;
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  createdAt: string;
}

// -------------------------------------------------------------
// SECCIÓN 2: COMERCIALIZACIÓN HOTELERA
// -------------------------------------------------------------
export type HotelDealStage = 
  | 'rfp_recibido'       // Solicitud de cotización inicial
  | 'propuesta_enviada'  // Cotización y bloqueo tentativo de fechas
  | 'negociacion'        // Ajuste de tarifas y condiciones
  | 'contratado'         // Contrato firmado y anticipo pagado
  | 'perdido';           // Cancelado o cerrado sin éxito

export type DealCategory = 
  | 'grupos_convenciones' // MICE: Congresos, eventos corporativos
  | 'bodas_sociales'      // Bodas de destino, aniversarios
  | 'cuentas_empresariales' // Convenios corporativos anuales
  | 'agencias_viaje';     // OTAs / Mayoristas / Consorcios de lujo

export type PaymentStatus = 
  | 'pendiente'        // Sin anticipo aún
  | 'anticipo_pagado'  // Anticipo abonado (fecha asegurada)
  | 'liquidado';       // 100% pagado

export interface HotelRoomType {
  id: string;
  name: string;
  capacity: string;
  description: string;
}

export interface RequestedRoomType {
  roomTypeName: string;
  count: number;
}

export interface HotelDeal {
  id: string;
  code: string;
  clientName: string;
  companyOrAgency: string;
  hotelName: string;
  selectedSpaces: string[]; // Espacios seleccionados del hotel
  requestedRooms?: RequestedRoomType[]; // Desglose de habitaciones requeridas por tipo
  category: DealCategory;
  stage: HotelDealStage;
  totalValue: number; // Monto total en moneda
  currency: 'MXN' | 'USD';
  depositAmount?: number; // Monto de anticipo pagado
  paymentStatus?: PaymentStatus; // Estatus financiero: pendiente | anticipo_pagado | liquidado
  balanceDue?: number; // Saldo por cobrar
  paymentDueDate?: string; // Fecha límite para liquidar el saldo total
  roomNights: number; // Noches de habitación estimadas
  attendeesCount?: number; // Personas para banquete/evento
  checkInDate: string;
  checkOutDate: string;
  assignedRep: string;
  notes: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

export interface HotelFactsheet {
  id: string;
  hotelName: string;
  title: string;
  type: 'tarifario_grupos' | 'capacidad_salones' | 'paquetes_bodas' | 'menu_banquetes' | 'presentacion_hotel';
  fileUrl: string;
  updatedAt: string;
  version: string;
}
