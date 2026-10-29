'use client';

import React, { useState } from 'react';
import { MarketingCampaign, ContentPublication, CreativeBrief, MarketingCampaignStatus, HotelDeal } from '@/lib/types';
import { HOTEL_PROPERTIES, HOTEL_SPACES } from '@/lib/initial-data';
import { formatCurrency, formatDate, getMarketingStatusBadge } from '@/lib/utils';
import { SharedCalendar } from '@/components/SharedCalendar';

interface MarketingSectionProps {
  campaigns: MarketingCampaign[];
  publications: ContentPublication[];
  briefs: CreativeBrief[];
  deals: HotelDeal[];
  onAddCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'code' | 'spent'>) => void;
  onUpdateCampaignStatus: (id: string, status: MarketingCampaignStatus) => void;
  onAddPublication: (pub: Omit<ContentPublication, 'id'>) => void;
  onAddBrief: (brief: Omit<CreativeBrief, 'id' | 'date'>) => void;
}

export function MarketingSection({
  campaigns,
  publications,
  briefs,
  deals,
  onAddCampaign,
  onUpdateCampaignStatus,
  onAddPublication,
  onAddBrief
}: MarketingSectionProps) {
  const [subView, setSubView] = useState<'campanas' | 'calendario' | 'contenido' | 'briefs'>('campanas');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('all');

  // Modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  // Form states - Campaign
  const [cTitle, setCTitle] = useState('');
  const [cHotel, setCHotel] = useState(HOTEL_PROPERTIES[0]);
  const [cSelectedSpaces, setCSelectedSpaces] = useState<string[]>([]);
  const [cType, setCType] = useState<MarketingCampaign['type']>('temporada');
  const [cBudget, setCBudget] = useState('45000');
  const [cStart, setCStart] = useState('2026-04-01');
  const [cEnd, setCEnd] = useState('2026-05-31');
  const [cChannels, setCChannels] = useState('Instagram Ads, TikTok, Prensa Estilo de Vida');
  const [cDesc, setCDesc] = useState('');

  // Form states - Publication
  const [pTitle, setPTitle] = useState('');
  const [pHotel, setPHotel] = useState(HOTEL_PROPERTIES[0]);
  const [pChannel, setPChannel] = useState<ContentPublication['channel']>('instagram');
  const [pDate, setPDate] = useState('2026-04-15');
  const [pResponsible, setPResponsible] = useState('Equipo Creativo');

  // Form states - Brief
  const [bTitle, setBTitle] = useState('');
  const [bHotel, setBHotel] = useState(HOTEL_PROPERTIES[0]);
  const [bCategory, setBCategory] = useState<CreativeBrief['category']>('shooting_fotografico');
  const [bObjective, setBObjective] = useState('');
  const [bAudience, setBAudience] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bDeliverables, setBDeliverables] = useState('25 Fotos HD de Espacios, 3 Reels, 1 Teaser');

  const availableSpaces = HOTEL_SPACES[cHotel] || [];

  const handleToggleSpace = (spaceName: string) => {
    setCSelectedSpaces((prev) =>
      prev.includes(spaceName) ? prev.filter((s) => s !== spaceName) : [...prev, spaceName]
    );
  };

  const handleHotelChange = (newHotel: string) => {
    setCHotel(newHotel);
    setCSelectedSpaces([]);
  };

  const filteredCampaigns = campaigns.filter(
    (c) => selectedHotelFilter === 'all' || c.hotelTarget === selectedHotelFilter
  );

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim()) return;

    onAddCampaign({
      title: cTitle,
      hotelTarget: cHotel,
      selectedSpaces: cSelectedSpaces,
      type: cType,
      status: 'planificacion',
      budget: parseFloat(cBudget) || 25000,
      startDate: cStart,
      endDate: cEnd,
      channels: cChannels.split(',').map((s) => s.trim()).filter(Boolean),
      externalLinks: [
        { id: 'lnk-1', title: 'Figma Creativos', url: 'https://figma.com', platform: 'figma' },
        { id: 'lnk-2', title: 'Drive Fotos Oficiales', url: 'https://drive.google.com', platform: 'drive' }
      ],
      leadOwner: 'Marketing Team',
      description: cDesc || 'Campaña estratégica de promoción y captación directa para Grupo Orgánico.'
    });

    setCTitle('');
    setCSelectedSpaces([]);
    setIsCampaignModalOpen(false);
  };

  const handleCreatePublication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) return;

    onAddPublication({
      title: pTitle,
      hotel: pHotel,
      channel: pChannel,
      publishDate: pDate,
      status: 'programado',
      responsible: pResponsible
    });

    setPTitle('');
    setIsPubModalOpen(false);
  };

  const handleCreateBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) return;

    onAddBrief({
      title: bTitle,
      hotelTarget: bHotel,
      category: bCategory,
      objective: bObjective || 'Generar activos visuales de alta gama para posicionamiento.',
      targetAudience: bAudience || 'Parejas, directores corporativos y turistas de lujo.',
      keyMessage: bMessage || 'Lujo rústico, descanso y naturaleza en Grupo Orgánico.',
      deliverables: bDeliverables.split(',').map((s) => s.trim()).filter(Boolean),
      author: 'Dirección de Marketing'
    });

    setBTitle('');
    setIsBriefModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Marketing Header with Vibrant Gradient & Navigation */}
      <div className="bg-linear-to-r from-rose-600 via-pink-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <span>Grupo Orgánico Hoteles Boutique</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight">
              Marketing & Comunicación
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Planificación de campañas de temporada, pauta digital, calendarios de contenido, notas de prensa y coordinación de shootings.
            </p>
          </div>

          {/* Quick Sub-View Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/25 backdrop-blur-md p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSubView('campanas')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subView === 'campanas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Campañas & Pauta ({campaigns.length})
            </button>
            <button
              onClick={() => setSubView('calendario')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subView === 'calendario'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📅 Calendario en Tiempo Real
            </button>
            <button
              onClick={() => setSubView('contenido')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subView === 'contenido'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Contenido & PR ({publications.length})
            </button>
            <button
              onClick={() => setSubView('briefs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subView === 'briefs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Briefs & Documentos ({briefs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Filter & Action Bar (except in Calendar view) */}
      {subView !== 'calendario' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Hotel:
            </span>
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">Todas las 6 Propiedades</option>
              {HOTEL_PROPERTIES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            {subView === 'campanas' && (
              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>+ Nueva Campaña Hotelera</span>
              </button>
            )}

            {subView === 'contenido' && (
              <button
                onClick={() => setIsPubModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>+ Programar Publicación / PR</span>
              </button>
            )}

            {subView === 'briefs' && (
              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>+ Redactar Nuevo Brief</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW: CALENDARIO EN TIEMPO REAL */}
      {subView === 'calendario' && (
        <SharedCalendar
          deals={deals}
          campaigns={campaigns}
          publications={publications}
          onAddCampaignClick={() => setIsCampaignModalOpen(true)}
        />
      )}

      {/* SUB-VIEW 1: CAMPAÑAS */}
      {subView === 'campanas' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Campaña & Hotel</th>
                  <th className="py-3 px-4">Espacios Promocionados</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Presupuesto</th>
                  <th className="py-3 px-4">Fechas</th>
                  <th className="py-3 px-4">Canales</th>
                  <th className="py-3 px-4">Enlaces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCampaigns.map((c) => {
                  const badge = getMarketingStatusBadge(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-500">{c.code}</td>
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
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onChange={(e) => onUpdateCampaignStatus(c.id, e.target.value as MarketingCampaignStatus)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border} cursor-pointer focus:outline-none`}
                        >
                          <option value="planificacion">Planificación</option>
                          <option value="en_produccion">En Producción</option>
                          <option value="revision">En Revisión</option>
                          <option value="activa">Activa en Pauta</option>
                          <option value="finalizada">Finalizada</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {formatCurrency(c.budget, 'MXN')}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-[11px] whitespace-nowrap font-medium">
                        {formatDate(c.startDate)} al {formatDate(c.endDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.channels.map((ch, idx) => (
                            <span key={idx} className="bg-stone-100 text-stone-700 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          {c.externalLinks.map((lnk) => (
                            <a
                              key={lnk.id}
                              href={lnk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] px-2 py-0.5 rounded-sm border border-stone-200 text-stone-700 hover:bg-stone-100 font-semibold"
                            >
                              {lnk.title} ↗
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CONTENIDOS & PR */}
      {subView === 'contenido' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publications.map((pub) => (
            <div key={pub.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {pub.channel}
                </span>
                <span className="font-mono text-stone-500 text-[11px] font-semibold">{formatDate(pub.publishDate)}</span>
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{pub.title}</h4>
                <p className="text-xs text-rose-600 font-bold mt-0.5">{pub.hotel}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-600">
                <span>Resp: {pub.responsible}</span>
                <span className="capitalize font-bold text-emerald-700">{pub.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-VIEW 3: BRIEFS CREATIVOS */}
      {subView === 'briefs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefs.map((brf) => (
            <div key={brf.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                  {brf.category.replace('_', ' ')}
                </span>
                <span className="text-stone-500 font-mono text-[11px]">{formatDate(brf.date)}</span>
              </div>
              <div>
                <h4 className="font-editorial text-xl font-bold text-stone-900">{brf.title}</h4>
                <p className="text-xs text-rose-600 font-bold">{brf.hotelTarget}</p>
              </div>
              <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                {brf.objective}
              </p>
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 flex justify-between">
                <span>Autor: {brf.author}</span>
                <span className="font-bold text-stone-800">{brf.deliverables.length} entregables</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: NUEVA CAMPAÑA */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Nueva Campaña de Marketing Hotelero
              </h3>
              <button onClick={() => setIsCampaignModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Campaña Bodas de Invierno & Romance"
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                        className={`p-1.5 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1.5 ${
                          isSelected ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold' : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => {}} className="accent-rose-600" />
                        <span className="truncate">{space.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Presupuesto ($ MXN)</label>
                  <input
                    type="number"
                    value={cBudget}
                    onChange={(e) => setCBudget(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Canales</label>
                  <input
                    type="text"
                    value={cChannels}
                    onChange={(e) => setCChannels(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={cStart}
                    onChange={(e) => setCStart(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={cEnd}
                    onChange={(e) => setCEnd(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                >
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA PUBLICACIÓN / PR */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Programar Contenido / PR
              </h3>
              <button onClick={() => setIsPubModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePublication} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título de la Pieza</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Reel Cabañas Ajusco con Chimenea"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Canal</label>
                  <select
                    value={pChannel}
                    onChange={(e) => setPChannel(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="prensa">Nota de Prensa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel</label>
                  <select
                    value={pHotel}
                    onChange={(e) => setPHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Fecha</label>
                <input
                  type="date"
                  value={pDate}
                  onChange={(e) => setPDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Programar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO BRIEF */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Redactar Brief Estratégico
              </h3>
              <button onClick={() => setIsBriefModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrief} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Shooting Casona Quinta Soledad"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel</label>
                  <select
                    value={bHotel}
                    onChange={(e) => setBHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Categoría</label>
                  <select
                    value={bCategory}
                    onChange={(e) => setBCategory(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="shooting_fotografico">Shooting Fotográfico</option>
                    <option value="comunicado_prensa">Comunicado de Prensa</option>
                    <option value="campana_digital">Campaña Digital</option>
                    <option value="evento_marca">Evento de Marca</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Objetivo</label>
                <textarea
                  rows={2}
                  value={bObjective}
                  onChange={(e) => setBObjective(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsBriefModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  Crear Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
