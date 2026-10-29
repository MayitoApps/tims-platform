import { CampaignStatus, LeadStage, ExternalPlatform } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
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

export function getCampaignStatusBadge(status: CampaignStatus): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'ideation':
      return { label: 'Ideación', bg: 'bg-[#F2F1ED]', text: 'text-[#615F59]', dot: 'bg-[#9C988D]' };
    case 'in_production':
      return { label: 'En Producción', bg: 'bg-[#EDF2F7]', text: 'text-[#2D4A6B]', dot: 'bg-[#4A729D]' };
    case 'review':
      return { label: 'En Revisión', bg: 'bg-[#FBF4E6]', text: 'text-[#845E1B]', dot: 'bg-[#C29538]' };
    case 'ready':
      return { label: 'Listo', bg: 'bg-[#EBF5EE]', text: 'text-[#1E5631]', dot: 'bg-[#3A945B]' };
    case 'active':
      return { label: 'Activa en Pauta', bg: 'bg-[#EBF7F5]', text: 'text-[#13505B]', dot: 'bg-[#1E8A9D]' };
    case 'completed':
      return { label: 'Finalizada', bg: 'bg-[#F4F4F5]', text: 'text-[#52525B]', dot: 'bg-[#A1A1AA]' };
    default:
      return { label: status, bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-400' };
  }
}

export function getLeadStageBadge(stage: LeadStage): { label: string; bg: string; text: string; dot: string } {
  switch (stage) {
    case 'prospect':
      return { label: 'Prospecto Nuevo', bg: 'bg-[#F5F4F0]', text: 'text-[#636159]', dot: 'bg-[#A19D91]' };
    case 'mql_qualified':
      return { label: 'Calificado por Mkt', bg: 'bg-[#F3EFF8]', text: 'text-[#563875]', dot: 'bg-[#8E5EB8]' };
    case 'contacted':
      return { label: 'Contactado / Demo', bg: 'bg-[#EDF2F7]', text: 'text-[#24466B]', dot: 'bg-[#407BB8]' };
    case 'proposal_sent':
      return { label: 'Propuesta Enviada', bg: 'bg-[#FDF6E2]', text: 'text-[#7D5B0E]', dot: 'bg-[#CFA329]' };
    case 'negotiation':
      return { label: 'En Negociación', bg: 'bg-[#FEF0E6]', text: 'text-[#94400E]', dot: 'bg-[#DE6F28]' };
    case 'won':
      return { label: 'Cerrado Ganado', bg: 'bg-[#EBF5EE]', text: 'text-[#1B522F]', dot: 'bg-[#2E9455]' };
    case 'lost':
      return { label: 'Perdido', bg: 'bg-[#FDF0ED]', text: 'text-[#8F2D17]', dot: 'bg-[#C9472A]' };
    default:
      return { label: stage, bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-400' };
  }
}

export function getPlatformBadge(platform: ExternalPlatform): { label: string; border: string; text: string } {
  switch (platform) {
    case 'figma':
      return { label: 'Figma', border: 'border-[#E6D4E7]', text: 'text-[#70297B]' };
    case 'drive':
      return { label: 'Drive', border: 'border-[#D2E7D6]', text: 'text-[#1F6E2E]' };
    case 'canva':
      return { label: 'Canva', border: 'border-[#CCE8F5]', text: 'text-[#0B6294]' };
    case 'dropbox':
      return { label: 'Dropbox', border: 'border-[#D4E2F5]', text: 'text-[#15468A]' };
    default:
      return { label: 'Enlace', border: 'border-stone-200', text: 'text-stone-600' };
  }
}
