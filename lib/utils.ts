import { MarketingCampaignStatus, HotelDealStage, DealCategory } from './types';

export function formatCurrency(amount: number, currency: 'MXN' | 'USD' = 'MXN'): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
  return `${formatted} MXN`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

// -------------------------------------------------------------
// COLORES PARA MARKETING & COMUNICACIÓN (Vibrantes & Profesionales)
// -------------------------------------------------------------
export function getMarketingStatusBadge(status: MarketingCampaignStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'planificacion':
      return {
        label: 'Planificación',
        bg: 'bg-indigo-50/80',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500'
      };
    case 'en_produccion':
      return {
        label: 'En Producción',
        bg: 'bg-blue-50/80',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'revision':
      return {
        label: 'En Revisión',
        bg: 'bg-amber-50/80',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'activa':
      return {
        label: 'Activa en Pauta',
        bg: 'bg-emerald-50/80',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'finalizada':
      return {
        label: 'Finalizada',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400'
      };
  }
}

// -------------------------------------------------------------
// COLORES PARA COMERCIALIZACIÓN HOTELERA (Lujo & Ventas)
// -------------------------------------------------------------
export function getHotelDealStageBadge(stage: HotelDealStage): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (stage) {
    case 'rfp_recibido':
      return {
        label: 'RFP / Solicitud Recibida',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600'
      };
    case 'propuesta_enviada':
      return {
        label: 'Cotización Enviada',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-600'
      };
    case 'negociacion':
      return {
        label: 'En Negociación',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500'
      };
    case 'contratado':
      return {
        label: 'Contrato Firmado (Ganado)',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-600'
      };
    case 'perdido':
      return {
        label: 'No Concretado',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    default:
      return {
        label: stage,
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-200',
        dot: 'bg-stone-400'
      };
  }
}

export function getDealCategoryLabel(category: DealCategory | string): { label: string; badge: string } {
  switch (category) {
    case 'empresarial':
    case 'grupos_convenciones':
    case 'cuentas_empresariales':
      return { label: 'Empresarial', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    case 'social':
    case 'bodas_sociales':
      return { label: 'Social', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'individual':
    case 'agencias_viaje':
      return { label: 'Individual', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    default:
      return { label: category || 'Social', badge: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
}
