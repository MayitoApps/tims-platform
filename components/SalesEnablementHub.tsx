'use client';

import React, { useState } from 'react';
import { SalesAsset } from '@/lib/types';
import { getPlatformBadge, formatDate } from '@/lib/utils';

interface SalesEnablementHubProps {
  assets: SalesAsset[];
  onRequestMaterial: (title: string, category: string, description: string) => void;
}

export function SalesEnablementHub({ assets, onRequestMaterial }: SalesEnablementHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('one_pager');
  const [reqDescription, setReqDescription] = useState('');

  const categories = [
    { id: 'all', label: 'Todos los Materiales' },
    { id: 'deck', label: 'Decks & Presentaciones' },
    { id: 'one_pager', label: 'One-Pagers & Tarifas' },
    { id: 'case_study', label: 'Casos de Éxito' },
    { id: 'guidelines', label: 'Manuales de Marca' }
  ];

  const filteredAssets = assets.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    onRequestMaterial(reqTitle, reqCategory, reqDescription);
    setReqTitle('');
    setReqDescription('');
    setIsRequestModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-editorial text-2xl font-medium tracking-tight text-stone-900">
              Sales Enablement Kit · Biblioteca de Activos
            </h2>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Aprobados por Marketing
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Materiales comerciales oficiales listos para compartir con prospectos en reuniones y propuestas.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>+ Solicitar Material a Marketing</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white hairline-all text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {filteredAssets.map((asset) => {
          const badge = getPlatformBadge(asset.platform);
          const isCopied = copiedId === asset.id;

          return (
            <div
              key={asset.id}
              className="bg-white hairline-all rounded-lg p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs border font-medium ${badge.border} ${badge.text}`}
                  >
                    <span>{badge.label}</span>
                    <span className="font-mono text-[9px]">({asset.version})</span>
                  </span>

                  <span className="text-[10px] text-stone-600 font-mono">
                    {formatDate(asset.updatedAt)}
                  </span>
                </div>

                <h3 className="font-editorial text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
                  {asset.title}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              {/* Card Footer with Actions */}
              <div className="pt-3 hairline-t flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-600 truncate max-w-[140px]">
                  {asset.author.split(' ')[0]}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(asset.id, asset.url)}
                    className="px-2 py-1 rounded-xs hairline-all text-[11px] font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    {isCopied ? '¡Copiado!' : 'Copiar Link'}
                  </button>

                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-xs bg-stone-900 text-white text-[11px] font-medium hover:bg-stone-800 transition-colors flex items-center gap-1"
                  >
                    <span>Abrir</span>
                    <span className="text-[9px]">↗</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Requesting Sales Material to Marketing */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl hairline-all w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between hairline-b pb-3">
              <div>
                <h3 className="font-editorial text-xl font-semibold text-stone-900">
                  Solicitud de Material a Marketing
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Esta solicitud creará una tarea directa en el flujo de diseño de Marketing.
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Nombre de la Pieza o Documento</label>
                <input
                  type="text"
                  required
                  placeholder="ej. One-Pager personalizado para Cliente Farmacéutico"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Tipo de Material</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 bg-white"
                >
                  <option value="one_pager">One-Pager / Ficha Resumen (PDF)</option>
                  <option value="deck">Presentación Comercial (Canva/PPT)</option>
                  <option value="case_study">Caso de Éxito Específico</option>
                  <option value="pricing">Plantilla de Cotización</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Detalles & Contexto para Marketing</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explica qué necesita el cliente, fecha límite para la propuesta y qué objeciones resolver..."
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 hairline-t">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3 py-1.5 rounded-md hairline-all text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 font-medium shadow-xs"
                >
                  Enviar a Marketing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

