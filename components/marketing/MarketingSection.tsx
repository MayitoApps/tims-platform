'use client';

import React, { useState } from 'react';
import {
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  MarketingCampaignStatus,
  MarketingTask,
  MarketingTaskStage,
  MarketingTaskCategory,
  TaskChecklistItem,
  TaskComment,
  UserProfile,
  HotelDeal,
  AppNotification,
  ADMIN_EMAILS,
  DESIGN_RESPONSIBLES,
  REQUIREMENT_FORMATS,
  getExecutiveEventStatus
} from '@/lib/types';
import { HOTEL_PROPERTIES, HOTEL_SPACES, CAMPAIGN_HOTEL_TARGETS } from '@/lib/initial-data';
import { formatCurrency, formatDate, getMarketingStatusBadge } from '@/lib/utils';
import { SharedCalendar } from '@/components/SharedCalendar';

interface MarketingSectionProps {
  campaigns: MarketingCampaign[];
  publications: ContentPublication[];
  briefs: CreativeBrief[];
  marketingTasks?: MarketingTask[];
  deals?: HotelDeal[];
  currentUser?: UserProfile | null;
  onAddCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'code' | 'spent'>) => void;
  onUpdateCampaign?: (campaign: MarketingCampaign) => void;
  onDeleteCampaign?: (id: string) => void;
  onUpdateCampaignStatus: (id: string, status: MarketingCampaignStatus) => void;
  onAddPublication: (pub: Omit<ContentPublication, 'id'>) => void;
  onUpdatePublication?: (pub: ContentPublication) => void;
  onDeletePublication?: (id: string) => void;
  onAddBrief: (brief: Omit<CreativeBrief, 'id' | 'date'>) => void;
  onUpdateBrief?: (brief: CreativeBrief) => void;
  onDeleteBrief?: (id: string) => void;
  onAddMarketingTask: (task: Omit<MarketingTask, 'id' | 'code' | 'createdAt'>) => void;
  onUpdateMarketingTask?: (task: MarketingTask) => void;
  onDeleteMarketingTask?: (id: string) => void;
  onUpdateMarketingTaskStage: (id: string, stage: MarketingTaskStage) => void;
  onAddNotification?: (notif: AppNotification) => void;
}

const MARKETING_STAGES: { id: MarketingTaskStage; title: string; colorDot: string }[] = [
  { id: 'backlog', title: 'Solicitudes', colorDot: 'bg-stone-500' },
  { id: 'en_produccion', title: 'En Producción & Diseño', colorDot: 'bg-amber-500' },
  { id: 'revision', title: 'Revisión & Feedback', colorDot: 'bg-indigo-500' },
  { id: 'aprobado', title: 'Listo / Publicado', colorDot: 'bg-emerald-600' }
];

const MARKETING_CATEGORIES: { id: MarketingTaskCategory; label: string; icon: string; badge: string }[] = [
  { id: 'diseno_grafico', label: 'Diseño Gráfico', icon: '🎨', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'produccion_video', label: 'Producción de Video', icon: '🎬', badge: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'cambios_web', label: 'Cambios en Web', icon: '💻', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'notas_digitales', label: 'Notas Digitales & Blog', icon: '📰', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'pauta_publicidad', label: 'Pauta & Anuncios', icon: '📣', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'fotografia', label: 'Fotografía & Shootings', icon: '📸', badge: 'bg-teal-50 text-teal-800 border-teal-200' }
];

export function MarketingSection({
  campaigns,
  publications,
  briefs,
  marketingTasks = [],
  deals = [],
  currentUser = null,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onUpdateCampaignStatus,
  onAddPublication,
  onUpdatePublication,
  onDeletePublication,
  onAddBrief,
  onUpdateBrief,
  onDeleteBrief,
  onAddMarketingTask,
  onUpdateMarketingTask,
  onDeleteMarketingTask,
  onUpdateMarketingTaskStage,
  onAddNotification
}: MarketingSectionProps) {
  const [subView, setSubView] = useState<'tablero' | 'campanas' | 'calendario' | 'briefs'>('tablero');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | MarketingTaskCategory>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<MarketingTaskStage | null>(null);
  const [boardLayout, setBoardLayout] = useState<'fit' | 'scroll'>('fit');

  // Current user admin check (expansioncomercia.gohb@gmail.com, marketinggrupoorganico@gmail.com, artes.grupoorganico@gmail.com)
  const currentUserEmail = (currentUser?.email || '').toLowerCase().trim();
  const isCurrentUserAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === currentUserEmail);

  // Tabs inside view modals (Detalles vs Comentarios)
  const [taskModalTab, setTaskModalTab] = useState<'detalles' | 'comentarios'>('detalles');
  const [taskCommentText, setTaskCommentText] = useState('');
  const [campaignModalTab, setCampaignModalTab] = useState<'detalles' | 'comentarios'>('detalles');
  const [campaignCommentText, setCampaignCommentText] = useState('');

  // Modals - Creation
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);

  // Modals - Edit States (Tasks) - NOTE: task deletion is disabled by business requirement
  const [editingTask, setEditingTask] = useState<MarketingTask | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  const [editTTitle, setEditTTitle] = useState('');
  const [editTFormat, setEditTFormat] = useState<string>('Historia');
  const [editTCustomFormat, setEditTCustomFormat] = useState('');
  const [editTHotelTargets, setEditTHotelTargets] = useState<string[]>([HOTEL_PROPERTIES[0]]);
  const [editTCategory, setEditTCategory] = useState<MarketingTaskCategory>('diseno_grafico');
  const [editTPriority, setEditTPriority] = useState<'alta' | 'media' | 'urgente'>('alta');
  const [editTStage, setEditTStage] = useState<MarketingTaskStage>('backlog');
  const [editTRequestedBy, setEditTRequestedBy] = useState('');
  const [editTAssignedTo, setEditTAssignedTo] = useState(DESIGN_RESPONSIBLES[0].name);
  const [editTAssignedEmail, setEditTAssignedEmail] = useState(DESIGN_RESPONSIBLES[0].email);
  const [editTDueDate, setEditTDueDate] = useState('2026-11-15');
  const [editTDesc, setEditTDesc] = useState('');
  const [editTAssetUrl, setEditTAssetUrl] = useState('');
  const [editTChecklist, setEditTChecklist] = useState<TaskChecklistItem[]>([]);
  const [newEditChecklistText, setNewEditChecklistText] = useState('');

  // Modals - Edit & Delete States (Campaigns)
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<MarketingCampaign | null>(null);

  const [editCTitle, setEditCTitle] = useState('');
  const [editCHotel, setEditCHotel] = useState<string>(CAMPAIGN_HOTEL_TARGETS[0]);
  const [editCType, setEditCType] = useState<MarketingCampaign['type']>('temporada');
  const [editCStatus, setEditCStatus] = useState<MarketingCampaignStatus>('planificacion');
  const [editCBudget, setEditCBudget] = useState('45000');
  const [editCStart, setEditCStart] = useState('2026-10-20');
  const [editCEnd, setEditCEnd] = useState('2026-12-31');
  const [editCChannels, setEditCChannels] = useState('Instagram Ads, Meta Ads');
  const [editCDesc, setEditCDesc] = useState('');

  // Modals - Edit & Delete States (Publications)
  const [editingPub, setEditingPub] = useState<ContentPublication | null>(null);
  const [isEditPubModalOpen, setIsEditPubModalOpen] = useState(false);
  const [pubToDelete, setPubToDelete] = useState<ContentPublication | null>(null);

  const [editPTitle, setEditPTitle] = useState('');
  const [editPHotel, setEditPHotel] = useState(HOTEL_PROPERTIES[0]);
  const [editPChannel, setEditPChannel] = useState<ContentPublication['channel']>('instagram');
  const [editPDate, setEditPDate] = useState('2026-11-10');
  const [editPResponsible, setEditPResponsible] = useState('Equipo Creativo');
  const [editPStatus, setEditPStatus] = useState<ContentPublication['status']>('programado');

  // Modals - Edit & Delete States (Briefs)
  const [editingBrief, setEditingBrief] = useState<CreativeBrief | null>(null);
  const [isEditBriefModalOpen, setIsEditBriefModalOpen] = useState(false);
  const [briefToDelete, setBriefToDelete] = useState<CreativeBrief | null>(null);

  const [editBTitle, setEditBTitle] = useState('');
  const [editBHotel, setEditBHotel] = useState(HOTEL_PROPERTIES[0]);
  const [editBCategory, setEditBCategory] = useState<CreativeBrief['category']>('shooting_fotografico');
  const [editBObjective, setEditBObjective] = useState('');
  const [editBAudience, setEditBAudience] = useState('');
  const [editBMessage, setEditBMessage] = useState('');
  const [editBDeliverables, setEditBDeliverables] = useState('25 Fotos HD, 3 Reels');

  // Modals - Ver en Grande (Vista Completa de Elementos de Marketing)
  const [viewingTask, setViewingTask] = useState<MarketingTask | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<MarketingCampaign | null>(null);
  const [viewingPub, setViewingPub] = useState<ContentPublication | null>(null);
  const [viewingBrief, setViewingBrief] = useState<CreativeBrief | null>(null);

  // Form states - Marketing Task (Requerimiento)
  const [tTitle, setTTitle] = useState('');
  const [tFormat, setTFormat] = useState<string>('Historia');
  const [tCustomFormat, setTCustomFormat] = useState('');
  const [tHotelTargets, setTHotelTargets] = useState<string[]>([HOTEL_PROPERTIES[0]]);
  const [tCategory, setTCategory] = useState<MarketingTaskCategory>('diseno_grafico');
  const [tPriority, setTPriority] = useState<'alta' | 'media' | 'urgente'>('media');
  const [tRequestedBy, setTRequestedBy] = useState('');
  const [tAssignedTo, setTAssignedTo] = useState('Por asignar');
  const [tAssignedEmail, setTAssignedEmail] = useState<string | undefined>(undefined);
  const [tDueDate, setTDueDate] = useState('2026-11-15');
  const [tDesc, setTDesc] = useState('');
  const [tAssetUrl, setTAssetUrl] = useState('');
  const [tChecklist, setTChecklist] = useState<TaskChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Form states - Campaign
  const [cTitle, setCTitle] = useState('');
  const [cHotel, setCHotel] = useState<string>(CAMPAIGN_HOTEL_TARGETS[0]);
  const [cType, setCType] = useState<MarketingCampaign['type']>('temporada');
  const [cBudget, setCBudget] = useState('45000');
  const [cStart, setCStart] = useState('2026-10-20');
  const [cEnd, setCEnd] = useState('2026-12-31');
  const [cChannels, setCChannels] = useState('Instagram Ads, Meta Ads, Google Ads');
  const [cDesc, setCDesc] = useState('');

  // Form states - Publication
  const [pTitle, setPTitle] = useState('');
  const [pHotel, setPHotel] = useState(HOTEL_PROPERTIES[0]);
  const [pChannel, setPChannel] = useState<ContentPublication['channel']>('instagram');
  const [pDate, setPDate] = useState('2026-11-10');
  const [pResponsible, setPResponsible] = useState('Equipo Creativo');

  // Form states - Brief
  const [bTitle, setBTitle] = useState('');
  const [bHotel, setBHotel] = useState(HOTEL_PROPERTIES[0]);
  const [bCategory, setBCategory] = useState<CreativeBrief['category']>('shooting_fotografico');
  const [bObjective, setBObjective] = useState('');
  const [bAudience, setBAudience] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bDeliverables, setBDeliverables] = useState('25 Fotos HD de Espacios, 3 Reels, 1 Teaser');



  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedHotelFilter !== 'all') {
      if (c.hotelTarget === 'Todos los Hoteles (Grupo Orgánico)') return true;
      if (c.hotelTarget !== selectedHotelFilter) return false;
    }
    return true;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle.trim()) return;

    onAddCampaign({
      title: cTitle,
      hotelTarget: cHotel,
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

  const filteredTasks = marketingTasks.filter((t) => {
    if (selectedHotelFilter !== 'all') {
      const targets = t.hotelTargets && t.hotelTargets.length > 0 ? t.hotelTargets : [t.hotelTarget];
      if (!targets.includes(selectedHotelFilter)) return false;
    }
    if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formatValue = tFormat === 'Otro' && tCustomFormat.trim() ? tCustomFormat.trim() : tFormat;
    const finalTitle = tTitle.trim() || `${formatValue} - ${(tHotelTargets[0] || 'Hotel')}`;
    const mainHotel = tHotelTargets[0] || HOTEL_PROPERTIES[0];

    onAddMarketingTask({
      title: finalTitle,
      format: formatValue,
      hotelTarget: mainHotel,
      hotelTargets: tHotelTargets.length > 0 ? tHotelTargets : [mainHotel],
      category: formatValue.toLowerCase().includes('web') ? 'cambios_web' : 'diseno_grafico',
      stage: 'backlog', // Automáticamente a la columna "Solicitudes"
      priority: tPriority,
      requestedBy: tRequestedBy || currentUser?.name || 'Dirección / Gerencia',
      assignedTo: tAssignedTo || 'Por asignar',
      assignedEmail: tAssignedEmail,
      dueDate: tDueDate,
      description: tDesc || 'Requerimiento de diseño / marketing.',
      assetUrl: tAssetUrl || undefined,
      checklist: tChecklist,
      comments: []
    });

    if (onAddNotification) {
      onAddNotification({
        id: `notif-${Date.now()}`,
        title: `Nuevo requerimiento registrado`,
        message: `Se registró '${finalTitle}' para entrega el ${tDueDate}.`,
        type: 'task_created',
        targetEmail: tAssignedEmail,
        targetName: tAssignedTo,
        authorName: currentUser?.name || 'Dirección',
        authorEmail: currentUser?.email,
        linkSection: 'marketing',
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    }

    setTTitle('');
    setTFormat('Historia');
    setTCustomFormat('');
    setTHotelTargets([HOTEL_PROPERTIES[0]]);
    setTAssignedTo('Por asignar');
    setTAssignedEmail(undefined);
    setTDesc('');
    setTAssetUrl('');
    setTRequestedBy('');
    setTChecklist([]);
    setNewChecklistText('');
    setIsTaskModalOpen(false);
  };

  const handleToggleChecklistItem = (task: MarketingTask, itemId: string) => {
    const updatedChecklist = (task.checklist || []).map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedTask = { ...task, checklist: updatedChecklist };
    if (viewingTask && viewingTask.id === task.id) {
      setViewingTask(updatedTask);
    }
    if (onUpdateMarketingTask) {
      onUpdateMarketingTask(updatedTask);
    }
  };

  const moveTaskStage = (task: MarketingTask, direction: 'prev' | 'next') => {
    const idx = MARKETING_STAGES.findIndex((s) => s.id === task.stage);
    if (direction === 'prev' && idx > 0) {
      onUpdateMarketingTaskStage(task.id, MARKETING_STAGES[idx - 1].id);
    } else if (direction === 'next' && idx < MARKETING_STAGES.length - 1) {
      onUpdateMarketingTaskStage(task.id, MARKETING_STAGES[idx + 1].id);
    }
  };

  // --- Handlers: Marketing Task Edit (Requerimientos) ---
  const openEditTaskModal = (task: MarketingTask) => {
    setEditingTask(task);
    setEditTTitle(task.title);
    setEditTFormat(task.format || 'Historia');
    setEditTCustomFormat(
      task.format && !REQUIREMENT_FORMATS.includes(task.format as any) ? task.format : ''
    );
    setEditTHotelTargets(task.hotelTargets && task.hotelTargets.length > 0 ? task.hotelTargets : [task.hotelTarget]);
    setEditTCategory(task.category);
    setEditTPriority(task.priority);
    setEditTStage(task.stage);
    setEditTRequestedBy(task.requestedBy);
    setEditTAssignedTo(task.assignedTo || DESIGN_RESPONSIBLES[0].name);
    setEditTAssignedEmail(task.assignedEmail || DESIGN_RESPONSIBLES[0].email);
    setEditTDueDate(task.dueDate);
    setEditTDesc(task.description || '');
    setEditTAssetUrl(task.assetUrl || '');
    setEditTChecklist(task.checklist || []);
    setNewEditChecklistText('');
    setIsEditTaskModalOpen(true);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const formatValue = editTFormat === 'Otro' && editTCustomFormat.trim() ? editTCustomFormat.trim() : editTFormat;
    const finalTitle = editTTitle.trim() || editingTask.title;
    const mainHotel = editTHotelTargets[0] || editingTask.hotelTarget;

    const updated: MarketingTask = {
      ...editingTask,
      title: finalTitle,
      format: formatValue,
      hotelTarget: mainHotel,
      hotelTargets: editTHotelTargets.length > 0 ? editTHotelTargets : [mainHotel],
      category: editTCategory,
      priority: editTPriority,
      stage: editTStage,
      requestedBy: editTRequestedBy || editingTask.requestedBy,
      assignedTo: editTAssignedTo,
      assignedEmail: editTAssignedEmail,
      dueDate: editTDueDate,
      description: editTDesc,
      assetUrl: editTAssetUrl || undefined,
      checklist: editTChecklist
    };

    if (onUpdateMarketingTask) {
      onUpdateMarketingTask(updated);
    }
    if (viewingTask && viewingTask.id === updated.id) {
      setViewingTask(updated);
    }
    setIsEditTaskModalOpen(false);
    setEditingTask(null);
  };

  // --- Handlers: Task Comments (Administrators Only Deletion) ---
  const handleAddTaskComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskCommentText.trim() || !viewingTask) return;

    const newComment: TaskComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      authorName: currentUser?.name || 'Administrador',
      authorEmail: currentUser?.email || (isCurrentUserAdmin ? ADMIN_EMAILS[0] : 'admin@tims.com'),
      authorAvatar: currentUser?.avatar,
      text: taskCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(viewingTask.comments || []), newComment];
    const updatedTask: MarketingTask = {
      ...viewingTask,
      comments: updatedComments
    };

    setViewingTask(updatedTask);
    setTaskCommentText('');
    if (onUpdateMarketingTask) {
      onUpdateMarketingTask(updatedTask);
    }

    if (onAddNotification) {
      onAddNotification({
        id: `notif-${Date.now()}`,
        title: `Nuevo comentario en: ${viewingTask.title}`,
        message: `${newComment.authorName}: "${newComment.text.slice(0, 90)}..."`,
        type: 'comment',
        targetEmail: viewingTask.assignedEmail,
        targetName: viewingTask.assignedTo,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail,
        linkSection: 'marketing',
        targetId: viewingTask.id,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    }
  };

  const handleDeleteTaskComment = (commentId: string) => {
    if (!isCurrentUserAdmin) {
      alert('Solo los administradores autorizados pueden eliminar comentarios.');
      return;
    }
    if (!viewingTask) return;

    const updatedComments = (viewingTask.comments || []).filter((c) => c.id !== commentId);
    const updatedTask: MarketingTask = {
      ...viewingTask,
      comments: updatedComments
    };

    setViewingTask(updatedTask);
    if (onUpdateMarketingTask) {
      onUpdateMarketingTask(updatedTask);
    }
  };

  // --- Handlers: Campaign Comments (Administrators Only Deletion) ---
  const handleAddCampaignComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!campaignCommentText.trim() || !viewingCampaign) return;

    const newComment: TaskComment = {
      id: `comm-c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      authorName: currentUser?.name || 'Administrador',
      authorEmail: currentUser?.email || (isCurrentUserAdmin ? ADMIN_EMAILS[0] : 'admin@tims.com'),
      authorAvatar: currentUser?.avatar,
      text: campaignCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(viewingCampaign.comments || []), newComment];
    const updatedCampaign: MarketingCampaign = {
      ...viewingCampaign,
      comments: updatedComments
    };

    setViewingCampaign(updatedCampaign);
    setCampaignCommentText('');
    if (onUpdateCampaign) {
      onUpdateCampaign(updatedCampaign);
    }
  };

  const handleDeleteCampaignComment = (commentId: string) => {
    if (!isCurrentUserAdmin) {
      alert('Solo los administradores autorizados pueden eliminar comentarios.');
      return;
    }
    if (!viewingCampaign) return;

    const updatedComments = (viewingCampaign.comments || []).filter((c) => c.id !== commentId);
    const updatedCampaign: MarketingCampaign = {
      ...viewingCampaign,
      comments: updatedComments
    };

    setViewingCampaign(updatedCampaign);
    if (onUpdateCampaign) {
      onUpdateCampaign(updatedCampaign);
    }
  };

  // --- Handlers: Campaign Edit/Delete ---
  const openEditCampaignModal = (c: MarketingCampaign) => {
    setEditingCampaign(c);
    setEditCTitle(c.title);
    setEditCHotel(c.hotelTarget);
    setEditCType(c.type);
    setEditCStatus(c.status);
    setEditCBudget(String(c.budget));
    setEditCStart(c.startDate);
    setEditCEnd(c.endDate);
    setEditCChannels(c.channels.join(', '));
    setEditCDesc(c.description || '');
    setIsEditCampaignModalOpen(true);
  };



  const handleSaveEditCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign || !editCTitle.trim()) return;

    const updated: MarketingCampaign = {
      ...editingCampaign,
      title: editCTitle,
      hotelTarget: editCHotel,
      type: editCType,
      status: editCStatus,
      budget: parseFloat(editCBudget) || editingCampaign.budget,
      startDate: editCStart,
      endDate: editCEnd,
      channels: editCChannels.split(',').map((s) => s.trim()).filter(Boolean),
      description: editCDesc
    };

    if (onUpdateCampaign) {
      onUpdateCampaign(updated);
    }
    setIsEditCampaignModalOpen(false);
    setEditingCampaign(null);
  };

  const handleConfirmDeleteCampaign = () => {
    if (!campaignToDelete) return;
    if (onDeleteCampaign) {
      onDeleteCampaign(campaignToDelete.id);
    }
    setCampaignToDelete(null);
  };

  // --- Handlers: Publication Edit/Delete ---
  const openEditPubModal = (pub: ContentPublication) => {
    setEditingPub(pub);
    setEditPTitle(pub.title);
    setEditPHotel(pub.hotel);
    setEditPChannel(pub.channel);
    setEditPDate(pub.publishDate);
    setEditPResponsible(pub.responsible);
    setEditPStatus(pub.status);
    setIsEditPubModalOpen(true);
  };

  const handleSaveEditPub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPub || !editPTitle.trim()) return;

    const updated: ContentPublication = {
      ...editingPub,
      title: editPTitle,
      hotel: editPHotel,
      channel: editPChannel,
      publishDate: editPDate,
      responsible: editPResponsible,
      status: editPStatus
    };

    if (onUpdatePublication) {
      onUpdatePublication(updated);
    }
    setIsEditPubModalOpen(false);
    setEditingPub(null);
  };

  const handleConfirmDeletePub = () => {
    if (!pubToDelete) return;
    if (onDeletePublication) {
      onDeletePublication(pubToDelete.id);
    }
    setPubToDelete(null);
  };

  // --- Handlers: Brief Edit/Delete ---
  const openEditBriefModal = (brf: CreativeBrief) => {
    setEditingBrief(brf);
    setEditBTitle(brf.title);
    setEditBHotel(brf.hotelTarget);
    setEditBCategory(brf.category);
    setEditBObjective(brf.objective);
    setEditBAudience(brf.targetAudience);
    setEditBMessage(brf.keyMessage);
    setEditBDeliverables(brf.deliverables.join(', '));
    setIsEditBriefModalOpen(true);
  };

  const handleSaveEditBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrief || !editBTitle.trim()) return;

    const updated: CreativeBrief = {
      ...editingBrief,
      title: editBTitle,
      hotelTarget: editBHotel,
      category: editBCategory,
      objective: editBObjective,
      targetAudience: editBAudience,
      keyMessage: editBMessage,
      deliverables: editBDeliverables.split(',').map((s) => s.trim()).filter(Boolean)
    };

    if (onUpdateBrief) {
      onUpdateBrief(updated);
    }
    setIsEditBriefModalOpen(false);
    setEditingBrief(null);
  };

  const handleConfirmDeleteBrief = () => {
    if (!briefToDelete) return;
    if (onDeleteBrief) {
      onDeleteBrief(briefToDelete.id);
    }
    setBriefToDelete(null);
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
              onClick={() => setSubView('tablero')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subView === 'tablero'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📋 Requerimientos ({marketingTasks.length})
            </button>
            <button
              onClick={() => setSubView('campanas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subView === 'campanas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Campañas & Pauta ({campaigns.length})
            </button>
            <button
              onClick={() => setSubView('calendario')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subView === 'calendario'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📅 Calendario en Tiempo Real
            </button>
            <button
              onClick={() => setSubView('briefs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
            {subView === 'tablero' && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>+ Nuevo Requerimiento</span>
              </button>
            )}

            {subView === 'campanas' && (
              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>+ Nueva Campaña Hotelera</span>
              </button>
            )}

            {subView === 'briefs' && (
              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>+ Redactar Nuevo Brief</span>
              </button>
            )}
          </div>
        </div>
      )}

            {/* SUB-VIEW 0: TABLERO DE ENTREGABLES & REQUERIMIENTOS POR FASES (DRAG & DROP) */}
      {subView === 'tablero' && (
        <div className="space-y-3">
          {/* Helper notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-stone-800">Flujo de Producción Creativa:</span>
              <span className="text-stone-500 hidden md:inline">
                Arrastra las tarjetas entre fases (Diseño, Videos, Web, Notas) o usa las flechas ◀ ▶ para mover de estatus.
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              Mostrando {filteredTasks.length} de {marketingTasks.length} requerimientos
            </div>
          </div>

          <div
            className={
              boardLayout === 'fit'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 pb-4 pt-1'
                : 'flex gap-3.5 overflow-x-auto pb-4 pt-1'
            }
          >
            {MARKETING_STAGES.map((col) => {
              const stageTasks = filteredTasks.filter((t) => t.stage === col.id);
              const isOver = dragOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverStage !== col.id) setDragOverStage(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStage(null);
                    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                    if (taskId) {
                      onUpdateMarketingTaskStage(taskId, col.id);
                    }
                    setDraggedTaskId(null);
                  }}
                  className={`flex flex-col rounded-2xl p-3 border transition-all min-h-[460px] ${
                    boardLayout === 'scroll' ? 'w-80 shrink-0' : 'w-full'
                  } ${
                    isOver
                      ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-300'
                      : 'bg-stone-100/75 border-stone-200/80'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.colorDot}`} />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                        {col.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-stone-200 text-stone-700">
                      {stageTasks.length}
                    </span>
                  </div>

                  {/* Tasks in stage */}
                  <div className="space-y-2 flex-1">
                    {stageTasks.length === 0 ? (
                      <div className="h-32 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-center p-3 text-stone-400 text-xs">
                        Sin requerimientos en esta fase. Arrastra aquí para mover.
                      </div>
                    ) : (
                      stageTasks.map((task) => {
                        const isDragging = draggedTaskId === task.id;
                        const priorityClass =
                          task.priority === 'urgente'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : task.priority === 'alta'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200';
                        const hotelList = task.hotelTargets && task.hotelTargets.length > 0 ? task.hotelTargets : [task.hotelTarget];

                        return (
                          <div
                            key={task.id}
                            draggable={true}
                            onClick={() => {
                              setViewingTask(task);
                              setTaskModalTab('detalles');
                            }}
                            onDragStart={(e) => {
                              setDraggedTaskId(task.id);
                              e.dataTransfer.setData('text/plain', task.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDragOverStage(null);
                            }}
                            className={`bg-white rounded-xl p-2.5 border transition-all cursor-pointer hover:shadow-md space-y-1.5 select-none ${
                              isDragging
                                ? 'opacity-40 border-stone-400 shadow-xl cursor-grabbing'
                                : 'border-stone-200/90 shadow-2xs hover:border-purple-400 hover:ring-1 hover:ring-purple-300/40'
                            }`}
                          >
                            {/* Fila 1: Código + Formato + Prioridad */}
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono font-bold text-stone-500 text-[9px] bg-stone-100 px-1 py-0.2 rounded shrink-0">
                                  {task.code}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-full font-bold text-[9px] bg-purple-50 text-purple-800 border border-purple-200 truncate">
                                  🎨 {task.format || 'Diseño'}
                                </span>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded font-bold text-[8px] uppercase tracking-wider shrink-0 border ${priorityClass}`}>
                                {task.priority}
                              </span>
                            </div>

                            {/* Fila 2: Título del Requerimiento */}
                            <div className="min-w-0 leading-tight">
                              <h5 className="font-bold text-stone-900 text-xs line-clamp-2" title={task.title}>
                                {task.title}
                              </h5>
                            </div>

                            {/* Fila 3: Hoteles (Pills) */}
                            <div className="flex flex-wrap gap-1">
                              {hotelList.slice(0, 2).map((h, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded truncate max-w-[130px]"
                                >
                                  🏨 {h.replace('Hotel Boutique ', '').replace('Hacienda ', '')}
                                </span>
                              ))}
                              {hotelList.length > 2 && (
                                <span className="text-[9px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                                  +{hotelList.length - 2}
                                </span>
                              )}
                            </div>

                            {/* Fila 4: Diseñador responsable + Comentarios + Fecha + Flechas */}
                            <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                              <div className="flex items-center gap-1 min-w-0" title={task.assignedEmail || task.assignedTo}>
                                <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                                  {task.assignedTo ? task.assignedTo.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '🎨'}
                                </span>
                                <span className="truncate max-w-[80px] text-[9px] font-semibold text-stone-700">
                                  {task.assignedTo ? task.assignedTo.split(' ')[0] : 'Diseño'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {task.comments && task.comments.length > 0 && (
                                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                    💬 {task.comments.length}
                                  </span>
                                )}
                                <span className="text-[9px] text-stone-500 font-medium">
                                  📅 {formatDate(task.dueDate)}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTaskStage(task, 'prev');
                                    }}
                                    disabled={col.id === 'backlog'}
                                    className="w-4 h-4 flex items-center justify-center rounded border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-20 disabled:pointer-events-none text-[9px] font-bold cursor-pointer"
                                    title="Fase anterior"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTaskStage(task, 'next');
                                    }}
                                    disabled={col.id === 'aprobado'}
                                    className="w-4 h-4 flex items-center justify-center rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none text-[9px] font-bold cursor-pointer"
                                    title="Avanzar de fase"
                                  >
                                    ▶
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

{/* SUB-VIEW: CALENDARIO EXCLUSIVO DE MARKETING (SEPARADO) */}
      {subView === 'calendario' && (
        <SharedCalendar
          mode="marketing"
          campaigns={campaigns}
          publications={publications}
          onAddCampaignClick={() => setIsCampaignModalOpen(true)}
          onEditCampaignClick={openEditCampaignModal}
          onDeleteCampaignClick={(c) => setCampaignToDelete(c)}
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
                  <th className="py-3 px-4">Nombre de la Campaña</th>
                  <th className="py-3 px-4">Hotel / Alcance</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Presupuesto</th>
                  <th className="py-3 px-4">Fechas</th>
                  <th className="py-3 px-4">Canales</th>
                  <th className="py-3 px-4">Enlaces</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCampaigns.map((c) => {
                  const badge = getMarketingStatusBadge(c.status);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setViewingCampaign(c)}
                      className="hover:bg-rose-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-stone-500">{c.code}</td>
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
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={c.status}
                          onClick={(e) => e.stopPropagation()}
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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

      {/* SUB-VIEW: BRIEFS CREATIVOS */}
      {subView === 'briefs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefs.map((brf) => (
            <div
              key={brf.id}
              onClick={() => setViewingBrief(brf)}
              className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-3 cursor-pointer hover:shadow-md hover:border-amber-300 hover:ring-2 hover:ring-amber-200/50 transition-all"
            >
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
              {/* Botón de apertura en grande */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-amber-800 font-semibold border-t border-stone-100">
                <span className="flex items-center gap-1 hover:underline">👁️ Ver brief completo en grande</span>
                <span className="text-stone-400 text-[9px]">Clic para ampliar</span>
              </div>

              <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>Autor: {brf.author}</span>
                  <span className="font-bold text-stone-800">{brf.deliverables.length} entregables</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditBriefModal(brf)}
                    className="p-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-semibold border border-stone-200"
                    title="Editar Brief"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setBriefToDelete(brf)}
                    className="p-1 rounded-md bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 text-xs border border-stone-200"
                    title="Eliminar Brief"
                  >
                    🗑️
                  </button>
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      {/* MODAL: NUEVO REQUERIMIENTO DE MARKETING */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 mb-1">
                  <span>✨</span> Fase Inicial: Solicitudes
                </div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Nuevo Requerimiento de Marketing
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  El requerimiento se agregará automáticamente al tablero en la fase de Solicitudes.
                </p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              {/* Formato del Requerimiento */}
              <div>
                <label className="block text-stone-800 font-bold mb-1.5 flex items-center gap-1">
                  <span>🎨</span> Formato de la Pieza / Solicitud:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REQUIREMENT_FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTFormat(fmt)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        tFormat === fmt
                          ? 'bg-purple-800 text-white border-purple-900 shadow-2xs ring-2 ring-purple-300'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                {tFormat === 'Otro' && (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el formato personalizado (ej. Stand publicitario, gafetes...)"
                    value={tCustomFormat}
                    onChange={(e) => setTCustomFormat(e.target.value)}
                    className="w-full mt-2 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                )}
              </div>

              {/* Título o Resumen */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  Título / Concepto del Requerimiento:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Menú QR & Flyer Promocional Temporada de Cava"
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Selección de Hoteles (Multi-select) */}
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-800 font-bold text-xs flex items-center gap-1.5">
                    <span>🏨</span> Hoteles Involucrados ({tHotelTargets.length} seleccionados):
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTHotelTargets([...HOTEL_PROPERTIES])}
                      className="text-purple-700 hover:text-purple-900 font-semibold cursor-pointer underline"
                    >
                      Todos
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={() => setTHotelTargets([HOTEL_PROPERTIES[0]])}
                      className="text-stone-500 hover:text-stone-700 font-semibold cursor-pointer underline"
                    >
                      Solo 1
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {HOTEL_PROPERTIES.map((hotel) => {
                    const isSelected = tHotelTargets.includes(hotel);
                    return (
                      <button
                        key={hotel}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (tHotelTargets.length > 1) {
                              setTHotelTargets(tHotelTargets.filter((h) => h !== hotel));
                            }
                          } else {
                            setTHotelTargets([...tHotelTargets, hotel]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100/70 border-purple-400 text-purple-950 font-bold shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 font-medium'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                          isSelected ? 'bg-purple-700 text-white border-purple-700' : 'border-stone-300 bg-white'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <span className="truncate">{hotel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fecha de Entrega y Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    📅 Fecha de Entrega Requerida:
                  </label>
                  <input
                    type="date"
                    required
                    value={tDueDate}
                    onChange={(e) => setTDueDate(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Prioridad:</label>
                  <select
                    value={tPriority}
                    onChange={(e) => setTPriority(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="media">Media (Normal)</option>
                    <option value="alta">Alta (Prioritario)</option>
                    <option value="urgente">Urgente (Lanzamiento Inmediato)</option>
                  </select>
                </div>
              </div>

              {/* Campo de texto: Requerimiento de dicha solicitud */}
              <div>
                <label className="block text-stone-800 font-bold mb-1">
                  📝 Requerimiento & Especificaciones de la Solicitud:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detalla aquí qué se necesita: medidas, copies o textos que debe llevar, colores, logotipo, objetivo visual, enlaces o instrucciones especiales..."
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 resize-none focus:ring-2 focus:ring-purple-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Enlace opcional a recursos */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  🔗 Enlace a Recursos / Figma / Drive (Opcional):
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... o https://figma.com/..."
                  value={tAssetUrl}
                  onChange={(e) => setTAssetUrl(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>✓</span> Guardar en Solicitudes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR REQUERIMIENTO DE MARKETING */}
      {isEditTaskModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {editingTask.code}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Editar Requerimiento
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título / Resumen</label>
                <input
                  type="text"
                  required
                  value={editTTitle}
                  onChange={(e) => setEditTTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Formato */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Formato de la Pieza</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REQUIREMENT_FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setEditTFormat(fmt)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        editTFormat === fmt
                          ? 'bg-purple-800 text-white border-purple-900 shadow-2xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                {editTFormat === 'Otro' && (
                  <input
                    type="text"
                    required
                    placeholder="Escribe el formato personalizado"
                    value={editTCustomFormat}
                    onChange={(e) => setEditTCustomFormat(e.target.value)}
                    className="w-full mt-2 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                )}
              </div>

              {/* Hoteles */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <label className="text-stone-800 font-bold text-xs flex items-center justify-between">
                  <span>🏨 Hoteles Involucrados ({editTHotelTargets.length}):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {HOTEL_PROPERTIES.map((hotel) => {
                    const isSelected = editTHotelTargets.includes(hotel);
                    return (
                      <button
                        key={hotel}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (editTHotelTargets.length > 1) {
                              setEditTHotelTargets(editTHotelTargets.filter((h) => h !== hotel));
                            }
                          } else {
                            setEditTHotelTargets([...editTHotelTargets, hotel]);
                          }
                        }}
                        className={`p-1.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100/70 border-purple-400 text-purple-950 font-bold'
                            : 'bg-white border-stone-200 text-stone-600'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold border ${
                          isSelected ? 'bg-purple-700 text-white border-purple-700' : 'border-stone-300 bg-white'
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                        <span className="truncate">{hotel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Responsable de Diseño */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Responsable del Diseño</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DESIGN_RESPONSIBLES.map((resp) => {
                    const isSelected = editTAssignedEmail === resp.email;
                    return (
                      <div
                        key={resp.email}
                        onClick={() => {
                          setEditTAssignedTo(resp.name);
                          setEditTAssignedEmail(resp.email);
                        }}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-purple-800 text-white' : 'bg-stone-300 text-stone-700'
                        }`}>
                          {resp.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 text-xs">{resp.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono truncate">{resp.email}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fase y Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fase / Estatus</label>
                  <select
                    value={editTStage}
                    onChange={(e) => setEditTStage(e.target.value as MarketingTaskStage)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold"
                  >
                    {MARKETING_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Prioridad</label>
                  <select
                    value={editTPriority}
                    onChange={(e) => setEditTPriority(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold"
                  >
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Fecha Límite de Entrega</label>
                <input
                  type="date"
                  required
                  value={editTDueDate}
                  onChange={(e) => setEditTDueDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              {/* Requerimiento */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Requerimiento & Especificaciones</label>
                <textarea
                  rows={4}
                  value={editTDesc}
                  onChange={(e) => setEditTDesc(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Enlace a Recursos / Figma / Drive</label>
                <input
                  type="url"
                  value={editTAssetUrl}
                  onChange={(e) => setEditTAssetUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              {/* Checklist */}
              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-purple-950 font-bold text-xs uppercase tracking-wider">
                    ☑️ Sub-entregables ({editTChecklist.filter(i => i.completed).length}/{editTChecklist.length})
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEditChecklistText}
                    onChange={(e) => setNewEditChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newEditChecklistText.trim()) {
                          setEditTChecklist([
                            ...editTChecklist,
                            { id: `chk-${Date.now()}-${Math.random()}`, text: newEditChecklistText.trim(), completed: false }
                          ]);
                          setNewEditChecklistText('');
                        }
                      }
                    }}
                    placeholder="Añadir sub-ítem..."
                    className="flex-1 border border-purple-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newEditChecklistText.trim()) {
                        setEditTChecklist([
                          ...editTChecklist,
                          { id: `chk-${Date.now()}-${Math.random()}`, text: newEditChecklistText.trim(), completed: false }
                        ]);
                        setNewEditChecklistText('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    + Añadir
                  </button>
                </div>

                {editTChecklist.length > 0 && (
                  <div className="space-y-1 pt-1 max-h-32 overflow-y-auto">
                    {editTChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-purple-100 text-xs"
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {
                              setEditTChecklist(editTChecklist.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i));
                            }}
                            className="rounded border-stone-300 text-purple-700"
                          />
                          <span className={item.completed ? 'line-through text-stone-400' : 'text-stone-800'}>
                            {item.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditTChecklist(editTChecklist.filter((i) => i.id !== item.id))}
                          className="text-stone-400 hover:text-rose-600 font-bold px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: NOTE - No delete button per user instructions */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditTaskModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow-xs cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CAMPAÑA */}
      {isEditCampaignModalOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {editingCampaign.code}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Editar Campaña
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditCampaignModalOpen(false);
                  setEditingCampaign(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  required
                  value={editCTitle}
                  onChange={(e) => setEditCTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Presupuesto ($ MXN)</label>
                  <input
                    type="number"
                    value={editCBudget}
                    onChange={(e) => setEditCBudget(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Canales</label>
                  <input
                    type="text"
                    value={editCChannels}
                    onChange={(e) => setEditCChannels(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={editCStart}
                    onChange={(e) => setEditCStart(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={editCEnd}
                    onChange={(e) => setEditCEnd(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingCampaign;
                    setIsEditCampaignModalOpen(false);
                    setEditingCampaign(null);
                    if (toDel) setCampaignToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>🗑️ Eliminar</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditCampaignModalOpen(false);
                      setEditingCampaign(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE CAMPAÑA */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  ¿Eliminar esta Campaña?
                </h3>
                <p className="text-xs text-stone-500">
                  Esta acción se sincronizará con el calendario y la base de datos.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900">
                {campaignToDelete.code} · {campaignToDelete.title}
              </div>
              <div className="text-stone-600">
                🏨 <strong>{campaignToDelete.hotelTarget}</strong> ({campaignToDelete.startDate} al {campaignToDelete.endDate})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCampaignToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCampaign}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PUBLICACIÓN / CONTENIDO */}
      {isEditPubModalOpen && editingPub && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Editar Publicación / PR
              </h3>
              <button
                onClick={() => {
                  setIsEditPubModalOpen(false);
                  setEditingPub(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPub} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título de la Pieza</label>
                <input
                  type="text"
                  required
                  value={editPTitle}
                  onChange={(e) => setEditPTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Canal</label>
                  <select
                    value={editPChannel}
                    onChange={(e) => setEditPChannel(e.target.value as any)}
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
                    value={editPHotel}
                    onChange={(e) => setEditPHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={editPDate}
                    onChange={(e) => setEditPDate(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Estado</label>
                  <select
                    value={editPStatus}
                    onChange={(e) => setEditPStatus(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="idea">Idea</option>
                    <option value="redactado">Redactado</option>
                    <option value="diseñado">Diseñado</option>
                    <option value="programado">Programado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Responsable</label>
                <input
                  type="text"
                  value={editPResponsible}
                  onChange={(e) => setEditPResponsible(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingPub;
                    setIsEditPubModalOpen(false);
                    setEditingPub(null);
                    if (toDel) setPubToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  Eliminar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditPubModalOpen(false);
                      setEditingPub(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE PUBLICACIÓN */}
      {pubToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  ¿Eliminar Publicación?
                </h3>
                <p className="text-xs text-stone-500">
                  Se removerá del calendario de contenidos y PR.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900">{pubToDelete.title}</div>
              <div className="text-stone-600">
                Canal: <strong className="uppercase">{pubToDelete.channel}</strong> · Hotel: {pubToDelete.hotel}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPubToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePub}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR BRIEF CREATIVO */}
      {isEditBriefModalOpen && editingBrief && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Editar Brief Creativo
              </h3>
              <button
                onClick={() => {
                  setIsEditBriefModalOpen(false);
                  setEditingBrief(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditBrief} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  value={editBTitle}
                  onChange={(e) => setEditBTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel</label>
                  <select
                    value={editBHotel}
                    onChange={(e) => setEditBHotel(e.target.value)}
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
                    value={editBCategory}
                    onChange={(e) => setEditBCategory(e.target.value as any)}
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
                  value={editBObjective}
                  onChange={(e) => setEditBObjective(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Entregables (separados por coma)</label>
                <input
                  type="text"
                  value={editBDeliverables}
                  onChange={(e) => setEditBDeliverables(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingBrief;
                    setIsEditBriefModalOpen(false);
                    setEditingBrief(null);
                    if (toDel) setBriefToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold"
                >
                  Eliminar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditBriefModalOpen(false);
                      setEditingBrief(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN DE BRIEF */}
      {briefToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  ¿Eliminar este Brief?
                </h3>
                <p className="text-xs text-stone-500">
                  Se removerá permanentemente de la biblioteca de briefs.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900">{briefToDelete.title}</div>
              <div className="text-stone-600">
                Hotel: <strong>{briefToDelete.hotelTarget}</strong> · Autor: {briefToDelete.author}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setBriefToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBrief}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VER TAREA / REQUERIMIENTO CREATIVO EN GRANDE                     */}
      {/* ========================================================================= */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                    {viewingTask.code}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-purple-50 text-purple-800 border-purple-200">
                    🎨 {viewingTask.format || 'Diseño'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border ${
                    viewingTask.priority === 'urgente'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : viewingTask.priority === 'alta'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    Prioridad {viewingTask.priority}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingTask.title}
                </h3>
              </div>

              <button
                onClick={() => setViewingTask(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pestañas: Detalles vs Comentarios */}
            <div className="flex border-b border-stone-200 gap-1">
              <button
                type="button"
                onClick={() => setTaskModalTab('detalles')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  taskModalTab === 'detalles'
                    ? 'border-purple-600 text-purple-800 bg-purple-50/50 rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                📋 Requerimiento & Detalles
              </button>
              <button
                type="button"
                onClick={() => setTaskModalTab('comentarios')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  taskModalTab === 'comentarios'
                    ? 'border-purple-600 text-purple-800 bg-purple-50/50 rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>💬 Comentarios</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  (viewingTask.comments || []).length > 0
                    ? 'bg-purple-700 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {(viewingTask.comments || []).length}
                </span>
              </button>
            </div>

            {/* CONTENIDO TAB 1: DETALLES */}
            {taskModalTab === 'detalles' && (
              <div className="space-y-5">
                {/* Fases / Tracker de Flujo Creativo */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      Fase Actual de Producción:
                    </span>
                    <span className="text-stone-500 text-[11px]">Clic para mover de fase:</span>
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
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-purple-800 text-white border-purple-900 shadow-xs ring-2 ring-purple-300'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${s.colorDot}`} />
                          <span className="truncate">{s.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hoteles Involucrados */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    🏨 Hoteles de la Solicitud
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(viewingTask.hotelTargets && viewingTask.hotelTargets.length > 0
                      ? viewingTask.hotelTargets
                      : [viewingTask.hotelTarget]
                    ).map((h, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 font-bold text-xs shadow-2xs flex items-center gap-1"
                      >
                        <span>🏨</span> {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Responsable del Diseño
                    </span>
                    <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold">
                        {viewingTask.assignedTo ? viewingTask.assignedTo.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '🎨'}
                      </span>
                      <span>{viewingTask.assignedTo}</span>
                    </div>
                    {viewingTask.assignedEmail && (
                      <span className="text-[10px] font-mono text-stone-500 block">
                        ✉️ {viewingTask.assignedEmail}
                      </span>
                    )}
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Fecha de Entrega Requerida
                    </span>
                    <div className="font-bold text-stone-900 text-sm">
                      📅 {formatDate(viewingTask.dueDate)}
                    </div>
                    <span className="text-[10px] text-stone-500 block">
                      Solicitado por: <strong>{viewingTask.requestedBy}</strong>
                    </span>
                  </div>
                </div>

                {/* Descripción / Requerimiento Completo */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                    Requerimiento & Especificaciones Técnicas:
                  </h4>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-stone-800 text-xs leading-relaxed whitespace-pre-wrap font-sans">
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

                {/* Checklist de Entregables */}
                {viewingTask.checklist && viewingTask.checklist.length > 0 && (
                  <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span>☑️</span> Checklist de Entregables
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800">
                        {viewingTask.checklist.filter(i => i.completed).length} de {viewingTask.checklist.length} completados
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {viewingTask.checklist.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleChecklistItem(viewingTask, item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            item.completed
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-white border-stone-200 hover:border-purple-300 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold ${
                              item.completed
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-400 bg-white text-transparent'
                            }`}>
                              ✓
                            </span>
                            <span className={`text-xs ${item.completed ? 'line-through text-stone-500' : 'font-medium'}`}>
                              {item.text}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                            {item.completed ? 'Completado' : 'Pendiente'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer: NOTE - No delete button per user instructions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      const t = viewingTask;
                      setViewingTask(null);
                      openEditTaskModal(t);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>✏️</span> Editar Requerimiento
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingTask(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* CONTENIDO TAB 2: COMENTARIOS */}
            {taskModalTab === 'comentarios' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 flex items-start gap-2.5">
                  <span className="text-base shrink-0">💬</span>
                  <div className="leading-relaxed">
                    <strong>Canal de Retroalimentación de la Solicitud:</strong> Los administradores pueden comunicarse directamente con el responsable ({viewingTask.assignedTo}) para revisiones y ajustes. Solo los administradores pueden eliminar comentarios.
                  </div>
                </div>

                {/* Formulario para agregar comentario */}
                <form onSubmit={handleAddTaskComment} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    placeholder="Escribe un comentario, retroalimentación o indicaciones para el diseñador..."
                    value={taskCommentText}
                    onChange={(e) => setTaskCommentText(e.target.value)}
                    className="w-full border border-stone-300 rounded-2xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500">
                      Publicando como: <strong>{currentUser?.name || 'Administrador'}</strong> ({currentUser?.email || (isCurrentUserAdmin ? ADMIN_EMAILS[0] : 'admin')})
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>💬</span> Publicar Comentario
                    </button>
                  </div>
                </form>

                {/* Lista de comentarios */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                    Historial de Comentarios ({(viewingTask.comments || []).length})
                  </h4>

                  {(!viewingTask.comments || viewingTask.comments.length === 0) ? (
                    <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                      No hay comentarios en este requerimiento todavía. Escribe el primero arriba.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {viewingTask.comments.map((comm) => {
                        const isAuthorAdmin = ADMIN_EMAILS.some(
                          (adm) => adm.toLowerCase() === (comm.authorEmail || '').toLowerCase().trim()
                        );

                        return (
                          <div
                            key={comm.id}
                            className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                                  {comm.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="font-bold text-stone-900">{comm.authorName}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  isAuthorAdmin
                                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                    : 'bg-stone-200 text-stone-700'
                                }`}>
                                  {comm.authorEmail}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                                <span>{formatDate(comm.createdAt.split('T')[0])}</span>
                                {isCurrentUserAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTaskComment(comm.id)}
                                    className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                    title="Eliminar comentario (Solo Administradores)"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-stone-800 whitespace-pre-wrap pl-8 leading-relaxed">
                              {comm.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setViewingTask(null)}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 2: VER CAMPAÑA COMPLETA EN GRANDE                                   */}
      {/* ========================================================================= */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                    {viewingCampaign.code}
                  </span>
                  {(() => {
                    const badge = getMarketingStatusBadge(viewingCampaign.status);
                    return (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
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
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pestañas: Detalles vs Comentarios */}
            <div className="flex border-b border-stone-200 gap-1">
              <button
                type="button"
                onClick={() => setCampaignModalTab('detalles')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  campaignModalTab === 'detalles'
                    ? 'border-rose-600 text-rose-800 bg-rose-50/50 rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                📊 Información de Campaña
              </button>
              <button
                type="button"
                onClick={() => setCampaignModalTab('comentarios')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  campaignModalTab === 'comentarios'
                    ? 'border-rose-600 text-rose-800 bg-rose-50/50 rounded-t-xl'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>💬 Comentarios</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  (viewingCampaign.comments || []).length > 0
                    ? 'bg-rose-600 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}>
                  {(viewingCampaign.comments || []).length}
                </span>
              </button>
            </div>

            {/* CONTENIDO TAB 1: DETALLES DE CAMPAÑA */}
            {campaignModalTab === 'detalles' && (
              <div className="space-y-5">
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

                {/* Alcance de la Campaña (Hotel o Todo el Grupo) */}
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
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border self-start sm:self-auto ${
                    viewingCampaign.hotelTarget.includes('Todos')
                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {viewingCampaign.hotelTarget.includes('Todos') ? '🌟 Cobertura Grupo Completo' : '📍 Hotel Específico'}
                  </span>
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
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
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
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 border border-stone-200 text-stone-600 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>🗑️</span> Eliminar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingCampaign(null)}
                    className="w-full sm:w-auto px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* CONTENIDO TAB 2: COMENTARIOS DE CAMPAÑA */}
            {campaignModalTab === 'comentarios' && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
                  <span className="text-base shrink-0">💬</span>
                  <div className="leading-relaxed">
                    <strong>Canal de Comentarios de Campaña:</strong> Espacio de retroalimentación estratégica para pauta publicitaria y lanzamientos. Solo los administradores pueden eliminar comentarios.
                  </div>
                </div>

                {/* Formulario para agregar comentario */}
                <form onSubmit={handleAddCampaignComment} className="space-y-2">
                  <textarea
                    rows={3}
                    required
                    placeholder="Escribe un comentario o retroalimentación sobre esta campaña hotelera..."
                    value={campaignCommentText}
                    onChange={(e) => setCampaignCommentText(e.target.value)}
                    className="w-full border border-stone-300 rounded-2xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none leading-relaxed"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-stone-500">
                      Publicando como: <strong>{currentUser?.name || 'Administrador'}</strong> ({currentUser?.email || (isCurrentUserAdmin ? ADMIN_EMAILS[0] : 'admin')})
                    </span>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>💬</span> Publicar Comentario
                    </button>
                  </div>
                </form>

                {/* Lista de comentarios */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                    Historial de Comentarios ({(viewingCampaign.comments || []).length})
                  </h4>

                  {(!viewingCampaign.comments || viewingCampaign.comments.length === 0) ? (
                    <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
                      No hay comentarios en esta campaña aún. Escribe el primero arriba.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {viewingCampaign.comments.map((comm) => {
                        const isAuthorAdmin = ADMIN_EMAILS.some(
                          (adm) => adm.toLowerCase() === (comm.authorEmail || '').toLowerCase().trim()
                        );

                        return (
                          <div
                            key={comm.id}
                            className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-rose-700 text-white flex items-center justify-center text-[10px] font-bold">
                                  {comm.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                </div>
                                <span className="font-bold text-stone-900">{comm.authorName}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  isAuthorAdmin
                                    ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                    : 'bg-stone-200 text-stone-700'
                                }`}>
                                  {comm.authorEmail}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                                <span>{formatDate(comm.createdAt.split('T')[0])}</span>
                                {isCurrentUserAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCampaignComment(comm.id)}
                                    className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                                    title="Eliminar comentario (Solo Administradores)"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-stone-800 whitespace-pre-wrap pl-8 leading-relaxed">
                              {comm.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setViewingCampaign(null)}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
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
    </div>
  );
}
