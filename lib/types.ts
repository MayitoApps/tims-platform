export type UserRole = 'marketing' | 'sales' | 'admin';

export type AppModuleAccess = 'marketing' | 'commercial' | 'sales';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  initials: string;
  department?: string;
}

export interface DirectoryUserDef {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  department: string;
  modules: AppModuleAccess[];
  showInSalesBoard: boolean;
  showInMarketing: boolean;
  commercialGoalMXN?: number;
  commercialAnnualGoalMXN?: number;
  commercialGoalOrder?: number;
}

export const TEAM_USERS_DIRECTORY: DirectoryUserDef[] = [
  {
    id: 'usr-mario-avalos',
    name: 'Mario Avalos',
    email: 'artes.grupoorganico@gmail.com',
    role: 'admin',
    initials: 'MA',
    department: 'Administración · Marketing y Comunicación',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: false,
    showInMarketing: true
  },
  {
    id: 'usr-alejandra-ocana',
    name: 'Alejandra Ocaña',
    email: 'marketinggrupoorganico@gmail.com',
    role: 'admin',
    initials: 'AO',
    department: 'Administración · Comercialización y Ventas',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false,
    commercialGoalMXN: 725000,
    commercialGoalOrder: 1
  },
  {
    id: 'usr-eduardo-barajas',
    name: 'Eduardo Barajas',
    email: 'eduardo@organicohotelboutique.com',
    role: 'admin',
    initials: 'EB',
    department: 'Dirección · Administrador',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: false,
    showInMarketing: false
  },
  {
    id: 'usr-manuel-barajas',
    name: 'Manuel Barajas',
    email: 'manuel@organicohotelboutique.com',
    role: 'admin',
    initials: 'MB',
    department: 'Dirección · Administrador',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: false,
    showInMarketing: false
  },
  {
    id: 'usr-marisol-trueba',
    name: 'Marisol Trueba',
    email: 'marisol@organicohotelboutique.com',
    role: 'admin',
    initials: 'MT',
    department: 'Dirección · Administrador',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: false,
    showInMarketing: false
  },
  {
    id: 'usr-estefania-azcona',
    name: 'Estefania Azcona',
    email: 'mkt.gohb@gmail.com',
    role: 'marketing',
    initials: 'EA',
    department: 'Marketing, Comercialización y Ventas',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: true,
    commercialGoalMXN: 241000,
    commercialGoalOrder: 4
  },
  {
    id: 'usr-abraham-garcia',
    name: 'Abraham García',
    email: 'otamexperiencias1@gmail.com',
    role: 'sales',
    initials: 'AG',
    department: 'Comercialización y Ventas',
    modules: ['commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false,
    commercialGoalMXN: 362200,
    commercialAnnualGoalMXN: 4446400,
    commercialGoalOrder: 3
  },
  {
    id: 'usr-mario-rangel',
    name: 'Mario Rangel',
    email: 'analista.digitalgohb@gmail.com',
    role: 'sales',
    initials: 'MR',
    department: 'Comercialización y Ventas',
    modules: ['commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false,
    commercialGoalMXN: 241000,
    commercialGoalOrder: 6
  },
  {
    id: 'usr-elizabeth-albarran',
    name: 'Elizabeth Albarran',
    email: 'coordinacionventasohb@gmail.com',
    role: 'admin',
    initials: 'EL',
    department: 'Administración · Comercialización y Ventas',
    modules: ['marketing', 'commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false,
    commercialGoalMXN: 362200,
    commercialAnnualGoalMXN: 4446400,
    commercialGoalOrder: 2
  },
  {
    id: 'usr-fernanda-samaniego',
    name: 'Fernanda Samaniego',
    email: 'comercializacion2ohb@gmail.com',
    role: 'sales',
    initials: 'FS',
    department: 'Comercialización y Ventas',
    modules: ['commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false,
    commercialGoalMXN: 241600,
    commercialAnnualGoalMXN: 2899200,
    commercialGoalOrder: 7
  },
  {
    id: 'usr-diana-marin',
    name: 'Diana Marin',
    email: 'redessocialesatencionaclientes@gmail.com',
    role: 'sales',
    initials: 'DM',
    department: 'Comercialización y Ventas',
    modules: ['commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false
  },
  {
    id: 'usr-camila-martinez',
    name: 'Camila Martinez',
    email: 'jefederecepcionesgrupoorganico@gmail.com',
    role: 'sales',
    initials: 'CM',
    department: 'Comercialización y Ventas',
    modules: ['commercial', 'sales'],
    showInSalesBoard: true,
    showInMarketing: false
  }
];

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
  'artes.grupoorganico@gmail.com',
  'marketinggrupoorganico@gmail.com',
  'coordinacionventasohb@gmail.com',
  'eduardo@organicohotelboutique.com',
  'manuel@organicohotelboutique.com',
  'marisol@organicohotelboutique.com'
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
}

export function getDirectoryUserByEmail(email?: string | null): DirectoryUserDef | undefined {
  if (!email) return undefined;
  const clean = email.toLowerCase().trim();
  return TEAM_USERS_DIRECTORY.find((u) => u.email.toLowerCase() === clean);
}

export function isUserAdmin(user?: { email?: string | null; role?: string | null } | null): boolean {
  if (!user) return false;
  return isAdminEmail(user.email) || user.role === 'admin';
}

export function getUserAllowedModules(user?: { email?: string | null; role?: string | null } | null): AppModuleAccess[] {
  if (!user) return [];
  if (isUserAdmin(user)) return ['marketing', 'commercial', 'sales'];
  const dir = getDirectoryUserByEmail(user.email);
  if (dir) return dir.modules;
  if (user.role === 'marketing') return ['marketing', 'commercial', 'sales'];
  return ['commercial', 'sales'];
}

export function normalizeIdentityText(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesUserIdentity(
  user: { email?: string | null; name?: string | null } | null | undefined,
  targetEmail?: string | null,
  targetName?: string | null
): boolean {
  if (!user) return false;
  const curEmail = (user.email || '').toLowerCase().trim();
  const curName = normalizeIdentityText(user.name);
  if (targetEmail && curEmail && targetEmail.toLowerCase().trim() === curEmail) return true;
  if (targetName && curName) {
    const cleanTargetName = normalizeIdentityText(targetName);
    if (cleanTargetName === curName) return true;
  }
  return false;
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
  linkSection: 'marketing' | 'commercial' | 'sales';
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
    name: 'Mario Avalos',
    email: 'artes.grupoorganico@gmail.com',
    role: 'Administrador · Marketing y Comunicación',
    initials: 'MA'
  },
  {
    name: 'Estefania Azcona',
    email: 'mkt.gohb@gmail.com',
    role: 'Marketing, Ventas y Comercialización',
    initials: 'EA'
  },
  {
    name: 'Alejandra Ocaña',
    email: 'marketinggrupoorganico@gmail.com',
    role: 'Administrador · Comercialización y Ventas',
    initials: 'AO'
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
  | 'otam'                 // OTAM Experiencias / Eventos
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

export interface DealExpedienteDoc {
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DealExpediente {
  serviceOrder?: DealExpedienteDoc;
  paymentProof?: DealExpedienteDoc;
  operationsHandover?: DealExpedienteDoc;
  welcomeEmail?: DealExpedienteDoc;
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
  contractUrl?: string;      // PDF, imagen o enlace del contrato firmado
  contractFileName?: string; // Nombre del archivo de contrato
  expediente?: DealExpediente; // Documentos del expediente (Orden de servicio, pago, entrega, bienvenida)
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
  | 'correo'           // 5 Correos comerciales diarios (25 a la semana)
  | 'prospecto'        // 2 nuevos prospectos cada semana y media
  | 'seguimiento'      // 2 Seguimientos diarios (10 a la semana)
  | 'cotizacion'       // 3 cotizaciones por semana
  | 'visita'           // Visitas presenciales: 1 cada 15 días (o cada 3 semanas)
  | 'reunion'          // Reuniones comerciales (Zoom, Meet o scouting): 1 cada 15 días
  | 'acuerdo';         // Acuerdos comerciales: 1 cierre al mes

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
  nextDate?: string; // Siguiente fecha de seguimiento
  evidenceUrl?: string; // Evidencia (contacto o cierre comercial)

  // Cotizaciones
  folio?: string; // Documento con folio
  hotel?: string;
  eventDates?: string; // Fechas
  quantity?: number; // Cantidad
  service?: string; // Servicio
  amount?: number; // Importe ($)
  validUntil?: string; // Vigencia
  proofUrl?: string; // Comprobante de envío

  // Visitas Presenciales (1 cada 15 días o cada 3 semanas)
  scheduledDate?: string; // Cita previa
  receiverName?: string; // Nombre de quien recibió
  receiverRole?: string; // Cargo de quien recibió
  minutes?: string; // Minuta o motivo de cancelación
  attendanceProofUrl?: string; // Evidencia: foto, pin de ubicación o correo de confirmación
  visitStatus?: 'realizada' | 'cancelada'; // Estado de la visita presencial
  visitEvidenceType?: 'foto' | 'pin_ubicacion' | 'correo_confirmacion' | 'evidencia_cancelacion';
  cancellationProofUrl?: string; // Evidencia correspondiente en caso de cancelación

  // Reunión Comercial (Zoom, Meet o scouting — 1 cada 15 días)
  meetingType?: 'Zoom' | 'Meet' | 'Scouting' | string; // Modalidad
  invitationProofUrl?: string; // Evidencia: correo de acuerdo o confirmación
  attendees?: string; // Asistentes
  topic?: string; // Tema
  agreements?: string; // Acuerdos
  nextAction?: string; // Siguiente acción / siguiente paso
  assignedRep?: 'Ale' | 'Fer' | string; // Quién va a ir (Ale o Fer)

  // Acuerdos Comerciales (1 cierre al mes)
  agreementStatus?: 'cerrado' | 'sin_cierre'; // ¿Hubo cierre o queda en seguimiento?
  closingDocType?: 'Orden de servicio' | 'Reservación' | 'Documento de cierre equivalente' | string;
}

export interface SalesExecutive {
  id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  initials?: string;
}

export const DEFAULT_SALES_EXECUTIVES: SalesExecutive[] = TEAM_USERS_DIRECTORY.filter(
  (u) => u.showInSalesBoard
).map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.department,
  initials: u.initials
}));

export interface SalesTaskCategoryDef {
  type: SalesActivityType;
  title: string;
  shortTitle: string;
  icon: string;
  cadence: 'diaria' | 'semanal' | 'quincenal' | 'mensual';
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
    description: 'Registro diario con comentarios.',
    color: 'text-blue-700',
    accentBg: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    type: 'correo',
    title: 'Correos Comerciales',
    shortTitle: 'Correos',
    icon: '✉️',
    cadence: 'diaria',
    targetCount: 5,
    targetLabel: '5 diarios (25/sem)',
    description: 'Destinatario, asunto, hora y vínculo o copia del mensaje.',
    color: 'text-sky-700',
    accentBg: 'bg-sky-50',
    borderColor: 'border-sky-200'
  },
  {
    type: 'prospecto',
    title: 'Prospectos Nuevos',
    shortTitle: 'Prospectos',
    icon: '🎯',
    cadence: 'semanal',
    targetCount: 2,
    targetLabel: '2 nuevos cada semana y media',
    description: 'Captación con datos de contacto.',
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    type: 'seguimiento',
    title: 'Seguimiento de Clientes',
    shortTitle: 'Seguimiento',
    icon: '🔄',
    cadence: 'diaria',
    targetCount: 2,
    targetLabel: '2 diarios (10/sem)',
    description: 'Respuesta, siguiente fecha y evidencia.',
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
    description: 'Folio, importe, vigencia y envío.',
    color: 'text-purple-700',
    accentBg: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    type: 'visita',
    title: 'Visitas Presenciales',
    shortTitle: 'Visitas',
    icon: '📍',
    cadence: 'quincenal',
    targetCount: 1,
    targetLabel: '1 cada 15 días (o 3 sem)',
    description: 'Evidencia: foto, pin o correo (también si se cancela).',
    color: 'text-rose-700',
    accentBg: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
  {
    type: 'reunion',
    title: 'Reuniones Comerciales',
    shortTitle: 'Reuniones',
    icon: '🤝',
    cadence: 'quincenal',
    targetCount: 1,
    targetLabel: '1 cada 15 días',
    description: 'Zoom, Meet o scouting. Evidencia: correo de confirmación.',
    color: 'text-indigo-700',
    accentBg: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  {
    type: 'acuerdo',
    title: 'Acuerdos Comerciales',
    shortTitle: 'Acuerdos',
    icon: '🏆',
    cadence: 'mensual',
    targetCount: 1,
    targetLabel: '1 cierre al mes',
    description: 'Orden/reserva o siguiente paso con fecha.',
    color: 'text-teal-700',
    accentBg: 'bg-teal-50',
    borderColor: 'border-teal-200'
  }
];

// -------------------------------------------------------------
// METAS FINANCIERAS OFICIALES DE COMERCIALIZACIÓN (MXN)
// Vigencia a partir de Enero 2027
// -------------------------------------------------------------
export const COMMERCIAL_GOALS_START_YEAR = 2027;
export const COMMERCIAL_GOALS_START_DATE = '2027-01-01';

export const COMMERCIAL_EXECUTIVE_GOALS = TEAM_USERS_DIRECTORY.filter(
  (u) => typeof u.commercialGoalMXN === 'number'
).sort((a, b) => (a.commercialGoalOrder || 99) - (b.commercialGoalOrder || 99));

export const COMMERCIAL_EXECUTIVE_MONTHLY_TOTAL_GOAL_MXN = COMMERCIAL_EXECUTIVE_GOALS.reduce(
  (sum, u) => sum + (u.commercialGoalMXN || 0),
  0
);
export const COMMERCIAL_EXECUTIVE_ANNUAL_TOTAL_GOAL_MXN = COMMERCIAL_EXECUTIVE_GOALS.reduce(
  (sum, u) => sum + (u.commercialAnnualGoalMXN ?? (u.commercialGoalMXN || 0) * 12),
  0
);

export function getCommercialExecutiveGoal(email?: string | null, name?: string | null): number | null {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = normalizeIdentityText(name);
  const found = COMMERCIAL_EXECUTIVE_GOALS.find(
    (u) =>
      (cleanEmail && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanName && normalizeIdentityText(u.name) === cleanName)
  );
  return found?.commercialGoalMXN ?? null;
}

export function getCommercialExecutiveAnnualGoal(email?: string | null, name?: string | null): number | null {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = normalizeIdentityText(name);
  const found = COMMERCIAL_EXECUTIVE_GOALS.find(
    (u) =>
      (cleanEmail && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanName && normalizeIdentityText(u.name) === cleanName)
  );
  if (!found || typeof found.commercialGoalMXN !== 'number') return null;
  return found.commercialAnnualGoalMXN ?? found.commercialGoalMXN * 12;
}

export interface HotelCommercialGoalDef {
  hotelKey: string;
  displayLabel: string;
  /** Meta mensual por propiedad (se multiplica × 12 para el total anual del grupo) */
  goalMXN: number | null;
}

export const COMMERCIAL_HOTEL_GOALS: HotelCommercialGoalDef[] = [
  { hotelKey: 'Centro Cultural Quinta Soledad', displayLabel: 'Centro Cultural Quinta Soledad', goalMXN: 2400000 },
  { hotelKey: 'Orgánico Ajusco', displayLabel: 'Orgánico Hotel Boutique Ajusco', goalMXN: 2000000 },
  { hotelKey: 'Orgánico Tepoztlán', displayLabel: 'Orgánico Hotel Boutique Tepoztlán', goalMXN: 1000000 },
  { hotelKey: 'Orgánico Valle de Bravo', displayLabel: 'Orgánico Hotel Boutique Valle de Bravo', goalMXN: 1000000 },
  { hotelKey: 'Frontera 49 Roma Norte', displayLabel: 'Frontera 49 Roma Norte', goalMXN: 600000 },
  { hotelKey: 'Orgánico Veracruz', displayLabel: 'Orgánico Veracruz', goalMXN: null }
];

export const COMMERCIAL_HOTEL_TOTAL_GOAL_MXN = COMMERCIAL_HOTEL_GOALS.reduce(
  (sum, item) => sum + (item.goalMXN || 0),
  0
);
export const COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN = COMMERCIAL_HOTEL_TOTAL_GOAL_MXN * 12;

export interface MonthlyCommercialGoalDef {
  monthNumber: number; // 1..12
  monthKey: string;    // '01'..'12'
  label: string;
  shortLabel: string;
  goalMXN: number;
}

export const COMMERCIAL_MONTHLY_OTAM_GOALS: MonthlyCommercialGoalDef[] = [
  { monthNumber: 1, monthKey: '01', label: 'Enero', shortLabel: 'Ene', goalMXN: 4000000 },
  { monthNumber: 2, monthKey: '02', label: 'Febrero', shortLabel: 'Feb', goalMXN: 2000000 },
  { monthNumber: 3, monthKey: '03', label: 'Marzo', shortLabel: 'Mar', goalMXN: 2000000 },
  { monthNumber: 4, monthKey: '04', label: 'Abril', shortLabel: 'Abr', goalMXN: 1000000 },
  { monthNumber: 5, monthKey: '05', label: 'Mayo', shortLabel: 'May', goalMXN: 1000000 },
  { monthNumber: 6, monthKey: '06', label: 'Junio', shortLabel: 'Jun', goalMXN: 2500000 },
  { monthNumber: 7, monthKey: '07', label: 'Julio', shortLabel: 'Jul', goalMXN: 1500000 },
  { monthNumber: 8, monthKey: '08', label: 'Agosto', shortLabel: 'Ago', goalMXN: 1000000 },
  { monthNumber: 9, monthKey: '09', label: 'Septiembre', shortLabel: 'Sep', goalMXN: 3000000 },
  { monthNumber: 10, monthKey: '10', label: 'Octubre', shortLabel: 'Oct', goalMXN: 2000000 },
  { monthNumber: 11, monthKey: '11', label: 'Noviembre', shortLabel: 'Nov', goalMXN: 5000000 },
  { monthNumber: 12, monthKey: '12', label: 'Diciembre', shortLabel: 'Dic', goalMXN: 5000000 }
];

export const COMMERCIAL_EMPRESARIAL_ANNUAL_TOTAL_GOAL_MXN = COMMERCIAL_MONTHLY_OTAM_GOALS.reduce(
  (sum, m) => sum + m.goalMXN,
  0
);

// Meta Anual del Grupo = Total metas hoteles durante el año (×12 = $84M) + Total metas mensuales empresariales ($30M) = $114,000,000
export const COMMERCIAL_ANNUAL_GOAL_MXN =
  COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN + COMMERCIAL_EMPRESARIAL_ANNUAL_TOTAL_GOAL_MXN;

export function isEmpresarialOrOtamDeal(deal: Pick<HotelDeal, 'category' | 'assignedEmail' | 'companyOrAgency' | 'notes'>): boolean {
  if (
    deal.category === 'empresarial' ||
    deal.category === 'otam' ||
    deal.category === 'cuentas_empresariales' ||
    deal.category === 'grupos_convenciones'
  ) {
    return true;
  }
  const email = (deal.assignedEmail || '').toLowerCase().trim();
  if (email === 'otamexperiencias1@gmail.com') return true;
  const hay = `${deal.companyOrAgency || ''} ${deal.notes || ''}`.toLowerCase();
  return /\botam\b/.test(hay);
}
