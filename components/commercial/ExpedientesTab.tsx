'use client';

import React, { useMemo, useState } from 'react';
import {
  HotelDeal,
  DealExpediente,
  DealExpedienteDoc,
  UserProfile
} from '@/lib/types';
import {
  formatDate,
  formatCurrency,
  safeExternalUrl,
  calculateProgressPercent
} from '@/lib/utils';

interface ExpedientesTabProps {
  deals: HotelDeal[];
  selectedHotelFilter: string;
  currentUser?: UserProfile | null;
  isCurrentUserAdmin: boolean;
  onUpdateDeal: (deal: HotelDeal) => void;
}

type ExpedienteSlotKey =
  | 'contract'
  | 'serviceOrder'
  | 'paymentProof'
  | 'operationsHandover'
  | 'welcomeEmail';

interface SlotConfig {
  key: ExpedienteSlotKey;
  title: string;
  subtitle: string;
  icon: string;
  accept: string;
  allowText?: boolean;
}

const EXPEDIENTE_SLOTS: SlotConfig[] = [
  {
    key: 'contract',
    title: '1. Contrato Firmado',
    subtitle: 'PDF o imagen (sincronizado con Pipeline)',
    icon: '📄',
    accept: 'application/pdf,image/*'
  },
  {
    key: 'serviceOrder',
    title: '2. Orden de Servicio',
    subtitle: 'PDF o imagen',
    icon: '📋',
    accept: 'application/pdf,image/*'
  },
  {
    key: 'paymentProof',
    title: '3. Comprobante de Pago',
    subtitle: 'Imagen o PDF',
    icon: '💳',
    accept: 'image/*,application/pdf'
  },
  {
    key: 'operationsHandover',
    title: '4. Entrega a Parte Operativa',
    subtitle: 'Correo o foto del correo',
    icon: '🏨',
    accept: 'image/*,application/pdf',
    allowText: true
  },
  {
    key: 'welcomeEmail',
    title: '5. Correo de Bienvenida al Cliente',
    subtitle: 'Imagen del correo',
    icon: '✉️',
    accept: 'image/*'
  }
];

function isSlotCompleted(deal: HotelDeal, key: ExpedienteSlotKey): boolean {
  if (key === 'contract') {
    return Boolean(deal.contractUrl?.trim());
  }
  const doc = deal.expediente?.[key];
  return Boolean(doc?.fileUrl?.trim() || (key === 'operationsHandover' && doc?.notes?.trim()));
}

function getSlotStats(deal: HotelDeal) {
  const completedCount = EXPEDIENTE_SLOTS.filter((s) => isSlotCompleted(deal, s.key)).length;
  const totalCount = EXPEDIENTE_SLOTS.length;
  const progress = calculateProgressPercent(completedCount, totalCount);
  return { completedCount, totalCount, progress };
}

export function ExpedientesTab({
  deals,
  selectedHotelFilter,
  currentUser,
  isCurrentUserAdmin,
  onUpdateDeal
}: ExpedientesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'completos' | 'pendientes'>('todos');
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<ExpedienteSlotKey | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [handoverDraft, setHandoverDraft] = useState('');
  const [urlDrafts, setUrlDrafts] = useState<Partial<Record<ExpedienteSlotKey, string>>>({});

  const contractedDeals = useMemo(() => {
    return deals
      .filter((d) => d.stage === 'contratado')
      .filter((d) => selectedHotelFilter === 'all' || d.hotelName === selectedHotelFilter)
      .filter((d) => {
        const { completedCount, totalCount } = getSlotStats(d);
        if (statusFilter === 'completos') return completedCount === totalCount;
        if (statusFilter === 'pendientes') return completedCount < totalCount;
        return true;
      })
      .filter((d) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          d.companyOrAgency.toLowerCase().includes(q) ||
          d.clientName.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.hotelName.toLowerCase().includes(q) ||
          (d.assignedRep || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate));
  }, [deals, selectedHotelFilter, statusFilter, searchTerm]);

  const summary = useMemo(() => {
    const allSigned = deals
      .filter((d) => d.stage === 'contratado')
      .filter((d) => selectedHotelFilter === 'all' || d.hotelName === selectedHotelFilter);
    const complete = allSigned.filter((d) => getSlotStats(d).completedCount === 5).length;
    return {
      total: allSigned.length,
      complete,
      pending: allSigned.length - complete
    };
  }, [deals, selectedHotelFilter]);

  const activeDeal = useMemo(
    () => (activeDealId ? deals.find((d) => d.id === activeDealId) || null : null),
    [deals, activeDealId]
  );

  const openExpedienteModal = (deal: HotelDeal) => {
    setActiveDealId(deal.id);
    setUploadError(null);
    setHandoverDraft(deal.expediente?.operationsHandover?.notes || '');
    setUrlDrafts({
      contract: deal.contractUrl || '',
      serviceOrder: deal.expediente?.serviceOrder?.fileUrl || '',
      paymentProof: deal.expediente?.paymentProof?.fileUrl || '',
      operationsHandover: deal.expediente?.operationsHandover?.fileUrl || '',
      welcomeEmail: deal.expediente?.welcomeEmail?.fileUrl || ''
    });
  };

  const saveSlotDoc = (
    deal: HotelDeal,
    key: ExpedienteSlotKey,
    patch: Partial<DealExpedienteDoc> & { fileUrl?: string; fileName?: string }
  ) => {
    const nowLabel = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const author = currentUser?.name || 'Ejecutivo';

    if (key === 'contract') {
      onUpdateDeal({
        ...deal,
        contractUrl: patch.fileUrl !== undefined ? patch.fileUrl || undefined : deal.contractUrl,
        contractFileName:
          patch.fileName !== undefined ? patch.fileName || undefined : deal.contractFileName
      });
      return;
    }

    const prevExpediente: DealExpediente = deal.expediente || {};
    const prevDoc: DealExpedienteDoc = prevExpediente[key] || {};
    const nextDoc: DealExpedienteDoc = {
      ...prevDoc,
      ...patch,
      updatedAt: nowLabel,
      updatedBy: author
    };

    onUpdateDeal({
      ...deal,
      expediente: {
        ...prevExpediente,
        [key]: nextDoc
      }
    });
  };

  const handleFileUpload = async (
    deal: HotelDeal,
    key: ExpedienteSlotKey,
    file: File
  ) => {
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('El archivo supera el máximo permitido (25MB).');
      return;
    }
    try {
      setUploadingSlot(key);
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir archivo');
      }
      saveSlotDoc(deal, key, { fileUrl: data.url, fileName: file.name });
      setUrlDrafts((prev) => ({ ...prev, [key]: data.url }));
    } catch (err) {
      setUploadError((err as Error).message || 'No se pudo subir el archivo.');
    } finally {
      setUploadingSlot(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Eventos Firmados
            </div>
            <div className="text-2xl font-editorial font-extrabold text-stone-900 mt-1">
              {summary.total}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl border border-emerald-200">
            📁
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Expedientes Completos (5/5)
            </div>
            <div className="text-2xl font-editorial font-extrabold text-emerald-800 mt-1">
              {summary.complete}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl border border-emerald-200">
            ✅
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Pendientes de Documentos
            </div>
            <div className="text-2xl font-editorial font-extrabold text-amber-900 mt-1">
              {summary.pending}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl border border-amber-200">
            ⏳
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por evento, cliente, folio, hotel o ejecutivo..."
          className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-bold">
          {(['todos', 'pendientes', 'completos'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'todos' ? 'Todos' : st === 'pendientes' ? 'Pendientes' : 'Completos'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas de Expedientes */}
      {contractedDeals.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-stone-400 space-y-2">
          <span className="text-4xl block">📂</span>
          <p className="text-sm font-semibold text-stone-600">
            No hay eventos en Contrato Firmado con estos filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contractedDeals.map((deal) => {
            const { completedCount, totalCount, progress } = getSlotStats(deal);
            const isComplete = completedCount === totalCount;

            return (
              <div
                key={deal.id}
                onClick={() => openExpedienteModal(deal)}
                className="bg-white border border-stone-200 hover:border-emerald-400 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        {deal.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {completedCount}/{totalCount} docs · {progress.formatted}
                      </span>
                    </div>
                    <h4 className="font-editorial text-lg font-bold text-stone-900 mt-1.5 truncate">
                      {deal.companyOrAgency}
                    </h4>
                    <div className="text-xs text-stone-500 truncate">
                      {deal.clientName} · <strong className="text-stone-700">{deal.hotelName}</strong>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progress.capped}%` }}
                  />
                </div>

                {/* Resumen de los 5 documentos */}
                <div className="grid grid-cols-5 gap-1.5 text-[10px] text-center font-semibold">
                  {EXPEDIENTE_SLOTS.map((slot) => {
                    const done = isSlotCompleted(deal, slot.key);
                    return (
                      <div
                        key={slot.key}
                        title={slot.title}
                        className={`py-1.5 px-1 rounded-lg border ${
                          done
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-50 text-stone-400 border-stone-200'
                        }`}
                      >
                        <div className="text-xs">{done ? '✓' : slot.icon}</div>
                        <div className="truncate text-[9px] mt-0.5">
                          {slot.key === 'contract'
                            ? 'Contrato'
                            : slot.key === 'serviceOrder'
                            ? 'Orden'
                            : slot.key === 'paymentProof'
                            ? 'Pago'
                            : slot.key === 'operationsHandover'
                            ? 'Entrega'
                            : 'Bienv.'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <span>📅 {formatDate(deal.checkInDate)}</span>
                  <span className="font-semibold text-stone-700 truncate max-w-[160px]">
                    👤 {deal.assignedRep}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EXPEDIENTE DEL EVENTO */}
      {activeDeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {activeDeal.code}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {activeDeal.hotelName} · {formatDate(activeDeal.checkInDate)} al{' '}
                    {formatDate(activeDeal.checkOutDate)}
                  </span>
                  {isCurrentUserAdmin && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      👤 Ejecutivo: {activeDeal.assignedRep}
                    </span>
                  )}
                </div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                  Expediente: {activeDeal.companyOrAgency}
                </h3>
                <p className="text-xs text-stone-500">
                  Cliente: {activeDeal.clientName} · Valor:{' '}
                  <strong className="font-mono text-stone-800">
                    {formatCurrency(activeDeal.totalValue, activeDeal.currency)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDealId(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                ⚠️ {uploadError}
              </div>
            )}

            <div className="space-y-4">
              {EXPEDIENTE_SLOTS.map((slot) => {
                const docMeta = slot.key === 'contract' ? undefined : activeDeal.expediente?.[slot.key];
                const fileUrl = slot.key === 'contract' ? activeDeal.contractUrl : docMeta?.fileUrl;
                const fileName = slot.key === 'contract' ? activeDeal.contractFileName : docMeta?.fileName;
                const done = isSlotCompleted(activeDeal, slot.key);
                const isUploading = uploadingSlot === slot.key;

                return (
                  <div
                    key={slot.key}
                    className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                      done
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{slot.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                            <span>{slot.title}</span>
                            {done && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Guardado
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">{slot.subtitle}</div>
                        </div>
                      </div>

                      {fileUrl && (
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={safeExternalUrl(fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs"
                          >
                            Ver {fileName ? `(${fileName.slice(0, 22)})` : 'archivo'} ↗
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              saveSlotDoc(activeDeal, slot.key, { fileUrl: '', fileName: '' });
                              setUrlDrafts((prev) => ({ ...prev, [slot.key]: '' }));
                            }}
                            className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <label className="cursor-pointer bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                        <span>{isUploading ? '⏳ Subiendo...' : '📎 Subir Archivo'}</span>
                        <input
                          type="file"
                          accept={slot.accept}
                          disabled={isUploading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(activeDeal, slot.key, f);
                          }}
                          className="hidden"
                        />
                      </label>

                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="O pega enlace (Drive / URL)..."
                          value={urlDrafts[slot.key] ?? ''}
                          onChange={(e) =>
                            setUrlDrafts((prev) => ({ ...prev, [slot.key]: e.target.value }))
                          }
                          className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = (urlDrafts[slot.key] || '').trim();
                            saveSlotDoc(activeDeal, slot.key, { fileUrl: val, fileName: '' });
                          }}
                          className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shrink-0"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>

                    {slot.allowText && (
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[11px] font-bold text-stone-700">
                          O pega el correo de entrega a operativa:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <textarea
                            rows={2}
                            value={handoverDraft}
                            onChange={(e) => setHandoverDraft(e.target.value)}
                            placeholder="Pega aquí el contenido o resumen del correo enviado a operativa..."
                            className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              saveSlotDoc(activeDeal, 'operationsHandover', {
                                notes: handoverDraft.trim()
                              })
                            }
                            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer self-end sm:self-stretch"
                          >
                            Guardar Correo
                          </button>
                        </div>
                      </div>
                    )}

                    {docMeta?.updatedAt && (
                      <div className="text-[10px] text-stone-500 font-mono">
                        Última actualización: {docMeta.updatedAt}
                        {docMeta.updatedBy ? ` por ${docMeta.updatedBy}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setActiveDealId(null)}
                className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
