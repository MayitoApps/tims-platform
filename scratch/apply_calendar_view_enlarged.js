const fs = require('fs');
const path = require('path');

const calPath = path.resolve('components/SharedCalendar.tsx');
let calCode = fs.readFileSync(calPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Update CalendarItem interface
const oldInterface = `interface CalendarItem {
  id: string;
  type: 'deal' | 'campaign' | 'publication';
  title: string;
  hotel: string;
  startDate: string;
  endDate: string;
  status: string;
  value?: number;
  currency?: 'MXN' | 'USD';
  spaces?: string[];
  requestedRooms?: { roomTypeName: string; count: number }[];
  clientOrLead?: string;
  attendees?: number;
  roomNights?: number;
  notes?: string;
}`;

const newInterface = `interface CalendarItem {
  id: string;
  code?: string;
  type: 'deal' | 'campaign' | 'publication';
  title: string;
  hotel: string;
  startDate: string;
  endDate: string;
  status: string;
  value?: number;
  currency?: 'MXN' | 'USD';
  spaces?: string[];
  requestedRooms?: { roomTypeName: string; count: number }[];
  clientOrLead?: string;
  attendees?: number;
  roomNights?: number;
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
  assignedRep?: string;
  channels?: string[];
}`;

if (calCode.includes(oldInterface)) {
  calCode = calCode.replace(oldInterface, newInterface);
}

// 2. Update mapping in items
const oldMapping = `  // STRICT SEPARATION: Commercial ONLY sees deals; Marketing ONLY sees campaigns + PR
  const items: CalendarItem[] = mode === 'commercial'
    ? deals.map((d) => ({
        id: d.id,
        type: 'deal' as const,
        title: d.companyOrAgency,
        hotel: d.hotelName,
        startDate: d.checkInDate,
        endDate: d.checkOutDate,
        status: d.stage,
        value: d.totalValue,
        currency: d.currency,
        spaces: d.selectedSpaces,
        requestedRooms: d.requestedRooms,
        clientOrLead: d.clientName,
        attendees: d.attendeesCount,
        roomNights: d.roomNights,
        notes: d.notes
      }))
    : [
        ...campaigns.map((c) => ({
          id: c.id,
          type: 'campaign' as const,
          title: c.title,
          hotel: c.hotelTarget,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          value: c.budget,
          currency: 'MXN' as const,
          spaces: c.selectedSpaces,
          clientOrLead: c.leadOwner,
          notes: c.description
        })),`;

const newMapping = `  // STRICT SEPARATION: Commercial ONLY sees deals; Marketing ONLY sees campaigns + PR
  const items: CalendarItem[] = mode === 'commercial'
    ? deals.map((d) => ({
        id: d.id,
        code: d.code,
        type: 'deal' as const,
        title: d.companyOrAgency,
        hotel: d.hotelName,
        startDate: d.checkInDate,
        endDate: d.checkOutDate,
        status: d.stage,
        value: d.totalValue,
        currency: d.currency,
        spaces: d.selectedSpaces,
        requestedRooms: d.requestedRooms,
        clientOrLead: d.clientName,
        attendees: d.attendeesCount,
        roomNights: d.roomNights,
        notes: d.notes,
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        assignedRep: d.assignedRep
      }))
    : [
        ...campaigns.map((c) => ({
          id: c.id,
          code: c.code,
          type: 'campaign' as const,
          title: c.title,
          hotel: c.hotelTarget,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          value: c.budget,
          currency: 'MXN' as const,
          spaces: c.selectedSpaces,
          clientOrLead: c.leadOwner,
          notes: c.description,
          channels: c.channels
        })),`;

if (calCode.includes(oldMapping)) {
  calCode = calCode.replace(oldMapping, newMapping);
}

// 3. Update activeItemModal to max-w-2xl and add extra details
const oldActiveItemModalHeader = `      {/* Detail Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <span
                  className={\`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border \${
                    activeItemModal.type === 'deal'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : activeItemModal.type === 'campaign'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  }\`}
                >
                  {activeItemModal.type === 'deal'
                    ? 'Evento / Reservación Hotelera'
                    : activeItemModal.type === 'campaign'
                    ? 'Campaña de Marketing'
                    : 'Publicación de Medios / PR'}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                  {activeItemModal.title}
                </h3>
                <p className="text-xs font-bold text-rose-700">
                  {activeItemModal.hotel}
                </p>
              </div>`;

const newActiveItemModalHeader = `      {/* Detail Modal - Vista en Grande */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeItemModal.code && (
                    <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                      {activeItemModal.code}
                    </span>
                  )}
                  <span
                    className={\`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border \${
                      activeItemModal.type === 'deal'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : activeItemModal.type === 'campaign'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                    }\`}
                  >
                    {activeItemModal.type === 'deal'
                      ? 'Evento / Reservación Hotelera'
                      : activeItemModal.type === 'campaign'
                      ? 'Campaña de Marketing'
                      : 'Publicación de Medios / PR'}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                  {activeItemModal.title}
                </h3>
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                  <span>🏨</span> {activeItemModal.hotel}
                </p>
              </div>`;

if (calCode.includes(oldActiveItemModalHeader)) {
  calCode = calCode.replace(oldActiveItemModalHeader, newActiveItemModalHeader);
}

// 4. In activeItemModal, add channels and contact details
const oldGridContact = `            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 font-medium">Fechas de Reserva:</span>
                <p className="font-bold text-stone-900">
                  {formatDate(activeItemModal.startDate)} al {formatDate(activeItemModal.endDate)}
                </p>
              </div>
              <div>
                <span className="text-stone-500 font-medium">Monto del Contrato:</span>
                <p className="font-mono font-bold text-emerald-800 text-sm">
                  {activeItemModal.value ? formatCurrency(activeItemModal.value, activeItemModal.currency) : 'N/A'}
                </p>
              </div>
              {activeItemModal.clientOrLead && (
                <div>
                  <span className="text-stone-500 font-medium">Cliente / Contacto:</span>
                  <p className="font-bold text-stone-900">{activeItemModal.clientOrLead}</p>
                </div>
              )}
              {activeItemModal.roomNights !== undefined && activeItemModal.roomNights > 0 && (
                <div>
                  <span className="text-stone-500 font-medium">Room Nights:</span>
                  <p className="font-bold text-stone-900">{activeItemModal.roomNights} Noches Habitación</p>
                </div>
              )}
            </div>`;

const newGridContact = `            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-500 font-medium block">Fechas:</span>
                <p className="font-bold text-stone-900 text-xs mt-0.5">
                  {formatDate(activeItemModal.startDate)} al {formatDate(activeItemModal.endDate)}
                </p>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Monto / Presupuesto:</span>
                <p className="font-mono font-bold text-emerald-800 text-sm mt-0.5">
                  {activeItemModal.value ? formatCurrency(activeItemModal.value, activeItemModal.currency) : 'N/A'}
                </p>
              </div>
              {activeItemModal.clientOrLead && (
                <div>
                  <span className="text-stone-500 font-medium block">Cliente / Titular:</span>
                  <p className="font-bold text-stone-900 text-xs mt-0.5">{activeItemModal.clientOrLead}</p>
                </div>
              )}
              {activeItemModal.roomNights !== undefined && activeItemModal.roomNights > 0 && (
                <div>
                  <span className="text-stone-500 font-medium block">Room Nights:</span>
                  <p className="font-bold text-stone-900 text-xs mt-0.5">{activeItemModal.roomNights} RN</p>
                </div>
              )}
            </div>

            {/* Canales si es campaña */}
            {activeItemModal.channels && activeItemModal.channels.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="text-stone-500 font-medium block">Canales de Difusión:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeItemModal.channels.map((ch, idx) => (
                    <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contacto directo si existe */}
            {(activeItemModal.contactEmail || activeItemModal.contactPhone || activeItemModal.assignedRep) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                {activeItemModal.assignedRep && (
                  <div>
                    <span className="text-stone-500 block">Ejecutivo:</span>
                    <strong className="text-stone-800">{activeItemModal.assignedRep}</strong>
                  </div>
                )}
                {activeItemModal.contactEmail && (
                  <div>
                    <span className="text-stone-500 block">Email:</span>
                    <a href={\`mailto:\${activeItemModal.contactEmail}\`} className="text-emerald-700 font-semibold underline truncate block">
                      {activeItemModal.contactEmail}
                    </a>
                  </div>
                )}
                {activeItemModal.contactPhone && (
                  <div>
                    <span className="text-stone-500 block">Teléfono:</span>
                    <a href={\`tel:\${activeItemModal.contactPhone}\`} className="text-emerald-700 font-semibold underline block">
                      {activeItemModal.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            )}`;

if (calCode.includes(oldGridContact)) {
  calCode = calCode.replace(oldGridContact, newGridContact);
}

fs.writeFileSync(calPath, calCode, 'utf8');
console.log('SharedCalendar updated successfully!');
