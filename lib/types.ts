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

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'comment' | 'task_created' | 'deal_created' | 'stage_changed' | 'payment_alert' | 'event_active';
  targetEmail?: string; // Correo específico del destinatario (si aplica)
  targetName?: string;  // Nombre del destinatario
  authorName?: string;
  authorEmail?: string;
  linkSection: 'marketing' | 'commercial';
  targetId?: string;    // ID del requerimiento o ID del deal
  createdAt: string;
  read?: boolean;
}

export interface CommercialExecutive {
  name: string;
  email: string;
  role: string;
  initials: string;
}

export const COMMERCIAL_TEAM: CommercialExecutive[] = [
  {
    name: 'Carlos Mendoza',
    email: 'comercial1.grupoorganico@gmail.com',
    role: 'Ejecutivo de Bodas & MICE',
    initials: 'CM'
  },
  {
    name: 'Valeria Domínguez',
    email: 'comercial2.grupoorganico@gmail.com',
    role: 'Ejecutiva de Cuentas Corporativas',
    initials: 'VD'
  },
  {
    name: 'Gerencia Comercial',
    email: 'expansioncomercia.gohb@gmail.com',
    role: 'Dirección Comercial & Eventos',
    initials: 'GC'
  }
];

export function getExecutiveEventStatus(
  deals: HotelDeal[],
  repIdentifier: string,
  dateStr: string = new Date().toISOString().split('T')[0]
): { isOperating: boolean; activeDeal?: HotelDeal } {
  if (!repIdentifier) return { isOperating: false };
  const clean = repIdentifier.toLowerCase().trim();
  const activeDeal = deals.find((d) => {
    if (d.stage !== 'contratado') return false;
    const match =
      (d.assignedEmail && d.assignedEmail.toLowerCase().trim() === clean) ||
      (d.assignedRep && (d.assignedRep.toLowerCase().includes(clean) || clean.includes(d.assignedRep.toLowerCase())));
    if (!match) return false;
    return dateStr >= d.checkInDate && dateStr <= d.checkOutDate;
  });
  return {
    isOperating: !!activeDeal,
    activeDeal
  };
}

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
  | 'empresarial'          // Eventos y convenios corporativos
  | 'social'               // Bodas, aniversarios y reuniones sociales
  | 'individual'           // Huéspedes individuales / estancias particulares
  | 'grupos_convenciones'  // Compatibilidad legacy
  | 'bodas_sociales'       // Compatibilidad legacy
  | 'cuentas_empresariales'// Compatibilidad legacy
  | 'agencias_viaje';      // Compatibilidad legacy

// -------------------------------------------------------------
// TABLERO KANBAN DE TAREAS COMERCIALES
// -------------------------------------------------------------
export type CommercialTaskStage = 
  | 'solicitud'   // Solicitud / Por asignar
  | 'en_proceso'  // En proceso / En curso
  | 'terminada'   // Terminada / Completada
  | 'cancelada';  // Cancelada

export interface CommercialTask {
  id: string;
  code: string;
  title: string;
  description: string;
  hotelTarget: string;
  dealId?: string;
  dealTitle?: string;
  assignedTo: string;
  assignedEmail?: string;
  priority: 'urgente' | 'alta' | 'media';
  stage: CommercialTaskStage;
  dueDate: string;
  createdBy: string;
  comments?: TaskComment[];
  createdAt: string;
}

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
  assignedEmail?: string;
  notes: string;
  comments?: TaskComment[];
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
