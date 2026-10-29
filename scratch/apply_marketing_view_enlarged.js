const fs = require('fs');
const path = require('path');

const mktPath = path.resolve('components/marketing/MarketingSection.tsx');
let mktCode = fs.readFileSync(mktPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add viewing states if not present
if (!mktCode.includes('viewingTask')) {
  const targetStatePos = `  // Form states - Marketing Task`;
  const newStates = `  // Modals - Ver en Grande (Vista Completa de Elementos de Marketing)
  const [viewingTask, setViewingTask] = useState<MarketingTask | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<MarketingCampaign | null>(null);
  const [viewingPub, setViewingPub] = useState<ContentPublication | null>(null);
  const [viewingBrief, setViewingBrief] = useState<CreativeBrief | null>(null);

  // Form states - Marketing Task`;

  if (mktCode.includes(targetStatePos)) {
    mktCode = mktCode.replace(targetStatePos, newStates);
  }
}

// 2. Make Kanban Task Card Clickable
const oldTaskCard = `                        return (
                          <div
                            key={task.id}
                            draggable={true}
                            onDragStart={(e) => {
                              setDraggedTaskId(task.id);
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDragOverStage(null);
                            }}
                            className={\`bg-white rounded-xl p-3.5 border transition-all cursor-grab active:cursor-grabbing hover:shadow-md space-y-2.5 select-none \${
                              isDragging
                                ? 'opacity-40 border-stone-400 shadow-xl'
                                : 'border-stone-200/90 shadow-2xs hover:border-stone-300'
                            }\`}
                          >`;

const newTaskCard = `                        return (
                          <div
                            key={task.id}
                            draggable={true}
                            onClick={() => setViewingTask(task)}
                            onDragStart={(e) => {
                              setDraggedTaskId(task.id);
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDragOverStage(null);
                            }}
                            className={\`bg-white rounded-xl p-3.5 border transition-all cursor-pointer hover:shadow-md space-y-2.5 select-none \${
                              isDragging
                                ? 'opacity-40 border-stone-400 shadow-xl cursor-grabbing'
                                : 'border-stone-200/90 shadow-2xs hover:border-purple-300 hover:ring-2 hover:ring-purple-200/50'
                            }\`}
                          >`;

if (mktCode.includes(oldTaskCard)) {
  mktCode = mktCode.replace(oldTaskCard, newTaskCard);
}

// Add "👁️ Ver requerimiento completo" before the quick action buttons in the task card
const oldTaskCardButtons = `                            {/* Quick Step & Action Buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">`;

const newTaskCardButtons = `                            {/* Botón de apertura en grande */}
                            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                              <span className="font-bold text-purple-800 flex items-center gap-1 hover:underline">
                                👁️ Ver requerimiento completo
                              </span>
                              <span className="text-[9px] text-stone-400">Clic para ampliar</span>
                            </div>

                            {/* Quick Step & Action Buttons */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">`;

if (mktCode.includes(oldTaskCardButtons)) {
  mktCode = mktCode.replace(oldTaskCardButtons, newTaskCardButtons);
}

// 3. Make Campaign table row clickable + add "👁️ Ver" button
const oldCampRow = `                    <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">`;
const newCampRow = `                    <tr
                      key={c.id}
                      onClick={() => setViewingCampaign(c)}
                      className="hover:bg-rose-50/60 cursor-pointer transition-colors"
                    >`;

if (mktCode.includes(oldCampRow)) {
  mktCode = mktCode.replace(oldCampRow, newCampRow);
}

const oldCampSelect = `                        <select
                          value={c.status}
                          onChange={(e) => onUpdateCampaignStatus(c.id, e.target.value as MarketingCampaignStatus)}
                          className={\`text-[11px] font-semibold px-2.5 py-1 rounded-full border \${badge.bg} \${badge.text} \${badge.border} cursor-pointer focus:outline-none\`}
                        >`;

const newCampSelect = `                        <select
                          value={c.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateCampaignStatus(c.id, e.target.value as MarketingCampaignStatus)}
                          className={\`text-[11px] font-semibold px-2.5 py-1 rounded-full border \${badge.bg} \${badge.text} \${badge.border} cursor-pointer focus:outline-none\`}
                        >`;

if (mktCode.includes(oldCampSelect)) {
  mktCode = mktCode.replace(oldCampSelect, newCampSelect);
}

const oldCampActions = `                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditCampaignModal(c)}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1"
                          >
                            <span>✏️</span> Editar
                          </button>
                          <button
                            onClick={() => setCampaignToDelete(c)}
                            className="p-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-xs transition-colors"
                            title="Eliminar Campaña"
                          >
                            🗑️
                          </button>
                        </div>`;

const newCampActions = `                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingCampaign(c);
                            }}
                            className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold hover:bg-rose-50 hover:text-rose-900 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Ver campaña completa en grande"
                          >
                            <span>👁️</span> Ver
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditCampaignModal(c);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1"
                          >
                            <span>✏️</span> Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCampaignToDelete(c);
                            }}
                            className="p-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-xs transition-colors"
                            title="Eliminar Campaña"
                          >
                            🗑️
                          </button>
                        </div>`;

if (mktCode.includes(oldCampActions)) {
  mktCode = mktCode.replace(oldCampActions, newCampActions);
}

// 4. Make Publication card clickable
const oldPubCard = `          {publications.map((pub) => (
            <div key={pub.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">`;

const newPubCard = `          {publications.map((pub) => (
            <div
              key={pub.id}
              onClick={() => setViewingPub(pub)}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3 cursor-pointer hover:shadow-md hover:border-indigo-300 hover:ring-2 hover:ring-indigo-200/50 transition-all"
            >`;

if (mktCode.includes(oldPubCard)) {
  mktCode = mktCode.replace(oldPubCard, newPubCard);
}

// Add indicator to publication card
const oldPubCardBottom = `              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-600">`;
const newPubCardBottom = `              {/* Botón de apertura en grande */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-indigo-700 font-semibold border-t border-stone-100">
                <span className="flex items-center gap-1 hover:underline">👁️ Ver publicación en grande</span>
                <span className="text-stone-400 text-[9px]">Clic para ampliar</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 text-stone-600">`;

if (mktCode.includes(oldPubCardBottom)) {
  mktCode = mktCode.replace(oldPubCardBottom, newPubCardBottom);
}

// 5. Make Brief card clickable
const oldBriefCard = `          {briefs.map((brf) => (
            <div key={brf.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">`;

const newBriefCard = `          {briefs.map((brf) => (
            <div
              key={brf.id}
              onClick={() => setViewingBrief(brf)}
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3 cursor-pointer hover:shadow-md hover:border-amber-300 hover:ring-2 hover:ring-amber-200/50 transition-all"
            >`;

if (mktCode.includes(oldBriefCard)) {
  mktCode = mktCode.replace(oldBriefCard, newBriefCard);
}

// Add indicator to brief card
const oldBriefCardBottom = `              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 flex justify-between items-center">`;
const newBriefCardBottom = `              {/* Botón de apertura en grande */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-amber-800 font-semibold border-t border-stone-100">
                <span className="flex items-center gap-1 hover:underline">👁️ Ver brief completo en grande</span>
                <span className="text-stone-400 text-[9px]">Clic para ampliar</span>
              </div>

              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 flex justify-between items-center">`;

if (mktCode.includes(oldBriefCardBottom)) {
  mktCode = mktCode.replace(oldBriefCardBottom, newBriefCardBottom);
}

// 6. Append the 4 Viewing Modals before the closing `</div>\n  );\n}`
const viewingModalsJSX = `
      {/* ========================================================================= */}
      {/* MODAL 1: VER TAREA / REQUERIMIENTO CREATIVO EN GRANDE                     */}
      {/* ========================================================================= */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                    {viewingTask.code}
                  </span>
                  {(() => {
                    const cat = MARKETING_CATEGORIES.find((c) => c.id === viewingTask.category);
                    return (
                      <span className={\`text-[11px] font-bold px-2.5 py-0.5 rounded-full border \${cat?.badge || 'bg-stone-100 text-stone-700'}\`}>
                        {cat?.icon} {cat?.label}
                      </span>
                    );
                  })()}
                  <span className={\`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border \${
                    viewingTask.priority === 'urgente'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : viewingTask.priority === 'alta'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }\`}>
                    Prioridad {viewingTask.priority}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingTask.title}
                </h3>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <span>🏨</span> {viewingTask.hotelTarget}
                </p>
              </div>

              <button
                onClick={() => setViewingTask(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Fases / Tracker de Flujo Creativo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 uppercase tracking-wider">
                  Fase de Producción:
                </span>
                <span className="text-stone-500">Mueve a cualquier fase con un clic:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MARKETING_STAGES.map((s) => {
                  const isCurrent = viewingTask.stage === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onUpdateMarketingTaskStage(viewingTask.id, s.id);
                        setViewingTask({ ...viewingTask, stage: s.id });
                      }}
                      className={\`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 \${
                        isCurrent
                          ? 'bg-purple-800 text-white border-purple-900 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }\`}
                    >
                      <span className={\`w-2 h-2 rounded-full \${s.colorDot}\`} />
                      <span className="truncate">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Fecha de Entrega</span>
                <div className="font-bold text-stone-900 text-sm">📅 {formatDate(viewingTask.dueDate)}</div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Responsable Asignado</span>
                <div className="font-bold text-stone-900 text-sm truncate">👤 {viewingTask.assignedTo}</div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Solicitado Por</span>
                <div className="font-bold text-stone-900 text-sm truncate">🏢 {viewingTask.requestedBy}</div>
              </div>
            </div>

            {/* Descripción Técnica Completa */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Descripción Completa & Especificaciones Técnicas:
              </h4>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-800 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingTask.description || 'Sin descripción detallada.'}
              </div>
            </div>

            {/* Recurso / Enlace si existe */}
            {viewingTask.assetUrl && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-indigo-950 block">Carpeta de Archivos / Enlace del Entregable</span>
                  <span className="text-indigo-800 text-[11px] truncate block max-w-sm">{viewingTask.assetUrl}</span>
                </div>
                <a
                  href={viewingTask.assetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Abrir Recurso ↗
                </a>
              </div>
            )}

            {/* Footer / Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const t = viewingTask;
                    setViewingTask(null);
                    openEditTaskModal(t);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>✏️</span> Editar Requerimiento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = viewingTask;
                    setViewingTask(null);
                    setTaskToDelete(t);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>🗑️</span> Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingTask(null)}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VER CAMPAÑA COMPLETA EN GRANDE                                   */}
      {/* ========================================================================= */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                    {viewingCampaign.code}
                  </span>
                  {(() => {
                    const badge = getMarketingStatusBadge(viewingCampaign.status);
                    return (
                      <span className={\`text-[11px] font-bold px-2.5 py-0.5 rounded-full border \${badge.bg} \${badge.text} \${badge.border}\`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-rose-50 text-rose-800 border border-rose-200">
                    {viewingCampaign.type}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingCampaign.title}
                </h3>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <span>🏨</span> {viewingCampaign.hotelTarget}
                </p>
              </div>

              <button
                onClick={() => setViewingCampaign(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider block">
                  Presupuesto Total
                </span>
                <div className="font-mono text-lg font-extrabold text-rose-950">
                  {formatCurrency(viewingCampaign.budget, 'MXN')}
                </div>
                <span className="text-[10px] text-rose-700">Asignado</span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Inversión Ejercida
                </span>
                <div className="font-mono text-lg font-extrabold text-emerald-950">
                  {formatCurrency(viewingCampaign.spent || 0, 'MXN')}
                </div>
                <span className="text-[10px] text-emerald-700">Gastado actual</span>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                  Fecha de Inicio
                </span>
                <div className="font-bold text-blue-950 text-sm mt-0.5">
                  📅 {formatDate(viewingCampaign.startDate)}
                </div>
                <span className="text-[10px] text-blue-700">Lanzamiento</span>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
                  Fecha de Cierre
                </span>
                <div className="font-bold text-purple-950 text-sm mt-0.5">
                  🏁 {formatDate(viewingCampaign.endDate)}
                </div>
                <span className="text-[10px] text-purple-700">Término de pauta</span>
              </div>
            </div>

            {/* Espacios Promocionados */}
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
            </div>

            {/* Canales de Difusión */}
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Canales de Difusión & Medios:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {viewingCampaign.channels.map((ch, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-800 font-semibold text-xs"
                  >
                    📣 {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Concepto y Objetivos */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Concepto Creativo & Objetivos Comerciales:
              </h4>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-800 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingCampaign.description || 'Sin descripción detallada.'}
              </div>
            </div>

            {/* Enlaces Externos */}
            {viewingCampaign.externalLinks && viewingCampaign.externalLinks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Carpetas y Enlaces Externos:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewingCampaign.externalLinks.map((lnk) => (
                    <a
                      key={lnk.id}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>🔗</span> {lnk.title} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Footer / Acciones */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCampaign;
                    setViewingCampaign(null);
                    openEditCampaignModal(c);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>✏️</span> Editar Campaña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCampaign;
                    setViewingCampaign(null);
                    setCampaignToDelete(c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>🗑️</span> Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingCampaign(null)}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VER PUBLICACIÓN / PR EN GRANDE                                  */}
      {/* ========================================================================= */}
      {viewingPub && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="space-y-1">
                <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {viewingPub.channel}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                  {viewingPub.title}
                </h3>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <span>🏨</span> {viewingPub.hotel}
                </p>
              </div>

              <button
                onClick={() => setViewingPub(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-500 font-medium block">Fecha Programada:</span>
                <span className="font-bold text-stone-900 text-sm">📅 {formatDate(viewingPub.publishDate)}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Responsable Editorial:</span>
                <span className="font-bold text-stone-900 text-sm">👤 {viewingPub.responsible}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Estado de Publicación:</span>
                <span className="font-bold text-emerald-800 capitalize text-sm">{viewingPub.status}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Canal:</span>
                <span className="font-bold text-indigo-800 uppercase text-sm">{viewingPub.channel}</span>
              </div>
            </div>

            {viewingPub.assetUrl && (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-indigo-900 font-medium truncate">{viewingPub.assetUrl}</span>
                <a
                  href={viewingPub.assetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shrink-0"
                >
                  Ver Nota ↗
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = viewingPub;
                    setViewingPub(null);
                    openEditPubModal(p);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 text-xs font-bold hover:bg-indigo-100"
                >
                  ✏️ Editar Publicación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = viewingPub;
                    setViewingPub(null);
                    setPubToDelete(p);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100"
                >
                  🗑️ Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingPub(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VER BRIEF CREATIVO EN GRANDE                                    */}
      {/* ========================================================================= */}
      {viewingBrief && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {viewingBrief.category.replace('_', ' ')}
                  </span>
                  <span className="text-stone-500 font-mono text-xs">
                    📅 {formatDate(viewingBrief.date)}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingBrief.title}
                </h3>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <span>🏨</span> {viewingBrief.hotelTarget}
                </p>
              </div>

              <button
                onClick={() => setViewingBrief(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-500 font-medium block">Autor del Brief:</span>
                <span className="font-bold text-stone-900 text-sm">👤 {viewingBrief.author}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Audiencia Meta:</span>
                <span className="font-bold text-stone-900 text-xs">{viewingBrief.targetAudience}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Objetivo Estratégico:
              </h4>
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-800 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingBrief.objective}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Mensaje Clave & Tono:
              </h4>
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-amber-950 text-xs font-medium">
                &ldquo;{viewingBrief.keyMessage}&rdquo;
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Entregables Requeridos ({viewingBrief.deliverables.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {viewingBrief.deliverables.map((del, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 p-2.5 rounded-xl text-xs font-semibold text-stone-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const b = viewingBrief;
                    setViewingBrief(null);
                    openEditBriefModal(b);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100"
                >
                  ✏️ Editar Brief
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const b = viewingBrief;
                    setViewingBrief(null);
                    setBriefToDelete(b);
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100"
                >
                  🗑️ Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingBrief(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
`;

const lastDivIdx = mktCode.lastIndexOf('    </div>\n  );\n}');
if (lastDivIdx !== -1) {
  mktCode = mktCode.slice(0, lastDivIdx) + viewingModalsJSX + mktCode.slice(lastDivIdx);
} else {
  console.log('Warning: could not locate lastDivIdx in MarketingSection');
}

fs.writeFileSync(mktPath, mktCode, 'utf8');
console.log('MarketingSection updated with viewing modals successfully!');
