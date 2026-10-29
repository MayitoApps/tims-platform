import { Campaign, MarketingTask, SalesLead, SalesAsset, BriefDoc, UserProfile } from './types';

export const TEAM_MEMBERS: Record<string, UserProfile> = {
  elena: {
    id: 'usr-1',
    name: 'Elena Rostova',
    email: 'elena@tims.studio',
    role: 'marketing',
    initials: 'ER'
  },
  marcus: {
    id: 'usr-2',
    name: 'Marcus Vance',
    email: 'marcus@tims.studio',
    role: 'sales',
    initials: 'MV'
  },
  clara: {
    id: 'usr-3',
    name: 'Clara Beaumont',
    email: 'clara@tims.studio',
    role: 'marketing',
    initials: 'CB'
  },
  diego: {
    id: 'usr-4',
    name: 'Diego Morales',
    email: 'diego@tims.studio',
    role: 'sales',
    initials: 'DM'
  }
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp-1',
    code: 'CMP-01',
    title: 'Lanzamiento Colección Primavera · Edition 26',
    description: 'Campaña omnicanal de posicionamiento premium y captación de clientes de alto valor.',
    status: 'active',
    leadOwner: TEAM_MEMBERS.elena,
    budget: 18500,
    spent: 9200,
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    channels: ['Instagram Ads', 'LinkedIn B2B', 'Editorial Newsletter'],
    externalLinks: [
      { id: 'lnk-1', title: 'Figma Design System & Creativos', url: 'https://figma.com/@tims/spring-26', platform: 'figma' },
      { id: 'lnk-2', title: 'Drive · Copys & Guiones de Video', url: 'https://drive.google.com/drive/folders/spring26', platform: 'drive' }
    ],
    tasksCount: 14,
    completedTasksCount: 10,
    leadsGenerated: 34
  },
  {
    id: 'cmp-2',
    code: 'CMP-02',
    title: 'Adquisición Clientes Corporativos · Q1',
    description: 'Pauta digital segmentada a directores de compras y gerentes de innovación.',
    status: 'in_production',
    leadOwner: TEAM_MEMBERS.clara,
    budget: 12000,
    spent: 4500,
    startDate: '2026-03-10',
    endDate: '2026-05-01',
    channels: ['LinkedIn Ads', 'Google Search', 'Account-Based Marketing'],
    externalLinks: [
      { id: 'lnk-3', title: 'Canva Pitch Presentation Kit', url: 'https://canva.com/design/tims-b2b', platform: 'canva' },
      { id: 'lnk-4', title: 'Drive · Fichas Técnicas PDF', url: 'https://drive.google.com/drive/folders/fichas-b2b', platform: 'drive' }
    ],
    tasksCount: 9,
    completedTasksCount: 4,
    leadsGenerated: 19
  },
  {
    id: 'cmp-3',
    code: 'CMP-03',
    title: 'Rediseño de Marca & Arquitectura Editorial',
    description: 'Renovación de papelería, catálogo digital e identidad visual de la compañía.',
    status: 'review',
    leadOwner: TEAM_MEMBERS.elena,
    budget: 8500,
    spent: 8000,
    startDate: '2026-02-15',
    endDate: '2026-03-30',
    channels: ['Brand Identity', 'Website', 'Packaging'],
    externalLinks: [
      { id: 'lnk-5', title: 'Figma Brand Guidelines V2', url: 'https://figma.com/@tims/brand-guidelines', platform: 'figma' }
    ],
    tasksCount: 8,
    completedTasksCount: 7,
    leadsGenerated: 6
  }
];

export const INITIAL_TASKS: MarketingTask[] = [
  {
    id: 'tsk-1',
    campaignId: 'cmp-1',
    campaignTitle: 'Lanzamiento Colección Primavera',
    title: 'Shooting de producto & selección de tomas editoriales',
    phase: 'approved',
    assignee: TEAM_MEMBERS.elena,
    dueDate: '2026-03-05',
    priority: 'high',
    externalLinks: [
      { id: 'tl-1', title: 'Dropbox Galería RAW', url: 'https://dropbox.com/sh/tims-raw', platform: 'dropbox' }
    ]
  },
  {
    id: 'tsk-2',
    campaignId: 'cmp-1',
    campaignTitle: 'Lanzamiento Colección Primavera',
    title: 'Redacción de copys persuasivos para Newsletter y Ads',
    phase: 'approved',
    assignee: TEAM_MEMBERS.clara,
    dueDate: '2026-03-08',
    priority: 'normal',
    externalLinks: [
      { id: 'tl-2', title: 'Google Docs · Copys Aprobados', url: 'https://docs.google.com/document/d/copys', platform: 'drive' }
    ]
  },
  {
    id: 'tsk-3',
    campaignId: 'cmp-1',
    campaignTitle: 'Lanzamiento Colección Primavera',
    title: 'Diseño de carruseles de alta conversión y stories',
    phase: 'review',
    assignee: TEAM_MEMBERS.elena,
    dueDate: '2026-03-12',
    priority: 'urgent',
    externalLinks: [
      { id: 'tl-3', title: 'Figma Board de Creativos', url: 'https://figma.com/@tims/social-ads', platform: 'figma' }
    ]
  },
  {
    id: 'tsk-4',
    campaignId: 'cmp-2',
    campaignTitle: 'Adquisición Clientes Corporativos',
    title: 'Diseño de One-Pager comercial para clientes enterprise',
    phase: 'design',
    assignee: TEAM_MEMBERS.clara,
    dueDate: '2026-03-18',
    priority: 'high',
    externalLinks: [
      { id: 'tl-4', title: 'Figma One-Pager Layout', url: 'https://figma.com/@tims/one-pager', platform: 'figma' }
    ]
  },
  {
    id: 'tsk-5',
    campaignId: 'cmp-2',
    campaignTitle: 'Adquisición Clientes Corporativos',
    title: 'Configuración de campaña de Lead Gen en LinkedIn',
    phase: 'copywriting',
    assignee: TEAM_MEMBERS.elena,
    dueDate: '2026-03-20',
    priority: 'normal',
    externalLinks: []
  }
];

export const INITIAL_LEADS: SalesLead[] = [
  {
    id: 'led-1',
    code: 'LD-101',
    contactName: 'Valeria Sotomayor',
    company: 'Atelier Kering Group',
    email: 'v.sotomayor@atelierkering.com',
    phone: '+52 55 4192 8830',
    stage: 'negotiation',
    dealValue: 24000,
    sourceCampaignId: 'cmp-1',
    sourceCampaignTitle: 'Lanzamiento Colección Primavera',
    assignedRep: TEAM_MEMBERS.marcus,
    qualifiedByMarketing: true,
    notes: 'Interesada en plan corporativo anual. Ya revisó el deck comercial y solicitó propuesta formal.',
    lastContactDate: '2026-03-02',
    nextFollowUpDate: '2026-03-06'
  },
  {
    id: 'led-2',
    code: 'LD-102',
    contactName: 'Julián Cárdenas',
    company: 'Nórdico Design Studio',
    email: 'julian@nordicostudio.io',
    phone: '+52 81 1204 9912',
    stage: 'proposal_sent',
    dealValue: 14500,
    sourceCampaignId: 'cmp-2',
    sourceCampaignTitle: 'Adquisición Clientes Corporativos',
    assignedRep: TEAM_MEMBERS.diego,
    qualifiedByMarketing: true,
    notes: 'Llegó por LinkedIn Ad. Tuvieron llamada exploratoria de 30 min. Propuesta enviada el lunes.',
    lastContactDate: '2026-03-01',
    nextFollowUpDate: '2026-03-05'
  },
  {
    id: 'led-3',
    code: 'LD-103',
    contactName: 'Lucía Mendizábal',
    company: 'Mendizábal & Co. Consultores',
    email: 'lucia@mendizabal.co',
    phone: '+52 33 8921 4450',
    stage: 'contacted',
    dealValue: 18000,
    sourceCampaignId: 'cmp-2',
    sourceCampaignTitle: 'Adquisición Clientes Corporativos',
    assignedRep: TEAM_MEMBERS.marcus,
    qualifiedByMarketing: true,
    notes: 'Lead calificado por marketing. Demo agendada para el jueves.',
    lastContactDate: '2026-03-03',
    nextFollowUpDate: '2026-03-06'
  },
  {
    id: 'led-4',
    code: 'LD-104',
    contactName: 'Ignacio Larrea',
    company: 'Grupo Retail Sur',
    email: 'ilarrea@retailsur.com.mx',
    phone: '+52 55 6010 7723',
    stage: 'mql_qualified',
    dealValue: 31000,
    sourceCampaignId: 'cmp-1',
    sourceCampaignTitle: 'Lanzamiento Colección Primavera',
    assignedRep: TEAM_MEMBERS.diego,
    qualifiedByMarketing: true,
    notes: 'Descargó el catálogo editorial y solicitó ser contactado por un asesor de cuentas.',
    lastContactDate: '2026-03-03',
    nextFollowUpDate: '2026-03-04'
  },
  {
    id: 'led-5',
    code: 'LD-105',
    contactName: 'Guillermo Fábregas',
    company: 'Horizon Logistics',
    email: 'gfabregas@horizonlog.com',
    phone: '+52 55 3344 1122',
    stage: 'won',
    dealValue: 42000,
    sourceCampaignId: 'cmp-2',
    sourceCampaignTitle: 'Adquisición Clientes Corporativos',
    assignedRep: TEAM_MEMBERS.marcus,
    qualifiedByMarketing: true,
    notes: 'Contrato firmado por 12 meses. Onboarding programado.',
    lastContactDate: '2026-02-27',
    nextFollowUpDate: '2026-03-15'
  }
];

export const INITIAL_ASSETS: SalesAsset[] = [
  {
    id: 'ast-1',
    title: 'Deck Comercial Ejecutivo 2026 (Oficial)',
    category: 'deck',
    platform: 'canva',
    url: 'https://canva.com/design/tims-deck-official',
    description: 'Presentación oficial de 14 diapositivas para reuniones de prospección y cierre.',
    updatedAt: '2026-03-01',
    version: 'v3.2',
    author: 'Elena Rostova (Marketing)'
  },
  {
    id: 'ast-2',
    title: 'One-Pager Resumen de Servicios & Tarifas',
    category: 'one_pager',
    platform: 'drive',
    url: 'https://drive.google.com/file/d/one-pager-tims.pdf',
    description: 'Ficha PDF de una página lista para enviar a prospectos por WhatsApp o Email.',
    updatedAt: '2026-02-28',
    version: 'v2.0',
    author: 'Clara Beaumont (Marketing)'
  },
  {
    id: 'ast-3',
    title: 'Guía de Identidad de Marca & Manual de Uso',
    category: 'guidelines',
    platform: 'figma',
    url: 'https://figma.com/@tims/brand-guidelines',
    description: 'Paleta tipográfica, lineamientos de color, logotipos en vector y tono de voz.',
    updatedAt: '2026-02-15',
    version: 'v1.4',
    author: 'Elena Rostova (Marketing)'
  },
  {
    id: 'ast-4',
    title: 'Caso de Éxito: Crecimiento B2B Atelier Kering',
    category: 'case_study',
    platform: 'drive',
    url: 'https://drive.google.com/file/d/case-study-kering.pdf',
    description: 'Documento de métricas y testimonios para derribar objeciones en etapa de propuesta.',
    updatedAt: '2026-03-02',
    version: 'v1.0',
    author: 'Elena Rostova (Marketing)'
  }
];

export const INITIAL_BRIEF: BriefDoc = {
  id: 'brf-1',
  campaignId: 'cmp-1',
  title: 'Brief Estratégico · Lanzamiento Colección Primavera',
  subtitle: 'Guía de concepto, audiencia, objetivos de conversión y entregables clave para Q1 2026',
  objective: 'Posicionar la nueva línea premium de servicios como el referente editorial indiscutible del sector, generando al menos 50 prospectos calificados (MQLs) con un deal value promedio superior a $15,000 USD.',
  targetAudience: 'Directores de Marketing, VP de Estrategia y Dueños de Marcas de Diseño con facturación anual superior a $1M USD que buscan una estética impecable y resultados tangibles.',
  valueProposition: 'Elegancia sin esfuerzo: la precisión del diseño suizo unida al rigor de una estrategia comercial de alto impacto.',
  keyDeliverables: [
    '1 Brand Video Hero en formato 16:9 y 9:16 (45 seg).',
    '3 Carruseles editoriales con tipografía de alto contraste.',
    '1 Landing Page de alta conversión optimizada para móviles.',
    'Ficha técnica y One-Pager comercial para el equipo de ventas.',
    'Secuencia de 4 correos automatizados de bienvenida y nutrición.'
  ],
  timelineNotes: 'Producción de artes del 1 al 10 de marzo. Pauta publicitaria activa a partir del 15 de marzo. Revisión comercial semanal los viernes.',
  author: TEAM_MEMBERS.elena,
  lastModified: '2026-03-02'
};
