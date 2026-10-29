const fs = require('fs');
const path = require('path');

// ==============================================================================
// 1. UPDATE lib/initial-data.ts
// ==============================================================================
const initPath = path.resolve('lib/initial-data.ts');
let initCode = fs.readFileSync(initPath, 'utf8').replace(/\r\n/g, '\n');

if (!initCode.includes('CAMPAIGN_HOTEL_TARGETS')) {
  initCode = initCode.replace(
    `export const HOTEL_PROPERTIES = [`,
    `export const CAMPAIGN_HOTEL_TARGETS = [
  'Todos los Hoteles (Grupo Orgánico)',
  'Orgánico Ajusco',
  'Orgánico Valle de Bravo',
  'Orgánico Tepoztlán',
  'Orgánico Veracruz',
  'Centro Cultural Quinta Soledad',
  'Frontera 49 Roma Norte'
];

export const HOTEL_PROPERTIES = [`
  );
}

// Remove spaces from initial campaigns
initCode = initCode.replace(
  `    hotelTarget: 'Orgánico Ajusco',
    type: 'temporada',
    status: 'activa',
    budget: 65000,
    spent: 38000,
    startDate: '2026-10-15',
    endDate: '2026-12-31',
    channels: ['Instagram Ads', 'Meta Ads', 'Prensa Estilo de Vida', 'Google Search MICE'],
    externalLinks: [
      { id: 'l1', title: 'Figma Creativos Bodas', url: 'https://figma.com', platform: 'figma' },
      { id: 'l2', title: 'Drive Fotos Salón Victoria', url: 'https://drive.google.com', platform: 'drive' }
    ],
    leadOwner: 'Elena Rostova (Marketing)',
    description: 'Atracción de parejas para bodas íntimas en el bosque con pauta segmentada a CDMX, Toluca y Querétaro.',
    selectedSpaces: ['Salón Victoria', 'Jardín Chula Vista']`,
  `    hotelTarget: 'Todos los Hoteles (Grupo Orgánico)',
    type: 'temporada',
    status: 'activa',
    budget: 65000,
    spent: 38000,
    startDate: '2026-10-15',
    endDate: '2026-12-31',
    channels: ['Instagram Ads', 'Meta Ads', 'Prensa Estilo de Vida', 'Google Search MICE'],
    externalLinks: [
      { id: 'l1', title: 'Figma Creativos Bodas', url: 'https://figma.com', platform: 'figma' },
      { id: 'l2', title: 'Drive Fotos Salón Victoria', url: 'https://drive.google.com', platform: 'drive' }
    ],
    leadOwner: 'Elena Rostova (Marketing)',
    description: 'Campaña transversal de posicionamiento en Meta Ads y Google Search para todas las propiedades boutique del grupo.'`
);

initCode = initCode.replace(
  `    description: 'Campaña de relaciones públicas para promover el Auditorio Pierre Damian y los salones para eventos corporativos.',
    selectedSpaces: ['Auditorio Pierre Damian', 'Salón Guadalupe']`,
  `    description: 'Campaña de relaciones públicas para posicionar Centro Cultural Quinta Soledad para retiros de bienestar y eventos de arte.'`
);

initCode = initCode.replace(
  `    description: 'Promoción de estancias de playa y gastronomía de mar en Restaurante El Muelle.',
    selectedSpaces: ['Zona de Playa Privada', 'Restaurante El Muelle']`,
  `    description: 'Promoción de estancias de descanso frente al mar y escapadas de fin de semana en Costa Esmeralda.'`
);

fs.writeFileSync(initPath, initCode, 'utf8');
console.log('lib/initial-data.ts updated!');

// ==============================================================================
// 2. UPDATE components/SharedCalendar.tsx
// ==============================================================================
const calPath = path.resolve('components/SharedCalendar.tsx');
let calCode = fs.readFileSync(calPath, 'utf8').replace(/\r\n/g, '\n');

// A. Filter logic: group-wide campaigns show on all filters
calCode = calCode.replace(
  `  // Hotel filtering
  const filteredItems = items.filter((item) => {
    if (selectedHotel !== 'all' && item.hotel !== selectedHotel) return false;
    return true;
  });`,
  `  // Hotel filtering (Group-wide campaigns show across all hotels or when filtering 'all')
  const filteredItems = items.filter((item) => {
    if (selectedHotel !== 'all') {
      if (item.hotel === 'Todos los Hoteles (Grupo Orgánico)') return true;
      if (item.hotel !== selectedHotel) return false;
    }
    return true;
  });`
);

// B. In campaigns mapping, remove spaces
calCode = calCode.replace(
  `          value: c.budget,
          currency: 'MXN' as const,
          spaces: c.selectedSpaces,
          clientOrLead: c.leadOwner,`,
  `          value: c.budget,
          currency: 'MXN' as const,
          clientOrLead: c.leadOwner,`
);

// C. In activeItemModal, only show spaces for deal (reservations)
calCode = calCode.replace(
  `            {/* Espacios bloqueados */}
            {activeItemModal.spaces && activeItemModal.spaces.length > 0 && (`,
  `            {/* Espacios bloqueados (Solo para reservas comerciales) */}
            {activeItemModal.type === 'deal' && activeItemModal.spaces && activeItemModal.spaces.length > 0 && (`
);

fs.writeFileSync(calPath, calCode, 'utf8');
console.log('components/SharedCalendar.tsx updated!');

// ==============================================================================
// 3. UPDATE components/marketing/MarketingSection.tsx
// ==============================================================================
const mktPath = path.resolve('components/marketing/MarketingSection.tsx');
let mktCode = fs.readFileSync(mktPath, 'utf8').replace(/\r\n/g, '\n');

// Import CAMPAIGN_HOTEL_TARGETS
mktCode = mktCode.replace(
  `import { HOTEL_PROPERTIES, HOTEL_SPACES } from '@/lib/initial-data';`,
  `import { HOTEL_PROPERTIES, HOTEL_SPACES, CAMPAIGN_HOTEL_TARGETS } from '@/lib/initial-data';`
);

// Default cHotel and editCHotel to 'Todos los Hoteles (Grupo Orgánico)'
mktCode = mktCode.replace(
  `  const [editCHotel, setEditCHotel] = useState(HOTEL_PROPERTIES[0]);
  const [editCSelectedSpaces, setEditCSelectedSpaces] = useState<string[]>([]);`,
  `  const [editCHotel, setEditCHotel] = useState<string>(CAMPAIGN_HOTEL_TARGETS[0]);`
);

mktCode = mktCode.replace(
  `  const [cHotel, setCHotel] = useState(HOTEL_PROPERTIES[0]);
  const [cSelectedSpaces, setCSelectedSpaces] = useState<string[]>([]);`,
  `  const [cHotel, setCHotel] = useState<string>(CAMPAIGN_HOTEL_TARGETS[0]);`
);

// Filter logic in MarketingSection: group campaigns show on all filters
mktCode = mktCode.replace(
  `  const filteredCampaigns = campaigns.filter(
    (c) => selectedHotelFilter === 'all' || c.hotelTarget === selectedHotelFilter
  );`,
  `  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedHotelFilter !== 'all') {
      if (c.hotelTarget === 'Todos los Hoteles (Grupo Orgánico)') return true;
      if (c.hotelTarget !== selectedHotelFilter) return false;
    }
    return true;
  });`
);

// Create campaign payload without spaces
mktCode = mktCode.replace(
  `    onAddCampaign({
      title: cTitle,
      hotelTarget: cHotel,
      selectedSpaces: cSelectedSpaces,
      type: cType,`,
  `    onAddCampaign({
      title: cTitle,
      hotelTarget: cHotel,
      type: cType,`
);

// Edit campaign open handler without spaces
mktCode = mktCode.replace(
  `    setEditingCampaign(c);
    setEditCTitle(c.title);
    setEditCHotel(c.hotelTarget);
    setEditCSelectedSpaces(c.selectedSpaces || []);`,
  `    setEditingCampaign(c);
    setEditCTitle(c.title);
    setEditCHotel(c.hotelTarget);`
);

// Save edit campaign payload without spaces
mktCode = mktCode.replace(
  `    const updated: MarketingCampaign = {
      ...editingCampaign,
      title: editCTitle,
      hotelTarget: editCHotel,
      selectedSpaces: editCSelectedSpaces,
      type: editCType,`,
  `    const updated: MarketingCampaign = {
      ...editingCampaign,
      title: editCTitle,
      hotelTarget: editCHotel,
      type: editCType,`
);

// Remove spaces from Campaign Table:
// 1. Column header
mktCode = mktCode.replace(
  `                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Campaña & Hotel</th>
                  <th className="py-3 px-4">Espacios Promocionados</th>
                  <th className="py-3 px-4">Estado</th>`,
  `                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Nombre de la Campaña</th>
                  <th className="py-3 px-4">Hotel / Alcance</th>
                  <th className="py-3 px-4">Estado</th>`
);

// 2. Table row cells
const oldCampCells = `                      <td className="py-3 px-4 font-mono font-bold text-stone-500">{c.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{c.title}</div>
                        <div className="text-[11px] text-rose-600 font-bold">{c.hotelTarget}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.selectedSpaces && c.selectedSpaces.length > 0 ? (
                            c.selectedSpaces.map((sp, idx) => (
                              <span key={idx} className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 px-1 py-0.2 rounded-xs font-semibold">
                                {sp}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Toda la propiedad</span>
                          )}
                        </div>
                      </td>`;

const newCampCells = `                      <td className="py-3 px-4 font-mono font-bold text-stone-500">{c.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 text-[13px]">{c.title}</div>
                        <div className="text-[10px] text-stone-400 font-medium capitalize mt-0.5">{c.type.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 px-4">
                        {c.hotelTarget.includes('Todos') ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full shadow-2xs">
                            <span>🌟</span> Todo el Grupo Orgánico
                          </span>
                        ) : (
                          <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
                            <span>🏨</span> {c.hotelTarget}
                          </div>
                        )}
                      </td>`;

if (mktCode.includes(oldCampCells)) {
  mktCode = mktCode.replace(oldCampCells, newCampCells);
}

// 3. In Create Campaign Modal: replace Hotel selector with CAMPAIGN_HOTEL_TARGETS and remove spaces block
const oldCreateHotelSection = `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel Destino</label>
                  <select
                    value={cHotel}
                    onChange={(e) => handleHotelChange(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Tipo de Campaña</label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="temporada">Temporada Alta / Festividades</option>
                    <option value="marca">Branding & Posicionamiento</option>
                    <option value="redes_sociales">Redes & Contenido Viral</option>
                    <option value="relaciones_publicas">Relaciones Públicas & Prensa</option>
                    <option value="gastronomia">Gastronomía & Restaurantes</option>
                  </select>
                </div>
              </div>

              {/* Espacios a destacar */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  Espacios del Hotel a Promocionar:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {availableSpaces.map((space) => {
                    const isSelected = cSelectedSpaces.includes(space.name);
                    return (
                      <div
                        key={space.id}
                        onClick={() => handleToggleSpace(space.name)}
                        className={\`p-1.5 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1.5 \${
                          isSelected ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold' : 'bg-white border-stone-200 text-stone-700'
                        }\`}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => {}} className="accent-rose-600" />
                        <span className="truncate">{space.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>`;

const newCreateHotelSection = `              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel o Alcance del Grupo</label>
                  <select
                    value={cHotel}
                    onChange={(e) => setCHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    {CAMPAIGN_HOTEL_TARGETS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Elige un hotel boutique o todos los hoteles del grupo.
                  </span>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Tipo de Campaña</label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold text-xs"
                  >
                    <option value="temporada">Temporada Alta / Festividades</option>
                    <option value="marca">Branding & Posicionamiento</option>
                    <option value="redes_sociales">Redes & Contenido Viral</option>
                    <option value="relaciones_publicas">Relaciones Públicas & Prensa</option>
                    <option value="gastronomia">Gastronomía & Restaurantes</option>
                  </select>
                </div>
              </div>`;

if (mktCode.includes(oldCreateHotelSection)) {
  mktCode = mktCode.replace(oldCreateHotelSection, newCreateHotelSection);
}

// 4. In Edit Campaign Modal: replace Hotel selector with CAMPAIGN_HOTEL_TARGETS and remove spaces block
const oldEditHotelSection = `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel Destino</label>
                  <select
                    value={editCHotel}
                    onChange={(e) => handleEditHotelChange(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Estado</label>
                  <select
                    value={editCStatus}
                    onChange={(e) => setEditCStatus(e.target.value as MarketingCampaignStatus)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold"
                  >
                    <option value="planificacion">Planificación</option>
                    <option value="en_produccion">En Producción</option>
                    <option value="revision">En Revisión</option>
                    <option value="activa">Activa en Pauta</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>

              {/* Espacios del Hotel */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                  Espacios del Hotel a Promocionar:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {(HOTEL_SPACES[editCHotel] || []).map((space) => {
                    const isSelected = editCSelectedSpaces.includes(space.name);
                    return (
                      <div
                        key={space.id}
                        onClick={() => handleToggleEditCampaignSpace(space.name)}
                        className={'p-1.5 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1.5 ' + (
                          isSelected ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold' : 'bg-white border-stone-200 text-stone-700'
                        )}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => {}} className="accent-rose-600" />
                        <span className="truncate">{space.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>`;

const newEditHotelSection = `              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel o Alcance del Grupo</label>
                  <select
                    value={editCHotel}
                    onChange={(e) => setEditCHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold text-xs focus:ring-2 focus:ring-rose-500"
                  >
                    {CAMPAIGN_HOTEL_TARGETS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Elige un hotel boutique o todos los hoteles del grupo.
                  </span>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Estado</label>
                  <select
                    value={editCStatus}
                    onChange={(e) => setEditCStatus(e.target.value as MarketingCampaignStatus)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold text-xs"
                  >
                    <option value="planificacion">Planificación</option>
                    <option value="en_produccion">En Producción</option>
                    <option value="revision">En Revisión</option>
                    <option value="activa">Activa en Pauta</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
              </div>`;

if (mktCode.includes(oldEditHotelSection)) {
  mktCode = mktCode.replace(oldEditHotelSection, newEditHotelSection);
}

// 5. In viewingCampaign Modal: replace Espacios Promocionados with Alcance de la Campaña
const oldViewingCampSpaces = `            {/* Espacios Promocionados */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🏛️</span> Espacios Promocionados en {viewingCampaign.hotelTarget}:
              </h4>
              {viewingCampaign.selectedSpaces && viewingCampaign.selectedSpaces.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingCampaign.selectedSpaces.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs"
                    >
                      ✓ {sp}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-stone-400 text-xs italic bg-stone-50 p-2.5 rounded-xl border border-dashed border-stone-200 block">
                  Campaña institucional dirigida a toda la propiedad.
                </span>
              )}
            </div>`;

const newViewingCampSpaces = `            {/* Alcance de la Campaña (Hotel o Todo el Grupo) */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg shrink-0">
                  🏨
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Alcance Hotelero</span>
                  <span className="font-bold text-stone-900 text-sm">
                    {viewingCampaign.hotelTarget}
                  </span>
                </div>
              </div>
              <span className={\`px-3 py-1 rounded-full text-[11px] font-bold border self-start sm:self-auto \${
                viewingCampaign.hotelTarget.includes('Todos')
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }\`}>
                {viewingCampaign.hotelTarget.includes('Todos') ? '🌟 Cobertura Grupo Completo' : '📍 Hotel Específico'}
              </span>
            </div>`;

if (mktCode.includes(oldViewingCampSpaces)) {
  mktCode = mktCode.replace(oldViewingCampSpaces, newViewingCampSpaces);
}

fs.writeFileSync(mktPath, mktCode, 'utf8');
console.log('components/marketing/MarketingSection.tsx updated!');

