'use client';

import React, { useMemo, useState } from 'react';
import {
  HotelDeal,
  HotelDealStage,
  UserProfile,
  COMMERCIAL_GOALS_START_YEAR,
  COMMERCIAL_GOALS_START_DATE,
  COMMERCIAL_ANNUAL_GOAL_MXN,
  COMMERCIAL_EXECUTIVE_GOALS,
  COMMERCIAL_HOTEL_GOALS,
  COMMERCIAL_HOTEL_TOTAL_GOAL_MXN,
  COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN,
  COMMERCIAL_EMPRESARIAL_ANNUAL_TOTAL_GOAL_MXN,
  COMMERCIAL_MONTHLY_OTAM_GOALS,
  getCommercialExecutiveGoal,
  getExecutiveEventStatus,
  isEmpresarialOrOtamDeal,
  matchesUserIdentity,
  normalizeIdentityText
} from '@/lib/types';
import { calculateProgressPercent, formatCurrency } from '@/lib/utils';

export interface PipelineStageDef {
  id: HotelDealStage;
  title: string;
  colorDot: string;
}

interface CommercialMetricsTabProps {
  deals: HotelDeal[];
  filteredDeals: HotelDeal[];
  selectedHotelFilter: string;
  registeredUsers: UserProfile[];
  currentUser?: UserProfile | null;
  isCurrentUserAdmin: boolean;
  stages: PipelineStageDef[];
  getDealRealIncome: (deal: HotelDeal) => number;
}

interface ExecutiveMetricRow {
  name: string;
  email: string;
  role: string;
  initials: string;
  avatar?: string;
  goalMXN: number | null;
}

function getProgressBarColor(percent: number, fallback = 'bg-blue-600'): string {
  if (percent >= 100) return 'bg-emerald-600';
  if (percent >= 80) return 'bg-emerald-500';
  if (percent >= 40) return 'bg-amber-500';
  return fallback;
}

function getPercentBadgeClass(percent: number): string {
  if (percent >= 100) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (percent >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (percent >= 40) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-stone-100 text-stone-700 border-stone-300';
}

function getDealYearAndMonth(deal: HotelDeal): { year: string; monthKey: string } | null {
  const dateStr = (deal.checkInDate || deal.createdAt || '').trim();
  const match = /^(\d{4})-(\d{2})/.exec(dateStr);
  if (!match) return null;
  return { year: match[1], monthKey: match[2] };
}

function formatCompactCurrency(amount: number): string {
  if (!amount) return '$0';
  if (amount >= 1000000) {
    const m = amount / 1000000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${Math.round(amount)}`;
}

/**
 * Selector reutilizable de cadencia (Mensual vs Anual ×12) y mes de referencia.
 */
function CadenceControls({
  cadenceView,
  onChangeCadence,
  focusMonthKey,
  onChangeMonth
}: {
  cadenceView: 'annual' | 'monthly';
  onChangeCadence: (next: 'annual' | 'monthly') => void;
  focusMonthKey: string;
  onChangeMonth: (monthKey: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => onChangeCadence('monthly')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            cadenceView === 'monthly'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => onChangeCadence('annual')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
            cadenceView === 'annual'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Anual (×12)
        </button>
      </div>

      <select
        value={focusMonthKey}
        onChange={(e) => onChangeMonth(e.target.value)}
        className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1 font-mono font-bold text-stone-800 focus:outline-none cursor-pointer"
        title="Mes seleccionado para las metas mensuales"
      >
        {COMMERCIAL_MONTHLY_OTAM_GOALS.map((m) => (
          <option key={m.monthKey} value={m.monthKey}>
            Mes: {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Grilla compacta de 12 meses (Ene–Dic) mostrando recaudado y % avanzado contra la meta mensual.
 */
function MonthlyBreakdownStrip({
  deals,
  monthlyGoal,
  focusMonthKey,
  onSelectMonth,
  getDealRealIncome
}: {
  deals: HotelDeal[];
  monthlyGoal: number;
  focusMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  getDealRealIncome: (deal: HotelDeal) => number;
}) {
  if (!monthlyGoal || monthlyGoal <= 0) return null;

  return (
    <div className="bg-white rounded-xl p-2.5 border border-stone-200/80 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold text-stone-600">
        <span>📅 Metas Mensuales Ene–Dic</span>
        <span className="font-mono text-stone-800">
          {formatCurrency(monthlyGoal, 'MXN')}/mes
        </span>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
        {COMMERCIAL_MONTHLY_OTAM_GOALS.map((m) => {
          const mReal = deals
            .filter((d) => getDealYearAndMonth(d)?.monthKey === m.monthKey)
            .reduce((acc, d) => acc + getDealRealIncome(d), 0);
          const pct = calculateProgressPercent(mReal, monthlyGoal);
          const isFocused = m.monthKey === focusMonthKey;

          return (
            <button
              key={m.monthKey}
              type="button"
              onClick={() => onSelectMonth(m.monthKey)}
              title={`${m.label}: ${formatCurrency(mReal, 'MXN')} de ${formatCurrency(monthlyGoal, 'MXN')} (${pct.formatted})`}
              className={`text-left px-1.5 py-1 rounded-lg border transition-all cursor-pointer space-y-0.5 ${
                isFocused
                  ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400'
                  : mReal > 0
                  ? 'bg-stone-50 border-emerald-200 hover:bg-emerald-50/40'
                  : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className={isFocused ? 'text-emerald-950' : 'text-stone-700'}>
                  {m.shortLabel}
                </span>
                <span
                  className={`font-mono ${
                    pct.raw >= 100
                      ? 'text-emerald-700'
                      : pct.raw > 0
                      ? 'text-amber-700'
                      : 'text-stone-400'
                  }`}
                >
                  {pct.rounded}%
                </span>
              </div>
              <div className="text-[8px] font-mono text-stone-500 truncate">
                {formatCompactCurrency(mReal)}
              </div>
              <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressBarColor(pct.raw, 'bg-emerald-600')}`}
                  style={{ width: `${mReal > 0 ? Math.max(8, pct.capped) : 0}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tablero completo de Métricas de Comercialización con metas anuales, por ejecutivo,
 * por hotel y metas mensuales de eventos empresariales / OTAM con porcentaje de avance.
 */
export function CommercialMetricsTab({
  deals,
  filteredDeals,
  selectedHotelFilter,
  registeredUsers,
  currentUser,
  isCurrentUserAdmin,
  stages,
  getDealRealIncome
}: CommercialMetricsTabProps) {
  const now = new Date();
  const currentYearNum = now.getFullYear();
  const currentYearStr = String(currentYearNum);
  const currentMonthKey = String(now.getMonth() + 1).padStart(2, '0');
  const defaultGoalYearStr = String(Math.max(COMMERCIAL_GOALS_START_YEAR, currentYearNum));

  const [totalGoalMXN, setTotalGoalMXN] = useState<number>(COMMERCIAL_ANNUAL_GOAL_MXN);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(String(COMMERCIAL_ANNUAL_GOAL_MXN));
  const [metricsYear, setMetricsYear] = useState<string>(defaultGoalYearStr);
  const [monthlyScope, setMonthlyScope] = useState<'empresarial_otam' | 'all'>('empresarial_otam');
  const [cadenceView, setCadenceView] = useState<'annual' | 'monthly'>('monthly');
  const [focusMonthKey, setFocusMonthKey] = useState<string>(
    currentYearNum < COMMERCIAL_GOALS_START_YEAR ? '01' : currentMonthKey
  );

  const focusMonthLabel =
    COMMERCIAL_MONTHLY_OTAM_GOALS.find((m) => m.monthKey === focusMonthKey)?.label || 'Enero';

  const isPreStartWindow =
    (metricsYear === '2027' || metricsYear === 'since_2027') &&
    currentYearNum < COMMERCIAL_GOALS_START_YEAR;

  const periodLabel =
    metricsYear === 'since_2027'
      ? 'Acumulado desde Enero 2027'
      : metricsYear === 'all'
      ? 'Todo el histórico'
      : metricsYear === '2027'
      ? 'Año 2027 (a partir de Ene 2027)'
      : `Año ${metricsYear}`;

  // Lista de años disponibles a partir de eventos + 2027 (inicio oficial de metas) + año actual
  const availableYears = useMemo(() => {
    const years = new Set<string>([String(COMMERCIAL_GOALS_START_YEAR), currentYearStr]);
    deals.forEach((d) => {
      const parsed = getDealYearAndMonth(d);
      if (parsed) years.add(parsed.year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [deals, currentYearStr]);

  const matchesMetricsPeriod = (deal: HotelDeal): boolean => {
    if (metricsYear === 'all') return true;
    const rawDate = (deal.checkInDate || deal.createdAt || '').trim().slice(0, 10);
    if (metricsYear === 'since_2027') {
      return rawDate >= COMMERCIAL_GOALS_START_DATE;
    }
    const parsed = getDealYearAndMonth(deal);
    return parsed?.year === metricsYear;
  };

  const pre2027DealsCount = useMemo(
    () =>
      deals.filter((d) => {
        const rawDate = (d.checkInDate || d.createdAt || '').trim().slice(0, 10);
        return rawDate > '' && rawDate < COMMERCIAL_GOALS_START_DATE;
      }).length,
    [deals]
  );

  const periodDeals = useMemo(
    () => deals.filter(matchesMetricsPeriod),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deals, metricsYear]
  );

  const periodFilteredDeals = useMemo(
    () => filteredDeals.filter(matchesMetricsPeriod),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredDeals, metricsYear]
  );

  // Ejecutivos comerciales con metas oficiales (o solo perfil propio si es usuario normal)
  const executivesWithGoals = useMemo<ExecutiveMetricRow[]>(() => {
    const avatarByEmail = new Map<string, string>();
    registeredUsers.forEach((u) => {
      if (u.avatar && u.email) {
        avatarByEmail.set(u.email.toLowerCase().trim(), u.avatar);
      }
    });

    if (!isCurrentUserAdmin && currentUser) {
      return [
        {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.department || 'Ejecutivo Comercial',
          initials: currentUser.initials || currentUser.name.slice(0, 2).toUpperCase(),
          avatar: currentUser.avatar || avatarByEmail.get(currentUser.email.toLowerCase().trim()),
          goalMXN: getCommercialExecutiveGoal(currentUser.email, currentUser.name)
        }
      ];
    }

    const list: ExecutiveMetricRow[] = COMMERCIAL_EXECUTIVE_GOALS.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.department,
      initials: u.initials,
      avatar: avatarByEmail.get(u.email.toLowerCase().trim()),
      goalMXN: u.commercialGoalMXN ?? null
    }));

    // Incluir si algún otro colaborador fuera de los 6 tuviera deals activos asignados en el periodo
    periodFilteredDeals.forEach((d) => {
      const alreadyIncluded = list.some((ex) =>
        matchesUserIdentity({ email: ex.email, name: ex.name }, d.assignedEmail, d.assignedRep)
      );
      if (!alreadyIncluded && (d.assignedEmail || d.assignedRep) && d.stage !== 'perdido') {
        const repName = d.assignedRep || d.assignedEmail || 'Colaborador';
        const repEmail = d.assignedEmail || '';
        list.push({
          name: repName,
          email: repEmail,
          role: 'Colaborador Comercial',
          initials: repName.slice(0, 2).toUpperCase(),
          avatar: repEmail ? avatarByEmail.get(repEmail.toLowerCase().trim()) : undefined,
          goalMXN: getCommercialExecutiveGoal(repEmail, repName)
        });
      }
    });

    return list;
  }, [registeredUsers, isCurrentUserAdmin, currentUser, periodFilteredDeals]);

  // Totales financieros reales del periodo y filtro seleccionado
  const activeFilteredDeals = useMemo(
    () => periodFilteredDeals.filter((d) => d.stage !== 'perdido'),
    [periodFilteredDeals]
  );

  const totalRealIncome = useMemo(
    () => activeFilteredDeals.reduce((acc, d) => acc + getDealRealIncome(d), 0),
    [activeFilteredDeals, getDealRealIncome]
  );

  const totalDeposits = useMemo(
    () =>
      activeFilteredDeals
        .filter((d) => d.paymentStatus !== 'liquidado')
        .reduce((acc, d) => acc + (Number(d.depositAmount) || 0), 0),
    [activeFilteredDeals]
  );

  const totalLiquidated = useMemo(
    () =>
      activeFilteredDeals
        .filter((d) => d.paymentStatus === 'liquidado')
        .reduce((acc, d) => acc + (Number(d.totalValue) || 0), 0),
    [activeFilteredDeals]
  );

  const totalPendingBalance = useMemo(
    () =>
      activeFilteredDeals.reduce(
        (acc, d) =>
          acc +
          (d.paymentStatus === 'liquidado'
            ? 0
            : d.balanceDue ?? Math.max(0, (Number(d.totalValue) || 0) - (Number(d.depositAmount) || 0))),
        0
      ),
    [activeFilteredDeals]
  );

  const totalPipelineRevenue = useMemo(
    () => activeFilteredDeals.reduce((acc, d) => acc + (Number(d.totalValue) || 0), 0),
    [activeFilteredDeals]
  );

  const totalRoomNights = useMemo(
    () => activeFilteredDeals.reduce((acc, d) => acc + (Number(d.roomNights) || 0), 0),
    [activeFilteredDeals]
  );

  const groupProgress = calculateProgressPercent(totalRealIncome, totalGoalMXN);
  const pipelineVsGoalProgress = calculateProgressPercent(totalPipelineRevenue, totalGoalMXN);
  const depositsVsGoalProgress = calculateProgressPercent(totalDeposits, totalGoalMXN);
  const liquidatedVsGoalProgress = calculateProgressPercent(totalLiquidated, totalGoalMXN);
  const portfolioBase = totalRealIncome + totalPendingBalance;
  const collectedRatioProgress = calculateProgressPercent(totalRealIncome, portfolioBase);
  const pendingRatioProgress = calculateProgressPercent(totalPendingBalance, portfolioBase);

  // Totales del equipo ejecutivo (mensual vs anual × 12)
  const executiveMonthlyTotalGoalMXN = useMemo(
    () => executivesWithGoals.reduce((sum, ex) => sum + (ex.goalMXN || 0), 0),
    [executivesWithGoals]
  );
  const executiveAnnualTotalGoalMXN = executiveMonthlyTotalGoalMXN * 12;

  const executiveTeamRealIncome = useMemo(
    () =>
      executivesWithGoals.reduce((sum, ex) => {
        const execReal = activeFilteredDeals
          .filter((d) =>
            matchesUserIdentity({ email: ex.email, name: ex.name }, d.assignedEmail, d.assignedRep)
          )
          .filter((d) => cadenceView === 'annual' || getDealYearAndMonth(d)?.monthKey === focusMonthKey)
          .reduce((acc, d) => acc + getDealRealIncome(d), 0);
        return sum + execReal;
      }, 0),
    [executivesWithGoals, activeFilteredDeals, getDealRealIncome, cadenceView, focusMonthKey]
  );

  const executiveActiveTotalGoalMXN =
    cadenceView === 'annual' ? executiveAnnualTotalGoalMXN : executiveMonthlyTotalGoalMXN;
  const executiveTeamProgress = calculateProgressPercent(
    executiveTeamRealIncome,
    executiveActiveTotalGoalMXN
  );

  // Métricas por Hotel contra sus metas oficiales (mensuales y anuales × 12)
  const hotelMetrics = useMemo(() => {
    return COMMERCIAL_HOTEL_GOALS.map((hg) => {
      const cleanHotelTarget = normalizeIdentityText(hg.hotelKey);
      const cleanDisplayTarget = normalizeIdentityText(hg.displayLabel);
      const hDeals = periodDeals.filter((d) => {
        if (d.stage === 'perdido') return false;
        const cleanDealHotel = normalizeIdentityText(d.hotelName);
        return cleanDealHotel === cleanHotelTarget || cleanDealHotel === cleanDisplayTarget;
      });
      const hMonthDeals = hDeals.filter(
        (d) => getDealYearAndMonth(d)?.monthKey === focusMonthKey
      );
      const sumIncome = (list: HotelDeal[]) => list.reduce((acc, d) => acc + getDealRealIncome(d), 0);
      const sumDeposits = (list: HotelDeal[]) =>
        list.reduce((acc, d) => acc + (d.paymentStatus !== 'liquidado' ? Number(d.depositAmount) || 0 : 0), 0);
      const sumLiquidated = (list: HotelDeal[]) =>
        list.reduce((acc, d) => acc + (d.paymentStatus === 'liquidado' ? Number(d.totalValue) || 0 : 0), 0);
      const sumPipeline = (list: HotelDeal[]) => list.reduce((acc, d) => acc + (Number(d.totalValue) || 0), 0);
      const sumRn = (list: HotelDeal[]) => list.reduce((acc, d) => acc + (Number(d.roomNights) || 0), 0);

      return {
        hotelKey: hg.hotelKey,
        displayLabel: hg.displayLabel,
        monthlyGoalMXN: hg.goalMXN,
        annualGoalMXN: hg.goalMXN ? hg.goalMXN * 12 : null,
        deals: hDeals,
        dealsCount: hDeals.length,
        realIncome: sumIncome(hDeals),
        deposits: sumDeposits(hDeals),
        liquidated: sumLiquidated(hDeals),
        pipeline: sumPipeline(hDeals),
        rn: sumRn(hDeals),
        monthDealsCount: hMonthDeals.length,
        monthRealIncome: sumIncome(hMonthDeals),
        monthDeposits: sumDeposits(hMonthDeals),
        monthLiquidated: sumLiquidated(hMonthDeals),
        monthPipeline: sumPipeline(hMonthDeals),
        monthRn: sumRn(hMonthDeals)
      };
    });
  }, [periodDeals, getDealRealIncome, focusMonthKey]);

  const hotelsWithGoalIncome = useMemo(
    () =>
      hotelMetrics
        .filter((h) => h.monthlyGoalMXN && h.monthlyGoalMXN > 0)
        .reduce((s, h) => s + (cadenceView === 'annual' ? h.realIncome : h.monthRealIncome), 0),
    [hotelMetrics, cadenceView]
  );
  const hotelsActiveTotalGoalMXN =
    cadenceView === 'annual' ? COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN : COMMERCIAL_HOTEL_TOTAL_GOAL_MXN;
  const hotelsCombinedProgress = calculateProgressPercent(
    hotelsWithGoalIncome,
    hotelsActiveTotalGoalMXN
  );
  const allHotelsTotalIncome = useMemo(
    () => hotelMetrics.reduce((s, h) => s + (cadenceView === 'annual' ? h.realIncome : h.monthRealIncome), 0),
    [hotelMetrics, cadenceView]
  );

  // Métricas mensuales de eventos empresariales / OTAM (Enero..Diciembre a partir de Ene 2027)
  const monthlyMetrics = useMemo(() => {
    return COMMERCIAL_MONTHLY_OTAM_GOALS.map((monthDef) => {
      const monthDeals = activeFilteredDeals.filter((d) => {
        const parsed = getDealYearAndMonth(d);
        return parsed?.monthKey === monthDef.monthKey;
      });

      const scopedDeals =
        monthlyScope === 'empresarial_otam'
          ? monthDeals.filter((d) => isEmpresarialOrOtamDeal(d))
          : monthDeals;

      const otherSegmentIncome =
        monthlyScope === 'empresarial_otam'
          ? monthDeals
              .filter((d) => !isEmpresarialOrOtamDeal(d))
              .reduce((acc, d) => acc + getDealRealIncome(d), 0)
          : 0;

      const realIncome = scopedDeals.reduce((acc, d) => acc + getDealRealIncome(d), 0);
      const pipeline = scopedDeals.reduce((acc, d) => acc + (Number(d.totalValue) || 0), 0);
      const progress = calculateProgressPercent(realIncome, monthDef.goalMXN);
      const pipelineProgress = calculateProgressPercent(pipeline, monthDef.goalMXN);

      const isActiveCurrentMonth =
        !isPreStartWindow &&
        monthDef.monthKey === currentMonthKey &&
        (metricsYear === currentYearStr || metricsYear === 'since_2027' || metricsYear === 'all');

      return {
        ...monthDef,
        dealsCount: scopedDeals.length,
        realIncome,
        pipeline,
        otherSegmentIncome,
        progress,
        pipelineProgress,
        isCurrentMonth: isActiveCurrentMonth,
        isStartingMonth: isPreStartWindow && monthDef.monthKey === '01'
      };
    });
  }, [activeFilteredDeals, metricsYear, monthlyScope, getDealRealIncome, currentMonthKey, currentYearStr, isPreStartWindow]);

  const monthlySectionTotalReal = useMemo(
    () => monthlyMetrics.reduce((acc, m) => acc + m.realIncome, 0),
    [monthlyMetrics]
  );
  const monthlySectionTotalPipeline = useMemo(
    () => monthlyMetrics.reduce((acc, m) => acc + m.pipeline, 0),
    [monthlyMetrics]
  );
  const monthlySectionTotalGoal = useMemo(
    () => monthlyMetrics.reduce((acc, m) => acc + m.goalMXN, 0),
    [monthlyMetrics]
  );
  const monthlySectionProgress = calculateProgressPercent(
    monthlySectionTotalReal,
    monthlySectionTotalGoal
  );
  const spotlightMonthMetric =
    (isPreStartWindow
      ? monthlyMetrics[0]
      : monthlyMetrics.find((m) => m.monthKey === currentMonthKey)) || monthlyMetrics[0];

  const maxStageValue = Math.max(
    ...stages.map((s) =>
      periodFilteredDeals
        .filter((d) => d.stage === s.id)
        .reduce((acc, d) => acc + getDealRealIncome(d), 0)
    ),
    1
  );

  return (
    <div className="space-y-6">
      {/* Banner de Moneda, Vigencia Ene 2027 y Control de Meta Anual */}
      <div className="bg-linear-to-r from-emerald-900 via-stone-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                MXN
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                Desde Ene 2027
              </span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
              Métricas Comerciales
            </h3>
            <p className="text-xs text-stone-300 max-w-xl">
              Avance de metas sobre ingreso real (MXN).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <label className="text-[10px] text-stone-300 uppercase font-bold block mb-1">
                Periodo de Medición:
              </label>
              <select
                value={metricsYear}
                onChange={(e) => setMetricsYear(e.target.value)}
                className="bg-stone-950/80 text-white border border-white/20 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr === '2027' ? 'Año 2027 (Inicio Ene 2027)' : `Año ${yr}`}
                  </option>
                ))}
                <option value="since_2027">Acumulado desde Ene 2027</option>
                <option value="all">Todo el histórico</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div>
                <span className="text-[10px] text-stone-300 uppercase font-bold block">
                  Meta Anual Oficial (MXN):
                </span>
                {isEditingGoal ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={tempGoalInput}
                      onChange={(e) => setTempGoalInput(e.target.value)}
                      className="bg-white text-stone-900 px-2 py-1 rounded-lg text-xs font-mono font-bold w-36 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseFloat(tempGoalInput) || COMMERCIAL_ANNUAL_GOAL_MXN;
                        setTotalGoalMXN(val);
                        setIsEditingGoal(false);
                      }}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <div className="font-mono text-xl font-extrabold text-amber-300">
                      {formatCurrency(totalGoalMXN, 'MXN')}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      {groupProgress.formatted}
                    </span>
                  </div>
                )}
              </div>
              {!isEditingGoal && (
                <button
                  type="button"
                  onClick={() => {
                    setTempGoalInput(String(totalGoalMXN));
                    setIsEditingGoal(true);
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs transition-colors cursor-pointer"
                  title="Ajustar Meta Anual"
                >
                  ✏️
                </button>
              )}
            </div>
          </div>
        </div>

        {(isPreStartWindow || pre2027DealsCount > 0) && (metricsYear === '2027' || metricsYear === 'since_2027') && (
          <div className="text-[11px] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-stone-200">
            <span>
              🗓️ Conteo vigente desde el <strong className="text-white">1 de enero de 2027</strong>.
            </span>
            {pre2027DealsCount > 0 && (
              <button
                type="button"
                onClick={() => setMetricsYear('2026')}
                className="text-amber-300 hover:text-amber-200 font-semibold underline cursor-pointer"
              >
                Ver {pre2027DealsCount} evento(s) de 2026
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 1: META ANUAL DEL GRUPO ($114,000,000 MXN = $84M Hoteles + $30M Empresariales/OTAM) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Meta Anual del Grupo en General · {periodLabel} {selectedHotelFilter !== 'all' ? `· ${selectedHotelFilter}` : ''}
              </span>
            </div>
            <h4 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900">
              {groupProgress.formatted} de la Meta Anual Alcanzada
            </h4>
            <p className="text-xs text-stone-500">
              Hoteles (12 meses) + Empresariales / OTAM = <strong className="text-stone-800">{formatCurrency(totalGoalMXN, 'MXN')}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold block">
                Brecha Restante:
              </span>
              <span className="font-mono text-lg sm:text-xl font-extrabold text-amber-900">
                {formatCurrency(Math.max(0, totalGoalMXN - totalRealIncome), 'MXN')}
              </span>
            </div>
          </div>
        </div>

        {/* Composición de la Meta Anual del Grupo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-stone-600 font-semibold">🏨 Hoteles (12 meses):</span>
            <span className="font-mono font-extrabold text-stone-900">
              {formatCurrency(COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN, 'MXN')}
            </span>
          </div>
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-indigo-900 font-semibold">🏢 Empresariales / OTAM (Año):</span>
            <span className="font-mono font-extrabold text-indigo-950">
              {formatCurrency(COMMERCIAL_EMPRESARIAL_ANNUAL_TOTAL_GOAL_MXN, 'MXN')}
            </span>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-emerald-900 font-bold">🎯 Meta Total del Grupo:</span>
            <span className="font-mono font-extrabold text-emerald-950">
              {formatCurrency(totalGoalMXN, 'MXN')}
            </span>
          </div>
        </div>

        {/* Gran Barra de Progreso con Marcas */}
        <div className="space-y-2">
          <div className="h-7 w-full bg-stone-100 rounded-full overflow-hidden p-1 border border-stone-200 relative flex items-center">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-700 relative shadow-inner flex items-center justify-end pr-2"
              style={{ width: `${Math.max(totalRealIncome > 0 ? 6 : 3, groupProgress.capped)}%` }}
            >
              <span className="text-[10px] font-mono font-extrabold text-white drop-shadow-xs">
                {groupProgress.formatted}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-stone-400 px-1 font-semibold flex-wrap gap-1">
            <span>0% ($0 MXN)</span>
            <span>25% ({formatCurrency(totalGoalMXN * 0.25, 'MXN')})</span>
            <span>50% ({formatCurrency(totalGoalMXN * 0.5, 'MXN')})</span>
            <span>75% ({formatCurrency(totalGoalMXN * 0.75, 'MXN')})</span>
            <span className="text-emerald-800 font-bold">100% Meta ({formatCurrency(totalGoalMXN, 'MXN')})</span>
          </div>
        </div>

        {/* Tarjetas Resumen de Apoyo de Dinero Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                ✓ Dinero Real Ingresado
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {groupProgress.formatted}
              </span>
            </div>
            <div className="font-mono text-xl font-extrabold text-emerald-950">
              {formatCurrency(totalRealIncome, 'MXN')}
            </div>
            <span className="text-[10px] text-emerald-700 block">
              Avance real vs meta anual
            </span>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                💳 Anticipos & Adelantos
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                {depositsVsGoalProgress.formatted}
              </span>
            </div>
            <div className="font-mono text-xl font-extrabold text-teal-950">
              {formatCurrency(totalDeposits, 'MXN')}
            </div>
            <span className="text-[10px] text-teal-700 block">
              {depositsVsGoalProgress.formatted} de la meta anual
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                ✨ Totalmente Liquidados
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                {liquidatedVsGoalProgress.formatted}
              </span>
            </div>
            <div className="font-mono text-xl font-extrabold text-blue-950">
              {formatCurrency(totalLiquidated, 'MXN')}
            </div>
            <span className="text-[10px] text-blue-700 block">
              {liquidatedVsGoalProgress.formatted} de la meta anual
            </span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                ⏳ Saldo por Cobrar
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {pendingRatioProgress.formatted}
              </span>
            </div>
            <div className="font-mono text-xl font-extrabold text-amber-950">
              {formatCurrency(totalPendingBalance, 'MXN')}
            </div>
            <span className="text-[10px] text-amber-700 block">
              Pendiente de cartera activa
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 bg-stone-50/80 px-4 py-2.5 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span>📊</span>
            <span>
              Pipeline Bruto Cotizado en Cartera:{' '}
              <strong className="font-mono font-bold text-stone-800">
                {formatCurrency(totalPipelineRevenue, 'MXN')}
              </strong>{' '}
              <span className="font-mono text-emerald-800 font-bold">
                ({pipelineVsGoalProgress.formatted} de meta anual)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛏️</span>
            <span>
              Room Nights de Grupos:{' '}
              <strong className="font-mono font-bold text-stone-800">{totalRoomNights} RN</strong>
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: METAS MENSUALES DE EVENTOS EMPRESARIALES / OTAM */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Suma Calendario Mensual: {formatCurrency(monthlySectionTotalGoal, 'MXN')}
              </span>
              {selectedHotelFilter !== 'all' && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Filtro: {selectedHotelFilter}
                </span>
              )}
            </div>
            <h4 className="font-editorial text-2xl font-bold text-stone-900">
              Metas Mensuales de Eventos Empresariales / OTAM
            </h4>
            <p className="text-xs text-stone-500">
              Avance mensual por check-in e ingreso real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMonthlyScope('empresarial_otam')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  monthlyScope === 'empresarial_otam'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Empresariales / OTAM
              </button>
              <button
                type="button"
                onClick={() => setMonthlyScope('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  monthlyScope === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos los Segmentos
              </button>
            </div>

            <select
              value={metricsYear}
              onChange={(e) => setMetricsYear(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr === '2027' ? 'Año 2027 (Inicio Ene 2027)' : `Año ${yr}`}
                </option>
              ))}
              <option value="since_2027">Desde Ene 2027</option>
              <option value="all">Todo el histórico</option>
            </select>
          </div>
        </div>

        {/* Barra resumen anual de metas mensuales + foco en mes actual / inicio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider block">
                  Avance {periodLabel} ({monthlyScope === 'empresarial_otam' ? 'Empresariales / OTAM' : 'Todos los segmentos'})
                </span>
                <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-xl font-extrabold text-indigo-950">
                    {formatCurrency(monthlySectionTotalReal, 'MXN')}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    de {formatCurrency(monthlySectionTotalGoal, 'MXN')}
                  </span>
                </div>
              </div>

              <span className="font-mono text-base font-extrabold px-3 py-1 rounded-full bg-indigo-700 text-white shadow-xs">
                {monthlySectionProgress.formatted} avanzado
              </span>
            </div>

            <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-indigo-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                  monthlySectionProgress.raw,
                  'bg-indigo-600'
                )}`}
                style={{
                  width: `${Math.max(monthlySectionTotalReal > 0 ? 3 : 0, monthlySectionProgress.capped)}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-indigo-900 font-mono flex-wrap gap-2">
              <span>
                Brecha anual: {formatCurrency(Math.max(0, monthlySectionTotalGoal - monthlySectionTotalReal), 'MXN')}
              </span>
              <span>
                Cotizado en el periodo: {formatCurrency(monthlySectionTotalPipeline, 'MXN')}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                {isPreStartWindow ? `Inicio Metas · ${spotlightMonthMetric.label} 2027` : `Mes en Curso · ${spotlightMonthMetric.label}`}
              </span>
              <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${getPercentBadgeClass(spotlightMonthMetric.progress.raw)}`}>
                {spotlightMonthMetric.progress.formatted}
              </span>
            </div>
            <div>
              <div className="font-mono text-lg font-extrabold text-emerald-950">
                {formatCurrency(spotlightMonthMetric.realIncome, 'MXN')}
              </div>
              <div className="text-[11px] text-stone-600 font-mono">
                Meta del mes: {formatCurrency(spotlightMonthMetric.goalMXN, 'MXN')}
              </div>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-emerald-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                  spotlightMonthMetric.progress.raw,
                  'bg-emerald-600'
                )}`}
                style={{
                  width: `${Math.max(spotlightMonthMetric.realIncome > 0 ? 4 : 0, spotlightMonthMetric.progress.capped)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Grid de los 12 meses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {monthlyMetrics.map((m) => (
            <div
              key={m.monthKey}
              className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                m.isCurrentMonth || m.isStartingMonth
                  ? 'bg-indigo-50/60 border-indigo-400 ring-1 ring-indigo-300 shadow-xs'
                  : 'bg-stone-50/70 border-stone-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-stone-900">{m.label}</span>
                  {m.isCurrentMonth && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-700 text-white">
                      Actual
                    </span>
                  )}
                  {m.isStartingMonth && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-600 text-white">
                      Inicia 2027
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${getPercentBadgeClass(
                    m.progress.raw
                  )}`}
                >
                  {m.progress.formatted}
                </span>
              </div>

              <div className="space-y-0.5 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-stone-500">Logrado:</span>
                  <span className="font-mono font-extrabold text-stone-900">
                    {formatCurrency(m.realIncome, 'MXN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-stone-500">Meta mes:</span>
                  <span className="font-mono font-semibold text-stone-600">
                    {formatCurrency(m.goalMXN, 'MXN')}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                    m.progress.raw,
                    'bg-indigo-600'
                  )}`}
                  style={{ width: `${Math.max(m.realIncome > 0 ? 4 : 0, m.progress.capped)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono pt-0.5">
                <span>{m.dealsCount} {m.dealsCount === 1 ? 'evento' : 'eventos'}</span>
                <span>Cotiz: {m.pipelineProgress.formatted}</span>
              </div>

              {m.otherSegmentIncome > 0 && (
                <div className="text-[9px] text-stone-400 font-mono border-t border-stone-200/70 pt-1">
                  + {formatCurrency(m.otherSegmentIncome, 'MXN')} en otros segmentos
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: METAS PERSONALES POR EJECUTIVO COMERCIAL */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h4 className="font-editorial text-2xl font-bold text-stone-900">
              Metas Personales por Ejecutivo Comercial
            </h4>
            <p className="text-xs text-stone-500">
              Cuota mensual y acumulado anual (× 12).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CadenceControls
              cadenceView={cadenceView}
              onChangeCadence={setCadenceView}
              focusMonthKey={focusMonthKey}
              onChangeMonth={setFocusMonthKey}
            />

            {executiveActiveTotalGoalMXN > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono bg-stone-100 text-stone-800 px-3 py-1 rounded-full font-bold border border-stone-200">
                  Meta {cadenceView === 'annual' ? 'Anual' : focusMonthLabel}: {formatCurrency(executiveActiveTotalGoalMXN, 'MXN')}
                </span>
                <span
                  className={`text-[11px] font-mono px-3 py-1 rounded-full font-extrabold border ${getPercentBadgeClass(
                    executiveTeamProgress.raw
                  )}`}
                >
                  {executiveTeamProgress.formatted} avanzado
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {executivesWithGoals.map((exec) => {
            const execDeals = activeFilteredDeals.filter((d) =>
              matchesUserIdentity({ email: exec.email, name: exec.name }, d.assignedEmail, d.assignedRep)
            );
            const execMonthDeals = execDeals.filter(
              (d) => getDealYearAndMonth(d)?.monthKey === focusMonthKey
            );

            const execAnnualRealVal = execDeals.reduce((acc, d) => acc + getDealRealIncome(d), 0);
            const execMonthRealVal = execMonthDeals.reduce((acc, d) => acc + getDealRealIncome(d), 0);

            const activeDeals = cadenceView === 'annual' ? execDeals : execMonthDeals;
            const activeRealVal = cadenceView === 'annual' ? execAnnualRealVal : execMonthRealVal;
            const execDeposits = activeDeals.reduce(
              (acc, d) => acc + (d.paymentStatus !== 'liquidado' ? Number(d.depositAmount) || 0 : 0),
              0
            );
            const execLiquidated = activeDeals.reduce(
              (acc, d) => acc + (d.paymentStatus === 'liquidado' ? Number(d.totalValue) || 0 : 0),
              0
            );
            const pipelineVal = activeDeals.reduce((acc, d) => acc + (Number(d.totalValue) || 0), 0);

            const monthlyGoal = exec.goalMXN || 0;
            const annualGoal = monthlyGoal * 12;
            const activeGoal = cadenceView === 'annual' ? annualGoal : monthlyGoal;
            const execProgress = calculateProgressPercent(activeRealVal, activeGoal);
            const secondaryProgress =
              cadenceView === 'annual'
                ? calculateProgressPercent(execMonthRealVal, monthlyGoal)
                : calculateProgressPercent(execAnnualRealVal, annualGoal);
            const pipelineProgress = calculateProgressPercent(pipelineVal, activeGoal);
            const status = getExecutiveEventStatus(deals, exec.email || exec.name);

            return (
              <div
                key={exec.email || exec.name}
                className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 space-y-3.5 shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Header del Ejecutivo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {exec.avatar ? (
                      <img
                        src={exec.avatar}
                        alt={exec.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-stone-300 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-800 to-teal-900 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                        {exec.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="font-bold text-stone-900 text-sm leading-tight truncate">{exec.name}</h5>
                      <span className="text-[10px] text-stone-500 block truncate">{exec.role}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {activeGoal > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold border ${getPercentBadgeClass(
                          execProgress.raw
                        )}`}
                      >
                        {execProgress.formatted}
                      </span>
                    )}
                    {status.isOperating ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold uppercase animate-pulse">
                        ⛔ En Evento
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        🟢 Disponible
                      </span>
                    )}
                  </div>
                </div>

                {status.isOperating && status.activeDeal && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-950 font-semibold space-y-0.5">
                    <span className="block text-[10px] uppercase font-bold text-rose-800">
                      Operando evento en sitio:
                    </span>
                    <div>{status.activeDeal.companyOrAgency} · 🏨 {status.activeDeal.hotelName}</div>
                    <div className="text-[10px] text-rose-700 font-mono">
                      Del {status.activeDeal.checkInDate} al {status.activeDeal.checkOutDate}
                    </div>
                  </div>
                )}

                {/* Cifras de Meta Principal */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-stone-500 font-semibold">
                      Dinero Real ({cadenceView === 'annual' ? 'Año' : focusMonthLabel}):
                    </span>
                    <span className="font-mono text-base font-extrabold text-emerald-900">
                      {formatCurrency(activeRealVal, 'MXN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>Anticipos: {formatCurrency(execDeposits, 'MXN')}</span>
                    <span>Liquidados: {formatCurrency(execLiquidated, 'MXN')}</span>
                  </div>
                  {activeGoal > 0 && (
                    <>
                      <div className="flex items-baseline justify-between text-xs pt-1">
                        <span className="text-stone-500 text-[11px] font-semibold">
                          Meta {cadenceView === 'annual' ? 'Anual (×12)' : `de ${focusMonthLabel}`}:
                        </span>
                        <span className="font-mono font-bold text-stone-800">{formatCurrency(activeGoal, 'MXN')}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-stone-400 text-[10px]">Faltante para meta:</span>
                        <span className="font-mono text-[11px] text-amber-800 font-semibold">
                          {formatCurrency(Math.max(0, activeGoal - activeRealVal), 'MXN')}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Barra de Progreso Principal */}
                {activeGoal > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-stone-600">
                        Avance {cadenceView === 'annual' ? 'Anual' : focusMonthLabel}:
                      </span>
                      <span className="font-mono text-stone-900">{execProgress.formatted}</span>
                    </div>
                    <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarColor(execProgress.raw)} transition-all duration-500`}
                        style={{ width: `${Math.max(activeRealVal > 0 ? 4 : 0, execProgress.capped)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Referencia Cruzada (Mensual si está en Anual, o Anual si está en Mensual) */}
                {monthlyGoal > 0 && (
                  <div className="bg-white rounded-xl px-3 py-2 border border-stone-200/80 flex items-center justify-between text-[10px] font-mono gap-2">
                    <span className="text-stone-600 truncate">
                      {cadenceView === 'annual'
                        ? `Meta Mensual (${focusMonthLabel}): ${formatCurrency(monthlyGoal, 'MXN')}`
                        : `Meta Anual (×12): ${formatCurrency(annualGoal, 'MXN')}`}
                    </span>
                    <span className="font-bold text-emerald-900 shrink-0">
                      {cadenceView === 'annual'
                        ? `${formatCurrency(execMonthRealVal, 'MXN')} (${secondaryProgress.formatted})`
                        : `${formatCurrency(execAnnualRealVal, 'MXN')} (${secondaryProgress.formatted})`}
                    </span>
                  </div>
                )}

                <MonthlyBreakdownStrip
                  deals={execDeals}
                  monthlyGoal={monthlyGoal}
                  focusMonthKey={focusMonthKey}
                  onSelectMonth={setFocusMonthKey}
                  getDealRealIncome={getDealRealIncome}
                />

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] gap-2">
                  <span className="text-stone-500">Pipeline cotizado:</span>
                  <span className="font-mono font-bold text-amber-800 text-right">
                    {formatCurrency(pipelineVal, 'MXN')}{' '}
                    {activeGoal > 0 && `(${pipelineProgress.formatted})`} · {activeDeals.length} deals
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 4: METAS E INGRESOS REALES POR HOTEL */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h4 className="font-editorial text-2xl font-bold text-stone-900">
              Metas e Ingresos Reales por Hotel
            </h4>
            <p className="text-xs text-stone-500">
              Cuota mensual ({formatCurrency(COMMERCIAL_HOTEL_TOTAL_GOAL_MXN, 'MXN')}) y anual × 12 ({formatCurrency(COMMERCIAL_HOTEL_ANNUAL_TOTAL_GOAL_MXN, 'MXN')}).
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <CadenceControls
              cadenceView={cadenceView}
              onChangeCadence={setCadenceView}
              focusMonthKey={focusMonthKey}
              onChangeMonth={setFocusMonthKey}
            />
            <span className="text-[11px] font-mono bg-stone-100 text-stone-800 px-3 py-1 rounded-full font-bold border border-stone-200">
              Meta {cadenceView === 'annual' ? 'Anual Hoteles (×12)' : `Mensual (${focusMonthLabel})`}:{' '}
              {formatCurrency(hotelsActiveTotalGoalMXN, 'MXN')}
            </span>
            <span
              className={`text-[11px] font-mono px-3 py-1 rounded-full font-extrabold border ${getPercentBadgeClass(
                hotelsCombinedProgress.raw
              )}`}
            >
              {hotelsCombinedProgress.formatted} avanzado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotelMetrics.map((hm) => {
            const hasGoal = hm.monthlyGoalMXN !== null && hm.monthlyGoalMXN > 0;
            const monthlyGoalAmount = hm.monthlyGoalMXN || 0;
            const annualGoalAmount = hm.annualGoalMXN || 0;

            const activeRealIncome = cadenceView === 'annual' ? hm.realIncome : hm.monthRealIncome;
            const activeDeposits = cadenceView === 'annual' ? hm.deposits : hm.monthDeposits;
            const activeLiquidated = cadenceView === 'annual' ? hm.liquidated : hm.monthLiquidated;
            const activePipeline = cadenceView === 'annual' ? hm.pipeline : hm.monthPipeline;
            const activeDealsCount = cadenceView === 'annual' ? hm.dealsCount : hm.monthDealsCount;
            const activeRn = cadenceView === 'annual' ? hm.rn : hm.monthRn;
            const activeGoalAmount = cadenceView === 'annual' ? annualGoalAmount : monthlyGoalAmount;

            const hotelProgress = hasGoal
              ? calculateProgressPercent(activeRealIncome, activeGoalAmount)
              : calculateProgressPercent(activeRealIncome, allHotelsTotalIncome || 1);
            const secondaryHotelProgress = hasGoal
              ? cadenceView === 'annual'
                ? calculateProgressPercent(hm.monthRealIncome, monthlyGoalAmount)
                : calculateProgressPercent(hm.realIncome, annualGoalAmount)
              : null;
            const hotelPipelineProgress = hasGoal
              ? calculateProgressPercent(activePipeline, activeGoalAmount)
              : null;

            return (
              <div
                key={hm.hotelKey}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>🏨</span>
                      <span>{hm.displayLabel}</span>
                    </div>
                    <span className="text-[10px] text-stone-500">
                      {activeDealsCount} {activeDealsCount === 1 ? 'evento registrado' : 'eventos registrados'} · {activeRn} Room Nights
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                        hasGoal
                          ? getPercentBadgeClass(hotelProgress.raw)
                          : 'bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      {hasGoal ? `${hotelProgress.formatted} meta` : `${hotelProgress.formatted} del total`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-white p-2.5 rounded-xl border border-stone-200/80">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-semibold">
                      Ingresado ({cadenceView === 'annual' ? 'Año' : focusMonthLabel})
                    </span>
                    <span className="font-mono font-extrabold text-emerald-900">
                      {formatCurrency(activeRealIncome, 'MXN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block font-semibold">
                      Meta {cadenceView === 'annual' ? 'Anual (×12)' : 'Mensual'}
                    </span>
                    <span className="font-mono font-bold text-stone-800">
                      {hasGoal ? formatCurrency(activeGoalAmount, 'MXN') : 'Sin meta fija'}
                    </span>
                  </div>
                  {hasGoal && (
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Brecha Restante</span>
                      <span className="font-mono font-semibold text-amber-800">
                        {formatCurrency(Math.max(0, activeGoalAmount - activeRealIncome), 'MXN')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>Anticipos: {formatCurrency(activeDeposits, 'MXN')} · Liquidados: {formatCurrency(activeLiquidated, 'MXN')}</span>
                    <span className="font-bold text-stone-800">
                      {hasGoal ? `${hotelProgress.formatted} avanzado` : `${hotelProgress.formatted} participación`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hasGoal ? getProgressBarColor(hotelProgress.raw, 'bg-emerald-700') : 'bg-stone-500'
                      }`}
                      style={{ width: `${Math.max(activeRealIncome > 0 ? 4 : 0, hotelProgress.capped)}%` }}
                    />
                  </div>
                  {hasGoal && secondaryHotelProgress && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-600 pt-0.5">
                      <span>
                        {cadenceView === 'annual'
                          ? `Meta mensual (${focusMonthLabel}): ${formatCurrency(monthlyGoalAmount, 'MXN')}`
                          : `Meta anual (×12): ${formatCurrency(annualGoalAmount, 'MXN')}`}
                      </span>
                      <span className="font-bold text-emerald-900">
                        {cadenceView === 'annual'
                          ? `${formatCurrency(hm.monthRealIncome, 'MXN')} (${secondaryHotelProgress.formatted})`
                          : `${formatCurrency(hm.realIncome, 'MXN')} (${secondaryHotelProgress.formatted})`}
                      </span>
                    </div>
                  )}
                  {hasGoal && (
                    <div className="pt-1.5">
                      <MonthlyBreakdownStrip
                        deals={hm.deals}
                        monthlyGoal={monthlyGoalAmount}
                        focusMonthKey={focusMonthKey}
                        onSelectMonth={setFocusMonthKey}
                        getDealRealIncome={getDealRealIncome}
                      />
                    </div>
                  )}
                  <div className="text-[10px] text-stone-400 font-mono text-right">
                    Cotizado en cartera: {formatCurrency(activePipeline, 'MXN')}
                    {hotelPipelineProgress ? ` (${hotelPipelineProgress.formatted} de meta)` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 5: BARRAS DE ESTADO POR FASE DEL PIPELINE COMERCIAL */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-stone-200 pb-3">
          <h4 className="font-editorial text-2xl font-bold text-stone-900">
            Pipeline por Fases (MXN)
          </h4>
          <p className="text-xs text-stone-500">
            Ingreso real vs meta anual
          </p>
        </div>

        <div className="space-y-3.5">
          {stages.map((stage) => {
            const stageDeals = periodFilteredDeals.filter((d) => d.stage === stage.id);
            const stageRealSum = stageDeals.reduce((acc, d) => acc + getDealRealIncome(d), 0);
            const stageTotalVal = stageDeals.reduce((acc, d) => acc + d.totalValue, 0);
            const percentOfMax = (stageRealSum / maxStageValue) * 100;
            const shareOfReal = calculateProgressPercent(stageRealSum, totalRealIncome || 1);
            const shareOfGoal = calculateProgressPercent(stageRealSum, totalGoalMXN);

            return (
              <div key={stage.id} className="space-y-1.5 bg-stone-50/60 p-3.5 rounded-2xl border border-stone-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.colorDot}`} />
                    <span className="font-bold text-stone-900">{stage.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/80 font-mono font-semibold text-stone-700">
                      {stageDeals.length} {stageDeals.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] text-stone-600 font-mono">
                      {shareOfReal.formatted} del real · <strong className="text-emerald-800">{shareOfGoal.formatted}</strong> de meta anual
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-extrabold text-stone-900 block">
                        {formatCurrency(stageRealSum, 'MXN')}
                      </span>
                      {stageTotalVal > stageRealSum && (
                        <span className="text-[10px] text-stone-400 font-mono block">
                          Cotizado: {formatCurrency(stageTotalVal, 'MXN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-3 w-full bg-stone-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stage.colorDot}`}
                    style={{ width: `${Math.max(stageRealSum > 0 ? 3 : 0, percentOfMax)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 6: SALUD FINANCIERA & COBRANZA EN MXN */}
      <div className="bg-amber-50/60 border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <div>
              <h4 className="font-bold text-amber-950 text-sm uppercase tracking-wider">
                Cobranza
              </h4>
              <span className="text-xs text-amber-800">
                Ingresado vs saldo por cobrar
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-900">
            {collectedRatioProgress.formatted} Ingresado · {pendingRatioProgress.formatted} Pendiente
          </span>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-amber-300 flex">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${collectedRatioProgress.capped}%` }}
              title="Cobrado"
            />
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${pendingRatioProgress.capped}%` }}
              title="Saldo por Cobrar"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-stone-700">Dinero Real Ingresado ({collectedRatioProgress.formatted}):</span>
              <strong className="font-mono text-emerald-900">{formatCurrency(totalRealIncome, 'MXN')}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-stone-700">Saldo Pendiente de Cobro ({pendingRatioProgress.formatted}):</span>
              <strong className="font-mono text-amber-950">{formatCurrency(totalPendingBalance, 'MXN')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
