'use client';

import React, { useState, useMemo } from 'react';
import {
  HotelDeal,
  DealInvoice,
  UserProfile,
  ADMIN_EMAILS,
  isAdminEmail
} from '@/lib/types';
import { HOTEL_PROPERTIES } from '@/lib/initial-data';
import { formatCurrency, formatDate, safeExternalUrl } from '@/lib/utils';

interface InvoicesTabProps {
  deals: HotelDeal[];
  currentUser?: UserProfile | null;
  selectedHotelFilter: string;
  onUpdateDeal: (deal: HotelDeal) => void;
}

export type EventOperationalState = 'en_curso' | 'concluido' | 'proximo';

export function getEventState(deal: HotelDeal, todayStr: string = new Date().toISOString().split('T')[0]): EventOperationalState {
  if (deal.checkOutDate < todayStr) return 'concluido';
  if (deal.checkInDate <= todayStr && deal.checkOutDate >= todayStr) return 'en_curso';
  return 'proximo';
}

export function InvoicesTab({
  deals,
  currentUser,
  selectedHotelFilter,
  onUpdateDeal
}: InvoicesTabProps) {
  const isCurrentUserAdmin = isAdminEmail(currentUser?.email);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [hotelFilter, setHotelFilter] = useState(selectedHotelFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_curso' | 'concluido' | 'proximo'>('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'con_factura' | 'sin_factura'>('all');
  const [viewMode, setViewMode] = useState<'eventos' | 'facturas'>('eventos');

  // Modal State - Attach / Edit Invoice
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDealForModal, setSelectedDealForModal] = useState<HotelDeal | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // Form Fields
  const [formDealId, setFormDealId] = useState('');
  const [formFolio, setFormFolio] = useState('');
  const [formConcept, setFormConcept] = useState('Anticipo');
  const [formCustomConcept, setFormCustomConcept] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [formInvoiceDate, setFormInvoiceDate] = useState(todayStr);
  const [formAttachmentType, setFormAttachmentType] = useState<'image' | 'link'>('image');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadSource, setUploadSource] = useState<string | null>(null);

  // Lightbox / Image Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<{
    invoice: DealInvoice;
    deal: HotelDeal;
  } | null>(null);

  // Delete Confirmation Modal
  const [invoiceToDelete, setInvoiceToDelete] = useState<{
    deal: HotelDeal;
    invoice: DealInvoice;
  } | null>(null);

  // Eligible deals: typically contracted or active confirmed deals
  const eligibleDeals = useMemo(() => {
    return deals.filter((d) => {
      // Excluir perdidos
      if (d.stage === 'perdido') return false;
      // Filtro de hotel si aplica
      if (hotelFilter !== 'all' && d.hotelName !== hotelFilter) return false;
      return true;
    });
  }, [deals, hotelFilter]);

  // Filtered deals according to search and status pills
  const filteredDeals = useMemo(() => {
    return eligibleDeals.filter((deal) => {
      const state = getEventState(deal, todayStr);
      if (statusFilter !== 'all' && state !== statusFilter) return false;

      const hasInvoices = deal.invoices && deal.invoices.length > 0;
      if (invoiceStatusFilter === 'con_factura' && !hasInvoices) return false;
      if (invoiceStatusFilter === 'sin_factura' && hasInvoices) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesClient = deal.clientName.toLowerCase().includes(q);
        const matchesCompany = deal.companyOrAgency?.toLowerCase().includes(q);
        const matchesCode = deal.code.toLowerCase().includes(q);
        const matchesHotel = deal.hotelName.toLowerCase().includes(q);
        const matchesInvoice = deal.invoices?.some(
          (inv) =>
            inv.folio.toLowerCase().includes(q) ||
            inv.concept?.toLowerCase().includes(q) ||
            inv.notes?.toLowerCase().includes(q)
        );
        if (!matchesClient && !matchesCompany && !matchesCode && !matchesHotel && !matchesInvoice) {
          return false;
        }
      }

      return true;
    });
  }, [eligibleDeals, statusFilter, invoiceStatusFilter, searchTerm, todayStr]);

  // Flat list of all invoices across deals
  const allInvoices = useMemo(() => {
    const list: { deal: HotelDeal; invoice: DealInvoice }[] = [];
    eligibleDeals.forEach((d) => {
      if (d.invoices && d.invoices.length > 0) {
        d.invoices.forEach((inv) => {
          list.push({ deal: d, invoice: inv });
        });
      }
    });
    return list.sort((a, b) => new Date(b.invoice.invoiceDate).getTime() - new Date(a.invoice.invoiceDate).getTime());
  }, [eligibleDeals]);

  // Filtered Flat Invoices for 'facturas' viewMode
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(({ deal, invoice }) => {
      const state = getEventState(deal, todayStr);
      if (statusFilter !== 'all' && state !== statusFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesClient = deal.clientName.toLowerCase().includes(q);
        const matchesHotel = deal.hotelName.toLowerCase().includes(q);
        const matchesFolio = invoice.folio.toLowerCase().includes(q);
        const matchesConcept = invoice.concept?.toLowerCase().includes(q);
        const matchesNotes = invoice.notes?.toLowerCase().includes(q);
        if (!matchesClient && !matchesHotel && !matchesFolio && !matchesConcept && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [allInvoices, statusFilter, searchTerm, todayStr]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalInvoices = allInvoices.length;
    const totalAmountMXN = allInvoices.reduce((sum, item) => sum + (Number(item.invoice.amount) || 0), 0);

    const enCursoDeals = eligibleDeals.filter((d) => getEventState(d, todayStr) === 'en_curso');
    const enCursoConFactura = enCursoDeals.filter((d) => d.invoices && d.invoices.length > 0).length;

    const concluidosDeals = eligibleDeals.filter((d) => getEventState(d, todayStr) === 'concluido');
    const concluidosConFactura = concluidosDeals.filter((d) => d.invoices && d.invoices.length > 0).length;

    return {
      totalInvoices,
      totalAmountMXN,
      enCursoTotal: enCursoDeals.length,
      enCursoConFactura,
      concluidosTotal: concluidosDeals.length,
      concluidosConFactura
    };
  }, [allInvoices, eligibleDeals, todayStr]);

  // Open modal to attach invoice to a specific deal or fresh
  const handleOpenAttachModal = (deal?: HotelDeal) => {
    setFormError(null);
    setEditingInvoiceId(null);
    if (deal) {
      setSelectedDealForModal(deal);
      setFormDealId(deal.id);
      setFormAmount(deal.depositAmount ? String(deal.depositAmount) : String(deal.totalValue));
      setFormCurrency(deal.currency || 'MXN');
    } else {
      setSelectedDealForModal(null);
      setFormDealId(eligibleDeals[0]?.id || '');
      setFormAmount('');
      setFormCurrency('MXN');
    }
    setFormFolio('');
    setFormConcept('Anticipo');
    setFormCustomConcept('');
    setFormInvoiceDate(todayStr);
    setFormAttachmentType('image');
    setFormFileUrl('');
    setFormFileName('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal to edit existing invoice
  const handleOpenEditInvoiceModal = (deal: HotelDeal, invoice: DealInvoice) => {
    setFormError(null);
    setSelectedDealForModal(deal);
    setFormDealId(deal.id);
    setEditingInvoiceId(invoice.id);
    setFormFolio(invoice.folio);
    if (['Anticipo', 'Liquidación / Finiquito', 'Renta de Salón', 'Alimentos y Bebidas', 'Hospedaje', 'Penalización'].includes(invoice.concept || '')) {
      setFormConcept(invoice.concept || 'Anticipo');
      setFormCustomConcept('');
    } else {
      setFormConcept('Otro');
      setFormCustomConcept(invoice.concept || '');
    }
    setFormAmount(invoice.amount ? String(invoice.amount) : '');
    setFormCurrency(invoice.currency || 'MXN');
    setFormInvoiceDate(invoice.invoiceDate || todayStr);
    setFormAttachmentType(invoice.fileType === 'link' ? 'link' : 'image');
    setFormFileUrl(invoice.fileUrl || '');
    setFormFileName(invoice.fileName || '');
    setFormNotes(invoice.notes || '');
    setIsModalOpen(true);
  };

  // Handle file upload to Cloud Storage (Vercel Blob / API)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setFormError('El archivo es demasiado grande. Máximo permitido: 25MB.');
      return;
    }

    try {
      setIsUploadingFile(true);
      setFormError(null);
      setFormFileName(file.name);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setFormFileUrl(data.url);
      setUploadSource(data.source === 'vercel_blob' ? 'Vercel Cloud Blob' : 'Almacenamiento Local');
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setFormError('No se pudo subir el archivo. Por favor intenta nuevamente.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Handle Save Invoice
  const handleSaveInvoice = () => {
    if (!formDealId) {
      setFormError('Por favor selecciona el evento correspondiente.');
      return;
    }
    if (!formFolio.trim()) {
      setFormError('Por favor ingresa el folio o número de factura.');
      return;
    }
    if (!formFileUrl.trim()) {
      setFormError('Por favor adjunta una imagen o ingresa el enlace de la factura.');
      return;
    }

    const targetDeal = deals.find((d) => d.id === formDealId);
    if (!targetDeal) {
      setFormError('No se encontró el evento seleccionado.');
      return;
    }

    const finalConcept = formConcept === 'Otro' ? (formCustomConcept.trim() || 'Otro concepto') : formConcept;
    const finalAmount = formAmount ? parseFloat(formAmount) : undefined;
    const isLink = formAttachmentType === 'link';

    const currentInvoices = targetDeal.invoices || [];

    if (editingInvoiceId) {
      // Actualizar factura existente
      const updatedInvoices = currentInvoices.map((inv) => {
        if (inv.id === editingInvoiceId) {
          return {
            ...inv,
            folio: formFolio.trim(),
            concept: finalConcept,
            amount: finalAmount,
            currency: formCurrency,
            invoiceDate: formInvoiceDate,
            fileUrl: formFileUrl.trim(),
            fileType: isLink ? ('link' as const) : ('image' as const),
            fileName: formFileName.trim() || undefined,
            notes: formNotes.trim() || undefined
          };
        }
        return inv;
      });

      onUpdateDeal({
        ...targetDeal,
        invoices: updatedInvoices
      });
    } else {
      // Crear nueva factura
      const newInvoice: DealInvoice = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        folio: formFolio.trim(),
        concept: finalConcept,
        amount: finalAmount,
        currency: formCurrency,
        invoiceDate: formInvoiceDate,
        fileUrl: formFileUrl.trim(),
        fileType: isLink ? 'link' : 'image',
        fileName: formFileName.trim() || (isLink ? 'Enlace Web' : 'Factura adjunta'),
        status: 'emitida',
        notes: formNotes.trim() || undefined,
        uploadedBy: currentUser?.name || 'Administrador',
        createdAt: new Date().toISOString()
      };

      onUpdateDeal({
        ...targetDeal,
        invoices: [newInvoice, ...currentInvoices]
      });
    }

    setIsModalOpen(false);
  };

  // Delete Invoice action
  const confirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    const { deal, invoice } = invoiceToDelete;
    const updatedInvoices = (deal.invoices || []).filter((i) => i.id !== invoice.id);
    onUpdateDeal({
      ...deal,
      invoices: updatedInvoices
    });
    setInvoiceToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Total Facturas
            </div>
            <div className="text-2xl font-editorial font-extrabold text-slate-900 mt-1">
              {stats.totalInvoices}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              En eventos confirmados
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-200/60">
            🧾
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Monto Facturado
            </div>
            <div className="text-2xl font-editorial font-extrabold text-emerald-700 mt-1">
              {formatCurrency(stats.totalAmountMXN)}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              Suma de facturas adjuntas
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-bold border border-teal-200/60">
            💰
          </div>
        </div>

        {/* KPI 3: Eventos En Curso */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Eventos En Curso
            </div>
            <div className="text-2xl font-editorial font-extrabold text-slate-900 mt-1">
              {stats.enCursoConFactura} / {stats.enCursoTotal}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              Con factura vinculada
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl font-bold border border-emerald-200">
            🟢
          </div>
        </div>

        {/* KPI 4: Eventos Concluidos */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏁</span>
              Eventos Concluidos
            </div>
            <div className="text-2xl font-editorial font-extrabold text-slate-900 mt-1">
              {stats.concluidosConFactura} / {stats.concluidosTotal}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              Con factura respaldada
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center text-xl font-bold border border-stone-200">
            📁
          </div>
        </div>
      </div>

      {/* 2. Control & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search input & Hotel Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por cliente, hotel, código de evento o folio de factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 placeholder:text-stone-400 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider pl-1">
              Hotel:
            </span>
            <select
              value={hotelFilter}
              onChange={(e) => setHotelFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todas las 6 Propiedades</option>
              {HOTEL_PROPERTIES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills & View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos ({eligibleDeals.length})
            </button>
            <button
              onClick={() => setStatusFilter('en_curso')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'en_curso'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>En Curso ({stats.enCursoTotal})</span>
            </button>
            <button
              onClick={() => setStatusFilter('concluido')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'concluido'
                  ? 'bg-slate-800 text-white shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🏁 Concluidos ({stats.concluidosTotal})</span>
            </button>
            <button
              onClick={() => setStatusFilter('proximo')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'proximo'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⏳ Próximos</span>
            </button>
          </div>

          {/* Toggle Invoices presence */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setInvoiceStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                invoiceStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setInvoiceStatusFilter('con_factura')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                invoiceStatusFilter === 'con_factura' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Con Factura
            </button>
            <button
              onClick={() => setInvoiceStatusFilter('sin_factura')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                invoiceStatusFilter === 'sin_factura' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sin Factura
            </button>
          </div>

          {/* View Mode Toggle: Eventos vs Facturas */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('eventos')}
              title="Ver agrupado por evento"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'eventos' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🏨 Por Evento</span>
            </button>
            <button
              onClick={() => setViewMode('facturas')}
              title="Ver listado general de facturas"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'facturas' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🧾 Listado Facturas ({allInvoices.length})</span>
            </button>
          </div>

          {/* Action Button: Nueva Factura */}
          <button
            onClick={() => handleOpenAttachModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <span>+</span>
            <span>Adjuntar Factura</span>
          </button>
        </div>
      </div>

      {/* 3. Main View Render */}
      {viewMode === 'eventos' ? (
        /* VISTA AGRUPADA POR EVENTO */
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <div className="text-4xl mb-3">🧾</div>
              <h3 className="text-base font-bold text-slate-800">No se encontraron eventos</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                No hay eventos que coincidan con los filtros seleccionados o la búsqueda realizada.
              </p>
            </div>
          ) : (
            filteredDeals.map((deal) => {
              const state = getEventState(deal, todayStr);
              const dealInvoices = deal.invoices || [];
              const totalInvoicedInDeal = dealInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-emerald-500/40"
                >
                  {/* Event Card Header */}
                  <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* State Badge */}
                      <div className="pt-0.5">
                        {state === 'en_curso' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            En Curso
                          </span>
                        )}
                        {state === 'concluido' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            🏁 Concluido
                          </span>
                        )}
                        {state === 'proximo' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⏳ Próximo
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900">
                            {deal.clientName}
                          </h4>
                          {deal.companyOrAgency && deal.companyOrAgency !== deal.clientName && (
                            <span className="text-xs text-stone-500 font-medium">
                              ({deal.companyOrAgency})
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700 font-semibold">
                            {deal.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-stone-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-stone-700">
                            🏨 {deal.hotelName}
                          </span>
                          <span>•</span>
                          <span>
                            📅 {formatDate(deal.checkInDate)} al {formatDate(deal.checkOutDate)}
                          </span>
                          <span>•</span>
                          <span>
                            👥 {deal.attendeesCount || 0} personas
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-900">
                            Valor: {formatCurrency(deal.totalValue)} {deal.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action & Financial Summary */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] uppercase font-bold text-stone-400">
                          Total Facturado
                        </div>
                        <div className="text-sm font-bold font-editorial text-emerald-800">
                          {formatCurrency(totalInvoicedInDeal)} {deal.currency}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {dealInvoices.length} {dealInvoices.length === 1 ? 'factura' : 'facturas'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenAttachModal(deal)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                      >
                        <span>+</span>
                        <span>Adjuntar Factura</span>
                      </button>
                    </div>
                  </div>

                  {/* Event Invoices List */}
                  <div className="p-5">
                    {dealInvoices.length === 0 ? (
                      <div className="bg-stone-50 rounded-xl p-4 border border-dashed border-stone-200 text-center flex items-center justify-between flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-3 text-stone-500 text-xs">
                          <span className="text-lg">⚠️</span>
                          <span>Este evento aún no tiene facturas vinculadas.</span>
                        </div>
                        <button
                          onClick={() => handleOpenAttachModal(deal)}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                        >
                          + Vincular primera factura
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {dealInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="bg-stone-50/80 hover:bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col justify-between transition-all group hover:shadow-xs"
                          >
                            <div>
                              {/* Top Bar of invoice card */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {inv.fileType === 'image' ? '🖼️' : '🔗'}
                                  </span>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                                      Folio: {inv.folio}
                                    </div>
                                    <div className="text-[10px] text-stone-500">
                                      {formatDate(inv.invoiceDate)}
                                    </div>
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {inv.concept || 'Factura'}
                                </span>
                              </div>

                              {/* Amount & Notes */}
                              <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-baseline justify-between">
                                <span className="text-[11px] text-stone-500">Importe:</span>
                                <span className="text-sm font-extrabold text-slate-900 font-editorial">
                                  {inv.amount ? `${formatCurrency(inv.amount)} ${inv.currency || 'MXN'}` : 'Sin especificar'}
                                </span>
                              </div>

                              {inv.notes && (
                                <p className="text-[11px] text-stone-600 mt-2 bg-white/70 p-2 rounded-lg border border-stone-200/50 line-clamp-2">
                                  {inv.notes}
                                </p>
                              )}

                              {/* Thumbnail preview if it's an image */}
                              {inv.fileType === 'image' && inv.fileUrl && (
                                <div
                                  onClick={() => setPreviewInvoice({ invoice: inv, deal })}
                                  className="mt-3 relative h-28 w-full bg-stone-200 rounded-lg overflow-hidden border border-stone-300 cursor-pointer group/thumb"
                                >
                                  <img
                                    src={inv.fileUrl}
                                    alt={`Factura ${inv.folio}`}
                                    className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                    🔍 Clic para ampliar
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {inv.fileType === 'image' ? (
                                  <button
                                    onClick={() => setPreviewInvoice({ invoice: inv, deal })}
                                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                                  >
                                    <span>👁️</span>
                                    <span>Ver Factura</span>
                                  </button>
                                ) : (
                                  <a
                                    href={safeExternalUrl(inv.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                                  >
                                    <span>🔗</span>
                                    <span>Abrir Enlace</span>
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditInvoiceModal(deal, inv)}
                                  title="Editar datos de factura"
                                  className="p-1 text-stone-500 hover:text-slate-900 rounded-md hover:bg-stone-200/60"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => setInvoiceToDelete({ deal, invoice: inv })}
                                  title="Eliminar factura"
                                  className="p-1 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VISTA LISTADO GENERAL DE FACTURAS */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Registro General de Facturas ({filteredInvoices.length})
            </h3>
            <span className="text-xs text-stone-500">
              Ordenadas por fecha de emisión más reciente
            </span>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs">
              No hay facturas registradas que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Folio / Fecha</th>
                    <th className="py-3 px-4">Evento / Cliente</th>
                    <th className="py-3 px-4">Hotel</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4 text-right">Importe</th>
                    <th className="py-3 px-4 text-center">Adjunto</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInvoices.map(({ deal, invoice }) => {
                    const state = getEventState(deal, todayStr);
                    return (
                      <tr key={invoice.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{invoice.folio}</div>
                          <div className="text-[10px] text-stone-400">{formatDate(invoice.invoiceDate)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{deal.clientName}</span>
                            {state === 'en_curso' && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                En Curso
                              </span>
                            )}
                            {state === 'concluido' && (
                              <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
                                Concluido
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">{deal.code}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-700">
                          {deal.hotelName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                            {invoice.concept || 'Factura'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-editorial text-sm">
                          {invoice.amount ? `${formatCurrency(invoice.amount)} ${invoice.currency || 'MXN'}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {invoice.fileType === 'image' ? (
                            <button
                              onClick={() => setPreviewInvoice({ invoice, deal })}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <span>🖼️</span>
                              <span>Ver Imagen</span>
                            </button>
                          ) : (
                            <a
                              href={safeExternalUrl(invoice.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <span>🔗</span>
                              <span>Ver Enlace</span>
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditInvoiceModal(deal, invoice)}
                              title="Editar factura"
                              className="p-1 text-stone-500 hover:text-slate-900 rounded-md hover:bg-stone-200"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setInvoiceToDelete({ deal, invoice })}
                              title="Eliminar factura"
                              className="p-1 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL: Adjuntar o Editar Factura */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xl">
                  🧾
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-editorial">
                    {editingInvoiceId ? 'Editar Factura' : 'Adjuntar Factura a Evento'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Vincula comprobantes fiscales o imágenes a un evento en curso o concluido
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {/* Event Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Evento Asociado *
                </label>
                <select
                  value={formDealId}
                  onChange={(e) => {
                    setFormDealId(e.target.value);
                    const selected = deals.find((d) => d.id === e.target.value);
                    if (selected && !formAmount) {
                      setFormAmount(selected.depositAmount ? String(selected.depositAmount) : String(selected.totalValue));
                      setFormCurrency(selected.currency || 'MXN');
                    }
                  }}
                  disabled={!!editingInvoiceId}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                >
                  <option value="">-- Selecciona el evento --</option>
                  {eligibleDeals.map((d) => {
                    const state = getEventState(d, todayStr);
                    const stateLabel = state === 'en_curso' ? '🟢 EN CURSO' : state === 'concluido' ? '🏁 CONCLUIDO' : '⏳ PRÓXIMO';
                    return (
                      <option key={d.id} value={d.id}>
                        [{stateLabel}] {d.clientName} - {d.hotelName} ({formatDate(d.checkInDate)}) [{d.code}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Folio & Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Folio de Factura / UUID *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. FAC-2026-0045 o UUID SAT"
                    value={formFolio}
                    onChange={(e) => setFormFolio(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    value={formInvoiceDate}
                    onChange={(e) => setFormInvoiceDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Concepto & Monto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Concepto
                  </label>
                  <select
                    value={formConcept}
                    onChange={(e) => setFormConcept(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                  >
                    <option value="Anticipo">Anticipo (50%)</option>
                    <option value="Liquidación / Finiquito">Liquidación / Finiquito</option>
                    <option value="Renta de Salón / Espacio">Renta de Salón / Espacio</option>
                    <option value="Alimentos y Bebidas">Alimentos y Bebidas / Banquete</option>
                    <option value="Hospedaje">Hospedaje / Bloqueo de Habitaciones</option>
                    <option value="Consumos Extras">Consumos Extras / Servicios Adicionales</option>
                    <option value="Otro">Otro concepto personalizado...</option>
                  </select>

                  {formConcept === 'Otro' && (
                    <input
                      type="text"
                      placeholder="Escribe el concepto..."
                      value={formCustomConcept}
                      onChange={(e) => setFormCustomConcept(e.target.value)}
                      className="w-full text-xs p-2.5 mt-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Importe Facturado ($)
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setFormCurrency('MXN')}
                        className={`px-1.5 py-0.5 rounded font-bold ${formCurrency === 'MXN' ? 'bg-slate-900 text-white' : 'text-stone-500'}`}
                      >
                        MXN
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormCurrency('USD')}
                        className={`px-1.5 py-0.5 rounded font-bold ${formCurrency === 'USD' ? 'bg-slate-900 text-white' : 'text-stone-500'}`}
                      >
                        USD
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                  />
                </div>
              </div>

              {/* Attachment Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Adjuntar Factura *
                </label>
                <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold mb-3">
                  <button
                    type="button"
                    onClick={() => setFormAttachmentType('image')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      formAttachmentType === 'image'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>🖼️ Subir Imagen / Documento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAttachmentType('link')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      formAttachmentType === 'link'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>🔗 Enlace Web (Drive, SAT, etc.)</span>
                  </button>
                </div>

                {formAttachmentType === 'image' ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-500 bg-stone-50/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        id="invoice-file-input"
                        disabled={isUploadingFile}
                        className="hidden"
                      />
                      <label
                        htmlFor="invoice-file-input"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        {isUploadingFile ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold text-emerald-800">
                              Subiendo archivo al almacenamiento en la nube...
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Optimizando y generando enlace CDN
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="text-3xl">📁</span>
                            <span className="text-xs font-bold text-emerald-800 hover:underline">
                              Seleccionar archivo de factura (PNG, JPG, PDF)
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Almacenamiento seguro en la nube (Hasta 25MB)
                            </span>
                          </>
                        )}
                      </label>
                    </div>

                    {formFileUrl && !isUploadingFile && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="text-base shrink-0">☁️</span>
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-emerald-950 truncate block">
                              {formFileName || 'Factura cargada'}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              {uploadSource ? `Alojado en: ${uploadSource}` : 'Enlace en la nube listo'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileUrl('');
                            setFormFileName('');
                            setUploadSource(null);
                          }}
                          className="text-xs text-rose-600 hover:underline font-semibold shrink-0 ml-2"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... o enlace al visor"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium"
                    />
                    <p className="text-[10px] text-stone-400">
                      Pega el link de Google Drive, Dropbox, OneDrive o portal fiscal donde esté alojada la factura.
                    </p>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre complementos de pago, retenciones o especificaciones..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 text-stone-900 font-medium resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isUploadingFile}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors ${
                  isUploadingFile
                    ? 'bg-stone-400 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {isUploadingFile ? 'Subiendo archivo...' : editingInvoiceId ? 'Guardar Cambios' : 'Vincular Factura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX / PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:px-6 bg-slate-900 border-b border-white/10 flex items-center justify-between text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🧾</span>
                  <h4 className="text-sm font-bold">
                    Factura: {previewInvoice.invoice.folio}
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    {previewInvoice.invoice.concept || 'Factura'}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  Evento: {previewInvoice.deal.clientName} ({previewInvoice.deal.hotelName})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={safeExternalUrl(previewInvoice.invoice.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`Factura-${previewInvoice.invoice.folio}`}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  Abrir / Descargar
                </a>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image Viewer Container */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              {previewInvoice.invoice.fileUrl.startsWith('data:image') || previewInvoice.invoice.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? (
                <img
                  src={previewInvoice.invoice.fileUrl}
                  alt={`Factura ${previewInvoice.invoice.folio}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center p-12 text-white">
                  <p className="text-sm mb-3">Este archivo es un documento o enlace externo.</p>
                  <a
                    href={safeExternalUrl(previewInvoice.invoice.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-block"
                  >
                    Abrir Documento
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-stone-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto mb-3">
              🗑️
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              ¿Eliminar factura?
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              ¿Estás seguro de que deseas desvincular y eliminar la factura <strong className="text-slate-800">{invoiceToDelete.invoice.folio}</strong> del evento <strong className="text-slate-800">{invoiceToDelete.deal.clientName}</strong>?
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteInvoice}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
