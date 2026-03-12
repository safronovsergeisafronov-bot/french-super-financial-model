/**
 * French.Super — Финансовые расчёты
 * Вся бизнес-логика здесь. React-компоненты только отображают.
 */

/**
 * Рассчитывает аналитику по каждому продукту из массива.
 * @param {Array} products — [{id, name, unitPrice, unitsSoldPerMonth, unitCost}]
 * @returns {Array} — products с добавленными полями: revenue, cost, profit, margin
 */
export function calculateProducts(products) {
  return products.map((p) => {
    const revenue = (p.unitsSoldPerMonth ?? 0) * (p.unitPrice ?? 0);
    const cost = (p.unitsSoldPerMonth ?? 0) * (p.unitCost ?? 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { ...p, revenue, cost, profit, margin };
  });
}

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
  courses = 0,
  coursePrice = 0,
  guides = 0,
  guidePrice = 0,
  managerCount,
  mgr1Fix,
  mgr1BonusPct,
  mgr1Kpi,
  mgr2Fix,
  mgr2BonusPct,
  mgr2Kpi,
  otherCosts,
  teachers = [],
  products = [],
}) {
  // ── Выручка от продуктов ──────────────────────────────────────────
  let lessonsRevenue;
  let lessonsCost;
  let premRevenue;
  let premCost;
  let teachersList = [];
  let teachersStudentsTotal = 0;

  const useTeachersList = teachers && teachers.length > 0;

  if (useTeachersList) {
    teachersList = teachers.map((t) => {
      const revenue = t.lessonsPerMonth * t.pricePerLesson;
      const cost = t.lessonsPerMonth * t.ratePerLesson;
      const profit = revenue - cost;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
      const studentsEstimate = t.lessonsPerMonth > 0
        ? Math.ceil(t.lessonsPerMonth / Math.max(t.avgLessonsPerStudent, 1))
        : 0;
      return {
        id: t.id,
        name: t.name,
        lessonsPerMonth: t.lessonsPerMonth,
        pricePerLesson: t.pricePerLesson,
        ratePerLesson: t.ratePerLesson,
        revenue,
        cost,
        profit,
        margin,
        studentsEstimate,
      };
    });

    const teachersRevenueTotal = teachersList.reduce((s, t) => s + t.revenue, 0);
    teachersStudentsTotal = teachersList.reduce((s, t) => s + t.studentsEstimate, 0);

    // Заполняем legacy-поля для совместимости с UI
    lessonsRevenue = teachersRevenueTotal;
    lessonsCost = teachersList.reduce((s, t) => s + t.cost, 0);
    premRevenue = 0;
    premCost = 0;
  } else {
    lessonsRevenue = (lessons ?? 0) * (price ?? 0);
    lessonsCost = (lessons ?? 0) * (teacherRate ?? 0);
    premRevenue = (premLessons ?? 0) * (premPrice ?? 0);
    premCost = (premLessons ?? 0) * (premTeacherRate ?? 0);
  }

  const lessonsProfit = lessonsRevenue - lessonsCost;
  const lessonsMargin = lessonsRevenue > 0
    ? Math.round((lessonsProfit / lessonsRevenue) * 100) : 0;

  const premProfit = premRevenue - premCost;
  const premMargin = premRevenue > 0
    ? Math.round((premProfit / premRevenue) * 100) : 0;

  const coursesRevenue = courses * coursePrice;
  const guidesRevenue = guides * guidePrice;

  // ── Продукты (динамический список) ───────────────────────────────
  const productsList = calculateProducts(products);
  const productsRevenue = productsList.reduce((s, p) => s + p.revenue, 0);
  const productsCost = productsList.reduce((s, p) => s + p.cost, 0);

  const totalRevenue = lessonsRevenue + premRevenue + coursesRevenue + guidesRevenue + productsRevenue;

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
  const totalCost = managerCostTotal + teacherCostTotal + productsCost + otherCosts;

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
    productsList,
    productsRevenue,
    productsCost,

    // Воронка
    dailySales,
    funnelRevenue,

    // Итого
    totalRevenue,
    teacherCostTotal,
    teachersList,
    teachersStudentsTotal,
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
