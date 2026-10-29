'use client';

import React, { useState } from 'react';
import { BriefDoc, Campaign } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface BriefEditorProps {
  brief: BriefDoc;
  campaigns: Campaign[];
  onSaveBrief: (updated: BriefDoc) => void;
}

export function BriefEditor({ brief, campaigns, onSaveBrief }: BriefEditorProps) {
  const [title, setTitle] = useState(brief.title);
  const [subtitle, setSubtitle] = useState(brief.subtitle);
  const [objective, setObjective] = useState(brief.objective);
  const [targetAudience, setTargetAudience] = useState(brief.targetAudience);
  const [valueProposition, setValueProposition] = useState(brief.valueProposition);
  const [deliverables, setDeliverables] = useState<string[]>(brief.keyDeliverables);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    const updated = [...deliverables, newDeliverable.trim()];
    setDeliverables(updated);
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveBrief({
      ...brief,
      title,
      subtitle,
      objective,
      targetAudience,
      valueProposition,
      keyDeliverables: deliverables,
      lastModified: new Date().toISOString().split('T')[0]
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between hairline-b pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-xs">
            Workdoc Editorial
          </span>
          <span className="text-xs text-stone-600 font-mono">
            Última edición: {formatDate(brief.lastModified)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSavedAlert && (
            <span className="text-xs text-emerald-800 font-medium animate-fade-in flex items-center gap-1">
              <span>✓</span> Guardado en base de datos
            </span>
          )}
          <button
            onClick={handleSave}
            className="text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors px-3.5 py-1.5 rounded-md shadow-xs"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Magazine Paper Canvas */}
      <div className="bg-white hairline-all rounded-lg p-8 sm:p-12 shadow-xs space-y-8">
        {/* Title & Subtitle */}
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-editorial text-3xl sm:text-4xl font-semibold text-stone-900 border-none focus:outline-none focus:ring-0 bg-transparent tracking-tight leading-tight"
            placeholder="Título del Brief Estratégico..."
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-sm sm:text-base text-stone-600 font-serif italic border-none focus:outline-none focus:ring-0 bg-transparent leading-relaxed"
            placeholder="Subtítulo o propósito principal de la campaña..."
          />
          <div className="flex items-center gap-3 pt-2 text-xs text-stone-600">
            <span className="font-medium text-stone-800">Redactado por: {brief.author.name}</span>
            <span>·</span>
            <span>Equipo de Marketing & Estrategia</span>
          </div>
        </div>

        <div className="h-px bg-stone-200"></div>

        {/* Section: Objetivo */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
            1. Objetivo de Negocio & Retorno Esperado
          </label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full text-xs sm:text-sm text-stone-800 leading-relaxed p-3.5 bg-stone-50/50 hairline-all rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none font-sans"
          />
        </div>

        {/* Section: Propuesta de Valor (Editorial Quote Style) */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
            2. Mensaje Central / Propuesta de Valor
          </label>
          <div className="border-l-2 border-stone-800 pl-4 py-1">
            <textarea
              rows={2}
              value={valueProposition}
              onChange={(e) => setValueProposition(e.target.value)}
              className="w-full font-editorial italic text-base sm:text-lg text-stone-900 bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
            />
          </div>
        </div>

        {/* Section: Audiencia */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider block">
            3. Audiencia Objetivo & Perfil del Cliente
          </label>
          <textarea
            rows={3}
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full text-xs sm:text-sm text-stone-800 leading-relaxed p-3.5 bg-stone-50/50 hairline-all rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none font-sans"
          />
        </div>

        {/* Section: Entregables (Checklist) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              4. Entregables Creativos Requeridos
            </label>
            <span className="text-[11px] text-stone-600 font-mono">
              {deliverables.length} entregables
            </span>
          </div>

          <div className="space-y-2">
            {deliverables.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-2.5 bg-stone-50/70 hairline-all rounded-md group text-xs text-stone-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-xs border border-stone-400 flex items-center justify-center text-[10px] text-stone-700">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveDeliverable(index)}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 text-xs transition-opacity"
                  title="Eliminar entregable"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Agregar nuevo entregable (ej. 'Video explicativo de 30s')..."
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDeliverable();
                }
              }}
              className="flex-1 text-xs hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
            />
            <button
              onClick={handleAddDeliverable}
              className="px-3 py-2 rounded-md hairline-all bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-800"
            >
              + Agregar
            </button>
          </div>
        </div>

        {/* Section: Sincronización Ventas */}
        <div className="p-4 bg-purple-50/50 hairline-all border-purple-100 rounded-md space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <h5 className="text-xs font-semibold text-purple-900">
              Instrucciones para el Equipo Comercial
            </h5>
          </div>
          <p className="text-[11px] text-purple-800 leading-relaxed">
            Al contactar prospectos que provengan de esta campaña, hacer énfasis en la propuesta de valor y compartir inmediatamente el One-Pager PDF alojado en el Repositorio de Activos.
          </p>
        </div>
      </div>
    </div>
  );
}
