import {
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  HotelDeal,
  HotelFactsheet,
  HotelSpaceInfo
} from './types';

// =============================================================
// HOTELES OFICIALES DE GRUPO ORGÁNICO HOTEL BOUTIQUE
// =============================================================
export const HOTEL_PROPERTIES = [
  'Orgánico Ajusco',
  'Orgánico Valle de Bravo',
  'Orgánico Tepoztlán',
  'Orgánico Veracruz',
  'Centro Cultural Quinta Soledad',
  'Frontera 49 Roma Norte'
];

// =============================================================
// ESPACIOS OFICIALES POR HOTEL (Extraídos de cada propiedad)
// =============================================================
export const HOTEL_SPACES: Record<string, HotelSpaceInfo[]> = {
  'Orgánico Ajusco': [
    { id: 'aj-sal-vic', name: 'Salón Victoria', description: 'Espacio cerrado con calefacción para recepciones y cenas de gala', type: 'salon' },
    { id: 'aj-aud-isa', name: 'Auditorio Isaura', description: 'Espacio multifuncional para juntas de consejo y dinámicas de grupo', type: 'salon' },
    { id: 'aj-jar-chu', name: 'Jardín Chulavista & Lago Victoria', description: 'Jardín panorámico entre coníferas para ceremonias y cócteles', type: 'jardin' },
    { id: 'aj-cas-clu', name: 'Casa Club & Chimenea Central', description: 'Área común acogedora con billar, bar y lounge de montaña', type: 'restaurante' },
    { id: 'aj-res-pet', name: 'Restaurante Don Petro & Terraza', description: 'Gastronomía de autor a la leña y fuego vivo', type: 'restaurante' },
    { id: 'aj-cab-bos', name: 'Cabañas & Master Suites del Bosque', description: 'Hospedaje de lujo rústico con chimenea privada', type: 'hospedaje' },
    { id: 'aj-mir-pda', name: 'Mirador Pico del Águila & Fogateros', description: 'Zona de fogatadas nocturnas con antorchas y vista al valle', type: 'terraza' }
  ],
  'Orgánico Valle de Bravo': [
    { id: 'vb-res-mil', name: 'Restaurante Milagro & Terraza', description: 'Cocina orgánica campestre con terraza rodeada de pinos', type: 'restaurante' },
    { id: 'vb-bar-bie', name: 'Bar de Mixología Bienaventurado', description: 'Lounge exclusivo de coctelería botánica y autor', type: 'restaurante' },
    { id: 'vb-jar-bos', name: 'Jardines del Bosque para Bodas', description: 'Claro natural arbolado para banquetes y bodas de destino', type: 'jardin' },
    { id: 'vb-are-alb', name: 'Área de Alberca & Asoleadero', description: 'Piscina templada con camastros y vista a la montaña', type: 'terraza' },
    { id: 'vb-sal-ret', name: 'Salón de Retiros & Talleres', description: 'Espacio vidriado con luz natural para yoga y sesiones ejecutivas', type: 'salon' },
    { id: 'vb-cab-pri', name: 'Suites & Cabañas Boutique', description: 'Hospedaje privado con tina de hidromasaje y chimenea', type: 'hospedaje' }
  ],
  'Orgánico Tepoztlán': [
    { id: 'tp-jar-mis', name: 'Jardín Místico al Tepozteco', description: 'Explanada de pasto y flora nativa con vista directa al cerro', type: 'jardin' },
    { id: 'tp-alb-vol', name: 'Alberca & Jacuzzi Volcánico', description: 'Zona acuática integrada en piedra volcánica y vegetación', type: 'terraza' },
    { id: 'tp-ter-pan', name: 'Terraza Panorámica Tepozteco', description: 'Mirador elevado para cócteles y ceremonias espirituales', type: 'terraza' },
    { id: 'tp-tem-hol', name: 'Temazcal & Espacio de Sanación', description: 'Área ceremonial para rituales holísticos y bienestar', type: 'bienestar' },
    { id: 'tp-res-ter', name: 'Restaurante del Jardín', description: 'Cocina mexicana contemporánea con ingredientes locales', type: 'restaurante' },
    { id: 'tp-sui-pie', name: 'Suites Rústico-Chic en Piedra', description: 'Habitaciones con arquitectura vernácula y terraza privada', type: 'hospedaje' }
  ],
  'Orgánico Veracruz': [
    { id: 'vr-pla-pri', name: 'Zona de Playa Privada (Costa Esmeralda)', description: 'Arena blanca frente al mar para bodas y ceremonias náuticas', type: 'jardin' },
    { id: 'vr-res-mue', name: 'Restaurante El Muelle', description: 'Pabellón abierto especializado en cocina de mar y mariscos frescos', type: 'restaurante' },
    { id: 'vr-poo-dec', name: 'Pool Deck & Alberca Frente al Mar', description: 'Piscina exterior con tumbonas, palmeras y barra de playa', type: 'terraza' },
    { id: 'vr-jar-tro', name: 'Jardines Tropicales de Palmeras', description: 'Espacio verde para montajes al aire libre y cócteles sunset', type: 'jardin' },
    { id: 'vr-sui-pla', name: 'Suites & Villas de Playa', description: 'Hospedaje costero con brisa marina y acceso directo al mar', type: 'hospedaje' }
  ],
  'Centro Cultural Quinta Soledad': [
    { id: 'qs-aud-pie', name: 'Auditorio Pierre Damain', description: 'Majestuoso salón insignia para 100 personas con techos altos de cantera', type: 'salon' },
    { id: 'qs-sal-gua', name: 'Salón Guadalupe', description: 'Salón señorial para 50 personas con vista a los jardines patrimoniales', type: 'salon' },
    { id: 'qs-cap-vir', name: 'Capilla Virreinal Centenaria', description: 'Templo histórico de 1870 para ceremonias religiosas íntimas', type: 'salon' },
    { id: 'qs-jar-cen', name: 'Jardines Arbolados de Cantera', description: 'Explanada central rodeada de árboles centenarios y muros virreinales', type: 'jardin' },
    { id: 'qs-res-cap', name: 'Restaurante Capitular Tlalpan', description: 'Cocina de autor en casona de época porfiriana', type: 'restaurante' },
    { id: 'qs-cla-bib', name: 'Claustro & Biblioteca Histórica', description: 'Pasillos con arcos y biblioteca para sesiones fotográficas o coctel', type: 'salon' }
  ],
  'Frontera 49 Roma Norte': [
    { id: 'f49-roo-sol', name: 'Rooftop Solárium Roma Norte', description: 'Terraza superior con vista al corazón de la colonia Roma', type: 'terraza' },
    { id: 'f49-res-bar', name: 'Restaurante & Bar Frontera 49', description: 'Gastronomía urbana de autor y coctelería contemporánea', type: 'restaurante' },
    { id: 'f49-sal-wor', name: 'Salas de Trabajo & Co-living Creativo', description: 'Espacios funcionales para workshops, diseño y reuniones ágiles', type: 'salon' },
    { id: 'f49-pat-cen', name: 'Patio Central & Galería de Arte', description: 'Patio interior con iluminación cenital para pop-ups y activaciones', type: 'jardin' },
    { id: 'f49-hab-urb', name: 'Suites Boutique de Diseño', description: 'Hospedaje urbano contemporáneo para creativos y ejecutivos', type: 'hospedaje' }
  ]
};

// =============================================================
// DATOS EJEMPLO: COMERCIALIZACIÓN HOTELERA (Reservaciones & RFPs)
// =============================================================
export const INITIAL_DEALS: HotelDeal[] = [
  {
    id: 'deal-1',
    code: 'RFP-501',
    clientName: 'Alejandra Morales & David Henderson',
    companyOrAgency: 'Boda Morales Henderson (Boutique Wedding)',
    hotelName: 'Orgánico Ajusco',
    selectedSpaces: [
      'Salón Victoria',
      'Jardín Chulavista & Lago Victoria',
      'Cabañas & Master Suites del Bosque',
      'Mirador Pico del Águila & Fogateros'
    ],
    category: 'bodas_sociales',
    stage: 'contratado',
    totalValue: 385000,
    currency: 'MXN',
    roomNights: 28,
    attendeesCount: 140,
    checkInDate: '2026-04-18',
    checkOutDate: '2026-04-20',
    assignedRep: 'Lucía Fernández (Bodas & Sociales)',
    notes: 'Boda de destino en el bosque. Ceremonia en Jardín Chulavista a las 16:00 hrs, recepción y banquete de 4 tiempos en Salón Victoria. Bloqueo total de cabañas para la familia.',
    contactEmail: 'alejandra.morales@gmail.com',
    contactPhone: '+52 55 4912 3001',
    createdAt: '2026-02-10'
  },
  {
    id: 'deal-2',
    code: 'RFP-502',
    clientName: 'Lic. Mariana Garza',
    companyOrAgency: 'L’Oréal México (Cumbre de Innovación y Bienestar)',
    hotelName: 'Centro Cultural Quinta Soledad',
    selectedSpaces: [
      'Auditorio Pierre Damain',
      'Salón Guadalupe',
      'Jardines Arbolados de Cantera',
      'Restaurante Capitular Tlalpan'
    ],
    category: 'grupos_convenciones',
    stage: 'negociacion',
    totalValue: 240000,
    currency: 'MXN',
    roomNights: 0,
    attendeesCount: 95,
    checkInDate: '2026-04-24',
    checkOutDate: '2026-04-24',
    assignedRep: 'Carlos Mendoza (MICE & Corporativo)',
    notes: 'Evento corporativo de todo el día. Conferencia en Auditorio Pierre Damain, breakout rooms en Salón Guadalupe y comida de gala en Jardines de Cantera.',
    contactEmail: 'mgarza@loreal.com.mx',
    contactPhone: '+52 55 8820 1199',
    createdAt: '2026-02-18'
  },
  {
    id: 'deal-3',
    code: 'RFP-503',
    clientName: 'Santiago Bailleres',
    companyOrAgency: 'McKinsey & Co. (Retiro Estratégico Anual de Socios)',
    hotelName: 'Orgánico Valle de Bravo',
    selectedSpaces: [
      'Salón de Retiros & Talleres',
      'Restaurante Milagro & Terraza',
      'Bar de Mixología Bienaventurado',
      'Suites & Cabañas Boutique'
    ],
    category: 'grupos_convenciones',
    stage: 'contratado',
    totalValue: 510000,
    currency: 'MXN',
    roomNights: 45,
    attendeesCount: 30,
    checkInDate: '2026-05-08',
    checkOutDate: '2026-05-11',
    assignedRep: 'Carlos Mendoza (MICE & Corporativo)',
    notes: 'Buyout completo de la propiedad para retiro de liderazgo. Sesiones de trabajo por la mañana en Salón de Retiros y cenas maridaje en Restaurante Milagro.',
    contactEmail: 'santiago_bailleres@mckinsey.com',
    contactPhone: '+52 55 6019 4433',
    createdAt: '2026-02-25'
  },
  {
    id: 'deal-4',
    code: 'RFP-504',
    clientName: 'Valeria Cárdenas',
    companyOrAgency: 'Retiro Holístico & Yoga Shanti',
    hotelName: 'Orgánico Tepoztlán',
    selectedSpaces: [
      'Jardín Místico al Tepozteco',
      'Temazcal & Espacio de Sanación',
      'Terraza Panorámica Tepozteco',
      'Suites Rústico-Chic en Piedra'
    ],
    category: 'bodas_sociales',
    stage: 'propuesta_enviada',
    totalValue: 195000,
    currency: 'MXN',
    roomNights: 32,
    attendeesCount: 22,
    checkInDate: '2026-05-22',
    checkOutDate: '2026-05-24',
    assignedRep: 'Sofía Rebollar (Bienestar & Eventos)',
    notes: 'Retiro de meditación, clases de yoga en Jardín Místico al amanecer y ceremonia de temazcal al atardecer.',
    contactEmail: 'valeria@shantiyoga.mx',
    contactPhone: '+52 777 312 8844',
    createdAt: '2026-03-01'
  },
  {
    id: 'deal-5',
    code: 'RFP-505',
    clientName: 'Guillermo y Pamela Sánchez',
    companyOrAgency: 'Boda frente al mar (Costa Esmeralda)',
    hotelName: 'Orgánico Veracruz',
    selectedSpaces: [
      'Zona de Playa Privada (Costa Esmeralda)',
      'Restaurante El Muelle',
      'Pool Deck & Alberca Frente al Mar',
      'Suites & Villas de Playa'
    ],
    category: 'bodas_sociales',
    stage: 'negociacion',
    totalValue: 320000,
    currency: 'MXN',
    roomNights: 36,
    attendeesCount: 110,
    checkInDate: '2026-06-12',
    checkOutDate: '2026-06-14',
    assignedRep: 'Lucía Fernández (Bodas & Sociales)',
    notes: 'Ceremonia civil en playa al atardecer, coctel de bienvenida en Pool Deck y fiesta con cena de mariscos en El Muelle.',
    contactEmail: 'guillermo_sanchez@outlook.com',
    contactPhone: '+52 229 901 2288',
    createdAt: '2026-03-02'
  },
  {
    id: 'deal-6',
    code: 'RFP-506',
    clientName: 'Diego de la Torre',
    companyOrAgency: 'Galería Mónica Saucedo & Coctel Mezcal Ojo de Tigre',
    hotelName: 'Frontera 49 Roma Norte',
    selectedSpaces: [
      'Rooftop Solárium Roma Norte',
      'Patio Central & Galería de Arte',
      'Restaurante & Bar Frontera 49'
    ],
    category: 'cuentas_empresariales',
    stage: 'contratado',
    totalValue: 98000,
    currency: 'MXN',
    roomNights: 8,
    attendeesCount: 75,
    checkInDate: '2026-04-10',
    checkOutDate: '2026-04-11',
    assignedRep: 'Sofía Rebollar (Bienestar & Eventos)',
    notes: 'Lanzamiento de colección artística contemporánea. Exhibición en Patio Central y barra de mixología premium en el Rooftop.',
    contactEmail: 'diego@monicasaucedo.art',
    contactPhone: '+52 55 1199 4400',
    createdAt: '2026-03-01'
  }
];

// =============================================================
// DATOS EJEMPLO: MARKETING & COMUNICACIÓN
// =============================================================
export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'cmp-1',
    code: 'MKT-101',
    title: 'Campaña Bodas de Destino & Romance 2026',
    hotelTarget: 'Orgánico Ajusco',
    type: 'temporada',
    status: 'activa',
    budget: 65000,
    spent: 38000,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    channels: ['Instagram Ads', 'Meta Ads', 'Prensa Estilo de Vida', 'Google Search MICE'],
    externalLinks: [
      { id: 'l1', title: 'Figma Creativos Bodas', url: 'https://figma.com', platform: 'figma' },
      { id: 'l2', title: 'Drive Fotos Salón Victoria', url: 'https://drive.google.com', platform: 'drive' }
    ],
    leadOwner: 'Elena Rostova (Marketing)',
    description: 'Atracción de parejas para bodas íntimas en el bosque con pauta segmentada a CDMX, Toluca y Querétaro.',
    selectedSpaces: ['Salón Victoria', 'Jardín Chulavista & Lago Victoria']
  },
  {
    id: 'cmp-2',
    code: 'MKT-102',
    title: 'Posicionamiento Histórico & Cultural Quinta Soledad',
    hotelTarget: 'Centro Cultural Quinta Soledad',
    type: 'marca',
    status: 'en_produccion',
    budget: 45000,
    spent: 18000,
    startDate: '2026-04-01',
    endDate: '2026-06-15',
    channels: ['PR Artículos', 'LinkedIn Corporativo', 'Newsletter Cultural'],
    externalLinks: [
      { id: 'l3', title: 'Drive Comunicados Prensa', url: 'https://drive.google.com', platform: 'drive' }
    ],
    leadOwner: 'Clara Beaumont (Comunicación)',
    description: 'Campaña de relaciones públicas para promover el Auditorio Pierre Damain y el Claustro para eventos culturales y corporativos.',
    selectedSpaces: ['Auditorio Pierre Damain', 'Claustro & Biblioteca Histórica']
  },
  {
    id: 'cmp-3',
    code: 'MKT-103',
    title: 'Escapada Sunset & Mar · Costa Esmeralda',
    hotelTarget: 'Orgánico Veracruz',
    type: 'redes_sociales',
    status: 'planificacion',
    budget: 35000,
    spent: 5000,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    channels: ['TikTok', 'Instagram Reels', 'Influencers Travel'],
    externalLinks: [
      { id: 'l4', title: 'Canva Moodboard Veracruz', url: 'https://canva.com', platform: 'canva' }
    ],
    leadOwner: 'Elena Rostova (Marketing)',
    description: 'Promoción de estancias de playa y gastronomía de mar en Restaurante El Muelle.',
    selectedSpaces: ['Zona de Playa Privada (Costa Esmeralda)', 'Restaurante El Muelle']
  }
];

export const INITIAL_PUBLICATIONS: ContentPublication[] = [
  {
    id: 'pub-1',
    title: 'Reel: Un despertar entre la bruma del Ajusco en Cabaña Master',
    hotel: 'Orgánico Ajusco',
    channel: 'instagram',
    publishDate: '2026-04-05',
    status: 'programado',
    responsible: 'Equipo Audiovisual'
  },
  {
    id: 'pub-2',
    title: 'Nota de Prensa: Quinta Soledad, el refugio virreinal de Tlalpan para bodas de ensueño',
    hotel: 'Centro Cultural Quinta Soledad',
    channel: 'prensa',
    publishDate: '2026-04-12',
    status: 'redactado',
    responsible: 'Clara Beaumont'
  },
  {
    id: 'pub-3',
    title: 'TikTok: 3 razones para hacer tu retiro de yoga en Orgánico Tepoztlán',
    hotel: 'Orgánico Tepoztlán',
    channel: 'tiktok',
    publishDate: '2026-04-18',
    status: 'idea',
    responsible: 'Social Media Lead'
  },
  {
    id: 'pub-4',
    title: 'LinkedIn: Retiros de Consejo de Alto Nivel en Orgánico Valle de Bravo',
    hotel: 'Orgánico Valle de Bravo',
    channel: 'linkedin',
    publishDate: '2026-04-22',
    status: 'diseñado',
    responsible: 'Clara Beaumont'
  }
];

export const INITIAL_BRIEFS: CreativeBrief[] = [
  {
    id: 'brf-1',
    title: 'Shooting Oficial: Nuevas Master Suites & Chimeneas Ajusco',
    hotelTarget: 'Orgánico Ajusco',
    category: 'shooting_fotografico',
    objective: 'Actualizar banco de imágenes HD para página web y catálogo de ventas para parejas y bodas.',
    targetAudience: 'Parejas entre 28 y 45 años, ejecutivos y planificadores de bodas de lujo.',
    keyMessage: 'El bosque y el confort rústico más exclusivo a 40 minutos de la ciudad.',
    deliverables: [
      '25 Fotografías de arquitectura e interiores de cabañas',
      '1 Video teaser cinematográfico de 30 segundos (4K)',
      '10 Tomas de detalle en fogateros y vistas al Pico del Águila'
    ],
    author: 'Elena Rostova',
    date: '2026-03-20',
    spacesTarget: ['Salón Victoria', 'Cabañas & Master Suites del Bosque', 'Mirador Pico del Águila & Fogateros']
  },
  {
    id: 'brf-2',
    title: 'Comunicado de Prensa: Apertura de Temporada Gastronómica El Muelle',
    hotelTarget: 'Orgánico Veracruz',
    category: 'comunicado_prensa',
    objective: 'Lograr menciones en revistas especializadas de gastronomía y viajes (Food & Travel, Quién, Travesías).',
    targetAudience: 'Amantes de la cocina del mar y turistas de fin de semana de CDMX y Puebla.',
    keyMessage: 'La riqueza marina de Costa Esmeralda con la elegancia relajada de Orgánico.',
    deliverables: [
      'Boletín de prensa oficial redactado en 2 páginas',
      'Fotogalería de 8 platillos insignia de Restaurante El Muelle',
      'Kit de medios para editores de prensa'
    ],
    author: 'Clara Beaumont',
    date: '2026-03-25',
    spacesTarget: ['Restaurante El Muelle', 'Zona de Playa Privada (Costa Esmeralda)']
  }
];

export const INITIAL_FACTSHEETS: HotelFactsheet[] = [
  {
    id: 'fs-1',
    hotelName: 'Orgánico Ajusco',
    title: 'Factsheet de Salón Victoria & Auditorio Isaura 2026',
    type: 'capacidad_salones',
    fileUrl: 'https://drive.google.com',
    updatedAt: '2026-03-01',
    version: 'v2026.1'
  },
  {
    id: 'fs-2',
    hotelName: 'Centro Cultural Quinta Soledad',
    title: 'Planos y Capacidades Auditorio Pierre Damain & Claustro',
    type: 'capacidad_salones',
    fileUrl: 'https://drive.google.com',
    updatedAt: '2026-02-15',
    version: 'v2026.2'
  },
  {
    id: 'fs-3',
    hotelName: 'Orgánico Valle de Bravo',
    title: 'Tarifario de Grupos & Menús de Banquetes Milagro',
    type: 'tarifario_grupos',
    fileUrl: 'https://drive.google.com',
    updatedAt: '2026-03-05',
    version: 'v2026.1'
  },
  {
    id: 'fs-4',
    hotelName: 'Orgánico Veracruz',
    title: 'Paquetes de Bodas Frente al Mar Costa Esmeralda',
    type: 'paquetes_bodas',
    fileUrl: 'https://drive.google.com',
    updatedAt: '2026-02-28',
    version: 'v2026.1'
  }
];
