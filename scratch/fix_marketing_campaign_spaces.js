const fs = require('fs');
const path = require('path');

const mktPath = path.resolve('components/marketing/MarketingSection.tsx');
let mktCode = fs.readFileSync(mktPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Remove availableSpaces, handleToggleSpace, handleHotelChange
const oldHelperBlock = `  const availableSpaces = HOTEL_SPACES[cHotel] || [];

  const handleToggleSpace = (spaceName: string) => {
    setCSelectedSpaces((prev) =>
      prev.includes(spaceName) ? prev.filter((s) => s !== spaceName) : [...prev, spaceName]
    );
  };

  const handleHotelChange = (newHotel: string) => {
    setCHotel(newHotel);
    setCSelectedSpaces([]);
  };`;

if (mktCode.includes(oldHelperBlock)) {
  mktCode = mktCode.replace(oldHelperBlock, '');
  console.log('Removed oldHelperBlock');
}

// 2. Remove setCSelectedSpaces([]); in handleCreateCampaign
mktCode = mktCode.replace(
  `    setCTitle('');\n    setCSelectedSpaces([]);\n    setIsCampaignModalOpen(false);`,
  `    setCTitle('');\n    setIsCampaignModalOpen(false);`
);

// 3. Remove handleToggleEditCampaignSpace
const oldToggleEdit = `  const handleToggleEditCampaignSpace = (spName: string) => {
    setEditCSelectedSpaces((prev) =>
      prev.includes(spName) ? prev.filter((s) => s !== spName) : [...prev, spName]
    );
  };`;

if (mktCode.includes(oldToggleEdit)) {
  mktCode = mktCode.replace(oldToggleEdit, '');
  console.log('Removed oldToggleEdit');
}

// 4. Replace the edit hotel & spaces section in edit modal
const oldEditModalSection = `              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel Destino</label>
                  <select
                    value={editCHotel}
                    onChange={(e) => {
                      setEditCHotel(e.target.value);
                      setEditCSelectedSpaces([]);
                    }}
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

const newEditModalSection = `              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

if (mktCode.includes(oldEditModalSection)) {
  mktCode = mktCode.replace(oldEditModalSection, newEditModalSection);
  console.log('Replaced oldEditModalSection successfully!');
} else {
  console.log('Warning: oldEditModalSection not matched exactly');
}

fs.writeFileSync(mktPath, mktCode, 'utf8');
console.log('MarketingSection cleanup done!');

