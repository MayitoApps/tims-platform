const fs = require('fs');
const path = require('path');

// ==============================================================================
// 1. UPDATE CommercialSection.tsx
// ==============================================================================
const commPath = path.resolve('components/commercial/CommercialSection.tsx');
let commCode = fs.readFileSync(commPath, 'utf8').replace(/\r\n/g, '\n');

// A. Add viewingDeal state
if (!commCode.includes('viewingDeal')) {
  commCode = commCode.replace(
    `  const [dealToDelete, setDealToDelete] = useState<HotelDeal | null>(null);`,
    `  const [dealToDelete, setDealToDelete] = useState<HotelDeal | null>(null);

  // Modal - Ver Detalle Completo en Grande
  const [viewingDeal, setViewingDeal] = useState<HotelDeal | null>(null);`
  );
}

// B. Make Kanban card clickable
const oldKanbanCardHeader = `                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', deal.id);
                            setDraggedDealId(deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDealId(null);
                            setDragOverStage(null);
                          }}
                          className={\`bg-white border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all space-y-2 cursor-grab active:cursor-grabbing \${
                            isBeingDragged
                              ? 'opacity-35 border-dashed border-emerald-500 scale-98'
                              : 'border-stone-200 hover:border-stone-300'
                          }\`}
                        >`;

const newKanbanCardHeader = `                      return (
                        <div
                          key={deal.id}
                          draggable
                          onClick={() => setViewingDeal(deal)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', deal.id);
                            setDraggedDealId(deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDealId(null);
                            setDragOverStage(null);
                          }}
                          className={\`bg-white border rounded-xl p-3 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer \${
                            isBeingDragged
                              ? 'opacity-35 border-dashed border-emerald-500 scale-98 cursor-grabbing'
                              : 'border-stone-200 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-200/50'
                          }\`}
                        >`;

if (commCode.includes(oldKanbanCardHeader)) {
  commCode = commCode.replace(oldKanbanCardHeader, newKanbanCardHeader);
} else {
  console.log('Notice: oldKanbanCardHeader not found as exact string, checking variant...');
}

// Ensure card buttons stopPropagation & add visual "👁️ Ver ficha completa"
const oldCardFooter = `                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-stone-500 font-medium truncate" title={deal.assignedRep}>
                                👤 {deal.assignedRep.split(' ')[0]}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(deal);
                                  }}
                                  title="Editar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 font-semibold"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDealToDelete(deal);
                                  }}
                                  title="Eliminar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 border border-stone-200"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {stageIdx > 0 && (
                                <button
                                  onClick={() => moveStage(deal, 'prev')}
                                  title="Mover a etapa anterior"
                                  className="px-1.5 py-0.5 rounded-md border border-stone-300 hover:bg-stone-100 font-bold"
                                >
                                  ◀
                                </button>
                              )}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  onClick={() => moveStage(deal, 'next')}
                                  title="Mover a etapa siguiente"
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 font-bold"
                                >
                                  ▶
                                </button>
                              )}
                            </div>
                          </div>`;

const newCardFooter = `                          {/* Botón de apertura en grande */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500">
                            <span className="font-bold text-emerald-800 flex items-center gap-1 hover:underline">
                              👁️ Ver ficha completa
                            </span>
                            <span className="text-[9px] text-stone-400">Clic para ampliar</span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-stone-500 font-medium truncate" title={deal.assignedRep}>
                                👤 {deal.assignedRep.split(' ')[0]}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(deal);
                                  }}
                                  title="Editar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 font-semibold"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDealToDelete(deal);
                                  }}
                                  title="Eliminar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 border border-stone-200"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {stageIdx > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(deal, 'prev');
                                  }}
                                  title="Mover a etapa anterior"
                                  className="px-1.5 py-0.5 rounded-md border border-stone-300 hover:bg-stone-100 font-bold"
                                >
                                  ◀
                                </button>
                              )}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(deal, 'next');
                                  }}
                                  title="Mover a etapa siguiente"
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 font-bold"
                                >
                                  ▶
                                </button>
                              )}
                            </div>
                          </div>`;

if (commCode.includes(oldCardFooter)) {
  commCode = commCode.replace(oldCardFooter, newCardFooter);
}

// C. Make Table Row clickable + add "👁️ Ver" button
const oldTableRow = `                    <tr key={deal.id} className="hover:bg-stone-50/70 transition-colors">`;
const newTableRow = `                    <tr
                      key={deal.id}
                      onClick={() => setViewingDeal(deal)}
                      className="hover:bg-emerald-50/60 cursor-pointer transition-colors"
                    >`;

if (commCode.includes(oldTableRow)) {
  commCode = commCode.replace(oldTableRow, newTableRow);
}

const oldTableStageSelect = `                        <select
                          value={deal.stage}
                          onChange={(e) => onUpdateDealStage(deal.id, e.target.value as HotelDealStage)}
                          className={\`text-[11px] font-semibold px-2.5 py-1 rounded-full border \${badge.bg} \${badge.text} \${badge.border} cursor-pointer focus:outline-none\`}
                        >`;

const newTableStageSelect = `                        <select
                          value={deal.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateDealStage(deal.id, e.target.value as HotelDealStage)}
                          className={\`text-[11px] font-semibold px-2.5 py-1 rounded-full border \${badge.bg} \${badge.text} \${badge.border} cursor-pointer focus:outline-none\`}
                        >`;

if (commCode.includes(oldTableStageSelect)) {
  commCode = commCode.replace(oldTableStageSelect, newTableStageSelect);
}

const oldTableActions = `                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(deal)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <span>✏️</span> Editar
                          </button>
                          <button
                            onClick={() => setDealToDelete(deal)}
                            className="p-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-xs"
                            title="Eliminar Evento"
                          >
                            🗑️
                          </button>
                        </div>`;

const newTableActions = `                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDeal(deal);
                            }}
                            className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Ver ficha completa en grande"
                          >
                            <span>👁️</span> Ver
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <span>✏️</span> Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDealToDelete(deal);
                            }}
                            className="p-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-xs"
                            title="Eliminar Evento"
                          >
                            🗑️
                          </button>
                        </div>`;

if (commCode.includes(oldTableActions)) {
  commCode = commCode.replace(oldTableActions, newTableActions);
}

// D. Add viewingDeal modal before the last </div>
const viewingDealModalJSX = `
      {/* MODAL: VER DETALLE COMPLETO DEL EVENTO EN GRANDE */}
      {viewingDeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Encabezado */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {viewingDeal.code}
                  </span>
                  {(() => {
                    const badge = getHotelDealStageBadge(viewingDeal.stage);
                    const catInfo = getDealCategoryLabel(viewingDeal.category);
                    return (
                      <>
                        <span className={\`text-[11px] font-bold px-2.5 py-0.5 rounded-full border \${badge.bg} \${badge.text} \${badge.border}\`}>
                          {badge.label}
                        </span>
                        <span className={\`text-[11px] font-semibold px-2 py-0.5 rounded-md border \${catInfo.badge}\`}>
                          {catInfo.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingDeal.companyOrAgency}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
                  <span>👤 Cliente: <strong className="text-stone-900 font-bold">{viewingDeal.clientName}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    🏨 {viewingDeal.hotelName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingDeal(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Tarjetas Métricas Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Valor Total
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-emerald-950">
                  {formatCurrency(viewingDeal.totalValue, viewingDeal.currency)}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">Cotizado</span>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                  Room Nights
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-amber-950">
                  {viewingDeal.roomNights} <span className="text-xs font-sans text-amber-800 font-normal">RN</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium">Hospedaje Grupal</span>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                  Asistentes
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-blue-950">
                  {viewingDeal.attendeesCount || 'N/A'} <span className="text-xs font-sans text-blue-800 font-normal">pax</span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium">Banquete / Evento</span>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
                  Estancia
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-purple-950">
                  {getStayNights(viewingDeal.checkInDate, viewingDeal.checkOutDate)} <span className="text-xs font-sans text-purple-800 font-normal">noches</span>
                </div>
                <span className="text-[10px] text-purple-700 font-medium">{formatDate(viewingDeal.checkInDate)}</span>
              </div>
            </div>

            {/* Fechas de Evento */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg shrink-0">
                  📅
                </span>
                <div>
                  <span className="font-bold text-stone-900 block text-sm">
                    {formatDate(viewingDeal.checkInDate)} → {formatDate(viewingDeal.checkOutDate)}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Bloqueo de calendario en {viewingDeal.hotelName} ({getStayNights(viewingDeal.checkInDate, viewingDeal.checkOutDate)} noches de ocupación)
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 font-bold self-start sm:self-auto">
                Check-in: 15:00 hrs · Check-out: 12:00 hrs
              </span>
            </div>

            {/* Espacios Reservados Oficiales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span> Espacios Reservados del Hotel:
                </h4>
                <span className="text-[11px] font-bold text-emerald-800">
                  {viewingDeal.selectedSpaces?.length || 0} área(s) bloqueada(s)
                </span>
              </div>
              {viewingDeal.selectedSpaces && viewingDeal.selectedSpaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingDeal.selectedSpaces.map((sp, idx) => {
                    const spaceInfo = (HOTEL_SPACES[viewingDeal.hotelName] || []).find((s) => s.name === sp);
                    return (
                      <div key={idx} className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-800 font-bold">✓</span>
                          <span className="font-bold text-emerald-950 text-xs">{sp}</span>
                        </div>
                        {spaceInfo && (
                          <p className="text-[11px] text-stone-600 leading-snug">
                            {spaceInfo.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-stone-400 text-xs italic bg-stone-50 p-3 rounded-xl border border-dashed border-stone-200">
                  Sin espacios específicos asignados (Aplica a toda la propiedad o por definir).
                </p>
              )}
            </div>

            {/* Desglose de Habitaciones Solicitadas */}
            {viewingDeal.requestedRooms && viewingDeal.requestedRooms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛏️</span> Habitaciones Solicitadas por Tipo:
                  </h4>
                  <span className="text-[11px] font-bold text-amber-800">
                    {viewingDeal.requestedRooms.reduce((acc, r) => acc + r.count, 0)} habitaciones totales
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {viewingDeal.requestedRooms.map((rm, idx) => {
                    const roomInfo = (HOTEL_ROOM_TYPES[viewingDeal.hotelName] || []).find((r) => r.name === rm.roomTypeName);
                    return (
                      <div key={idx} className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs">{rm.roomTypeName}</span>
                          <span className="font-mono font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md text-xs">
                            {rm.count}x
                          </span>
                        </div>
                        {roomInfo && (
                          <div className="text-[10px] text-stone-600">
                            Capacidad: <strong>{roomInfo.capacity}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Datos de Contacto y Ejecutivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-stone-500 font-medium block">Ejecutivo Comercial:</span>
                <span className="font-bold text-stone-900 text-sm">{viewingDeal.assignedRep}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Correo de Contacto:</span>
                {viewingDeal.contactEmail ? (
                  <a
                    href={\`mailto:\${viewingDeal.contactEmail}\`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 underline block truncate"
                  >
                    ✉️ {viewingDeal.contactEmail}
                  </a>
                ) : (
                  <span className="text-stone-400">No especificado</span>
                )}
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Teléfono / WhatsApp:</span>
                {viewingDeal.contactPhone ? (
                  <a
                    href={\`tel:\${viewingDeal.contactPhone}\`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 underline block"
                  >
                    📞 {viewingDeal.contactPhone}
                  </a>
                ) : (
                  <span className="text-stone-400">No especificado</span>
                )}
              </div>
            </div>

            {/* Notas y Requerimientos Especiales */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>📝</span> Requerimientos Especiales, Banquete y Notas:
              </h4>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingDeal.notes || 'Sin especificaciones ni notas adicionales registradas en este evento.'}
              </div>
            </div>

            {/* Fase y Control de Pipeline */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 uppercase tracking-wider">
                  Etapa en el Pipeline Comercial:
                </span>
                <span className="text-stone-500">Cambia la fase directamente:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {STAGES.map((s) => {
                  const isCurrent = viewingDeal.stage === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onUpdateDealStage(viewingDeal.id, s.id);
                        setViewingDeal({ ...viewingDeal, stage: s.id });
                      }}
                      className={\`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center flex items-center justify-center gap-1 \${
                        isCurrent
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }\`}
                    >
                      <span className={\`w-2 h-2 rounded-full \${s.colorDot}\`} />
                      <span className="truncate">{s.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acciones del Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const d = viewingDeal;
                    setViewingDeal(null);
                    openEditModal(d);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>✏️</span> Editar Información Completa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = viewingDeal;
                    setViewingDeal(null);
                    setDealToDelete(d);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  title="Eliminar este evento"
                >
                  <span>🗑️</span> Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingDeal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
`;

const lastDivIdx = commCode.lastIndexOf('    </div>\n  );\n}');
if (lastDivIdx !== -1) {
  commCode = commCode.slice(0, lastDivIdx) + viewingDealModalJSX + commCode.slice(lastDivIdx);
} else {
  console.log('Warning: could not locate lastDivIdx in CommercialSection');
}

fs.writeFileSync(commPath, commCode, 'utf8');
console.log('CommercialSection updated successfully!');

