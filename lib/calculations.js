/**
 * French.Super — Финансовые расчёты
 * Вся бизнес-логика здесь. React-компоненты только отображают.
 */

export function calculateModel({
  leads,
  conv,
  avgCheck,
  lessons,
  price,
  teacherRate,
  premLessons,
  premPrice,
  premTeacherRate,
  courses,
  coursePrice,
  guides,
  guidePrice,
  managerCount,
  mgr1Fix,
  mgr1BonusPct,
  mgr1Kpi,
  mgr2Fix,
  mgr2BonusPct,
  mgr2Kpi,
  otherCosts,
}) {
  // ── Выручка от продуктов ──────────────────────────────────────────
  const lessonsRevenue = lessons * price;
  const lessonsCost = lessons * teacherRate;
  const lessonsProfit = lessonsRevenue - lessonsCost;
  const lessonsMargin = lessonsRevenue > 0
    ? Math.round((lessonsProfit / lessonsRevenue) * 100) : 0;

  const premRevenue = premLessons * premPrice;
  const premCost = premLessons * premTeacherRate;
  const premProfit = premRevenue - premCost;
  const premMargin = premRevenue > 0
    ? Math.round((premProfit / premRevenue) * 100) : 0;

  const coursesRevenue = courses * coursePrice;
  const guidesRevenue = guides * guidePrice;
  const totalRevenue = lessonsRevenue + premRevenue + coursesRevenue + guidesRevenue;

  // ── Воронка продаж (оценка сверху) ───────────────────────────────
  const dailySales = Math.round(leads * conv / 100 * 10) / 10;
  const funnelRevenue = Math.round(dailySales * avgCheck * 26);

  // ── Преподаватели ─────────────────────────────────────────────────
  const teacherCostTotal = lessonsCost + premCost;

  // ── Менеджеры — каждый считается отдельно ────────────────────────
  // Выручка делится поровну между менеджерами для расчёта их бонуса
  const revenuePerManager = managerCount > 0 ? totalRevenue / managerCount : 0;
  const managersList = [];

  if (managerCount >= 1) {
    const salesBonus = Math.round(revenuePerManager * mgr1BonusPct / 100);
    managersList.push({
      label: "Менеджер А",
      shift: "пн–сб 09:00–14:00",
      fix: mgr1Fix,
      revenueShare: Math.round(revenuePerManager),
      bonusPct: mgr1BonusPct,
      salesBonus,
      kpi: mgr1Kpi,
      total: mgr1Fix + salesBonus + mgr1Kpi,
    });
  }

  if (managerCount >= 2) {
    const salesBonus = Math.round(revenuePerManager * mgr2BonusPct / 100);
    managersList.push({
      label: "Менеджер Б",
      shift: "пн–вс (вых. ср) 15:00–20:00",
      fix: mgr2Fix,
      revenueShare: Math.round(revenuePerManager),
      bonusPct: mgr2BonusPct,
      salesBonus,
      kpi: mgr2Kpi,
      total: mgr2Fix + salesBonus + mgr2Kpi,
    });
  }

  const managerCostTotal = managersList.reduce((s, m) => s + m.total, 0);

  // ── Итоговые расходы ─────────────────────────────────────────────
  const totalCost = managerCostTotal + teacherCostTotal + otherCosts;

  // ── Прибыль ──────────────────────────────────────────────────────
  const netProfit = totalRevenue - totalCost;
  const netMargin = totalRevenue > 0
    ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // ── ROI менеджеров ────────────────────────────────────────────────
  const managerRoi = managerCostTotal > 0
    ? (totalRevenue / managerCostTotal).toFixed(1) : "0";

  // ── Безубыточность (заявок/день) ─────────────────────────────────
  // Через воронку: сколько заявок/день нужно чтобы покрыть все расходы
  const revenuePerLeadPerDay = avgCheck * conv / 100;
  const breakeven = revenuePerLeadPerDay > 0
    ? Math.ceil(totalCost / (revenuePerLeadPerDay * 26)) : 999;

  return {
    // Продукты
    lessonsRevenue,
    lessonsCost,
    lessonsProfit,
    lessonsMargin,
    premRevenue,
    premCost,
    premProfit,
    premMargin,
    coursesRevenue,
    guidesRevenue,

    // Воронка
    dailySales,
    funnelRevenue,

    // Итого
    totalRevenue,
    teacherCostTotal,
    managersList,
    managerCostTotal,
    totalCost,
    netProfit,
    netMargin,
    managerRoi,
    breakeven,
    isProfitable: netProfit >= 0,
  };
}
