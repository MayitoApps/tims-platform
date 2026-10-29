import {
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  HotelDeal,
  HotelSpaceInfo,
  HotelRoomType
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
// ESPACIOS OFICIALES EXTRAÍDOS DIRECTAMENTE DE:
// https://www.gohb.com.mx/nuestros-espacios (Nombres 100% exactos)
// =============================================================
export const HOTEL_SPACES: Record<string, HotelSpaceInfo[]> = {
  'Orgánico Ajusco': [
    { id: 'aj-aud-isa', name: 'Auditorio Isaura', description: 'Capacidad: 60 personas', type: 'salon' },
    { id: 'aj-sal-vic', name: 'Salón Victoria', description: 'Capacidad: 150 personas', type: 'salon' },
    { id: 'aj-cas-clu', name: 'Casa Club', description: 'Capacidad: 20 personas', type: 'salon' },
    { id: 'aj-res-pet', name: 'Restaurante Don Petro', description: 'Capacidad: 100 personas', type: 'restaurante' },
    { id: 'aj-bar-mie', name: 'Bar Miel Sobre Limón', description: 'Capacidad: 50 personas', type: 'restaurante' },
    { id: 'aj-jar-cas', name: 'Jardín Casa Club', description: 'Capacidad: 50 personas', type: 'jardin' },
    { id: 'aj-jar-chu', name: 'Jardín Chula Vista', description: 'Capacidad: 120 personas', type: 'jardin' },
    { id: 'aj-jar-lal', name: 'Jardín Loma Alta', description: 'Capacidad: 60 personas', type: 'jardin' },
    { id: 'aj-jar-les', name: 'Jardín Loma Escondida', description: 'Capacidad: 30 personas', type: 'jardin' },
    { id: 'aj-jar-lli', name: 'Jardín Loma Linda', description: 'Capacidad: 200 personas', type: 'jardin' }
  ],
  'Orgánico Tepoztlán': [
    { id: 'tp-jar-equ', name: 'Jardín Equilibrio', description: 'Capacidad: 150 personas', type: 'jardin' },
    { id: 'tp-alb', name: 'Alberca', description: 'Capacidad: 100 personas', type: 'terraza' },
    { id: 'tp-can-squ', name: 'Cancha de Squash', description: 'Capacidad: 30 personas', type: 'salon' },
    { id: 'tp-cas-clu', name: 'Casa Club', description: 'Capacidad: 30 personas', type: 'salon' },
    { id: 'tp-sal-imp', name: 'Salón Imperfecto', description: 'Capacidad: 80 personas', type: 'salon' },
    { id: 'tp-res-inf', name: 'Restaurante Infinito', description: 'Capacidad: 60 personas', type: 'restaurante' }
  ],
  'Orgánico Valle de Bravo': [
    { id: 'vb-cas-clu', name: 'Casa Club', description: 'Capacidad: 40 personas', type: 'salon' },
    { id: 'vb-sal-por', name: 'Salón Porvenir', description: 'Capacidad: 80 personas', type: 'salon' },
    { id: 'vb-can-ten', name: 'Cancha de Tenis', description: 'Capacidad: 30 personas', type: 'salon' },
    { id: 'vb-fog', name: 'Fogatero', description: 'Capacidad: 30 personas', type: 'terraza' },
    { id: 'vb-jar-cnu', name: 'Jardín Casa Nueva', description: 'Capacidad: 100 personas', type: 'jardin' },
    { id: 'vb-jar-rec', name: 'Jardín Recepción', description: 'Capacidad: 50 personas', type: 'jardin' },
    { id: 'vb-res-mil', name: 'Restaurante Milagro', description: 'Capacidad: 100 personas', type: 'restaurante' },
    { id: 'vb-bar-bie', name: 'Bar Bienaventurado', description: 'Capacidad: 50 personas', type: 'restaurante' },
    { id: 'vb-alb', name: 'Alberca', description: 'Capacidad: 80 personas', type: 'terraza' }
  ],
  'Frontera 49 Roma Norte': [
    { id: 'f49-cow', name: 'Coworking', description: 'Capacidad: 40 personas', type: 'salon' },
    { id: 'f49-for-cul', name: 'Foro Cultural', description: 'Capacidad: 70 personas', type: 'salon' },
    { id: 'f49-res-gar', name: 'Restaurante Garnachería Única', description: 'Capacidad: 50 personas', type: 'restaurante' },
    { id: 'f49-ter', name: 'Terraza', description: 'Capacidad: 80 personas', type: 'terraza' }
  ],
  'Centro Cultural Quinta Soledad': [
    { id: 'qs-aud-pie', name: 'Auditorio Pierre Damian', description: 'Capacidad: 100 personas', type: 'salon' },
    { id: 'qs-bar-alp', name: 'Bar Alpestre', description: 'Capacidad: 100 personas', type: 'restaurante' },
    { id: 'qs-res-cap', name: 'Restaurante Capitular', description: 'Capacidad: 100 personas', type: 'restaurante' },
    { id: 'qs-sal-gua', name: 'Salón Guadalupe', description: 'Capacidad: 50 personas', type: 'salon' },
    { id: 'qs-sal-bas', name: 'Salón Basilio', description: 'Capacidad: 12 personas', type: 'salon' },
    { id: 'qs-sal-con', name: 'Salón Concilio', description: 'Capacidad: 45 personas', type: 'salon' },
    { id: 'qs-sal-lav', name: 'Salón La Valla', description: 'Capacidad: 16 personas', type: 'salon' },
    { id: 'qs-sal-min', name: 'Salón Ministerio', description: 'Capacidad: 40 personas', type: 'salon' },
    { id: 'qs-sal-ova', name: 'Salón Oval', description: 'Capacidad: 45 personas', type: 'salon' },
    { id: 'qs-cap', name: 'Capilla', description: 'Capacidad: 60 personas', type: 'salon' }
  ],
  'Orgánico Veracruz': [
    { id: 'vr-pla-pri', name: 'Zona de Playa Privada', description: 'Bodas y eventos frente al mar en Costa Esmeralda', type: 'jardin' },
    { id: 'vr-res-mue', name: 'Restaurante El Muelle', description: 'Cocina de mar y gastronomía local', type: 'restaurante' },
    { id: 'vr-poo-dec', name: 'Pool Deck & Alberca', description: 'Piscina exterior con tumbonas y palmeras', type: 'terraza' },
    { id: 'vr-jar-tro', name: 'Jardines Tropicales', description: 'Áreas verdes para cócteles y montajes al atardecer', type: 'jardin' },
    { id: 'vr-sui-pla', name: 'Suites de Playa', description: 'Hospedaje costero para eventos y retiros', type: 'hospedaje' }
  ]
};

// =============================================================
// TIPOS DE HABITACIONES Y SUITES OFICIALES DE CADA HOTEL
// Extraídos directamente de sus sitios oficiales (Ajusco, Tepoztlán,
// Valle de Bravo, Frontera 49, Quinta Soledad, Veracruz)
// =============================================================
export const HOTEL_ROOM_TYPES: Record<string, HotelRoomType[]> = {
  'Orgánico Ajusco': [
    { id: 'aj-rm-mini', name: 'Mini Suite', capacity: 'Máx. 2 personas', description: 'Refugio íntimo en el bosque, calefacción, chimenea sujeta a disponibilidad, terraza privada' },
    { id: 'aj-rm-std', name: 'Standard Suite', capacity: 'Máx. 3 personas', description: 'Cabaña-suite espaciosa con cama de lujo, sala de estar, terraza privada y vistas al bosque' },
    { id: 'aj-rm-prem', name: 'Premium Suite', capacity: 'Máx. 3 personas', description: 'Confort superior, chimenea de leña, balcón panorámico y amenidades prémium' },
    { id: 'aj-rm-mst', name: 'Master Suite', capacity: 'Máx. 2 personas', description: 'Máxima exclusividad, cama King Size, sala amplia, chimenea y vistas panorámicas al Pico del Águila' }
  ],
  'Orgánico Tepoztlán': [
    { id: 'tp-rm-std', name: 'Habitación Estándar', capacity: 'Máx. 2 personas', description: 'Cama King Size, terraza y jardín privado con atmósfera mística de quietud' },
    { id: 'tp-rm-prem', name: 'Habitación Premium', capacity: 'Máx. 2 personas', description: 'Cama King Size, sala de estar independiente con muebles de diseño, terraza y jardín privado' }
  ],
  'Orgánico Valle de Bravo': [
    { id: 'vb-rm-mst', name: 'Suite Master', capacity: 'Máx. 2 personas', description: 'Cama King Size, terraza privada, salita de estar, madera viva y minibar de cortesía' },
    { id: 'vb-rm-prem', name: 'Suite Premium', capacity: 'Máx. 2-4 personas', description: 'Opción 1 King o 2 Queen, balcón con vistas al bosque y jardines interiores, aislamiento acústico' }
  ],
  'Frontera 49 Roma Norte': [
    { id: 'f49-rm-dlx', name: 'Habitación Deluxe', capacity: 'Máx. 2 personas', description: 'Máxima privacidad, baño y regadera privados en la habitación, cama King o Queen' },
    { id: 'f49-rm-std', name: 'Habitación Estándar / Doble', capacity: 'Máx. 1-2 personas', description: 'Cama individual o matrimonial, baño exterior compartido impecable' },
    { id: 'f49-rm-dor', name: 'Dormitorio Compartido', capacity: '1 cama individual', description: 'Camas individuales en dormitorio contemporáneo con lockers y acceso a coworking' }
  ],
  'Centro Cultural Quinta Soledad': [
    { id: 'qs-rm-uto-mst', name: 'Suite Utopía (Casona Histórica)', capacity: 'Máx. 2 personas', description: 'Suite señorial en casona virreinal de 1870, techos altos, cama King y lencería fina' },
    { id: 'qs-rm-uto-dob', name: 'Habitación Utopía Doble', capacity: 'Máx. 4 personas', description: 'Dos camas en el claustro histórico de la casona con vista a jardines centenarios' },
    { id: 'qs-rm-her-sen', name: 'Habitación Hermitage Sencilla', capacity: 'Máx. 1-2 personas', description: 'Ala Hotel Express Hermitage, cama matrimonial, baño privado y desayuno' },
    { id: 'qs-rm-her-dob', name: 'Habitación Hermitage Doble', capacity: 'Máx. 2-4 personas', description: 'Ala Hotel Express Hermitage, dos camas individuales, funcional para grupos corporativos' }
  ],
  'Orgánico Veracruz': [
    { id: 'vr-rm-sui-pla', name: 'Suite de Playa Frente al Mar', capacity: 'Máx. 2 personas', description: 'Cama King Size con terraza privada y vista directa a las olas de Costa Esmeralda' },
    { id: 'vr-rm-bun-fam', name: 'Bungalow Familiar Costa Esmeralda', capacity: 'Máx. 4-6 personas', description: 'Espacio amplio para familias o grupos de eventos con área de estar y múltiples camas' },
    { id: 'vr-rm-dob-jar', name: 'Habitación Doble Estándar Jardín', capacity: 'Máx. 2-4 personas', description: 'Dos camas dobles, aire acondicionado y vista a la alberca y jardines tropicales' }
  ]
};

// =============================================================
// DATOS EJEMPLO: COMERCIALIZACIÓN HOTELERA (Reservaciones & RFPs)
// Usando los nombres de espacios 100% exactos de gohb.com.mx
// =============================================================
export const INITIAL_DEALS: HotelDeal[] = [
  {
    id: 'deal-1',
    code: 'RFP-501',
    clientName: 'Alejandra Morales & David Henderson',
    companyOrAgency: 'Boda Morales Henderson',
    hotelName: 'Orgánico Ajusco',
    selectedSpaces: [
      'Salón Victoria',
      'Jardín Chula Vista',
      'Casa Club'
    ],
    requestedRooms: [
      { roomTypeName: 'Master Suite', count: 2 },
      { roomTypeName: 'Premium Suite', count: 6 },
      { roomTypeName: 'Standard Suite', count: 6 }
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
    notes: 'Boda boutique en montaña. Ceremonia en Jardín Chula Vista y cena/baile en Salón Victoria. Casa Club para tornaboda.',
    contactEmail: 'alejandra.morales@gmail.com',
    contactPhone: '+52 55 4912 3001',
    createdAt: '2026-02-10'
  },
  {
    id: 'deal-2',
    code: 'RFP-502',
    clientName: 'Lic. Mariana Garza',
    companyOrAgency: 'L’Oréal México (Cumbre de Innovación)',
    hotelName: 'Centro Cultural Quinta Soledad',
    selectedSpaces: [
      'Auditorio Pierre Damian',
      'Salón Guadalupe',
      'Restaurante Capitular'
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
    notes: 'Conferencias en Auditorio Pierre Damian, mesas de trabajo en Salón Guadalupe y comida en Restaurante Capitular.',
    contactEmail: 'mgarza@loreal.com.mx',
    contactPhone: '+52 55 8820 1199',
    createdAt: '2026-02-18'
  },
  {
    id: 'deal-3',
    code: 'RFP-503',
    clientName: 'Santiago Bailleres',
    companyOrAgency: 'McKinsey & Co. (Retiro de Liderazgo)',
    hotelName: 'Orgánico Valle de Bravo',
    selectedSpaces: [
      'Salón Porvenir',
      'Restaurante Milagro',
      'Bar Bienaventurado',
      'Fogatero'
    ],
    requestedRooms: [
      { roomTypeName: 'Suite Master', count: 5 },
      { roomTypeName: 'Suite Premium', count: 10 }
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
    notes: 'Sesiones de planeación en Salón Porvenir, cenas maridaje en Restaurante Milagro y fogatada en el Fogatero.',
    contactEmail: 'santiago_bailleres@mckinsey.com',
    contactPhone: '+52 55 6019 4433',
    createdAt: '2026-02-25'
  },
  {
    id: 'deal-4',
    code: 'RFP-504',
    clientName: 'Valeria Cárdenas',
    companyOrAgency: 'Retiro Holístico Shanti Yoga',
    hotelName: 'Orgánico Tepoztlán',
    selectedSpaces: [
      'Jardín Equilibrio',
      'Salón Imperfecto',
      'Restaurante Infinito'
    ],
    requestedRooms: [
      { roomTypeName: 'Habitación Premium', count: 8 },
      { roomTypeName: 'Habitación Estándar', count: 8 }
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
    notes: 'Meditación matutina en Jardín Equilibrio, talleres en Salón Imperfecto y comidas en Restaurante Infinito.',
    contactEmail: 'valeria@shantiyoga.mx',
    contactPhone: '+52 777 312 8844',
    createdAt: '2026-03-01'
  },
  {
    id: 'deal-5',
    code: 'RFP-505',
    clientName: 'Guillermo y Pamela Sánchez',
    companyOrAgency: 'Boda Sánchez & Romo',
    hotelName: 'Orgánico Veracruz',
    selectedSpaces: [
      'Zona de Playa Privada',
      'Restaurante El Muelle',
      'Pool Deck & Alberca'
    ],
    requestedRooms: [
      { roomTypeName: 'Suite de Playa Frente al Mar', count: 6 },
      { roomTypeName: 'Bungalow Familiar Costa Esmeralda', count: 4 },
      { roomTypeName: 'Habitación Doble Estándar Jardín', count: 8 }
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
    notes: 'Ceremonia en Playa Privada, banquete de mariscos en El Muelle y barra de cocteles en Pool Deck.',
    contactEmail: 'guillermo_sanchez@outlook.com',
    contactPhone: '+52 229 901 2288',
    createdAt: '2026-03-02'
  },
  {
    id: 'deal-6',
    code: 'RFP-506',
    clientName: 'Diego de la Torre',
    companyOrAgency: 'Galería Mónica Saucedo & Coctel Mezcal',
    hotelName: 'Frontera 49 Roma Norte',
    selectedSpaces: [
      'Terraza',
      'Foro Cultural',
      'Restaurante Garnachería Única'
    ],
    requestedRooms: [
      { roomTypeName: 'Habitación Deluxe', count: 4 },
      { roomTypeName: 'Habitación Estándar / Doble', count: 4 }
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
    notes: 'Exhibición de arte en Foro Cultural, degustación en Restaurante Garnachería Única y brindis en Terraza.',
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
    title: 'Campaña Bodas en el Bosque & Romance 2026',
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
    selectedSpaces: ['Salón Victoria', 'Jardín Chula Vista']
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
    description: 'Campaña de relaciones públicas para promover el Auditorio Pierre Damian y los salones para eventos corporativos.',
    selectedSpaces: ['Auditorio Pierre Damian', 'Salón Guadalupe']
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
    selectedSpaces: ['Zona de Playa Privada', 'Restaurante El Muelle']
  }
];

export const INITIAL_PUBLICATIONS: ContentPublication[] = [
  {
    id: 'pub-1',
    title: 'Reel: Un amanecer en Salón Victoria y Jardín Chula Vista',
    hotel: 'Orgánico Ajusco',
    channel: 'instagram',
    publishDate: '2026-04-05',
    status: 'programado',
    responsible: 'Equipo Audiovisual'
  },
  {
    id: 'pub-2',
    title: 'Nota de Prensa: Quinta Soledad, historia virreinal y modernidad en Tlalpan',
    hotel: 'Centro Cultural Quinta Soledad',
    channel: 'prensa',
    publishDate: '2026-04-12',
    status: 'redactado',
    responsible: 'Clara Beaumont'
  },
  {
    id: 'pub-3',
    title: 'TikTok: 3 razones para visitar Jardín Equilibrio en Orgánico Tepoztlán',
    hotel: 'Orgánico Tepoztlán',
    channel: 'tiktok',
    publishDate: '2026-04-18',
    status: 'idea',
    responsible: 'Social Media Lead'
  },
  {
    id: 'pub-4',
    title: 'LinkedIn: Retiros de Consejo de Alto Nivel en Salón Porvenir Valle de Bravo',
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
    title: 'Shooting Oficial: Salón Victoria & Jardines Ajusco 2026',
    hotelTarget: 'Orgánico Ajusco',
    category: 'shooting_fotografico',
    objective: 'Actualizar banco de imágenes HD para catálogo de bodas y eventos corporativos.',
    targetAudience: 'Wedding planners, parejas y directores corporativos.',
    keyMessage: 'Naturaleza y elegancia rústica en el Ajusco.',
    deliverables: [
      '25 Fotografías de Salón Victoria y Jardín Chula Vista',
      '1 Video teaser cinematográfico de 30 segundos (4K)',
      '10 Tomas de detalle en Don Petro y Miel Sobre Limón'
    ],
    author: 'Elena Rostova',
    date: '2026-03-20',
    spacesTarget: ['Salón Victoria', 'Jardín Chula Vista', 'Restaurante Don Petro']
  },
  {
    id: 'brf-2',
    title: 'Comunicado de Prensa: Auditorio Pierre Damian & Experiencias Quinta Soledad',
    hotelTarget: 'Centro Cultural Quinta Soledad',
    category: 'comunicado_prensa',
    objective: 'Menciones en medios nacionales de estilo de vida, negocios y cultura.',
    targetAudience: 'Empresas y organizadores de eventos culturales.',
    keyMessage: 'El recinto virreinal más exclusivo de Tlalpan para eventos memorables.',
    deliverables: [
      'Boletín de prensa oficial',
      'Fotogalería del Auditorio Pierre Damian y Restaurante Capitular'
    ],
    author: 'Clara Beaumont',
    date: '2026-03-25',
    spacesTarget: ['Auditorio Pierre Damian', 'Restaurante Capitular']
  }
];
