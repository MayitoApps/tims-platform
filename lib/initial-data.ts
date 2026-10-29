import {
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  HotelDeal,
  HotelSpaceInfo,
  HotelRoomType,
  MarketingTask
} from './types';

// =============================================================
// HOTELES OFICIALES DE GRUPO ORGÁNICO HOTEL BOUTIQUE
// =============================================================
export const CAMPAIGN_HOTEL_TARGETS = [
  'Todos los Hoteles (Grupo Orgánico)',
  'Orgánico Ajusco',
  'Orgánico Valle de Bravo',
  'Orgánico Tepoztlán',
  'Orgánico Veracruz',
  'Centro Cultural Quinta Soledad',
  'Frontera 49 Roma Norte'
];

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
// DATOS EN BLANCO: LISTO PARA PROYECTOS REALES
// =============================================================
export const INITIAL_DEALS: HotelDeal[] = [];
export const INITIAL_CAMPAIGNS: MarketingCampaign[] = [];
export const INITIAL_PUBLICATIONS: ContentPublication[] = [];
export const INITIAL_BRIEFS: CreativeBrief[] = [];
export const INITIAL_MARKETING_TASKS: MarketingTask[] = [];
