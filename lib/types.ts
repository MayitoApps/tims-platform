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
  'artes.grupoorganico@gmail.com'
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

export const COMMERCIAL_TEAM: CommercialExecutive[] = [];

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

export interface DealRequirement {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

export interface DealInvoice {
  id: string;
  folio: string;               // Folio fiscal o interno (ej. FAC-1002, UUID)
  concept?: string;            // Concepto (ej. 'Anticipo 50%', 'Liquidación Total', etc.)
  amount?: number;             // Monto de la factura
  currency?: 'MXN' | 'USD';
  invoiceDate: string;         // Fecha de la factura
  fileUrl: string;             // Imagen Base64 o Enlace Web (Drive, Dropbox, etc.)
  fileType: 'image' | 'pdf' | 'link';
  fileName?: string;           // Nombre del archivo
  status?: 'emitida' | 'pagada' | 'cancelada';
  notes?: string;              // Observaciones
  uploadedBy?: string;         // Usuario que adjuntó la factura
  createdAt: string;
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
  contactEmail?: string;
  contactPhone?: string;
  requirements?: DealRequirement[];
  invoices?: DealInvoice[];
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

// -------------------------------------------------------------
// SECCIÓN 3: VENTAS Y ACTIVIDADES DIARIAS / SEMANALES
// -------------------------------------------------------------
export type SalesActivityType =
  | 'llamada'          // 5 Llamadas diarias
  | 'prospecto'        // 2 nuevos prospectos cada semana y media
  | 'seguimiento'      // Seguimiento a clientes con evidencia
  | 'cotizacion'       // 3 cotizaciones por semana
  | 'visita'           // Visitas presenciales
  | 'reunion';         // 2 reuniones comerciales por mes (Ale o Fer)

export interface SalesActivity {
  id: string;
  type: SalesActivityType;
  executiveName: string; // 'Ale', 'Fer', etc.
  executiveEmail?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  createdAt: string;

  // Llamadas
  phone?: string;
  clientName?: string;
  answered?: boolean; // ¿Contestó o no?
  notes?: string; // Comentarios / Minuta / ¿Qué dijo el cliente?

  // Prospectos Nuevos
  company?: string;
  email?: string;
  acquisitionDate?: string; // Fecha en la que lo consiguió

  // Seguimiento
  subject?: string; // Asunto previo
  contactMethod?: string; // Medio de contacto
  clientFeedback?: string; // Información de la llamada / ¿Qué dijo el cliente?
  nextDate?: string; // Siguiente fecha
  evidenceUrl?: string; // Evidencia del contacto (fotografía / comprobante)

  // Cotizaciones
  folio?: string; // Documento con folio
  hotel?: string;
  eventDates?: string; // Fechas
  quantity?: number; // Cantidad
  service?: string; // Servicio
  amount?: number; // Importe ($)
  validUntil?: string; // Vigencia
  proofUrl?: string; // Comprobante de envío

  // Visitas Presenciales
  scheduledDate?: string; // Cita previa
  receiverName?: string; // Nombre de quien recibió
  receiverRole?: string; // Cargo de quien recibió
  minutes?: string; // Minuta
  attendanceProofUrl?: string; // Constancia de asistencia

  // Reunión Comercial
  invitationProofUrl?: string; // Invitación o confirmación
  attendees?: string; // Asistentes
  topic?: string; // Tema
  agreements?: string; // Acuerdos
  nextAction?: string; // Siguiente acción
  assignedRep?: 'Ale' | 'Fer' | string; // Quién va a ir (Ale o Fer)
}

export interface SalesExecutive {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  initials?: string;
}

export const DEFAULT_SALES_EXECUTIVES: SalesExecutive[] = [
  { id: 'exec-ale', name: 'Ale', role: 'Ejecutiva de Ventas', email: 'ale@grupoorganico.com', initials: 'AL' },
  { id: 'exec-fer', name: 'Fer', role: 'Ejecutivo de Ventas', email: 'fer@grupoorganico.com', initials: 'FE' }
];

export interface SalesTaskCategoryDef {
  type: SalesActivityType;
  title: string;
  shortTitle: string;
  icon: string;
  cadence: 'diaria' | 'semanal' | 'mensual';
  targetCount: number;
  targetLabel: string;
  description: string;
  color: string;
  accentBg: string;
  borderColor: string;
}

export const SALES_TASK_CATEGORIES: SalesTaskCategoryDef[] = [
  {
    type: 'llamada',
    title: 'Llamadas Diarias',
    shortTitle: 'Llamadas',
    icon: '📞',
    cadence: 'diaria',
    targetCount: 5,
    targetLabel: '5 llamadas diarias',
    description: 'Registro diario de llamadas a clientes: hora, fecha, número, cliente, si contestó y comentarios.',
    color: 'text-blue-700',
    accentBg: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    type: 'prospecto',
    title: 'Prospectos Nuevos',
    shortTitle: 'Prospectos',
    icon: '🎯',
    cadence: 'semanal',
    targetCount: 2,
    targetLabel: '2 nuevos cada semana y media',
    description: 'Captación de prospectos: nombre, teléfono, empresa, correo electrónico y fecha de adquisición.',
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    type: 'seguimiento',
    title: 'Seguimiento de Clientes',
    shortTitle: 'Seguimiento',
    icon: '🔄',
    cadence: 'semanal',
    targetCount: 5,
    targetLabel: 'Seguimiento y evidencia',
    description: 'Nombre del cliente, asunto previo, medio de contacto, respuesta del cliente, siguiente fecha y evidencia.',
    color: 'text-amber-700',
    accentBg: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    type: 'cotizacion',
    title: 'Cotizaciones',
    shortTitle: 'Cotizaciones',
    icon: '📑',
    cadence: 'semanal',
    targetCount: 3,
    targetLabel: '3 por semana',
    description: 'Documento con folio, cliente, hotel, fechas, cantidad, servicio, importe, vigencia y comprobante de envío.',
    color: 'text-purple-700',
    accentBg: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    type: 'visita',
    title: 'Visitas Presenciales',
    shortTitle: 'Visitas',
    icon: '📍',
    cadence: 'semanal',
    targetCount: 1,
    targetLabel: 'Inspección en sitio',
    description: 'Cita previa, nombre y cargo de quien recibió, minuta y constancia de asistencia.',
    color: 'text-rose-700',
    accentBg: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
  {
    type: 'reunion',
    title: 'Reunión Comercial',
    shortTitle: 'Reunión Comercial',
    icon: '🤝',
    cadence: 'mensual',
    targetCount: 2,
    targetLabel: '2 por mes (Ale o Fer)',
    description: 'Invitación/confirmación, asistentes, hora, tema, acuerdos y siguiente acción (indicando si va Ale o Fer).',
    color: 'text-indigo-700',
    accentBg: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];
